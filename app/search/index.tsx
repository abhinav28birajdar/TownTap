import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Keyboard,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RECENT_SEARCHES_KEY = '@recent_searches';

const popularSearches = [
  'Plumber',
  'Electrician',
  'AC Repair',
  'House Cleaning',
  'Carpenter',
  'Painter',
  'Pest Control',
  'Appliance Repair',
];

const trendingServices = [
  { id: '1', name: 'Home Deep Cleaning', icon: 'sparkles', searches: '2.5k' },
  { id: '2', name: 'AC Service & Repair', icon: 'snow', searches: '1.8k' },
  { id: '3', name: 'Electrician', icon: 'flash', searches: '1.2k' },
  { id: '4', name: 'Plumbing Services', icon: 'water', searches: '980' },
];

export default function SearchScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    loadRecentSearches();
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (query: string) => {
    try {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  const removeRecentSearch = async (query: string) => {
    try {
      const updated = recentSearches.filter(s => s !== query);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error('Error removing recent search:', error);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
      Keyboard.dismiss();
      router.push(`/search/results?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleVoiceSearch = () => {
    router.push('/search/voice');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={[
          styles.searchContainer,
          { 
            backgroundColor: colors.card,
            borderColor: isFocused ? colors.primary : colors.border,
          }
        ]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for services..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={() => handleSearch(searchQuery)}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleVoiceSearch} style={styles.voiceButton}>
            <Ionicons name="mic" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <Animated.View style={[styles.section, { opacity: animatedValue }]}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Recent Searches</ThemedText>
              <TouchableOpacity onPress={clearRecentSearches}>
                <ThemedText style={[styles.clearText, { color: colors.primary }]}>
                  Clear All
                </ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.chipsContainer}>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.recentChip, { backgroundColor: colors.card }]}
                  onPress={() => handleSearch(search)}
                >
                  <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                  <ThemedText style={styles.chipText}>{search}</ThemedText>
                  <TouchableOpacity
                    onPress={() => removeRecentSearch(search)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Popular Searches */}
        <Animated.View style={[styles.section, { opacity: animatedValue }]}>
          <ThemedText style={styles.sectionTitle}>Popular Searches</ThemedText>
          <View style={styles.popularGrid}>
            {popularSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.popularChip, { backgroundColor: colors.primary + '15' }]}
                onPress={() => handleSearch(search)}
              >
                <ThemedText style={[styles.popularText, { color: colors.primary }]}>
                  {search}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Trending Services */}
        <Animated.View style={[styles.section, { opacity: animatedValue }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Trending Services</ThemedText>
            <Ionicons name="trending-up" size={20} color={colors.success} />
          </View>
          {trendingServices.map((service, index) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.trendingCard, { backgroundColor: colors.card }]}
              onPress={() => handleSearch(service.name)}
            >
              <View style={[styles.trendingIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={service.icon as any} size={24} color={colors.primary} />
              </View>
              <View style={styles.trendingInfo}>
                <ThemedText style={styles.trendingName}>{service.name}</ThemedText>
                <ThemedText style={[styles.trendingSearches, { color: colors.textSecondary }]}>
                  {service.searches} searches this week
                </ThemedText>
              </View>
              <View style={styles.trendingRank}>
                <ThemedText style={[styles.rankText, { color: colors.primary }]}>
                  #{index + 1}
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Browse Categories */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <Ionicons name="grid-outline" size={20} color="#FFF" />
            <ThemedText style={styles.browseText}>Browse All Categories</ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  voiceButton: {
    padding: 4,
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  chipText: {
    fontSize: 14,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  popularChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  popularText: {
    fontSize: 14,
    fontWeight: '500',
  },
  trendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  trendingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trendingName: {
    fontSize: 16,
    fontWeight: '500',
  },
  trendingSearches: {
    fontSize: 12,
    marginTop: 2,
  },
  trendingRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  browseText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
