import { authService } from './authService';

interface ApiError {
  message: string;
  status: number;
}

class ApiHandler {
  private isRefreshing = false;
  private failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else if (token) {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private getHeaders(customHeaders?: HeadersInit): Record<string, string> {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authService.getAuthHeaders(),
    };

    if (customHeaders) {
      if (customHeaders instanceof Headers) {
        customHeaders.forEach((value, key) => {
          defaultHeaders[key] = value;
        });
      } else if (Array.isArray(customHeaders)) {
        customHeaders.forEach(([key, value]) => {
          defaultHeaders[key] = value;
        });
      } else {
        Object.assign(defaultHeaders, customHeaders);
      }
    }

    return defaultHeaders;
  }

  async handleRequest<T>(
    url: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<{ data?: T; error?: ApiError }> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(options.headers),
      });

      // Handle 401 Unauthorized - try to refresh token (except for login/logout/refresh endpoints)
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/refresh-token');
      if (response.status === 401 && !isRetry && !isAuthEndpoint) {
        if (this.isRefreshing) {
          try {
            const newToken = await new Promise<string>((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            });

            return this.handleRequest<T>(
              url,
              {
                ...options,
                headers: {
                  ...options.headers,
                  Authorization: `Bearer ${newToken}`,
                },
              },
              true
            );
          } catch (queueErr: any) {
            return {
              error: {
                message: queueErr?.message || 'Session expired. Please login again.',
                status: 401,
              },
            };
          }
        }

        this.isRefreshing = true;

        try {
          const refreshResult = await authService.refreshToken();

          if (refreshResult.success && refreshResult.tokens?.accessToken) {
            const newAccessToken = refreshResult.tokens.accessToken;
            this.processQueue(null, newAccessToken);

            return this.handleRequest<T>(
              url,
              {
                ...options,
                headers: {
                  ...options.headers,
                  Authorization: `Bearer ${newAccessToken}`,
                },
              },
              true
            );
          } else {
            const authErr = new Error('Session expired. Please login again.');
            this.processQueue(authErr, null);
            await authService.logout();
            return {
              error: {
                message: 'Session expired. Please login again.',
                status: 401,
              },
            };
          }
        } catch (refreshErr) {
          this.processQueue(refreshErr, null);
          await authService.logout();
          return {
            error: {
              message: 'Session expired. Please login again.',
              status: 401,
            },
          };
        } finally {
          this.isRefreshing = false;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        return {
          error: {
            message: errorData.message || 'Request failed',
            status: response.status,
          },
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request error:', error);
      return {
        error: {
          message: error instanceof Error ? error.message : 'Network error',
          status: 0,
        },
      };
    }
  }
}

export const apiHandler = new ApiHandler();