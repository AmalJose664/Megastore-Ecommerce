import { apiHandler } from './apiHandler';
import { LoginRequest, LoginResponse, ChangePasswordRequest, RefreshTokenRequest, RefreshTokenResponse, AdminUser, AuthTokens } from '@/types';

const API_BASE_URL = 'http://localhost:5000/api';

class AuthService {

  async login(email: string, password: string): Promise<{ success: boolean; user?: AdminUser; tokens?: AuthTokens }> {
    try {
      const request: LoginRequest = { email, password };

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.data.user.role === 'admin') {
        // Store tokens
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);

        // Store user data
        const adminUser: AdminUser = {
          id: data.data.user._id,
          email: data.data.user.email,
          name: `${data.data.user.firstName} ${data.data.user.lastName}`,
          role: 'admin',
        };
        localStorage.setItem('admin_user', JSON.stringify(adminUser));

        return {
          success: true,
          user: adminUser,
          tokens: data.data.tokens
        };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  }

  async getProfile(): Promise<{ success: boolean; user?: AdminUser }> {
    try {
      const { data, error } = await apiHandler.handleRequest(`${API_BASE_URL}/auth/profile`);

      if (error) {
        throw new Error(error.message);
      }

      if (data && (data as any).success) {
        const adminUser: AdminUser = {
          id: (data as any).data.userId,
          email: localStorage.getItem('admin_user') ? JSON.parse(localStorage.getItem('admin_user')!).email : '',
          name: localStorage.getItem('admin_user') ? JSON.parse(localStorage.getItem('admin_user')!).name : '',
          role: 'admin',
        };
        return { success: true, user: adminUser };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      return { success: false };
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      const request: ChangePasswordRequest = { currentPassword, newPassword };
      const { data, error } = await apiHandler.handleRequest(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: (data as any)?.success || false, message: (data as any)?.message };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, message: 'Failed to change password' };
    }
  }

  async logout(): Promise<{ success: boolean }> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        await apiHandler.handleRequest(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }

      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('admin_user');

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if backend call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('admin_user');
      return { success: true };
    }
  }

  async refreshToken(): Promise<{ success: boolean; tokens?: AuthTokens }> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        return { success: false };
      }

      // Use fetch directly to avoid circular dependency with apiHandler on 401s
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Refresh failed');
      }

      if (data.success && data.data) {
        // Updated to match actual API response structure where data contains the tokens directly
        // Structure: { success: true, data: { accessToken: "...", refreshToken: "..." } }
        const tokens = data.data;

        if (tokens.accessToken && tokens.refreshToken) {
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          return { success: true, tokens: tokens };
        }
      }

      return { success: false };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false };
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken') && !!localStorage.getItem('admin_user');
  }

  getCurrentUser(): AdminUser | null {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getAuthHeaders() {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService();