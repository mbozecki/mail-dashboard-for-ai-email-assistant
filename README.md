# Dashboard for AI Email Assistant

Standalone Angular 19 SPA for managing emails, invoices, and spending analytics. Built with signal-based state management (signal, computed, input, output), lazy-loaded feature routes, and per-component SCSS. Includes a RAG-powered chat interface for natural-language queries, interactive ECharts visualisations, Stripe subscription flow, and a role-gated admin panel — all backed by Supabase JWT auth via a custom HTTP interceptor and route guard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 19 (standalone components) |
| UI Library | PrimeNG 19 (Aura Dark theme, purple accent) |
| Styling | Tailwind CSS v4 |
| Charts | ngx-echarts (Apache ECharts) |
| Auth | Supabase Auth (JWT) |
| Billing | Stripe (subscription + customer portal) |
| Backend | FastAPI (Python) — repo not uploaded |

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Sign in with password or magic link |
| `/dashboard/overview` | Stats cards, email volume chart, top senders |
| `/dashboard/ask` | Chat-style RAG Q&A interface |
| `/dashboard/emails` | Email browser with search and detail drawer |
| `/dashboard/invoices` | Invoice/document table with seller filtering |
| `/dashboard/spending` | Spending analytics — monthly bar chart, seller breakdown |
| `/dashboard/subscription` | Stripe subscription status, checkout and portal |
| `/dashboard/settings` | Account info, backend health status |
| `/admin/dashboard` | Admin metrics — MRR, subscriptions, cost per user |
| `/admin/users` | User management with subscription grant/revoke |
| `/admin/reports` | Date-range CSV export |

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/mail-assistant-dashboard.git
cd mail-assistant-dashboard
npm install
```

### 2. Configure environment

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  supabaseUrl: 'https://xxxx.supabase.co',
  supabaseAnonKey: 'eyJhbGciO...',
};
```

### 3. Backend setup (The BE is not public - right now I prefer to keep it private)

The dashboard expects the following endpoints on the FastAPI backend:

```
GET   /api/stats                              — Dashboard statistics
GET   /api/emails                             — Paginated email list
GET   /api/emails/{id}                        — Email detail
GET   /api/attachments                        — Invoice/document list
GET   /api/spending                           — Spending summary & analytics
POST  /api/ask                                — RAG Q&A
GET   /api/stripe/subscription                — Subscription status
POST  /api/stripe/create-checkout-session     — Stripe checkout
POST  /api/stripe/portal-session              — Stripe customer portal
GET   /api/admin/metrics                      — Admin metrics (role-gated)
GET   /api/admin/users                        — User list (role-gated)
PATCH /api/admin/users/{id}/subscription      — Grant/revoke subscription
GET   /api/admin/export                       — CSV export
GET   /health                                 — System health
```

The backend also needs:
- `SUPABASE_JWT_SECRET` env var for JWT validation
- `CORS` configured for `http://localhost:4200`

### 4. Run

```bash
npm start
```

## Build for production

```bash
npm run build
```

## Privacy

- Each user authenticates via Supabase Auth
- The JWT `sub` claim is used as `owner_id` — users only ever see their own data
- Admin routes are gated behind a role check (`user_metadata.role === 'admin'`)
