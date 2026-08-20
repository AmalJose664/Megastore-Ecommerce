import { FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { User } from '../models';
import { IUser } from '../types';

export interface UserFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  role?: 'all' | 'admin' | 'customer' | 'user';
}

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findWithFilters(filters: UserFilters = {}): Promise<IUser[]> {
    const query: FilterQuery<IUser> = {};

    if (filters.status === 'active') {
      query.isActive = true;
    } else if (filters.status === 'inactive') {
      query.isActive = false;
    }

    if (filters.role && filters.role !== 'all') {
      if (filters.role === 'customer' || filters.role === 'user') {
        query.role = { $in: ['customer', 'user'] as any };
      } else {
        query.role = filters.role as any;
      }
    }

    if (filters.search) {
      const regex = { $regex: filters.search, $options: 'i' };
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
      ];
    }

    return this.model.find(query).sort({ createdAt: -1 });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email: email.toLowerCase() }).select('+password +refreshToken');
  }

  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return this.model.findById(id).select('+password');
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { refreshToken },
      { new: true }
    );
  }

  async setResetPasswordToken(
    userId: string,
    token: string,
    expires: Date
  ): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { resetPasswordToken: token, resetPasswordExpires: expires },
      { new: true }
    );
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    return this.model.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');
  }

  async findByRefreshToken(refreshToken: string): Promise<IUser | null> {
    return this.model.findOne({ refreshToken }).select('+refreshToken');
  }

  async clearResetPasswordToken(userId: string): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 } },
      { new: true }
    );
  }

  async findAllSorted(): Promise<IUser[]> {
    return this.model.find({}).sort({ createdAt: -1 });
  }

  async updateStatus(userId: string, isActive: boolean): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(userId, { isActive }, { new: true });
  }
}

export const userRepository = new UserRepository();