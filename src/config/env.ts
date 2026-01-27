import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

interface EnvConfig {
  nodeEnv: string;
  port: number;
  apiVersion: string;
  mongoUri: string;
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  admin: {
    email: string;
    password: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
  cors: {
    origin: string[];
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
  };
  payment: {
    razorpay: {
      keyId: string;
      keySecret: string;
    };
    stripe: {
      secretKey: string;
      publishableKey: string;
    };
  };
  urls: {
    client: string;
    server: string;
  };
}

const config: EnvConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiVersion: process.env.API_VERSION || 'v1',
  mongoUri:
    process.env.NODE_ENV === 'production'
      ? process.env.MONGODB_URI_PROD || ''
      : process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@ecommerce.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@ecommerce.com',
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10),
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
  },
  payment: {
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID || '',
      keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    },
  },
  urls: {
    client: process.env.CLIENT_URL || 'http://localhost:3000',
    server: process.env.SERVER_URL || 'http://localhost:5000',
  },
};

export default config;