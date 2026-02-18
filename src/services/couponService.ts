import { CONFIG } from '@/configs/env.config';
import { apiHandler } from './apiHandler';
import {
    Coupon,
    CreateCouponRequest,
    UpdateCouponRequest,
    ApiResponse
} from '@/types';

const API_BASE_URL = CONFIG.API_BASE_URL;

class CouponService {
    // GET /api/coupons (List All Coupons)
    async getCoupons(): Promise<Coupon[] | null> {
        try {
            const { data, error } = await apiHandler.handleRequest<ApiResponse<Coupon[]>>(
                `${API_BASE_URL}/coupons`
            );

            if (error) {
                console.error('Get coupons error:', error.message);
                return null;
            }

            return data?.data || null;
        } catch (error) {
            console.error('Get coupons error:', error);
            return null;
        }
    }

    // POST /api/coupons (Create Coupon)
    async createCoupon(couponData: CreateCouponRequest): Promise<{ success: boolean; data?: Coupon; error?: string }> {
        try {
            const { data, error } = await apiHandler.handleRequest<ApiResponse<Coupon>>(
                `${API_BASE_URL}/coupons`,
                {
                    method: 'POST',
                    body: JSON.stringify(couponData),
                }
            );

            if (error) {
                console.error('Create coupon error:', error.message);
                return { success: false, error: error.message };
            }

            return { success: true, data: data?.data };
        } catch (error: any) {
            console.error('Create coupon error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }

    // PUT /api/coupons/:id (Update Coupon)
    async updateCoupon(id: string, couponData: UpdateCouponRequest): Promise<{ success: boolean; data?: Coupon; error?: string }> {
        try {
            const { data, error } = await apiHandler.handleRequest<ApiResponse<Coupon>>(
                `${API_BASE_URL}/coupons/${id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(couponData),
                }
            );

            if (error) {
                console.error('Update coupon error:', error.message);
                return { success: false, error: error.message };
            }

            return { success: true, data: data?.data };
        } catch (error: any) {
            console.error('Update coupon error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }

    // DELETE /api/coupons/:id (Delete Coupon)
    async deleteCoupon(id: string): Promise<{ success: boolean; error?: string }> {
        try {
            const { data, error } = await apiHandler.handleRequest<ApiResponse<{ message: string }>>(
                `${API_BASE_URL}/coupons/${id}`,
                {
                    method: 'DELETE',
                }
            );

            if (error) {
                console.error('Delete coupon error:', error.message);
                return { success: false, error: error.message };
            }

            return { success: data?.success || false };
        } catch (error: any) {
            console.error('Delete coupon error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }

    // PATCH /api/coupons/:id/toggle (Activate/Deactivate Coupon)
    async toggleCouponStatus(id: string, isActive: boolean): Promise<{ success: boolean; data?: Coupon; error?: string }> {
        try {
            const { data, error } = await apiHandler.handleRequest<ApiResponse<Coupon>>(
                `${API_BASE_URL}/coupons/${id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({ isActive }),
                }
            );

            if (error) {
                console.error('Toggle coupon error:', error.message);
                return { success: false, error: error.message };
            }

            return { success: true, data: data?.data };
        } catch (error: any) {
            console.error('Toggle coupon error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }
}

export const couponService = new CouponService();
