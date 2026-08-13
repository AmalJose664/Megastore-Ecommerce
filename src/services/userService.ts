import { CONFIG } from '@/configs/env.config';
import { apiHandler } from './apiHandler';
import { User, Order, ApiResponse } from '@/types';

const API_BASE_URL = CONFIG.API_BASE_URL;

export interface UserDetailsResponse {
  user: User;
  orders: Order[];
}

class UserService {
  // GET /api/v1/users (Get All Users)
  async getUsers(): Promise<User[] | null> {
    try {
      const { data, error } = await apiHandler.handleRequest<ApiResponse<User[]>>(
        `${API_BASE_URL}/users`
      );

      if (error) {
        console.error('Get users error:', error.message);
        return null;
      }

      return data?.data || null;
    } catch (error) {
      console.error('Get users error:', error);
      return null;
    }
  }

  // GET /api/v1/users/:id (Get User Details & Order History)
  async getUserById(id: string): Promise<UserDetailsResponse | null> {
    try {
      const { data, error } = await apiHandler.handleRequest<ApiResponse<UserDetailsResponse>>(
        `${API_BASE_URL}/users/${id}`
      );

      if (error) {
        console.error('Get user by ID error:', error.message);
        return null;
      }

      return data?.data || null;
    } catch (error) {
      console.error('Get user by ID error:', error);
      return null;
    }
  }

  // PATCH /api/v1/users/:id/status (Toggle User Status)
  async toggleUserStatus(id: string, isActive?: boolean): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await apiHandler.handleRequest<ApiResponse<any>>(
        `${API_BASE_URL}/users/${id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ isActive }),
        }
      );

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: data?.success || false, data: data?.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const userService = new UserService();
