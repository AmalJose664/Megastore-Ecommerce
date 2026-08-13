import { userRepository } from '../repositories';
import { ApiError } from '../utils/ApiError';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { AuthResponse, AuthTokens } from '../types';
import crypto from 'crypto';
import { activityService } from './activity.service';

export class AuthService {
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const user = await userRepository.create({
      ...data,
      email: data.email.toLowerCase(),
    });

    const tokens = generateTokens(user._id, user.role);
    await userRepository.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    // Log activity
    await activityService.logUserRegistered(user);

    return {
      user: user.toJSON() as any,
      tokens,
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('Account is deactivated');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const tokens = generateTokens(user._id, user.role);
    await userRepository.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      user: user.toJSON() as any,
      tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await userRepository.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw ApiError.unauthorized('Invalid refresh token');
      }

      const tokens = generateTokens(user._id, user.role);
      await userRepository.updateRefreshToken(user._id.toString(), tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  }

  async getProfile(userId: string): Promise<any> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  async logout(userId: string): Promise<void> {
    await userRepository.updateRefreshToken(userId, null);
  }

  async logoutWithToken(refreshToken: string): Promise<void> {
    const user = await userRepository.findByRefreshToken(refreshToken);
    if (user) {
      await userRepository.updateRefreshToken(user._id.toString(), null);
    }
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      // Don't reveal if email exists
      return 'If the email exists, a reset link has been sent';
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await userRepository.setResetPasswordToken(user._id.toString(), hashedToken, expires);

    // In production, send email with resetToken
    // For now, return the token (remove this in production)
    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userRepository.findByResetToken(hashedToken);

    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    user.password = newPassword;
    await user.save();

    await userRepository.clearResetPasswordToken(user._id.toString());
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await userRepository.findByIdWithPassword(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
  }
}

export const authService = new AuthService();