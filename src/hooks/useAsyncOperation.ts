/**
 * FILE: src/hooks/useAsyncOperation.ts
 * PURPOSE: Custom hook for handling async operations with loading and error states
 * RESPONSIBILITIES: Reduce boilerplate for async operations, provide consistent error handling
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

interface UseAsyncOperationReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (operation: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

interface UseAsyncOperationOptions {
  initialLoading?: boolean;
  showErrorAlert?: boolean;
  errorTitle?: string;
}

export function useAsyncOperation<T = any>(
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn<T> {
  const {
    initialLoading = false,
    showErrorAlert = true,
    errorTitle = 'Error',
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      if (showErrorAlert) {
        Alert.alert(errorTitle, errorMessage);
      }
      
      console.error('AsyncOperation error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [showErrorAlert, errorTitle]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
  };
}

export default useAsyncOperation;