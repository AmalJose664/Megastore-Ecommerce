export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'customer';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  ordersCount: number;
  totalSpent: number;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  category: string;
  images: string[];
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
  sku: string;
}

export interface Order {
  id: string;
  _id?: string;
  orderNumber: string;
  user: string;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'completed';
  shippingAddress: Address;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  total: number;
  _id?: string;
  id?: string;
}

export interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  parentCategory: string | null;
  isActive: boolean;
  displayOrder: number;
  productsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

export interface CategoryDetails extends Category {
  subcategories: Category[];
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  ordersChange: number;
  revenueChange: number;
  productsChange: number;
  usersChange: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  user: string;
  timestamp: string;
  type: 'order' | 'product' | 'user' | 'system';
}

// Auth related types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: 'admin' | 'customer';
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    tokens: AuthTokens;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalProducts: number;
  productsChange: number;
  totalUsers: number;
  usersChange: number;
}

export interface ActivityLog {
  _id: string;
  type: 'order' | 'product' | 'user' | 'system';
  action: string;
  description: string;
  timestamp: string;
}

export interface ChartData {
  date: string;
  revenue: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentOrders: Order[];
  lowStockProducts: Product[];
  activityLog: ActivityLog[];
  charts: {
    salesOverTime: ChartData[];
  };
}

// Product related types
export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface ProductSpecifications {
  [key: string]: string;
}

export interface ApiProduct {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  thumbnail: string;
  sku: string;
  stock: number;
  lowStockThreshold?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
  isNewProduct: boolean;
  tags: string[];
  specifications?: ProductSpecifications;
  weight?: number;
  dimensions?: ProductDimensions;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  success: boolean;
  data: ApiProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductResponse {
  success: boolean;
  data: ApiProduct;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  thumbnail: string;
  sku: string;
  stock: number;
  lowStockThreshold?: number;
  featured?: boolean;
  isNewProduct?: boolean;
  tags?: string[];
  specifications?: ProductSpecifications;
  weight?: number;
  dimensions?: ProductDimensions;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  category?: string;
  subcategory?: string;
  images?: string[];
  thumbnail?: string;
  sku?: string;
  stock?: number;
  lowStockThreshold?: number;
  featured?: boolean;
  isNewProduct?: boolean;
  tags?: string[];
  specifications?: ProductSpecifications;
  weight?: number;
  dimensions?: ProductDimensions;
  isActive?: boolean;
}

export interface ProductQueryParams {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  featured?: boolean;
  isNew?: boolean;
  inStock?: boolean;
  search?: string;
  tags?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FeaturedProductsQuery {
  limit?: number;
}

export interface NewProductsQuery {
  limit?: number;
}

// Testimonial related types
export interface Testimonial {
  _id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
  isApproved: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface TestimonialsResponse {
  success: boolean;
  data: Testimonial[];
}

export interface CreateTestimonialRequest {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
  isApproved: boolean;
  displayOrder: number;
}

export interface UpdateTestimonialRequest extends Partial<CreateTestimonialRequest> { }

// Hero related types
export interface HeroStats {
  value: string;
  label: string;
}

export interface HeroSection {
  _id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  image: string;
  stats: HeroStats[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHeroRequest {
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  image: string;
  stats: HeroStats[];
  isActive?: boolean;
}

export interface UpdateHeroRequest extends Partial<CreateHeroRequest> { }

// Promo related types
export interface PromoSection {
  _id: string;
  tag: string;
  title: string;
  description: string;
  code: string;
  terms: string;
  link: string;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromoRequest {
  tag: string;
  title: string;
  description: string;
  code: string;
  terms: string;
  link: string;
  image: string;
  isActive?: boolean;
}

// Coupon related types
export interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  minPurchaseAmount: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  usedBy: string[];
  isListed: boolean;
  isReusable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponRequest {
  code: string;
  description: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  minPurchaseAmount: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  isListed: boolean;
  isReusable: boolean;
  isActive?: boolean;
}

export interface UpdateCouponRequest extends Partial<CreateCouponRequest> { }

