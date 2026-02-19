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

  async getMonthlyRevenue(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: OrderStatus.CANCELLED },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]);
    return result[0]?.total || 0;
  }

  async getDailySales(days: number = 7): Promise<{ date: string; revenue: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.model.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: OrderStatus.CANCELLED },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return result.map(item => ({
      date: item._id,
      revenue: item.revenue,
    }));
  }
}

export const orderRepository = new OrderRepository();