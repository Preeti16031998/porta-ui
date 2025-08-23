import { useState, useEffect, useCallback } from 'react';
import { getCurrentUserId, getUserContext, UserContext } from '@/lib/api';

// User interface
export interface User {
  id: string;
  email?: string;
  name?: string;
  isAuthenticated: boolean;
  preferences?: Record<string, any>;
}

// Hook state interface
interface UseUserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Hook options interface
interface UseUserOptions {
  autoFetch?: boolean;
  onUserChange?: (user: User) => void;
}

// Custom hook for user management
export function useUser(options: UseUserOptions = {}) {
  const { autoFetch = true, onUserChange } = options;
  
  const [state, setState] = useState<UseUserState>({
    user: null,
    loading: false,
    error: null,
  });

  // Initialize user from environment
  const initializeUser = useCallback(() => {
    try {
      console.log('useUser - initializeUser called');
      const userId = getCurrentUserId();
      console.log('useUser - getCurrentUserId returned:', userId);
      const userContext = getUserContext();
      console.log('useUser - getUserContext returned:', userContext);
      
      const user: User = {
        id: userId,
        isAuthenticated: userContext.isAuthenticated,
        // You can extend this with additional user data from your auth system
      };
      
      console.log('useUser - created user object:', user);
      
      setState({
        user,
        loading: false,
        error: null,
      });
      
      onUserChange?.(user);
      return user;
    } catch (error) {
      console.error('useUser - initializeUser error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize user';
      setState({
        user: null,
        loading: false,
        error: errorMessage,
      });
      return null;
    }
  }, [onUserChange]);

  // Update user data
  const updateUser = useCallback((userData: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;
      
      const updatedUser = { ...prev.user, ...userData };
      onUserChange?.(updatedUser);
      
      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, [onUserChange]);

  // Set user authentication status
  const setAuthenticationStatus = useCallback((isAuthenticated: boolean) => {
    setState(prev => {
      if (!prev.user) return prev;
      
      const updatedUser = { ...prev.user, isAuthenticated };
      onUserChange?.(updatedUser);
      
      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, [onUserChange]);

  // Clear user data (logout)
  const clearUser = useCallback(() => {
    setState({
      user: null,
      loading: false,
      error: null,
    });
  }, []);

  // Refresh user data
  const refreshUser = useCallback(() => {
    setState(prev => ({ ...prev, loading: true }));
    
    // Simulate API call delay
    setTimeout(() => {
      initializeUser();
    }, 100);
  }, [initializeUser]);

  // Initialize user on mount
  useEffect(() => {
    if (autoFetch) {
      initializeUser();
    }
  }, [autoFetch, initializeUser]);

  return {
    ...state,
    user: state.user,
    loading: state.loading,
    error: state.error,
    updateUser,
    setAuthenticationStatus,
    clearUser,
    refreshUser,
    initializeUser,
  };
}

// Hook for getting just the current user ID
export function useUserId(): string | null {
  const { user } = useUser({ autoFetch: true });
  const userId = user?.id || null;
  
  // Debug logging
  console.log('useUserId hook - user:', user);
  console.log('useUserId hook - userId:', userId);
  
  return userId;
}

// Hook for checking if user is authenticated
export function useIsAuthenticated(): boolean {
  const { user } = useUser({ autoFetch: true });
  return user?.isAuthenticated || false;
}

// Hook for getting user preferences
export function useUserPreferences(): Record<string, any> | null {
  const { user } = useUser({ autoFetch: true });
  return user?.preferences || null;
}
