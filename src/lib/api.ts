// API Configuration and utilities
import { env } from '@/config/env';

export const API_CONFIG = {
  baseURL: env.api.baseUrl,
  timeout: env.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

// API response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
}

// API error types
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// User context interface
export interface UserContext {
  userId: string;
  isAuthenticated: boolean;
}

// Base API client
export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private userContext: UserContext;

  constructor(config = API_CONFIG) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.defaultHeaders = config.headers;
    this.userContext = {
      userId: env.user.id,
      isAuthenticated: true,
    };
  }

  // Set user context (useful for dynamic user switching)
  setUserContext(userId: string, isAuthenticated: boolean = true) {
    this.userContext = { userId, isAuthenticated };
  }

  // Get current user context
  getUserContext(): UserContext {
    return this.userContext;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Prepare headers with user context
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      'X-User-ID': this.userContext.userId,
      'X-User-Authenticated': this.userContext.isAuthenticated.toString(),
    };

    // Merge with any custom headers
    if (options.headers) {
      Object.assign(headers, options.headers);
    }
    
    const config: RequestInit = {
      headers,
      ...options,
    };

    // Debug logging
    console.log('API Client - Making request to:', url);
    console.log('API Client - Headers:', headers);
    console.log('API Client - Options:', options);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('API Client - Response status:', response.status);
      console.log('API Client - Response ok:', response.ok);

      if (!response.ok) {
        throw new ApiError(
          response.status,
          `HTTP error! status: ${response.status}`,
          await response.text()
        );
      }

      const data = await response.json();
      console.log('API Client - Response data:', data);
      
      // Check if the response already has the expected ApiResponse structure
      if (data && typeof data === 'object' && 'success' in data) {
        return data;
      }
      
      // Wrap the response in ApiResponse format if it doesn't have it
      return {
        data,
        success: true,
        message: 'Success'
      };
    } catch (error: unknown) {
      console.error('API Client - Error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(408, 'Request timeout');
      }
      
      throw new ApiError(500, 'Network error', error);
    }
  }

  // GET request
  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  // POST request
  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Create a default API client instance
export const apiClient = new ApiClient();

// Utility function to get the current API base URL
export const getApiBaseUrl = (): string => {
  return env.api.baseUrl;
};

// Utility function to get the current user ID
export const getCurrentUserId = (): string => {
  return env.user.id;
};

// Utility function to check if we're in development
export const isDevelopment = (): boolean => {
  return env.environment === 'development';
};

// Utility function to get user context
export const getUserContext = (): UserContext => {
  return apiClient.getUserContext();
};
