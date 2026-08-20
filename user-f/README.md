# Megastore Storefront

Customer-facing React 18 & Vite 5 e-commerce storefront for Megastore E-Commerce. It runs locally on port `4000` and in production at [https://megastore.lynfera.qzz.io](https://megastore.lynfera.qzz.io). Built with TypeScript, Tailwind CSS, shadcn/ui components, Framer Motion animations, Lucide Icons, and PDF invoice generation.

## Runtime and Tooling

- **Framework**: React `18.3` with Vite `5.4`
- **Language**: TypeScript `5.8`
- **Styling**: Tailwind CSS `3.4`, shadcn/ui primitives, Framer Motion animations
- **Icons & UI**: Lucide React, Sonner / shadcn toasts, Embla Carousel
- **Document Export**: `jspdf` for downloadable customer order receipts
- **Node & Package Manager**: Node.js `>=18.0.0`, npm / pnpm

## Live & Local URLs

- **Live Production URL**: [https://megastore.lynfera.qzz.io](https://megastore.lynfera.qzz.io)
- **Local URL**: [http://localhost:4000](http://localhost:4000)

## Setup

From the repository root or the `user-f/` workspace directory:

```bash
cd user-f
npm install
cp .env.example .env
npm run dev
```

Required values documented in `.env.example`:

- `VITE_BASE_URL` — Backend API endpoint (e.g., `http://localhost:5000/api`)

Keep all API secrets on the server and use `VITE_BASE_URL` for API communication.

## Main Routes

- `/` — Homepage featuring Hero banner, featured categories, promo sections, and trending items
- `/products` — Product catalog listing with filter controls (price range, ratings, categories, search)
- `/product/:id` — Product detail view with gallery, stock count, and customer reviews
- `/categories` — Catalog category browser
- `/cart` — Interactive sliding cart drawer and cart breakdown page
- `/checkout` — Checkout workflow with address selection and payment choice
- `/order-success/:id` — Order confirmation screen with downloadable PDF invoice
- `/order-failed` — Payment/order failure recovery page
- `/orders` — Customer order history listing
- `/orders/:id` — Detailed order tracking view
- `/profile` — Customer account settings, saved addresses, and profile details
- `/wishlist` — Saved favorite products wishlist
- `/login` & `/register` — Customer account authentication pages
- `/about` — Store information and brand story page

## Commerce Behavior

- **Catalog & Data Fetching**: Product catalog, category listings, reviews, and promotional slides are fetched dynamically via REST API services.
- **Cart Logic**: Cart updates run through React Context with client-side quantity management and backend stock check validation.
- **Coupon Engine**: Promo code verification and discount calculations are performed server-side.
- **Checkout & Pricing**: Product prices, shipping fees, tax, and final order totals are recalculated and verified by the backend API.
- **Order Snapshots**: Completed orders create immutable snapshots of item details, shipping address, and payment status.
- **Invoice Export**: Downloadable PDF receipts generated on demand using `jspdf`.

## Validation & Quality Gates

Run from the `user-f/` directory:

```bash
npx tsc --noEmit     # TypeScript type-checking
npm run lint         # ESLint code analysis
npm test             # Vitest test suite
npm run build        # Production Vite bundle compilation
```

### Verification Status:
- Type check: **Passed (0 errors)**
- Lint check: **Passed**
- Vitest suite: **Passed**
- Production bundle: **Passed**

## Remaining External Verification

- Complete live COD (Cash on Delivery) order lifecycle test.
- Verify live Stripe/Razorpay payment gateway credentials in production.
- Validate email order confirmation triggers.

## 📞 Support & Contact

For support, inquiries, or feedback, email: **renderestest446446@gmail.com**

