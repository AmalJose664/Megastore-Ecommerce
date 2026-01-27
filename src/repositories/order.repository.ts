import { BaseRepository } from './base.repository';
import { Order } from '../models';
import { IOrder, OrderStatus } from '../types';

export class OrderRepository extends BaseRepository<IOrder> {
  constructor() {
    super(Order);
  }

  async findByUser(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ orders: IOrder[]; total: number }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.model
        .find({ user: userId })
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.model.countDocuments({ user: userId }),
    ]);

    return { orders, total };
  }

  async findByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    return this.model
      .findOne({ orderNumber: orderNumber.toUpperCase() })
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name images');
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<IOrder | null> {
    const update: any = { status };

    if (status === OrderStatus.DELIVERED) {
      update.deliveredAt = new Date();
    } else if (status === OrderStatus.CANCELLED) {
      update.cancelledAt = new Date();
    }

    return this.model.findByIdAndUpdate(orderId, update, { new: true });
  }

  async getOrderStats(): Promise<any> {
    return this.model.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
        },
      },
    ]);
  }

  async getRecentOrders(limit: number = 10): Promise<IOrder[]> {
    return this.model
      .find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

export const orderRepository = new OrderRepository();