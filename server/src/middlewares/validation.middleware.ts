import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { validateEmail, validatePassword, validatePhone, isMongoId } from '../utils/validators';

export const validateRegistration = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { firstName, lastName, email, password, phone } = req.body;

  if (!firstName || !lastName || !email || !password) {
    throw ApiError.badRequest('All required fields must be provided');
  }

  if (!validateEmail(email)) {
    throw ApiError.badRequest('Invalid email format');
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw ApiError.badRequest(passwordValidation.message || 'Invalid password');
  }

  if (phone && !validatePhone(phone)) {
    throw ApiError.badRequest('Invalid phone number');
  }

  next();
};

export const validateLogin = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required');
  }

  if (!validateEmail(email)) {
    throw ApiError.badRequest('Invalid email format');
  }

  next();
};

export const validateMongoId = (paramName = 'id') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const id = req.params[paramName];

    if (!id || !isMongoId(id)) {
      throw ApiError.badRequest(`Invalid ${paramName}`);
    }

    next();
  };
};

export const validateProductCreation = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { name, description, price, category, sku, stock, images } = req.body;

  if (!name || !description || price === undefined || !category || !sku || stock === undefined) {
    throw ApiError.badRequest('All required fields must be provided');
  }

  if (price < 0) {
    throw ApiError.badRequest('Price cannot be negative');
  }

  if (stock < 0) {
    throw ApiError.badRequest('Stock cannot be negative');
  }

  if (!Array.isArray(images) || images.length === 0) {
    throw ApiError.badRequest('At least one product image is required');
  }

  next();
};

export const validateOrderCreation = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { shippingAddress, paymentMethod } = req.body;

  if (!shippingAddress) {
    throw ApiError.badRequest('Shipping address is required');
  }

  if (!paymentMethod) {
    throw ApiError.badRequest('Payment method is required');
  }

  const { fullName, phone, addressLine1, city, state, postalCode, country } = shippingAddress;

  if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode || !country) {
    throw ApiError.badRequest('Complete shipping address is required');
  }

  next();
};