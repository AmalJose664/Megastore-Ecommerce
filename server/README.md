# E-commerce Backend API (`server/`)

Production-ready RESTful E-Commerce Backend API built with Node.js, TypeScript, Express.js, and MongoDB (Mongoose ODM).

---

## 🚀 Key Technologies & Stack

- **Runtime & Language**: Node.js (`>=18.x`), TypeScript (`^5.9`)
- **Web Framework**: Express.js (`^4.22`)
- **Database & Data Modeling**: MongoDB (`>=5.0`) with Mongoose ODM (`^8.24`)
- **Authentication & Security**:
  - JSON Web Tokens (`jsonwebtoken`) with Access Token (short-lived 15m) & Refresh Token (7d) rotation
  - Password hashing with `bcryptjs`
  - Security headers using `helmet`
  - Cross-Origin Resource Sharing (`cors`) configuration
  - Rate limiting via `express-rate-limit`
  - NoSQL injection protection using `express-mongo-sanitize`
- **Payment Processing**: Stripe Checkout & Webhook handler + Razorpay key configuration
- **Performance & Logging**: Compression via `compression`, HTTP request logging with `morgan`

---

## 📁 Architecture & Design Patterns

The backend follows a strict 4-tier Layered Architecture:

```text
server/src/
├── config/            # Environment configurations & MongoDB connection setup
├── models/            # Mongoose Schema definitions (User, Product, Order, Cart, etc.)
├── repositories/      # Data access layer using Repository Pattern (base & domain repos)
├── services/          # Core business logic processing
├── controllers/       # HTTP request handlers & response formattings
├── routes/            # Express endpoint definitions
├── middlewares/       # JWT auth, RBAC authorization, error & validation middlewares
├── utils/             # Custom ApiError class, asyncHandler wrapper, JWT helpers
├── scripts/           # Database seeding & administrative scripts
├── app.ts             # Express application setup & middleware pipelines
└── server.ts          # Server initialization & graceful shutdown listeners
```

---

## 📋 Comprehensive API Route Reference

Base URL: `http://localhost:5000/api/v1`

### 1. Health & Server Info
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/` | API Welcome Endpoint | Public |
| `GET` | `/health` | Server Health Status & Timestamp | Public |

---

### 2. Authentication & Profile (`/api/v1/auth`)
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Register new customer account | Public |
| `POST` | `/api/v1/auth/login` | Authenticate user/admin & issue JWT tokens | Public |
| `POST` | `/api/v1/auth/refresh-token` | Exchange refresh token for new access token | Public |
| `POST` | `/api/v1/auth/logout` | Logout user & invalidate refresh session | Optional Auth |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset token | Public |
| `POST` | `/api/v1/auth/reset-password` | Reset password via token | Public |
| `POST` | `/api/v1/auth/change-password` | Update current account password | Auth Required |
| `GET` | `/api/v1/auth/profile` | Retrieve authenticated user profile | Auth Required |

---

### 3. Product Catalog (`/api/v1/products`)
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/api/v1/products` | Query products with filters, sorting, search & pagination | Public |
| `GET` | `/api/v1/products/suggestions` | Get search auto-complete suggestions | Public |
| `GET` | `/api/v1/products/featured` | Fetch featured catalog products | Public |
| `GET` | `/api/v1/products/new` | Fetch newest arrival products | Public |
| `GET` | `/api/v1/products/slug/:slug` | Retrieve product details by slug | Public |
| `GET` | `/api/v1/products/:id` | Retrieve product details by ID | Public |
| `POST` | `/api/v1/products` | Create a new product entry | Admin |
| `PUT` | `/api/v1/products/:id` | Update product attributes | Admin |
| `POST` | `/api/v1/products/bulk-delete` | Bulk delete multiple products | Admin |
| `DELETE` | `/api/v1/products/:id` | Soft-delete product entry | Admin |

---

### 4. Categories & Hierarchy (`/api/v1/categories`)
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/api/v1/categories` | Get category tree structure | Public |
| `GET` | `/api/v1/categories/:slug` | Get category by slug | Public |
| `GET` | `/api/v1/categories/:id/subcategories` | Get child subcategories by parent ID | Public |
| `POST` | `/api/v1/categories` | Create new category or subcategory | Admin |
| `PUT` | `/api/v1/categories/:id` | Update category details | Admin |
| `DELETE` | `/api/v1/categories/:id` | Soft-delete category | Admin |
| `GET` | `/api/v1/categories/admin/all` | Fetch all categories (including inactive) | Admin |
| `GET` | `/api/v1/categories/admin/paginated` | Query paginated categories with filters | Admin |

---

### 5. Shopping Cart (`/api/v1/cart`)
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/api/v1/cart` | Get authenticated user cart | Auth Required |
| `POST` | `/api/v1/cart/items` | Add product item to cart | Auth Required |
| `POST` | `/api/v1/cart/merge` | Merge guest cart items into user cart | Auth Required |
| `PUT` | `/api/v1/cart/items/:productId` | Update item quantity in cart | Auth Required |
| `DELETE` | `/api/v1/cart/items/:productId` | Remove product item from cart | Auth Required |
| `DELETE` | `/api/v1/cart` | Empty all cart items | Auth Required |

---

### 6. Order Management (`/api/v1/orders`)
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/api/v1/orders` | Place new order with cart items | Auth Required |
| `GET` | `/api/v1/orders/my-orders` | Get user order history | Auth Required |
| `GET` | `/api/v1/orders/:id` | Get order details by ID | Auth Required |
| `POST` | `/api/v1/orders/:id/cancel` | Request order cancellation | Auth Required |
| `GET` | `/api/v1/orders/admin/all` | Retrieve all customer orders | Admin |
| `PUT` | `/api/v1/orders/bulk-status` | Bulk update status across orders | Admin |
| `PATCH` / `PUT` | `/api/v1/orders/:id/status` | Update single order lifecycle status | Admin |
| `GET` | `/api/v1/orders/admin/stats` | Order analytics and revenue totals | Admin |

---

### 7. Coupons & Promotions (`/api/v1/coupons`)
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/api/v1/coupons` | Get active public coupons | Optional Auth |
| `POST` | `/api/v1/coupons/validate` | Validate coupon code against subtotal | Auth Required |
| `GET` | `/api/v1/coupons/all` | List all coupons (including inactive) | Admin |
| `GET` | `/api/v1/coupons/:id` | Get coupon details by ID | Admin |
| `POST` | `/api/v1/coupons` | Create new discount coupon | Admin |
| `PUT` | `/api/v1/coupons/:id` | Update coupon rule | Admin |
| `DELETE` | `/api/v1/coupons/:id` | Delete coupon rule | Admin |

---

### 8. Address Management (`/api/v1/addresses`)
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/api/v1/addresses` | Get user saved delivery addresses | Auth Required |
| `GET` | `/api/v1/addresses/:id` | Get address details by ID | Auth Required |
| `POST` | `/api/v1/addresses` | Save new shipping address | Auth Required |
| `PUT` | `/api/v1/addresses/:id` | Update shipping address details | Auth Required |
| `DELETE` | `/api/v1/addresses/:id` | Remove shipping address | Auth Required |
| `PATCH` | `/api/v1/addresses/:id/default` | Set primary delivery address | Auth Required |

---

### 9. Customer Wishlist (`/api/v1/wishlist`)
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/api/v1/wishlist` | Get user saved wishlist items | Auth Required |
| `POST` | `/api/v1/wishlist/add` | Add product to wishlist | Auth Required |
| `DELETE` | `/api/v1/wishlist/remove/:productId` | Remove product from wishlist | Auth Required |
| `POST` | `/api/v1/wishlist/toggle` | Toggle product wishlist state | Auth Required |
| `GET` | `/api/v1/wishlist/check/:productId` | Check if product is in wishlist | Auth Required |

---

### 10. Product Reviews (`/api/v1/reviews`)
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/api/v1/reviews/product/:productId` | List reviews for product | Public |
| `POST` | `/api/v1/reviews` | Submit product review | Auth Required |
| `GET` | `/api/v1/reviews/my-reviews` | Get user submitted reviews | Auth Required |
| `GET` | `/api/v1/reviews/can-review/:productId` | Verify review eligibility | Auth Required |
| `PATCH` / `DELETE` | `/api/v1/reviews/:id` | Update or remove review | Auth Required |
| `PATCH` | `/api/v1/reviews/:id/approve` | Approve customer review | Admin |

---

### 11. Dashboard & Analytics (`/api/v1/dashboard`)
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/api/v1/dashboard/admin` | Executive dashboard overview metrics | Admin |
| `GET` | `/api/v1/dashboard/analytics` | Sales analytics & revenue reports | Admin |

---

### 12. User Management (`/api/v1/users`)
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/api/v1/users` | List registered customer users | Admin |
| `GET` | `/api/v1/users/:id` | Get user profile details by ID | Admin |
| `PATCH` / `PUT` | `/api/v1/users/:id/status` | Activate or suspend user account | Admin |

---

### 13. Payments & Webhooks (`/api/v1/payments`)
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/api/v1/payments/webhook` | Stripe payment event webhook listener | Public (Raw Body) |
| `POST` | `/api/v1/payments/create-checkout-session` | Create Stripe Checkout payment session | Auth Required |

---

### 14. CMS Content Management
| Endpoint Group | Available Operations | Access |
| --- | --- | --- |
| `/api/v1/hero` | `GET /` (Public), `GET /all`, `POST /`, `PUT /:id`, `DELETE /:id`, `PATCH /:id/activate`, `PATCH /:id/deactivate` | Admin (except public GET) |
| `/api/v1/banner-sections` | `GET /active`, `GET /:id` (Public), `GET /`, `POST /`, `PUT /:id`, `DELETE /:id` | Admin (except public GET) |
| `/api/v1/promo` | `GET /` (Public), `GET /all`, `POST /`, `PUT /:id`, `DELETE /:id`, `PATCH /:id/activate` | Admin (except public GET) |
| `/api/v1/testimonials` | `GET /` (Public), `POST /`, `PUT /:id`, `DELETE /:id` | Admin (except public GET) |
| `/api/v1/activities` | `GET /` — System audit log feed | Admin |
| `/api/v1/settings` | `GET /` (Public), `PUT /` (Update global settings) | Admin (PUT) / Public (GET) |

---

## 📊 Database Models (MongoDB Mongoose)

- **`User`**: First/last name, email, hashed password, role (`user` | `admin`), status (`active` | `inactive`), refresh tokens.
- **`Product`**: Title, slug, description, price, original price, SKU, stock count, category, subcategory, images, ratings, tags, featured status.
- **`Category`**: Name, slug, description, image, parent category ID.
- **`Cart`**: User reference, item array (`productId`, quantity, unit price).
- **`Order`**: Order number, user reference, item snapshots, shipping address, subtotal, discount, tax, total, order status (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`), payment status.
- **`Address`**: Full name, street address, city, state, postal code, country, phone, default flag.
- **`Coupon`**: Coupon code, discount type (`percentage` | `flat`), discount value, minimum order spend, max usage, expiry date.
- **`Review`**: Product reference, user reference, rating (1-5), comment, approval status.
- **`Wishlist`**: User reference, array of saved product IDs.
- **`Hero`, `Banner`, `Promo`, `Testimonial`, `Activity`, `Setting`**: Dynamic CMS and audit ledger schemas.

---

## 🛠️ Setup & Execution

1. **Install Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   Set `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `PORT`.

3. **Seed Database**:
   ```bash
   npm run seed
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Build & Run with Docker (Multi-Stage Container)**:
   ```bash
   # Build production image
   docker build -t megastore-backend .

   # Run container on port 5000
   docker run -p 5000:5000 --env-file .env megastore-backend
   ```

6. **Build for Local Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📞 Support & Contact

For support, inquiries, or feedback, email: **renderestest446446@gmail.com**