import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { User } from '../models';
import { UserRole } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required');
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyAccessToken(token) as JwtPayload;

      // Verify user still exists
      const user = await User.findById(decoded.userId).select('_id role isActive');

      if (!user) {
        throw ApiError.unauthorized('User no longer exists');
      }

      if (!user.isActive) {
        throw ApiError.unauthorized('User account is deactivated');
      }

      req.user = {
        userId: decoded.userId,
        role: decoded.role,
      };

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.unauthorized('Invalid or expired token');
    }
  }
);

export const authorize = (...roles: UserRole[]) => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (!roles.includes(req.user.role as UserRole)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }

    next();
  });
};

export const optionalAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const decoded = verifyAccessToken(token) as JwtPayload;
        const user = await User.findById(decoded.userId).select('_id role isActive');

        if (user && user.isActive) {
          req.user = {
            userId: decoded.userId,
            role: decoded.role,
          };
        }
      } catch (error) {
        // Silently fail for optional auth
      }
    }

    next();
  }
);