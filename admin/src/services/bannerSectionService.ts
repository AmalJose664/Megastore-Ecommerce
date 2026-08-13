import { CONFIG } from '@/configs/env.config';
import { apiHandler } from './apiHandler';
import { BannerSection, CreateBannerSectionRequest, UpdateBannerSectionRequest, ApiResponse } from '@/types';

const API_BASE_URL = CONFIG.API_BASE_URL;

class BannerSectionService {
  async getAllSections(): Promise<BannerSection[] | null> {
    try {
      const { data, error } = await apiHandler.handleRequest<ApiResponse<BannerSection[]>>(
        `${API_BASE_URL}/banner-sections`
      );

      if (error) {
        console.error('Get all banner sections error:', error.message);
        return null;
      }

      return data?.data || null;
    } catch (error) {
      console.error('Get all banner sections error:', error);
      return null;
    }
  }

  async createSection(section: CreateBannerSectionRequest): Promise<BannerSection | null> {
    try {
      const { data, error } = await apiHandler.handleRequest<ApiResponse<BannerSection>>(
        `${API_BASE_URL}/banner-sections`,
        {
          method: 'POST',
          body: JSON.stringify(section),
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      return data?.data || null;
    } catch (error: any) {
      console.error('Create banner section error:', error);
      throw error;
    }
  }

  async updateSection(id: string, section: UpdateBannerSectionRequest): Promise<BannerSection | null> {
    try {
      const { data, error } = await apiHandler.handleRequest<ApiResponse<BannerSection>>(
        `${API_BASE_URL}/banner-sections/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(section),
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      return data?.data || null;
    } catch (error: any) {
      console.error('Update banner section error:', error);
      throw error;
    }
  }

  async deleteSection(id: string): Promise<boolean> {
    try {
      const { error } = await apiHandler.handleRequest<ApiResponse<any>>(
        `${API_BASE_URL}/banner-sections/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (error) {
        console.error('Delete banner section error:', error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete banner section error:', error);
      return false;
    }
  }
}

export const bannerSectionService = new BannerSectionService();
