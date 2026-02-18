import { CONFIG } from '@/configs/env.config';
import { apiHandler } from './apiHandler';
import {
    PromoSection,
    CreatePromoRequest,
    UpdatePromoRequest
} from '@/types';

const API_BASE_URL = CONFIG.API_BASE_URL;

class PromoService {
    // GET /api/promo/all (List All Promo Sections)
    async getPromos(): Promise<PromoSection[] | null> {
        try {
            const { data, error } = await apiHandler.handleRequest<{ success: boolean; data: PromoSection[] }>(
                `${API_BASE_URL}/promo/all`
            );

            if (error) {
                console.error('Get promos error:', error.message);
                return null;
            }

            return data?.data || null;
        } catch (error) {
            console.error('Get promos error:', error);
            return null;
        }
    }

    // POST /api/promo (Create Promo Section)
    async createPromo(promoData: CreatePromoRequest): Promise<{ success: boolean; data?: PromoSection; error?: string }> {
        try {
            const { data, error } = await apiHandler.handleRequest<{ success: boolean; data: PromoSection }>(
                `${API_BASE_URL}/promo`,
                {
                    method: 'POST',
                    body: JSON.stringify(promoData),
                }
            );

            if (error) {
                console.error('Create promo error:', error.message);
                return { success: false, error: error.message };
            }

            return { success: true, data: data?.data };
        } catch (error: any) {
            console.error('Create promo error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }

    // PUT /api/promo/:id (Update Promo Section)
    async updatePromo(id: string, promoData: UpdatePromoRequest): Promise<{ success: boolean; data?: PromoSection; error?: string }> {
        try {
            const { data, error } = await apiHandler.handleRequest<{ success: boolean; data: PromoSection }>(
                `${API_BASE_URL}/promo/${id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(promoData),
                }
            );

            if (error) {
                console.error('Update promo error:', error.message);
                return { success: false, error: error.message };
            }

            return { success: true, data: data?.data };
        } catch (error: any) {
            console.error('Update promo error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }

    // DELETE /api/promo/:id (Delete Promo Section)
    async deletePromo(id: string): Promise<{ success: boolean; error?: string }> {
        try {
            const { data, error } = await apiHandler.handleRequest<{ success: boolean; message: string }>(
                `${API_BASE_URL}/promo/${id}`,
                {
                    method: 'DELETE',
                }
            );

            if (error) {
                console.error('Delete promo error:', error.message);
                return { success: false, error: error.message };
            }

            return { success: data?.success || false };
        } catch (error: any) {
            console.error('Delete promo error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }

    // PATCH /api/promo/:id/activate (Activate Promo Section)
    async activatePromo(id: string): Promise<{ success: boolean; data?: PromoSection; error?: string }> {
        try {
            const url = `${API_BASE_URL}/promo/${id}/activate`;
            console.log('🌐 Activating promo - URL:', url);

            const { data, error } = await apiHandler.handleRequest<{ success: boolean; data: PromoSection }>(
                url,
                {
                    method: 'PATCH',
                }
            );

            console.log('📦 Raw API Response:', { data, error });

            if (error) {
                console.error('Activate promo error:', error.message);
                return { success: false, error: error.message };
            }

            return { success: true, data: data?.data };
        } catch (error: any) {
            console.error('Activate promo error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }

    // PATCH /api/promo/:id/deactivate (Deactivate Promo Section)
    async deactivatePromo(id: string): Promise<{ success: boolean; data?: PromoSection; error?: string }> {
        try {
            const url = `${API_BASE_URL}/promo/${id}/deactivate`;
            console.log('🌐 Deactivating promo - URL:', url);

            const { data, error } = await apiHandler.handleRequest<{ success: boolean; data: PromoSection }>(
                url,
                {
                    method: 'PATCH',
                }
            );

            console.log('📦 Raw API Response:', { data, error });

            if (error) {
                console.error('Deactivate promo error:', error.message);
                return { success: false, error: error.message };
            }

            return { success: true, data: data?.data };
        } catch (error: any) {
            console.error('Deactivate promo error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }
}

export const promoService = new PromoService();
