import { apiHandler } from './apiHandler';
import {
    Banner,
    BannerListResponse,
    CreateBannerRequest,
    UpdateBannerRequest
} from '@/types';

const API_BASE_URL = 'http://localhost:5000/api';

class BannersService {
    // GET /api/banners (List All Banners - Admin Only)
    async getBanners(): Promise<Banner[] | null> {
        try {
            const { data, error } = await apiHandler.handleRequest<BannerListResponse>(
                `${API_BASE_URL}/banners`
            );

            if (error) {
                console.error('Get banners error:', error.message);
                return null;
            }

            return data?.data || null;
        } catch (error) {
            console.error('Get banners error:', error);
            return null;
        }
    }

    // GET /api/banners/:id (Get Banner by ID - Admin Only)
    async getBannerById(id: string): Promise<Banner | null> {
        try {
            const { data, error } = await apiHandler.handleRequest<{ success: boolean; data: Banner }>(
                `${API_BASE_URL}/banners/${id}`
            );

            if (error) {
                console.error('Get banner error:', error.message);
                return null;
            }

            return data?.success ? data.data : null;
        } catch (error) {
            console.error('Get banner error:', error);
            return null;
        }
    }

    // POST /api/banners (Create Banner - Admin Only)
    async createBanner(bannerData: CreateBannerRequest): Promise<Banner | null> {
        try {
            const { data, error } = await apiHandler.handleRequest<{ success: boolean; data: Banner }>(
                `${API_BASE_URL}/banners`,
                {
                    method: 'POST',
                    body: JSON.stringify(bannerData),
                }
            );

            if (error) {
                console.error('Create banner error:', error.message);
                return null;
            }

            return data?.success ? data.data : null;
        } catch (error) {
            console.error('Create banner error:', error);
            return null;
        }
    }

    // PUT /api/banners/:id (Update Banner - Admin Only)
    async updateBanner(id: string, bannerData: UpdateBannerRequest): Promise<Banner | null> {
        try {
            const { data, error } = await apiHandler.handleRequest<{ success: boolean; data: Banner }>(
                `${API_BASE_URL}/banners/${id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(bannerData),
                }
            );

            if (error) {
                console.error('Update banner error:', error.message);
                return null;
            }

            return data?.success ? data.data : null;
        } catch (error) {
            console.error('Update banner error:', error);
            return null;
        }
    }

    // DELETE /api/banners/:id (Delete Banner - Admin Only)
    async deleteBanner(id: string): Promise<boolean> {
        try {
            const { data, error } = await apiHandler.handleRequest<{ success: boolean; message: string }>(
                `${API_BASE_URL}/banners/${id}`,
                {
                    method: 'DELETE',
                }
            );

            if (error) {
                console.error('Delete banner error:', error.message);
                return false;
            }

            return data?.success || false;
        } catch (error) {
            console.error('Delete banner error:', error);
            return false;
        }
    }
}

export const bannersService = new BannersService();
