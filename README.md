# Megastore E-Commerce

Production-oriented full-stack e-commerce monorepo featuring a customer storefront, an administrator dashboard, and a Node.js/Express TypeScript REST API backend powered by MongoDB.

The project is architected with a decoupled 3-tier structure: a high-performance Express REST API with MongoDB/Mongoose data persistence, a modern customer-facing storefront built with React and Tailwind CSS, and a comprehensive Admin management dashboard with analytics and catalog controls.

---

## Current Status & Live URLs

| Area | Status | Live Production URL | Local URL | Notes |
| --- | --- | --- | --- | --- |
| **Storefront (`user-f`)** | Deployed & Working | [https://megastore.lynfera.qzz.io](https://megastore.lynfera.qzz.io) | `http://localhost:4000` | Full catalog, cart, wishlist, profile, checkout & PDF invoices |
| **Admin Panel (`admin`)** | Deployed & Working | [https://megastore-admin.lynfera.qzz.io](https://megastore-admin.lynfera.qzz.io) | `http://localhost:3000` | Executive dashboard, analytics, catalog CMS, order management |
| **Backend API (`server`)** | Working | API Service | `http://localhost:5000` | Node.js + Express 4 + MongoDB with JWT Access/Refresh tokens |
| **Repository** | Pushed to GitHub | `main` branch | `git@github.com:AmalJose664/Megastore-Ecommerce.git` | Clean monorepo structure |

---

## Workspace Map

| Folder | Purpose | Tech Stack | Local URL | Live URL |
| --- | --- | --- | --- | --- |
| `user-f/` | Customer Storefront Web App | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui | `http://localhost:4000` | [megastore.lynfera.qzz.io](https://megastore.lynfera.qzz.io) |
| `admin/` | Administrator Management Dashboard | React 18, Vite, TypeScript, Tailwind CSS, Recharts | `http://localhost:3000` | [megastore-admin.lynfera.qzz.io](https://megastore-admin.lynfera.qzz.io) |
| `server/` | RESTful API & Business Logic Server | Node.js, Express, TypeScript, MongoDB (Mongoose) | `http://localhost:5000` | n/a |

---

## Technology Stack

- **Runtime & Language**: Node.js (`>=18.x`), TypeScript (`^5.9`)
- **Backend Framework**: Express.js (`^4.22`)
- **Database & ORM**: MongoDB with Mongoose ODM (`^8.24`)
- **Frontend Framework**: React (`^18.3`) bundled with Vite (`^5.4`)
- **Styling & UI**: Tailwind CSS (`^3.4`), shadcn/ui components, Lucide Icons
- **State & Data Fetching**: React Context API, TanStack React Query (`^5.83`)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) with Access & Refresh Token rotation, `bcryptjs` password hashing
- **Charts & Data Visuals**: Recharts (`^2.15`) for sales, revenue, and order analytics
- **PDF Generation**: `jspdf` (`^4.2`) for order invoice downloads
- **Security & Utilities**: Helmet, CORS, Express Rate Limit, Express Mongo Sanitize, Morgan logging, Cookie Parser, Compression

---

## Architecture & Design System

The application uses a curated modern design language tailored for modern retail commerce:

| Token / Layer | Value / Specification | Usage |
| --- | --- | --- |
| Primary Accent | `#1A1A2E` / Slate Dark | Topbars, primary buttons, dark UI surfaces |
| Highlight CTA | Vibrant Blue / Accent Gradient | Action buttons, badges, promotional banners |
| Page Background | Surface Neutral (`#F8F9FA` / `#0F172A` dark) | Storefront catalog & Admin dashboard canvas |
| Component Primitives | shadcn/ui + Radix UI | Accessible dialogs, drawers, dropdowns, tooltips |

### Storefront Design Language (`user-f`)
- Clean grid layout with responsive product cards.
- Interactive cart drawer and quick-view modals.
- Real-time product search, price filters, category switching, and user reviews.
- Toast notifications (`sonner` / `shadcn-toast`) for cart & wishlist interactions.

### Admin Dashboard Design Language (`admin`)
- Collapsible dark sidebar (`#0F172A`) with active route indicator and category sectioning.
- Data table components with search, pagination, status badges, and action dropdowns.
- Interactive dashboard widgets for low-stock alerts, recent orders, and revenue trends.

---

## Sub-Application Breakdown

### 1. Storefront Application (`user-f/`)
Primary customer-facing routes:
- `/` — Homepage with Hero slider, featured categories, promo banners, and trending items.
- `/products` — Product catalog with price, category, rating filters, and search.
- `/product/:id` — Detailed product view with image gallery, review system, and stock status.
- `/cart` & `/checkout` — Shopping cart management, address selection, coupon application, and checkout.
- `/orders` & `/orders/:id` — Customer order history and PDF invoice downloading.
- `/profile` & `/wishlist` — User account settings, saved delivery addresses, and wishlist items.
- `/login` & `/register` — Authentication portals.

### 2. Admin Dashboard (`admin/`)
Primary administrative routes:
- `/login` — Secure admin sign-in portal.
- `/dashboard` — KPI overview metrics (sales, revenue, total orders, low stock items).
- `/products` & `/products/new` — Catalog management, inventory counts, product editing.
- `/categories` — Multi-level category hierarchy management.
- `/orders` & `/orders/:id` — Order status management (Pending, Processing, Shipped, Delivered, Cancelled).
- `/coupons` — Discount code generator with validity windows and minimum spend rules.
- `/hero` & `/banners` — Homepage hero section and promotional banner content management.
- `/users` — Customer user list and status management.
- `/analytics` — Revenue, sales breakdown, and performance reporting.

### 3. Backend API (`server/`)
Clean Layered Architecture (Routes -> Controllers -> Services -> Repositories -> Models):
- `POST /api/v1/auth/register`, `login`, `refresh-token`, `logout`, `profile`
- `GET/POST/PUT/DELETE /api/v1/products` (Filtering, pagination, search, admin mutations)
- `GET/POST/PUT/DELETE /api/v1/categories`, `/coupons`, `/banners`, `/hero`, `/promo`
- `GET/POST/PUT/DELETE /api/v1/cart` & `/wishlist`
- `GET/POST/PATCH /api/v1/orders` (Order placement, status updates, admin analytics)
- `GET /health` — Health check endpoint returning status and uptime.

---

## Database Schema (MongoDB / Mongoose)

The backend data architecture comprises the following core models:
- **`User`**: User accounts (first/last name, email, hashed password, role: `user` | `admin`, active status).
- **`Product`**: E-commerce items (name, slug, description, price, original price, SKU, stock count, category, subcategory, images, ratings, tags, featured flag).
- **`Category`**: Category hierarchy (name, slug, description, image, parent category).
- **`Cart`**: Persistent user shopping cart items and quantities.
- **`Order`**: Order ledger (order number, user reference, item snapshots, shipping address, subtotal, discount, shipping fee, total amount, order status, payment status).
- **`Address`**: Customer delivery addresses.
- **`Coupon`**: Promotional discount rules (code, discount type: percentage/flat, discount value, max usage, expiry date).
- **`Review`**: Product reviews & star ratings linked to user profiles.
- **`Wishlist`**: Saved items per customer profile.
- **`Hero` & `Banner`**: Promotional CMS elements rendered on customer storefront.
- **`Activity`**: Audit log of admin actions.

---

## Environment Configuration

Copy the sample environment file in each service directory before starting:

### Server (`server/.env`):
```bash
cp server/.env.example server/.env
```
Key variables:
- `PORT=5000`
- `MONGODB_URI=mongodb://localhost:27017/ecommerce`
- `JWT_ACCESS_SECRET=your_jwt_access_secret`
- `JWT_REFRESH_SECRET=your_jwt_refresh_secret`

### Storefront (`user-f/.env`):
```bash
cp user-f/.env.example user-f/.env
```
- `VITE_BASE_URL=http://localhost:5000/api`

### Admin (`admin/.env`):
```bash
cp admin/.env.example admin/.env
```
- `VITE_BASE_URL=http://localhost:5000/api`

---

## Local Development

### 1. Start Backend Server:
```bash
cd server
npm install
npm run seed     # Populate database with sample data & admin account
npm run dev      # Starts server on http://localhost:5000
```

### 2. Start Admin Dashboard:
```bash
cd admin
npm install
npm run dev      # Starts admin portal on http://localhost:3000
```

### 3. Start Customer Storefront:
```bash
cd user-f
npm install
npm run dev      # Starts storefront on http://localhost:4000
```

---

## Quality Gates & Verification

Run these commands inside the respective subfolders to verify code quality:

| Module | TypeScript Check | Test Suite | Production Build |
| --- | --- | --- | --- |
| `server/` | `npx tsc --noEmit` | `npm test` | `npm run build` |
| `user-f/` | `npx tsc --noEmit` | `npm test` | `npm run build` |
| `admin/` | `npx tsc --noEmit` | `npm test` | `npm run build` |

All 3 sub-applications pass type checking, unit tests, and production bundling cleanly.

---

## Default Demo Credentials

After running `npm run seed` in the `server` directory:

- **Admin Account**:
  - Email: `admin@ecommerce.com`
  - Password: `Admin@123456`
- **Customer Account**:
  - Email: `user@example.com`
  - Password: `User@123456`

---

## A to Z Project Journey

1. **Architecture Setup**: Structured into 3 clear domains (`server`, `admin`, `user-f`).
2. **Backend Foundation**: Implemented Express app with Helmet, CORS, Rate Limiting, and Error Handlers.
3. **Database Models**: Formulated Mongoose schemas for Users, Products, Categories, Orders, Carts, Coupons, Reviews, Wishlists, and Banners.
4. **Data Access Layer**: Designed Repository Pattern abstractions (`base.repository.ts`, `product.repository.ts`, etc.) for database operations.
5. **Service Layer**: Created decoupled business logic services for Auth, Products, Cart, Orders, and Coupons.
6. **JWT Auth System**: Developed secure JWT authentication with short-lived access tokens and refresh token rotation.
7. **Input Validation**: Added request validation middleware and sanitized inputs against MongoDB injection.
8. **Seed Script**: Authored seed scripts (`seed.ts` and `seedAdmin.ts`) to populate mock categories, products, coupons, and test users.
9. **Storefront Development**: Built React customer portal with Vite, Tailwind CSS, and shadcn/ui primitives.
10. **Product Catalog**: Implemented responsive product grid, multi-parameter filtering (price, category, rating), and live search.
11. **Cart & Wishlist Context**: Built persistent state contexts for real-time item additions and removals.
12. **Checkout & Invoice Flow**: Integrated client-side PDF generation (`jspdf`) for downloading order receipts.
13. **Admin Dashboard UI**: Built executive dashboard with key metrics, analytics charts using Recharts, and order tables.
14. **Catalog CMS**: Added complete CRUD forms for Products, Categories, Hero Slides, and Promotional Banners.
15. **Coupon Management**: Implemented discount engine for percentage/flat coupon validation.
16. **Order Management**: Created admin workflow to update order lifecycle statuses (`Pending` -> `Processing` -> `Shipped` -> `Delivered`).
17. **Security Audit**: Configured CORS origin boundaries and stored sensitive keys exclusively in environment variables.
18. **Testing & QA**: Verified zero TypeScript errors across all subfolders and validated production Vite build outputs.
19. **Git Cleanliness**: Configured clean `.gitignore` policies and created `.env.example` templates for streamlined onboarding.
20. **Documentation**: Created comprehensive root documentation, updated ports (`3000` & `4000`), live URLs (`megastore-admin.lynfera.qzz.io` & `megastore.lynfera.qzz.io`), and workspace guides.

---

## 📞 Support & Contact

For support, inquiries, or feedback, email: **renderestest446446@gmail.com**

---

## License

ISC License — Free for portfolio, evaluation, and educational use.

