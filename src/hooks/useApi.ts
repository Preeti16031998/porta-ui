import { useState, useCallback, useEffect } from 'react';
import { ApiResponse, ApiError } from '@/lib/api';

// Hook state interface
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Hook options interface
interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  initialData?: T;
  autoFetch?: boolean;
  dependencies?: any[];
}

// Custom hook for API calls
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
) {
  const {
    onSuccess,
    onError,
    initialData = null,
    autoFetch = false,
    dependencies = [],
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
    success: false,
  });

  // Reset state
  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      success: false,
    });
  }, [initialData]);

  // Execute API call
  const execute = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
    }));

    try {
      const response = await apiCall();
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true,
        });
        
        onSuccess?.(response.data);
      } else {
        throw new Error(response.error || 'API request failed');
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred';
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
      
      onError?.(errorMessage);
    }
  }, [apiCall, onSuccess, onError]);

  // Auto-fetch effect
  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, [autoFetch, execute, ...dependencies]);

  return {
    ...state,
    execute,
    reset,
    refetch: execute,
  };
}

// Hook for API calls with parameters
export function useApiWithParams<T, P>(
  apiCall: (params: P) => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
) {
  const {
    onSuccess,
    onError,
    initialData = null,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
    success: false,
  });

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      success: false,
    });
  }, [initialData]);

  const execute = useCallback(async (params: P) => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
    }));

    try {
      const response = await apiCall(params);
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true,
        });
        
        onSuccess?.(response.data);
      } else {
        throw new Error(response.error || 'API request failed');
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred';
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
      
      onError?.(errorMessage);
    }
  }, [apiCall, onSuccess, onError]);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for real-time data updates
export function useApiPolling<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  interval: number = 30000, // 30 seconds default
  options: UseApiOptions<T> = {}
) {
  const {
    onSuccess,
    onError,
    initialData = null,
    autoFetch = true,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
    success: false,
  });

  const [isPolling, setIsPolling] = useState(false);

  const execute = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const response = await apiCall();
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true,
        });
        
        onSuccess?.(response.data);
      } else {
        throw new Error(response.error || 'API request failed');
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      onError?.(errorMessage);
    }
  }, [apiCall, onSuccess, onError]);

  const startPolling = useCallback(() => {
    setIsPolling(true);
  }, []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  // Polling effect
  useEffect(() => {
    if (!isPolling) return;

    const intervalId = setInterval(execute, interval);
    return () => clearInterval(intervalId);
  }, [isPolling, execute, interval]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, [autoFetch, execute]);

  return {
    ...state,
    execute,
    startPolling,
    stopPolling,
    isPolling,
  };
}
