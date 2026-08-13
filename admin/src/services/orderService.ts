import { CONFIG } from '@/configs/env.config';
import { apiHandler } from './apiHandler';
import { Order, ApiResponse } from '@/types';

const API_BASE_URL = CONFIG.API_BASE_URL;

class OrderService {
    // GET /api/orders/admin/all (List All Orders for Admin)
    async getAllOrders(): Promise<Order[] | null> {
        try {
            const { data, error } = await apiHandler.handleRequest<ApiResponse<Order[]>>(
                `${API_BASE_URL}/orders/admin/all`
            );

            if (error) {
                console.error('Get all orders error:', error.message);
                return null;
            }

            return data?.data || null;
        } catch (error) {
            console.error('Get all orders error:', error);
            return null;
        }
    }

    // GET /api/orders/:id (Get Order Details)
    async getOrderById(id: string): Promise<Order | null> {
        try {
            const { data, error } = await apiHandler.handleRequest<ApiResponse<Order>>(
                `${API_BASE_URL}/orders/${id}`
            );

            if (error) {
                console.error('Get order by ID error:', error.message);
                return null;
            }

            return data?.data || null;
        } catch (error) {
            console.error('Get order by ID error:', error);
            return null;
        }
    }

    // PUT /api/orders/:id/status (Update Order Status)
    async updateOrderStatus(id: string, status: string): Promise<{ success: boolean; error?: string }> {
        try {
            const { data, error } = await apiHandler.handleRequest<ApiResponse<any>>(
                `${API_BASE_URL}/orders/${id}/status`,
                {
                    method: 'PUT',
                    body: JSON.stringify({ status }),
                }
            );

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: data?.success || false };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
}

export const orderService = new OrderService();
