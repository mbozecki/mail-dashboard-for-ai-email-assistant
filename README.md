# Mail Assistant Dashboard

A modern Angular 19 dashboard for the **Mail Assistant** — an AI-powered email RAG system. Users log in via Supabase Auth and can only see their own emails, invoices, and documents.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 19 (standalone components) |
| UI Library | PrimeNG 19 (Aura Dark theme, purple accent) |
| Styling | Tailwind CSS v4 |
| Charts | ngx-echarts (Apache ECharts) |
| Auth | Supabase Auth (JWT) |
| Backend | FastAPI (Python) — see companion repo |

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Sign in with password or magic link |
| `/dashboard/overview` | Stats cards, email volume chart, top senders |
| `/dashboard/ask` | Chat-style RAG Q&A interface |
| `/dashboard/emails` | Email browser with search and detail drawer |
| `/dashboard/invoices` | Invoice/document table with filtering |
| `/dashboard/settings` | Account info, backend health status |

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

> **Do not commit real credentials.** Use `src/environments/environment.local.ts` (gitignored) for local values, or set environment variables at build time.

### 3. Backend setup

The dashboard expects the following endpoints on the FastAPI backend:

```
GET  /api/stats          — Dashboard statistics
GET  /api/emails         — Paginated email list
GET  /api/emails/{id}    — Email detail (decrypted)
GET  /api/attachments    — Invoice/document list
POST /api/ask            — RAG Q&A
GET  /health             — System health
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
- No admin panel or cross-user data access
