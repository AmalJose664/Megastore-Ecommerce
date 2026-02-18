import { authService } from './authService';

interface ApiError {
  message: string;
  status: number;
}

class ApiHandler {
  async handleRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<{ data?: T; error?: ApiError }> {
    try {
      // Add default headers
      const defaultHeaders = {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      };

      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401) {
        const refreshResult = await authService.refreshToken();
        if (refreshResult.success) {
          // Retry the original request with new token
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...defaultHeaders,
              ...options.headers,
              Authorization: `Bearer ${authService.getAccessToken()}`,
            },
          });
          
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            return { data };
          } else {
            // If retry fails, logout user
            await authService.logout();
            return { 
              error: { 
                message: 'Session expired. Please login again.', 
                status: 401 
              } 
            };
          }
        } else {
          // Refresh failed, logout user
          await authService.logout();
          return { 
            error: { 
              message: 'Session expired. Please login again.', 
              status: 401 
            } 
          };
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        return { 
          error: { 
            message: errorData.message || 'Request failed', 
            status: response.status 
          } 
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request error:', error);
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'Network error', 
          status: 0 
        } 
      };
    }
  }
}

export const apiHandler = new ApiHandler();