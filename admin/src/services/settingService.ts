import { CONFIG } from '@/configs/env.config';
import { apiHandler } from './apiHandler';
import { SiteSettings, ApiResponse } from '@/types';

const API_BASE_URL = CONFIG.API_BASE_URL;

class SettingService {
  async getSettings(): Promise<SiteSettings | null> {
    try {
      const { data, error } = await apiHandler.handleRequest<ApiResponse<SiteSettings>>(
        `${API_BASE_URL}/settings`
      );

      if (error) {
        console.error('Get settings error:', error.message);
        return null;
      }

      return data?.data || null;
    } catch (error) {
      console.error('Get settings error:', error);
      return null;
    }
  }

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings | null> {
    try {
      const { data, error } = await apiHandler.handleRequest<ApiResponse<SiteSettings>>(
        `${API_BASE_URL}/settings`,
        {
          method: 'PUT',
          body: JSON.stringify(settings),
        }
      );

      if (error) {
        console.error('Update settings error:', error.message);
        return null;
      }

      return data?.data || null;
    } catch (error) {
      console.error('Update settings error:', error);
      return null;
    }
  }
}

export const settingService = new SettingService();
