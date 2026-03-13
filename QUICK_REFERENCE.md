# 🚀 Shop OS - Quick Reference Guide

## 📦 Project Structure

```
shop-os/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── index.ts           # Main server
│   │   ├── middleware/        # Auth, validation
│   │   └── routes/            # API endpoints
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/                   # Next.js React app
│   ├── src/
│   │   ├── app/               # Pages
│   │   ├── components/        # React components
│   │   └── lib/               # Utilities
│   ├── package.json
│   ├── tailwind.config.ts
│   └── Dockerfile
├── schema.prisma              # Database schema
├── docker-compose.yml         # Docker setup
├── .env.example               # Environment template
├── README.md                  # Project overview
├── SETUP_GUIDE.md             # Setup instructions
├── API_DOCS.md                # API reference
├── DEPLOYMENT_GUIDE.md        # Deployment guide
└── PROJECT_SUMMARY.md         # Architecture overview
```

---

## ⚡ Quick Commands

### Backend

```bash
# Setup
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma generate

# Development
npm run dev              # Start dev server (port 4000)
npm run build            # Build TypeScript
npm start                # Start production server
npm test                 # Run tests

# Database
npx prisma studio       # Open Prisma Studio
npx prisma migrate dev  # Create migration
npx prisma migrate reset # Reset database (dev only)
```

### Frontend

```bash
# Setup
cd frontend
npm install
cp .env.example .env.local

# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm start                # Start production server
npm test                 # Run tests
npm run lint             # Run linter
npm run type-check       # Check TypeScript
```

### Docker

```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Shell
docker-compose exec backend sh
docker-compose exec frontend sh
```

---

## 🔑 Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/shopos
JWT_SECRET=your-secret-key-min-32-chars
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
RAZORPAY_KEY_ID=rzp_live_...
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 📊 API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Products
```
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Orders
```
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id/cancel
```

### Customers
```
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
```

### Analytics
```
GET    /api/analytics/dashboard
GET    /api/analytics/sales-report
```

### AI
```
POST   /api/ai/chat
GET    /api/ai/insights
```

---

## 🔐 Authentication

### Login Flow

```bash
# 1. Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "shopName": "My Shop",
    "ownerName": "John",
    "email": "john@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'

# Response: { token, user, shop }

# 2. Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# 3. Use token in requests
curl http://localhost:4000/api/products \
  -H "Authorization: Bearer <token>"
```

---

## 📱 Frontend Pages

```
/                    # Home/Landing
/login               # Login page
/register            # Registration
/dashboard           # Main dashboard
/products            # Inventory
/orders              # Sales/Orders
/customers           # Customer management
/suppliers           # Supplier management
/purchases           # Purchase orders
/expenses            # Expense tracking
/analytics           # Analytics & reports
/ai                  # AI insights
/settings            # Shop settings
```

---

## 🗄️ Database

### Connect to Database

```bash
# Local PostgreSQL
psql -U postgres -d shopos

# AWS RDS
psql -h <endpoint> -U shopos -d shopos

# Heroku
heroku pg:psql -a <app-name>
```

### Common Queries

```sql
-- Count products
SELECT COUNT(*) FROM "Product" WHERE "shopId" = 'shop_id';

-- Recent orders
SELECT * FROM "Order" WHERE "shopId" = 'shop_id' 
ORDER BY "createdAt" DESC LIMIT 10;

-- Low stock products
SELECT * FROM "Product" 
WHERE "shopId" = 'shop_id' AND stock <= "lowStockAlert";

-- Customer balance
SELECT name, "outstandingBalance" FROM "Customer" 
WHERE "shopId" = 'shop_id' AND "outstandingBalance" > 0;
```

---

## 🚀 Deployment

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
```

### Railway (Backend)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up

# Set variables
railway variables set DATABASE_URL="..."
```

### Database (AWS RDS)

```bash
# Create instance
aws rds create-db-instance \
  --db-instance-identifier shopos-prod \
  --db-instance-class db.t3.micro \
  --engine postgres

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier shopos-prod
```

---

## 🧪 Testing

### API Testing

```bash
# Health check
curl http://localhost:4000/health

# Create product
curl -X POST http://localhost:4000/api/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product",
    "costPrice": 100,
    "sellingPrice": 150,
    "stock": 10
  }'

# Get products
curl http://localhost:4000/api/products \
  -H "Authorization: Bearer <token>"
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:4000/health

# Using k6
k6 run load-test.js
```

---

## 🐛 Debugging

### Backend Logs

```bash
# Development
npm run dev          # Logs in console

# Production
railway logs         # Railway logs
docker logs backend  # Docker logs
```

### Frontend Logs

```bash
# Browser console
F12 or Cmd+Option+I

# Next.js logs
npm run dev          # Logs in terminal
```

### Database Debugging

```bash
# Prisma Studio
npx prisma studio

# Query logs
DATABASE_LOG=query npm run dev
```

---

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error

```bash
# Check PostgreSQL
psql -U postgres

# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

### Prisma Issues

```bash
# Regenerate client
npx prisma generate

# Reset database (dev only)
npx prisma migrate reset

# Check schema
npx prisma validate
```

### Node Modules Issues

```bash
# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Project overview |
| SETUP_GUIDE.md | Setup instructions |
| API_DOCS.md | API reference |
| DEPLOYMENT_GUIDE.md | Deployment guide |
| PROJECT_SUMMARY.md | Architecture overview |
| schema.prisma | Database schema |

---

## 🔗 Useful Links

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **API Docs**: http://localhost:4000/api
- **Prisma Studio**: http://localhost:5555
- **GitHub**: https://github.com/shopos/shop-os
- **Docs**: https://docs.shopos.in

---

## 👥 Team Roles

| Role | Responsibilities |
|------|-----------------|
| Admin | Full system access, user management |
| Manager | Product, order, customer management |
| Employee | View products, create orders |

---

## 💡 Tips & Tricks

### Development

```bash
# Watch mode for TypeScript
tsc --watch

# Format code
npx prettier --write .

# Lint code
npm run lint

# Type check
npm run type-check
```

### Database

```bash
# Backup database
pg_dump shopos > backup.sql

# Restore database
psql shopos < backup.sql

# Export data
\copy "Product" TO 'products.csv' WITH CSV HEADER
```

### Performance

```bash
# Check API response time
time curl http://localhost:4000/api/products

# Monitor database
EXPLAIN ANALYZE SELECT * FROM "Product";

# Check indexes
SELECT * FROM pg_indexes WHERE tablename = 'Product';
```

---

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@shopos.in
- **Docs**: https://docs.shopos.in

---

## 🎯 Checklist

### Before Deployment

- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] SSL certificates ready
- [ ] Payment gateway configured
- [ ] Email service setup
- [ ] Monitoring enabled
- [ ] Backups configured

### After Deployment

- [ ] Health check passing
- [ ] API responding
- [ ] Database connected
- [ ] Frontend loading
- [ ] Authentication working
- [ ] Payments processing
- [ ] Emails sending
- [ ] Logs monitoring

---

**Happy coding! 🚀**
