import { apiHandler } from './apiHandler';
import {
    HeroSection,
    CreateHeroRequest,
    UpdateHeroRequest
} from '@/types';

const API_BASE_URL = 'http://localhost:5000/api';

class HeroService {
    // GET /api/hero/all (List All Hero Sections)
    async getHeroes(): Promise<HeroSection[] | null> {
        try {
            const { data, error } = await apiHandler.handleRequest<{ success: boolean; data: HeroSection[] }>(
                `${API_BASE_URL}/hero/all`
            );

            if (error) {
                console.error('Get heroes error:', error.message);
                return null;
            }

            return data?.data || null;
        } catch (error) {
            console.error('Get heroes error:', error);
            return null;
        }
    }

    // POST /api/hero (Create Hero Section)
    async createHero(heroData: CreateHeroRequest): Promise<{ success: boolean; data?: HeroSection; error?: string }> {
        try {
            const { data, error } = await apiHandler.handleRequest<{ success: boolean; data: HeroSection }>(
                `${API_BASE_URL}/hero`,
                {
                    method: 'POST',
                    body: JSON.stringify(heroData),
                }
            );

            if (error) {
                console.error('Create hero error:', error.message);
                return { success: false, error: error.message };
            }

            return { success: true, data: data?.data };
        } catch (error: any) {
            console.error('Create hero error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }

    // PUT /api/hero/:id (Update Hero Section)
    async updateHero(id: string, heroData: UpdateHeroRequest): Promise<{ success: boolean; data?: HeroSection; error?: string }> {
        try {
            const { data, error } = await apiHandler.handleRequest<{ success: boolean; data: HeroSection }>(
                `${API_BASE_URL}/hero/${id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(heroData),
                }
            );

            if (error) {
                console.error('Update hero error:', error.message);
                return { success: false, error: error.message };
            }

            return { success: true, data: data?.data };
        } catch (error: any) {
            console.error('Update hero error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }

    // DELETE /api/hero/:id (Delete Hero Section)
    async deleteHero(id: string): Promise<{ success: boolean; error?: string }> {
        try {
            const { data, error } = await apiHandler.handleRequest<{ success: boolean; message: string }>(
                `${API_BASE_URL}/hero/${id}`,
                {
                    method: 'DELETE',
                }
            );

            if (error) {
                console.error('Delete hero error:', error.message);
                return { success: false, error: error.message };
            }

            return { success: data?.success || false };
        } catch (error: any) {
            console.error('Delete hero error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }

    // PATCH /api/hero/:id/activate (Activate Hero Section)
    async activateHero(id: string): Promise<{ success: boolean; data?: HeroSection; error?: string }> {
        try {
            const { data, error } = await apiHandler.handleRequest<{ success: boolean; data: HeroSection }>(
                `${API_BASE_URL}/hero/${id}/activate`,
                {
                    method: 'PATCH',
                }
            );

            if (error) {
                console.error('Activate hero error:', error.message);
                return { success: false, error: error.message };
            }

            return { success: true, data: data?.data };
        } catch (error: any) {
            console.error('Activate hero error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }

    // PATCH /api/hero/:id/deactivate (Deactivate Hero Section)
    async deactivateHero(id: string): Promise<{ success: boolean; data?: HeroSection; error?: string }> {
        try {
            const { data, error } = await apiHandler.handleRequest<{ success: boolean; data: HeroSection }>(
                `${API_BASE_URL}/hero/${id}/deactivate`,
                {
                    method: 'PATCH',
                }
            );

            if (error) {
                console.error('Deactivate hero error:', error.message);
                return { success: false, error: error.message };
            }

            return { success: true, data: data?.data };
        } catch (error: any) {
            console.error('Deactivate hero error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }
}

export const heroService = new HeroService();
