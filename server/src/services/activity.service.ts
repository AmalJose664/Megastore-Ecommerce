import { activityRepository } from '../repositories/activity.repository';
import { IActivity, ActivityType } from '../types';

export class ActivityService {
    async getRecentActivities(limit: number = 20): Promise<IActivity[]> {
        return activityRepository.getRecentActivities(limit);
    }

    async logActivity(
        type: ActivityType,
        title: string,
        description: string,
        userId?: string,
        metadata?: any
    ): Promise<IActivity> {
        return activityRepository.create({
            type,
            title,
            description,
            user: userId as any,
            metadata,
        } as any);
    }

    async logOrderCreated(order: any, userId: string, userName: string): Promise<IActivity> {
        return this.logActivity(
            ActivityType.ORDER_CREATED,
            'Order Created',
            `New order #${order.orderNumber} placed by ${userName}`,
            userId,
            {
                orderId: order._id,
                orderNumber: order.orderNumber,
                userName,
            }
        );
    }

    async logOrderShipped(order: any, userName: string): Promise<IActivity> {
        return this.logActivity(
            ActivityType.ORDER_SHIPPED,
            'Order Shipped',
            `Order #${order.orderNumber} marked as shipped`,
            order.user,
            {
                orderId: order._id,
                orderNumber: order.orderNumber,
                userName,
            }
        );
    }

    async logOrderDelivered(order: any, userName: string): Promise<IActivity> {
        return this.logActivity(
            ActivityType.ORDER_DELIVERED,
            'Order Delivered',
            `Order #${order.orderNumber} delivered successfully`,
            order.user,
            {
                orderId: order._id,
                orderNumber: order.orderNumber,
                userName,
            }
        );
    }

    async logProductUpdated(product: any, oldPrice: number, newPrice: number): Promise<IActivity> {
        return this.logActivity(
            ActivityType.PRODUCT_UPDATED,
            'Product Updated',
            `${product.name} price updated to $${newPrice}`,
            undefined,
            {
                productId: product._id,
                productName: product.name,
                oldPrice,
                newPrice,
            }
        );
    }

    async logUserRegistered(user: any): Promise<IActivity> {
        const userName = `${user.firstName} ${user.lastName}`;
        return this.logActivity(
            ActivityType.USER_REGISTERED,
            'User Registered',
            `New user ${userName} registered`,
            user._id,
            {
                userId: user._id,
                userName,
            }
        );
    }
}

export const activityService = new ActivityService();
