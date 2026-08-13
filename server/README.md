# E-commerce Backend API

Production-ready e-commerce backend built with Node.js, TypeScript, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with access/refresh tokens, role-based access control
- **Product Management**: CRUD operations, filtering, search, pagination
- **Shopping Cart**: Persistent cart, add/remove/update items
- **Order Management**: Create orders, status tracking, order history
- **Payment Integration**: Ready for Razorpay/Stripe integration
- **Review System**: Product reviews and ratings
- **Coupon System**: Discount codes with validation
- **Admin Dashboard**: Stats, management APIs
- **Content Management**: Testimonials, banners

## 📋 Prerequisites

- Node.js >= 16.x
- MongoDB >= 5.x
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ecommerce-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- MongoDB URI
- JWT secrets
- Admin credentials
- Payment gateway keys (optional)

4. **Seed the database**
```bash
npm run seed
```

5. **Start development server**
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## 📁 Project Structure

```
src/
├── config/          # Configuration files
│   ├── env.ts       # Environment variables
│   └── database.ts  # MongoDB connection
├── models/          # Mongoose schemas
│   ├── User.model.ts
│   ├── Product.model.ts
│   ├── Cart.model.ts
│   ├── Order.model.ts
│   ├── Payment.model.ts
│   ├── Review.model.ts
│   ├── Coupon.model.ts
│   ├── Category.model.ts
│   ├── Address.model.ts
│   ├── Wishlist.model.ts
│   ├── Testimonial.model.ts
│   ├── Banner.model.ts
│   └── InventoryLog.model.ts
├── repositories/    # Data access layer
│   ├── base.repository.ts
│   ├── user.repository.ts
│   ├── product.repository.ts
│   ├── cart.repository.ts
│   └── order.repository.ts
├── services/        # Business logic
│   ├── auth.service.ts
│   ├── product.service.ts
│   ├── cart.service.ts
│   └── order.service.ts
├── controllers/     # Request handlers
│   ├── auth.controller.ts
│   ├── product.controller.ts
│   ├── cart.controller.ts
│   └── order.controller.ts
├── routes/          # API routes
│   ├── auth.routes.ts
│   ├── product.routes.ts
│   ├── cart.routes.ts
│   └── order.routes.ts
├── middlewares/     # Express middlewares
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validation.middleware.ts
├── utils/           # Helper functions
│   ├── ApiError.ts
│   ├── asyncHandler.ts
│   ├── jwt.ts
│   ├── pagination.ts
│   └── validators.ts
├── types/           # TypeScript types
│   └── index.ts
├── scripts/         # Utility scripts
│   └── seed.ts
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## 🔑 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| POST | `/api/v1/auth/refresh-token` | Refresh access token | No |
| POST | `/api/v1/auth/logout` | Logout user | Yes |
| POST | `/api/v1/auth/forgot-password` | Request password reset | No |
| POST | `/api/v1/auth/reset-password` | Reset password | No |
| POST | `/api/v1/auth/change-password` | Change password | Yes |
| GET | `/api/v1/auth/profile` | Get user profile | Yes |

### Products
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/products` | List products (with filters) | No |
| GET | `/api/v1/products/featured` | Get featured products | No |
| GET | `/api/v1/products/new` | Get new products | No |
| GET | `/api/v1/products/:id` | Get product by ID | No |
| GET | `/api/v1/products/slug/:slug` | Get product by slug | No |
| POST | `/api/v1/products` | Create product | Admin |
| PUT | `/api/v1/products/:id` | Update product | Admin |
| DELETE | `/api/v1/products/:id` | Delete product | Admin |

### Cart
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/cart` | Get user cart | Yes |
| POST | `/api/v1/cart/items` | Add item to cart | Yes |
| PUT | `/api/v1/cart/items/:productId` | Update cart item | Yes |
| DELETE | `/api/v1/cart/items/:productId` | Remove from cart | Yes |
| DELETE | `/api/v1/cart` | Clear cart | Yes |

### Orders
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/orders` | Create order | Yes |
| GET | `/api/v1/orders/my-orders` | Get user orders | Yes |
| GET | `/api/v1/orders/:id` | Get order details | Yes |
| POST | `/api/v1/orders/:id/cancel` | Cancel order | Yes |
| GET | `/api/v1/orders/admin/all` | Get all orders | Admin |
| PATCH | `/api/v1/orders/:id/status` | Update order status | Admin |
| GET | `/api/v1/orders/admin/stats` | Get order statistics | Admin |

## 📝 Request/Response Examples

### Register User
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "phone": "9876543210"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

### Get Products with Filters
```bash
GET /api/v1/products?category=electronics&minPrice=1000&maxPrice=5000&page=1&limit=20
```

### Add to Cart
```bash
POST /api/v1/cart/items
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "productId": "...",
  "quantity": 2
}
```

### Create Order
```bash
POST /api/v1/orders
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "9876543210",
    "addressLine1": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India"
  },
  "paymentMethod": "card",
  "notes": "Please deliver before 6 PM"
}
```

## 🔐 Authentication

The API uses JWT tokens for authentication:

1. **Access Token**: Short-lived (15 minutes), used for API requests
2. **Refresh Token**: Long-lived (7 days), used to get new access tokens

Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## 🎯 Query Parameters

### Product Filtering
- `category`: Filter by category ID
- `subcategory`: Filter by subcategory ID
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `minRating`: Minimum rating
- `featured`: Boolean (true/false)
- `isNew`: Boolean (true/false)
- `inStock`: Boolean (true/false)
- `search`: Search in name, description, tags
- `tags`: Comma-separated tags

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (default: createdAt)
- `order`: Sort order (asc/desc, default: desc)

## 🏗️ Architecture

### Layered Architecture
1. **Routes**: Define API endpoints
2. **Controllers**: Handle HTTP requests/responses
3. **Services**: Business logic
4. **Repositories**: Database operations
5. **Models**: MongoDB schemas

### Design Patterns
- Repository Pattern for data access
- Service Layer for business logic
- Dependency Injection
- Error handling with custom ApiError class
- Async wrapper for route handlers

## 🔒 Security Features

- Helmet for security headers
- CORS configuration
- Rate limiting
- MongoDB injection sanitization
- Password hashing with bcrypt
- JWT token validation
- Input validation
- XSS protection

## 🧪 Testing

```bash
npm test
```

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🌍 Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `NODE_ENV`: development/production
- `PORT`: Server port
- `MONGODB_URI`: MongoDB connection string
- `JWT_ACCESS_SECRET`: Secret for access tokens
- `JWT_REFRESH_SECRET`: Secret for refresh tokens
- `ADMIN_EMAIL`: Admin user email
- `ADMIN_PASSWORD`: Admin user password

## 📊 Database Schema

### User
- firstName, lastName, email, password
- role (user/admin)
- phone, avatar
- Email verification, active status
- Refresh token, reset password token

### Product
- name, slug, description
- price, originalPrice
- category, subcategory
- images, thumbnail, SKU
- stock, rating, reviews
- featured, isNew, tags

### Order
- orderNumber, user
- items (product, quantity, price)
- shipping address
- subtotal, discount, shipping, tax, total
- status, payment method/status
- tracking, delivery dates

### Cart
- user, items (product, quantity, price)
- totalItems, subtotal

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

ISC

## 👥 Default Credentials

After running seed script:

**Admin**
- Email: admin@ecommerce.com
- Password: Admin@123456

**User**
- Email: user@example.com
- Password: User@123456

## 🐛 Known Issues

None currently

## 📞 Support

For support, email: support@example.com