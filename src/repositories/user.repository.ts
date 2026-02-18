import { BaseRepository } from './base.repository';
import { User } from '../models';
import { IUser } from '../types';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
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
}

export const userRepository = new UserRepository();