import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LocationCoordinates, locationService } from '../lib/location-service';
import { SearchFilter, SearchResult, searchService, SearchSuggestion } from '../lib/search-service';
import { useAppStore } from '../stores/app-store';

interface UseSearchOptions {
  enableLocation?: boolean;
  enableSuggestions?: boolean;
  enableHistory?: boolean;
  debounceMs?: number;
  autoSearch?: boolean;
}

interface UseSearchReturn {
  // Search state
  query: string;
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  isLoadingSuggestions: boolean;
  error: string | null;
  
  // Location state
  userLocation: LocationCoordinates | null;
  isLoadingLocation: boolean;
  
  // Filter state
  filters: SearchFilter;
  
  // Actions
  setQuery: (query: string) => void;
  search: (customQuery?: string, customFilters?: SearchFilter) => Promise<void>;
  updateFilters: (newFilters: Partial<SearchFilter>) => void;
  clearFilters: () => void;
  clearResults: () => void;
  clearHistory: () => void;
  
  // Location actions
  requestLocation: () => Promise<boolean>;
  updateLocation: (location: LocationCoordinates) => void;
  
  // Suggestion actions
  selectSuggestion: (suggestion: SearchSuggestion) => void;
  
  // Utility
  formatDistance: (distanceInMeters: number) => string;
  isWithinRadius: (coordinates: LocationCoordinates, radiusInMeters: number) => boolean;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const {
    enableLocation = true,
    enableSuggestions = true,
    enableHistory = true,
    debounceMs = 300,
    autoSearch = false,
  } = options;

  // State
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [filters, setFilters] = useState<SearchFilter>({});
  
  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const suggestionsAbortControllerRef = useRef<AbortController | null>(null);
  
  // Get app store for global state
  const { addNotification } = useAppStore();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, searchFilters: SearchFilter) => {
      if (!searchQuery.trim() && !autoSearch) return;

      // Cancel previous search
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await searchService.searchBusinesses(
          searchQuery,
          searchFilters,
          userLocation || undefined
        );

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        setResults(searchResults);
        
        // Track search analytics
        await searchService.trackSearch(searchQuery, searchResults.length, searchFilters);

      } catch (err) {
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }
        
        const errorMessage = err instanceof Error ? err.message : 'Search failed';
        setError(errorMessage);
        setResults([]);
        
        addNotification({
          id: `search-error-${Date.now()}`,
          type: 'error',
          title: 'Search Error',
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
        
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, debounceMs),
    [userLocation, addNotification, autoSearch]
  );

  // Debounced suggestions function
  const debouncedGetSuggestions = useCallback(
    debounce(async (input: string) => {
      if (!input.trim() || !enableSuggestions) {
        setSuggestions([]);
        return;
      }

      // Cancel previous suggestions request
      if (suggestionsAbortControllerRef.current) {
        suggestionsAbortControllerRef.current.abort();
      }
      
      suggestionsAbortControllerRef.current = new AbortController();
      setIsLoadingSuggestions(true);

      try {
        const searchSuggestions = await searchService.getSearchSuggestions(
          input,
          userLocation || undefined
        );

        if (!suggestionsAbortControllerRef.current?.signal.aborted) {
          setSuggestions(searchSuggestions);
        }
      } catch (err) {
        if (!suggestionsAbortControllerRef.current?.signal.aborted) {
          console.error('Failed to get suggestions:', err);
          setSuggestions([]);
        }
      } finally {
        if (!suggestionsAbortControllerRef.current?.signal.aborted) {
          setIsLoadingSuggestions(false);
        }
      }
    }, 200),
    [userLocation, enableSuggestions]
  );

  // Set query and trigger suggestions
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    
    if (enableSuggestions) {
      debouncedGetSuggestions(newQuery);
    }
    
    if (autoSearch) {
      debouncedSearch(newQuery, filters);
    }
  }, [debouncedGetSuggestions, debouncedSearch, filters, autoSearch, enableSuggestions]);

  // Manual search function
  const search = useCallback(async (
    customQuery?: string,
    customFilters?: SearchFilter
  ) => {
    const searchQuery = customQuery ?? query;
    const searchFilters = customFilters ?? filters;
    
    // Clear suggestions when searching
    setSuggestions([]);
    
    // Use the debounced search but call it immediately
    debouncedSearch.cancel();
    await debouncedSearch(searchQuery, searchFilters);
  }, [query, filters, debouncedSearch]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilter>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    if (autoSearch && query.trim()) {
      debouncedSearch(query, updatedFilters);
    }
  }, [filters, query, debouncedSearch, autoSearch]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
    
    if (autoSearch && query.trim()) {
      debouncedSearch(query, {});
    }
  }, [query, debouncedSearch, autoSearch]);

  // Clear results
  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  // Clear search history
  const clearHistory = useCallback(async () => {
    try {
      await searchService.clearSearchHistory();
      addNotification({
        id: `history-cleared-${Date.now()}`,
        type: 'info',
        title: 'History Cleared',
        message: 'Search history has been cleared',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to clear search history:', err);
    }
  }, [addNotification]);

  // Request user location
  const requestLocation = useCallback(async (): Promise<boolean> => {
    if (!enableLocation) return false;

    setIsLoadingLocation(true);
    setError(null);

    try {
      const location = await locationService.getCurrentLocation();
      
      if (location) {
        setUserLocation(location);
        return true;
      } else {
        setError('Unable to get your location');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Location access failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoadingLocation(false);
    }
  }, [enableLocation]);

  // Update location manually
  const updateLocation = useCallback((location: LocationCoordinates) => {
    setUserLocation(location);
  }, []);

  // Select a suggestion
  const selectSuggestion = useCallback((suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setSuggestions([]);
    
    // Trigger search with the selected suggestion
    if (suggestion.type === 'business' && suggestion.metadata?.businessId) {
      // Could navigate to business detail or filter by business
      search(suggestion.text);
    } else if (suggestion.type === 'category' && suggestion.metadata?.category) {
      // Apply category filter
      updateFilters({ category: suggestion.metadata.category });
      search(suggestion.text);
    } else if (suggestion.type === 'location' && suggestion.metadata?.coordinates) {
      // Update location and search
      updateLocation(suggestion.metadata.coordinates);
      search(suggestion.text);
    } else {
      // Regular text search
      search(suggestion.text);
    }
  }, [search, updateFilters, updateLocation]);

  // Format distance for display
  const formatDistance = useCallback((distanceInMeters: number): string => {
    return locationService.formatDistance(distanceInMeters);
  }, []);

  // Check if coordinates are within radius of user location
  const isWithinRadius = useCallback((
    coordinates: LocationCoordinates,
    radiusInMeters: number
  ): boolean => {
    if (!userLocation) return false;
    return locationService.isWithinRadius(userLocation, coordinates, radiusInMeters);
  }, [userLocation]);

  // Initialize location on mount if enabled
  useEffect(() => {
    if (enableLocation && !userLocation) {
      requestLocation();
    }
  }, [enableLocation, userLocation, requestLocation]);

  // Load recent searches on mount if enabled
  useEffect(() => {
    if (enableHistory && !query.trim()) {
      searchService.getRecentSearches().then(setSuggestions).catch(console.error);
    }
  }, [enableHistory, query]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (suggestionsAbortControllerRef.current) {
        suggestionsAbortControllerRef.current.abort();
      }
      debouncedSearch.cancel();
      debouncedGetSuggestions.cancel();
    };
  }, [debouncedSearch, debouncedGetSuggestions]);

  return {
    // Search state
    query,
    results,
    suggestions,
    isLoading,
    isLoadingSuggestions,
    error,
    
    // Location state
    userLocation,
    isLoadingLocation,
    
    // Filter state
    filters,
    
    // Actions
    setQuery,
    search,
    updateFilters,
    clearFilters,
    clearResults,
    clearHistory,
    
    // Location actions
    requestLocation,
    updateLocation,
    
    // Suggestion actions
    selectSuggestion,
    
    // Utility
    formatDistance,
    isWithinRadius,
  };
}

export default useSearch;