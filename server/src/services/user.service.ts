import { userRepository, UserRepository, UserFilters } from '../repositories/user.repository';
import { orderRepository, OrderRepository } from '../repositories/order.repository';
import { ApiError } from '../utils/ApiError';
import { OrderStatus } from '../types';

export class UserService {
  constructor(
    private userRepo: UserRepository = userRepository,
    private orderRepo: OrderRepository = orderRepository
  ) {}

  /**
   * Get all users with aggregated ordersCount and totalSpent via Repository
   */
  async getAllUsers(filters: UserFilters = {}) {
    const users = await this.userRepo.findWithFilters(filters);

    // Aggregate stats via OrderRepository
    const userStats = await this.orderRepo.getUserStatsGrouped();
    const allOrderCounts = await this.orderRepo.getAllOrderCountsGrouped();

    // Create maps for fast lookup
    const statsMap = new Map<string, { ordersCount: number; totalSpent: number }>();
    userStats.forEach((stat) => {
      if (stat._id) {
        statsMap.set(stat._id.toString(), {
          ordersCount: stat.ordersCount || 0,
          totalSpent: stat.totalSpent || 0,
        });
      }
    });

    const orderCountMap = new Map<string, number>();
    allOrderCounts.forEach((stat) => {
      if (stat._id) {
        orderCountMap.set(stat._id.toString(), stat.totalOrders || 0);
      }
    });

    return users.map((user: any) => {
      const userIdStr = user._id.toString();
      const stats = statsMap.get(userIdStr) || { ordersCount: 0, totalSpent: 0 };
      const totalOrdersCount = orderCountMap.get(userIdStr) || 0;

      return {
        id: userIdStr,
        _id: userIdStr,
        name: `${user.firstName} ${user.lastName}`.trim(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        status: user.isActive ? 'active' : 'inactive',
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        ordersCount: totalOrdersCount,
        totalSpent: stats.totalSpent,
      };
    });
  }

  /**
   * Get user details by ID including order history via Repository
   */
  async getUserById(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const userIdStr = (user as any)._id.toString();

    // Fetch user's orders via OrderRepository
    const orders = await this.orderRepo.findAllByUserId(userId);

    const totalSpent = orders
      .filter((o) => o.status !== OrderStatus.CANCELLED)
      .reduce((sum, o) => sum + o.total, 0);

    return {
      user: {
        id: userIdStr,
        _id: userIdStr,
        name: `${user.firstName} ${user.lastName}`.trim(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        status: user.isActive ? 'active' : 'inactive',
        isActive: user.isActive,
        createdAt: (user as any).createdAt,
        updatedAt: (user as any).updatedAt,
        ordersCount: orders.length,
        totalSpent,
      },
      orders,
    };
  }

  /**
   * Toggle or update user active status via Repository
   */
  async updateUserStatus(userId: string, isActive?: boolean, status?: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    let targetIsActive: boolean;
    if (isActive !== undefined) {
      targetIsActive = isActive;
    } else if (status !== undefined) {
      targetIsActive = status === 'active';
    } else {
      targetIsActive = !user.isActive;
    }

    const updatedUser = await this.userRepo.updateStatus(userId, targetIsActive);
    if (!updatedUser) {
      throw ApiError.internal('Failed to update user status');
    }

    return {
      id: (updatedUser as any)._id.toString(),
      _id: (updatedUser as any)._id.toString(),
      name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.isActive ? 'active' : 'inactive',
      isActive: updatedUser.isActive,
    };
  }
}

export const userService = new UserService(userRepository, orderRepository);
