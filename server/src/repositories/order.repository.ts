import { FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Order } from '../models';
import { IOrder } from '../types';

export interface OrderFilters {
  search?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
}

export class OrderRepository extends BaseRepository<IOrder> {
  constructor() {
    super(Order);
  }

  async findWithFilters(
    filters: OrderFilters,
    page: number,
    limit: number,
    sort: string = 'createdAt',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<{ orders: IOrder[]; total: number }> {
    const query: FilterQuery<IOrder> = {};

    if (filters.status && filters.status !== 'all') {
      query.status = filters.status as any;
    }

    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      query.paymentStatus = filters.paymentStatus as any;
    }

    if (filters.paymentMethod && filters.paymentMethod !== 'all') {
      query.paymentMethod = filters.paymentMethod as any;
    }

    if (filters.search) {
      const regex = { $regex: filters.search, $options: 'i' };
      query.$or = [
        { orderNumber: regex },
        { 'shippingAddress.fullName': regex },
        { 'shippingAddress.city': regex },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOption: any = { [sort]: order === 'asc' ? 1 : -1 };

    const [orders, total] = await Promise.all([
      this.model.find(query).sort(sortOption).skip(skip).limit(limit),
      this.model.countDocuments(query),
    ]);

    return { orders, total };
  }

  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ orders: IOrder[]; total: number }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.model
        .find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.model.countDocuments({ user: userId }),
    ]);

    return { orders, total };
  }

  async findByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    return this.model.findOne({ orderNumber });
  }

  async updateStatus(orderId: string, status: string): Promise<IOrder | null> {
    return this.model.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
  }

  async updateStatusDetails(
    orderId: string,
    updateData: Record<string, any>
  ): Promise<IOrder | null> {
    return this.model.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true }
    );
  }

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: string,
    paymentDetails?: Record<string, unknown>
  ): Promise<IOrder | null> {
    const updateData: Record<string, unknown> = { paymentStatus };
    if (paymentDetails) {
      updateData.paymentDetails = paymentDetails;
    }

    return this.model.findByIdAndUpdate(orderId, updateData, { new: true });
  }

  async countByStatus(status: string): Promise<number> {
    return this.model.countDocuments({ status });
  }

  async findAllByUserId(userId: string): Promise<IOrder[]> {
    return this.model.find({ user: userId }).sort({ createdAt: -1 });
  }

  async getUserStatsGrouped(): Promise<Array<{ _id: any; ordersCount: number; totalSpent: number }>> {
    return this.model.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$user',
          ordersCount: { $sum: 1 },
          totalSpent: { $sum: '$total' },
        },
      },
    ]);
  }

  async getAllOrderCountsGrouped(): Promise<Array<{ _id: any; totalOrders: number }>> {
    return this.model.aggregate([
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
        },
      },
    ]);
  }

  async getMonthlyRevenue(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
        },
      },
    ]);
    return result.length > 0 ? result[0].totalRevenue : 0;
  }

  async countInRange(startDate: Date, endDate: Date): Promise<number> {
    return this.model.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });
  }

  async getDailySales(days: number = 7): Promise<Array<{ date: string; revenue: number }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.model.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return result.map((r) => ({ date: r._id, revenue: r.sales }));
  }

  async getAnalyticsData(startDate?: Date, endDate?: Date) {
    const matchStage: any = { status: { $ne: 'cancelled' } };
    if (startDate && endDate) {
      matchStage.createdAt = { $gte: startDate, $lte: endDate };
    }

    const [salesTrend, topProducts, categorySales, summary] = await Promise.all([
      this.model.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            ordersCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      this.model.aggregate([
        { $match: matchStage },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            name: { $first: '$items.name' },
            image: { $first: '$items.image' },
            unitsSold: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.total' },
          },
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 10 },
      ]),

      this.model.aggregate([
        { $match: matchStage },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productDoc',
          },
        },
        { $unwind: { path: '$productDoc', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'categories',
            localField: 'productDoc.category',
            foreignField: '_id',
            as: 'categoryDoc',
          },
        },
        { $unwind: { path: '$categoryDoc', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$categoryDoc._id',
            categoryName: { $first: { $ifNull: ['$categoryDoc.name', 'General'] } },
            revenue: { $sum: '$items.total' },
          },
        },
        { $sort: { revenue: -1 } },
      ]),

      this.model.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalRev = summary[0]?.totalRevenue || 0;
    const totalOrd = summary[0]?.totalOrders || 0;
    const avgOrderVal = totalOrd > 0 ? Math.round(totalRev / totalOrd) : 0;

    const categoryBreakdown = categorySales.map((c) => ({
      categoryId: c._id ? c._id.toString() : 'other',
      categoryName: c.categoryName || 'General',
      revenue: c.revenue,
      percentage: totalRev > 0 ? Math.round((c.revenue / totalRev) * 100) : 0,
    }));

    return {
      salesTrend: salesTrend.map((s) => ({ date: s._id, revenue: s.revenue, ordersCount: s.ordersCount })),
      topProducts: topProducts.map((p) => ({
        id: p._id ? p._id.toString() : '',
        name: p.name,
        image: p.image,
        unitsSold: p.unitsSold,
        revenue: p.revenue,
      })),
      categoryBreakdown,
      totalRevenue: totalRev,
      totalOrders: totalOrd,
      avgOrderValue: avgOrderVal,
    };
  }
}

export const orderRepository = new OrderRepository();
