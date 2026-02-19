import { Document, Types } from 'mongoose';

// Enums
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CARD = 'card',
  UPI = 'upi',
  NET_BANKING = 'netbanking',
  WALLET = 'wallet',
  COD = 'cod',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum ActivityType {
  ORDER_CREATED = 'order_created',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  PRODUCT_UPDATED = 'product_updated',
  USER_REGISTERED = 'user_registered',
}

// User Types
export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Address Types
export interface IAddress extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Category Types
export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  image?: string;
  parentCategory?: Types.ObjectId;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface Product {
  name: string;
  slug?: string;
  description: string;
  price: number;
  originalPrice?: number;

  category: Types.ObjectId;
  subcategory?: Types.ObjectId;

  images: string[];
  thumbnail?: string;

  sku: string;
  stock: number;
  lowStockThreshold?: number;

  rating?: number;
  reviewCount?: number;
  inStock?: boolean;

  featured?: boolean;
  isNewProduct?: boolean;

  tags?: string[];
  specifications?: Record<string, string>;

  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };

  isActive?: boolean;
}


// Cart Types
export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: ICartItem[];
  totalItems: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

// Wishlist Types
export interface IWishlist extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  products: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  image: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  couponCode?: string;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export interface IPayment extends Document {
  _id: Types.ObjectId;
  order: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  gatewayResponse?: Record<string, any>;
  failureReason?: string;
  refundAmount?: number;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Review Types
export interface IReview extends Document {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpful: number;
  notHelpful: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Coupon Types
export interface ICoupon extends Document {
  _id: Types.ObjectId;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  isListed: boolean;
  isReusable: boolean;
  usedBy: Types.ObjectId[];
  applicableCategories?: Types.ObjectId[];
  applicableProducts?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Testimonial Types
export interface ITestimonial extends Document {
  _id: Types.ObjectId;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
  isApproved: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Banner Types
export interface IBanner extends Document {
  _id: Types.ObjectId;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  mobileImage?: string;
  buttonText?: string;
  buttonLink?: string;
  position: string;
  isActive: boolean;
  displayOrder: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Hero Section Types
export interface IHero extends Document {
  _id: Types.ObjectId;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  image: string;
  stats: { value: string; label: string }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Promo Section Types
export interface IPromo extends Document {
  _id: Types.ObjectId;
  tag: string;
  title: string;
  description: string;
  code: string;
  terms: string;
  link: string;
  image: string;
  isActive: boolean;
  displayOrder: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Inventory Types
export interface IInventoryLog extends Document {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  type: 'addition' | 'reduction' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference?: string;
  performedBy: Types.ObjectId;
  createdAt: Date;
}

// Activity Types
export interface IActivity extends Document {
  _id: Types.ObjectId;
  type: ActivityType;
  title: string;
  description: string;
  user?: Types.ObjectId;
  metadata?: {
    orderId?: string;
    productId?: string;
    orderNumber?: string;
    productName?: string;
    oldPrice?: number;
    newPrice?: number;
    userName?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response Types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: Partial<IUser>;
  tokens: AuthTokens;
}

// Dashboard Types
export interface IDashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalProducts: number;
  productsChange: number;
  totalUsers: number;
  usersChange: number;
}

export interface AdminDashboardData {
  stats: IDashboardStats;
  recentOrders: IOrder[];
  lowStockProducts: any[];
  activityLog: IActivity[];
  charts: {
    salesOverTime: { date: string; revenue: number }[];
  };
}