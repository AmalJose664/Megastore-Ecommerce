import { CONFIG } from '@/configs/env.config';
import { apiHandler } from './apiHandler';
import { Order, ApiResponse, OrderQueryParams, OrderListResponse } from '@/types';

const API_BASE_URL = CONFIG.API_BASE_URL;

class OrderService {
    private buildQuery(params: OrderQueryParams): string {
        const query = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, value.toString());
            }
        });

        return query.toString() ? `?${query.toString()}` : '';
    }

    // GET /api/orders/admin/all (List All Orders for Admin)
    async getAllOrders(params: OrderQueryParams = {}): Promise<OrderListResponse | null> {
        try {
            const queryString = this.buildQuery(params);
            const { data, error } = await apiHandler.handleRequest<OrderListResponse>(
                `${API_BASE_URL}/orders/admin/all${queryString}`
            );

            if (error) {
                console.error('Get all orders error:', error.message);
                return null;
            }

            return data || null;
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
    async updateOrderStatus(
        id: string,
        status: string,
        extraData?: {
            carrier?: string;
            trackingNumber?: string;
            notes?: string;
            estimatedDelivery?: string;
        }
    ): Promise<{ success: boolean; data?: Order; error?: string }> {
        try {
            const { data, error } = await apiHandler.handleRequest<ApiResponse<Order>>(
                `${API_BASE_URL}/orders/${id}/status`,
                {
                    method: 'PUT',
                    body: JSON.stringify({ status, ...extraData }),
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

    // PUT /api/orders/bulk-status (Bulk Update Orders Status)
    async bulkUpdateOrderStatus(
        orderIds: string[],
        status: string,
        extraData?: { carrier?: string; trackingNumber?: string; notes?: string }
    ): Promise<{ success: boolean; count?: number; error?: string }> {
        try {
            const { data, error } = await apiHandler.handleRequest<ApiResponse<any>>(
                `${API_BASE_URL}/orders/bulk-status`,
                {
                    method: 'PUT',
                    body: JSON.stringify({ orderIds, status, ...extraData }),
                }
            );

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: data?.success || false, count: data?.data?.length || orderIds.length };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
}

export const orderService = new OrderService();
