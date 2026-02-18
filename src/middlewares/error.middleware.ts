import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import config from '../config/env';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error = err;

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors)
      .map((e: any) => e.message)
      .join(', ');
    error = ApiError.badRequest(message);
  }

  // Handle Mongoose duplicate key errors
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    error = ApiError.conflict(`${field} already exists`);
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    const castErr = err as any;
    error = ApiError.badRequest(`Invalid ID format for ${castErr.path}: ${castErr.value}`);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token expired');
  }

  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const message = error.message || 'Internal server error';

  const response: any = {
    success: false,
    message: message,
  };

  // Include stack trace in development
  if (config.nodeEnv === 'development') {
    response.stack = error.stack;
  }

  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  res.status(statusCode).json(response);
};

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error = ApiError.notFound(`Route ${req.originalUrl} not found`);
  next(error);
};