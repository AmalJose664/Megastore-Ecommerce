import jwt from 'jsonwebtoken';
import config from '../config/env';
import { Types } from 'mongoose';

export interface JwtPayload {
  userId: string;
  role: string;
}

export const generateAccessToken = (userId: Types.ObjectId, role: string): string => {
  return jwt.sign(
    { userId: userId.toString(), role },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );
};

export const generateRefreshToken = (userId: Types.ObjectId, role: string): string => {
  return jwt.sign(
    { userId: userId.toString(), role },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
};

export const generateTokens = (userId: Types.ObjectId, role: string) => {
  return {
    accessToken: generateAccessToken(userId, role),
    refreshToken: generateRefreshToken(userId, role),
  };
};