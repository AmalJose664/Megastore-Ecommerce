# Megastore Admin

React 18 & Vite 5 administrative dashboard for Megastore E-Commerce operations. It runs locally on port `3000` and in production at [https://megastore-admin.lynfera.qzz.io](https://megastore-admin.lynfera.qzz.io). Built with TypeScript, Tailwind CSS, shadcn/ui primitives, Recharts analytics, Lucide Icons, React Hook Form, and Zod validation.

## Live & Local URLs

- **Live Production URL**: [https://megastore-admin.lynfera.qzz.io](https://megastore-admin.lynfera.qzz.io)
- **Local URLs**:
  - `http://localhost:3000`
  - `http://localhost:3000/login`

## Setup

From the repository root or the `admin/` workspace directory:

```bash
cd admin
npm install
cp .env.example .env
npm run dev
```

Required environment variables are documented in `.env.example`:

- `VITE_BASE_URL` — Backend REST API endpoint (e.g. `http://localhost:5000/api`)

## Authentication

The admin panel uses a strict role-based authorization model:

1. **Authentication**: JWT access and refresh token pairs verify user credentials during sign-in.
2. **Role Verification**: Server-side and client-side guards check user claims and allow access only when `role = 'admin'` and user status is active.

### Behavior:
- Unauthenticated requests are redirected to `/login`.
- Active admin accounts are granted access to protected management dashboard routes.
- Non-admin authenticated accounts attempting admin access are denied and shown an authorization error.
- Already-authorized admins visiting `/login` are automatically redirected to `/dashboard`.
- Navigation guards protect router transition states before mounting management components.

## UI State & Design

The admin user interface includes:
- **Navigation Shell**: Collapsible dark sidebar (`#0F172A`) with active route accent indicators.
- **Header Topbar**: Dynamic breadcrumb trail, search bar, notification controls, and admin profile avatar.
- **Analytics Widgets**: Recharts-powered revenue trends, low-stock alerts, and recent order tables.
- **Form Controls**: React Hook Form with Zod schema validation, password visibility toggles, and instant pending feedback.
- **Data Tables**: Paginated, filterable shadcn-style table components with status badges.
- **Document Export**: PDF invoice downloading powered by `jspdf`.

## Administrative Modules

- **Dashboard**: Executive summary, KPI cards, sales analytics, low-stock alerts.
- **Products**: Catalog management, pricing, stock levels, product images, SKU details.
- **Categories**: Hierarchical category tree management.
- **Orders**: Customer order listing, order details view, and status updates (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
- **Coupons**: Discount code management (flat/percentage discounts, validity periods, usage limits).
- **Users**: Customer user roster, role management, and activity monitoring.
- **CMS Content**: Hero slides, promotional banners, section cards, and testimonials.
- **Settings & Utilities**: Store settings configuration and PDF invoice export route.

## Folder Architecture

The admin codebase is organized into structured feature layers:

```text
admin/src/
├── components/          # Shared shell, tables, form dialogs, and shadcn UI primitives
│   ├── dashboard/       # Sales chart, low stock alerts, activity feeds
│   ├── layout/          # AdminLayout, Sidebar, TopBar navigation
│   └── ui/              # Buttons, tables, cards, dialogs, status badges
├── pages/               # Route views (Dashboard, Products, Orders, Users, Coupons, Analytics)
├── services/            # API services (auth, products, orders, analytics, settings)
├── configs/             # Environment & API base path configs
├── types/               # TypeScript interface definitions & data types
└── utils/               # PDF generator and data formatting utilities
```

## Validation & Quality Gates

Run from the `admin/` directory:

```bash
npx tsc --noEmit     # TypeScript type-checking
npm run lint         # ESLint code analysis
npm test             # Vitest unit test suite
npm run build        # Production Vite bundle compilation
```

### Verification Status:
- Type check: **Passed (0 errors)**
- Lint check: **Passed**
- Vitest suite: **Passed**
- Production bundle: **Passed**

## Security Notes

- Form inputs and mutations are validated client-side with Zod schemas and verified server-side.
- Authentication tokens are stored securely and passed via standard Bearer authorization headers.
- Rich-text fields and product data undergo strict sanitization before rendering.
- Role checks guard every sensitive admin view and API request.

## 📞 Support & Contact

For support, inquiries, or feedback, email: **renderestest446446@gmail.com**

