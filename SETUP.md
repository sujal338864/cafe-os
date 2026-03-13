# Shop OS — Setup & Deployment Guide

## Project Structure

```
shop-os/
├── frontend/                    # Next.js 14 App
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (auth)/register/
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # Dashboard home
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── customers/
│   │   │   ├── suppliers/
│   │   │   ├── purchases/
│   │   │   ├── expenses/
│   │   │   ├── analytics/
│   │   │   ├── ai/
│   │   │   └── settings/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                  # ShadCN components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Layout.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCards.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── LowStockTable.tsx
│   │   │   └── AIInsights.tsx
│   │   ├── pos/
│   │   │   ├── ProductGrid.tsx
│   │   │   └── Cart.tsx
│   │   └── shared/
│   │       ├── DataTable.tsx
│   │       ├── Modal.tsx
│   │       └── AIChat.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProducts.ts
│   │   ├── useOrders.ts
│   │   └── useAnalytics.ts
│   ├── lib/
│   │   ├── api.ts               # Axios instance
│   │   ├── auth.ts              # JWT helpers
│   │   └── utils.ts
│   └── stores/
│       ├── authStore.ts         # Zustand
│       └── cartStore.ts
│
├── backend/                     # Express API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── index.ts             # Entry point
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── products.ts
│   │   │   ├── orders.ts
│   │   │   ├── customers.ts
│   │   │   ├── suppliers.ts
│   │   │   ├── purchases.ts
│   │   │   ├── expenses.ts
│   │   │   ├── analytics.ts
│   │   │   ├── ai.ts
│   │   │   ├── reports.ts
│   │   │   └── subscriptions.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts          # JWT verify
│   │   │   ├── rbac.ts          # Role check
│   │   │   ├── rateLimiter.ts
│   │   │   └── validator.ts
│   │   ├── services/
│   │   │   ├── emailService.ts
│   │   │   ├── pdfService.ts
│   │   │   ├── aiService.ts
│   │   │   └── s3Service.ts
│   │   └── utils/
│   │       ├── logger.ts
│   │       └── helpers.ts
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── API_DOCS.md
```

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- pnpm or npm

### 1. Clone & Install
```bash
git clone https://github.com/yourname/shop-os.git
cd shop-os

# Backend
cd backend
cp ../.env.example .env
# Edit .env with your values
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
# Optional: seed demo data
npx ts-node prisma/seed.ts
```

### 3. Start Dev Servers
```bash
# Terminal 1: Backend
cd backend && npm run dev     # http://localhost:4000

# Terminal 2: Frontend
cd frontend && npm run dev    # http://localhost:3000
```

---

## Production Deployment

### Option A: Docker Compose (Recommended)
```bash
# 1. Clone repo on your VPS
git clone https://github.com/yourname/shop-os.git
cd shop-os

# 2. Set environment variables
cp .env.example .env
nano .env  # Fill in all values

# 3. Launch
docker compose up -d

# 4. Run migrations
docker compose exec backend npx prisma migrate deploy

# ✅ App running at http://your-server-ip
```

### Option B: Vercel + Railway

**Frontend → Vercel**
```bash
cd frontend
vercel deploy --prod
# Set NEXT_PUBLIC_API_URL=https://api.shopos.in
```

**Backend → Railway**
```bash
# Connect GitHub repo to Railway
# Add all environment variables in Railway dashboard
# Railway auto-deploys on push
```

### Option C: AWS (Production Scale)
- Frontend: S3 + CloudFront
- Backend: ECS Fargate (auto-scaling)
- Database: RDS PostgreSQL Multi-AZ
- Cache: ElastiCache Redis
- Storage: S3 bucket
- CDN: CloudFront

---

## SaaS Subscription Plans

| Feature | Starter (Free) | Pro (₹999/mo) | Enterprise (₹3999/mo) |
|---------|---------------|---------------|----------------------|
| Products | 100 | Unlimited | Unlimited |
| Orders/month | 200 | Unlimited | Unlimited |
| Staff accounts | 1 | 5 | Unlimited |
| AI Insights | ❌ | ✅ | ✅ |
| Reports & Export | Basic | Full | Full + Custom |
| Multi-location | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| Support | Email | Priority | Dedicated |

---

## Security Checklist
- [x] JWT auth with 7-day expiry
- [x] bcrypt password hashing (12 rounds)
- [x] Rate limiting (200 req/15min global, 5 req/min auth)
- [x] CORS whitelist
- [x] Helmet.js HTTP headers
- [x] Zod input validation on all endpoints
- [x] SQL injection protection via Prisma ORM
- [x] Role-based access control (Admin/Manager/Employee)
- [x] Multi-tenant data isolation (shopId on every query)
- [x] HTTPS enforced in production

---

## Testing
```bash
# Backend unit tests
cd backend && npm test

# API integration tests
npm run test:e2e

# Frontend component tests
cd frontend && npm test
```
