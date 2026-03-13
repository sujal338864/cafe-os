# 🏪 Shop OS - SaaS Platform for Small Business Management

**Shop OS** is a production-ready, scalable SaaS platform that replaces Excel, notebooks, and multiple apps for small shops, retailers, and MSMEs.

## ✨ Features

### 🛍️ Core Modules

- **Inventory Management** - Track products, stock levels, and valuations
- **Point of Sale (POS)** - Create invoices with tax calculation and multiple payment methods
- **Customer Management** - Maintain customer profiles and purchase history
- **Supplier Management** - Track suppliers and outstanding payments
- **Purchase Orders** - Record inventory purchases with auto stock updates
- **Expense Tracking** - Monitor business expenses by category
- **Analytics Dashboard** - Real-time insights with Recharts visualizations
- **AI Business Assistant** - Chat-based AI for business insights
- **Multi-Employee Access** - Role-based access control (Admin, Manager, Employee)
- **Notifications** - Real-time alerts for low stock, orders, and payments
- **Reports** - Generate and export sales, inventory, and customer reports
- **SaaS Billing** - Subscription management with Stripe/Razorpay integration

### 🔐 Security & Performance

- JWT authentication with role-based access control
- Rate limiting and CORS protection
- Input validation and SQL injection prevention
- Bcrypt password hashing
- API caching and pagination
- Lazy loading and code splitting
- Production-ready error handling

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS + ShadCN UI
- React Query (Tanstack Query)
- Zustand for state management
- Recharts for analytics

**Backend**
- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM
- OpenAI API for AI features
- Stripe/Razorpay for payments

**Deployment**
- Docker & Docker Compose
- Vercel (Frontend)
- Railway/Render/AWS (Backend)
- PostgreSQL (Database)

---

## 📁 Project Structure

```
shop-os/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Main server
│   │   ├── middleware/
│   │   │   └── auth.ts           # Authentication middleware
│   │   └── routes/
│   │       ├── auth.ts           # Authentication
│   │       ├── products.ts       # Inventory
│   │       ├── orders.ts         # Sales/POS
│   │       ├── customers.ts      # Customer management
│   │       ├── suppliers.ts      # Supplier management
│   │       ├── purchases.ts      # Purchase orders
│   │       ├── expenses.ts       # Expense tracking
│   │       ├── analytics.ts      # Dashboard analytics
│   │       ├── ai.ts             # AI assistant
│   │       ├── reports.ts        # Report generation
│   │       ├── notifications.ts  # Notifications
│   │       ├── subscriptions.ts  # SaaS billing
│   │       ├── users.ts          # Staff management
│   │       ├── categories.ts     # Product categories
│   │       └── shop.ts           # Shop settings
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root layout
│   │   │   ├── page.tsx          # Home page
│   │   │   ├── login/            # Login page
│   │   │   ├── register/         # Registration
│   │   │   ├── dashboard/        # Main dashboard
│   │   │   └── ...               # Other pages
│   │   ├── components/           # Reusable components
│   │   ├── lib/
│   │   │   ├── api.ts            # API client
│   │   │   └── store.ts          # Zustand stores
│   │   └── styles/               # Global styles
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── Dockerfile
│
├── schema.prisma                 # Database schema
├── docker-compose.yml            # Docker setup
├── .env.example                  # Environment template
├── API_DOCS.md                   # API documentation
├── SETUP_GUIDE.md                # Setup instructions
└── README.md                     # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### Option 1: Local Development

```bash
# Clone repository
git clone <repo-url>
cd shop-os

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL
npx prisma migrate dev
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Visit:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- API Docs: http://localhost:4000/api

### Option 2: Docker

```bash
docker-compose up -d
```

---

## 📊 Database Schema

### Key Tables

**Multi-Tenancy**
- `Shop` - Individual shop accounts
- `User` - Shop users with roles (Admin, Manager, Employee)

**Inventory**
- `Product` - Products with pricing and stock
- `Category` - Product categories
- `StockHistory` - Stock movement tracking

**Sales**
- `Order` - Invoices/sales
- `OrderItem` - Line items in orders
- `Customer` - Customer profiles

**Procurement**
- `Supplier` - Supplier information
- `Purchase` - Purchase orders
- `PurchaseItem` - Items in purchase orders

**Operations**
- `Expense` - Business expenses
- `Notification` - System notifications
- `Subscription` - SaaS billing

**Security**
- `AuditLog` - User activity tracking

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new shop
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/:id/stock-history` - Stock history
- `POST /api/products/:id/adjust-stock` - Adjust stock

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id/orders` - Customer orders

### Analytics
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/analytics/sales-report` - Sales report
- `GET /api/analytics/inventory-report` - Inventory report

### AI
- `POST /api/ai/chat` - Chat with AI
- `GET /api/ai/insights` - Auto-generated insights

See `API_DOCS.md` for complete API reference.

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Role-Based Access Control** - Admin, Manager, Employee roles
- **Rate Limiting** - Prevent abuse (200 req/15min globally, 5 req/15min for auth)
- **CORS Protection** - Whitelist frontend domain
- **Input Validation** - Zod schema validation
- **Password Hashing** - Bcrypt with salt rounds
- **SQL Injection Prevention** - Parameterized queries via Prisma
- **HTTPS Ready** - Helmet security headers
- **Audit Logging** - Track user actions

---

## 📈 Scaling Strategy

### Database
- Connection pooling with PgBouncer
- Read replicas for analytics queries
- Automated backups
- Indexes on frequently queried columns

### Backend
- Horizontal scaling with load balancer
- Redis caching for frequently accessed data
- Job queue (Bull/RabbitMQ) for async tasks
- CDN for static assets

### Frontend
- Vercel auto-scaling
- Image optimization
- Code splitting and lazy loading
- Service workers for offline support

---

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

---

## 🚀 Production Deployment

### Backend (Railway/Render)

1. **Build**
   ```bash
   npm run build
   ```

2. **Environment Variables**
   - `DATABASE_URL` - Production PostgreSQL
   - `JWT_SECRET` - Strong random string
   - `OPENAI_API_KEY` - OpenAI API key
   - `STRIPE_SECRET_KEY` - Stripe key (if using)

3. **Database Migration**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start**
   ```bash
   npm start
   ```

### Frontend (Vercel)

1. Connect GitHub repository
2. Set `NEXT_PUBLIC_API_URL` to production API
3. Auto-deploys on push

### Database (AWS RDS/Heroku)

1. Create PostgreSQL instance
2. Update `DATABASE_URL`
3. Run migrations

---

## 📋 Deployment Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Configure email service
- [ ] Set up monitoring/logging
- [ ] Enable rate limiting
- [ ] Configure CDN
- [ ] Set up SSL certificates
- [ ] Test all payment integrations
- [ ] Security audit
- [ ] Load testing

---

## 🆘 Troubleshooting

### Database Connection Error
```bash
# Verify PostgreSQL is running
psql -U postgres

# Check DATABASE_URL
echo $DATABASE_URL
```

### Port Already in Use
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9
```

### Prisma Issues
```bash
# Regenerate client
npx prisma generate

# Reset database (dev only)
npx prisma migrate reset
```

---

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [API Documentation](./API_DOCS.md) - Complete API reference
- [Database Schema](./schema.prisma) - Prisma schema

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

- **Email**: support@shopos.in
- **Documentation**: https://docs.shopos.in
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced reporting with custom dashboards
- [ ] Inventory forecasting with ML
- [ ] Multi-location support
- [ ] Advanced payment integrations
- [ ] Accounting integration (Tally, QuickBooks)
- [ ] Barcode scanning
- [ ] SMS/WhatsApp notifications
- [ ] API marketplace

---

## 👥 Team

Built with ❤️ by the Shop OS team

---

**Ready to transform your shop management? Start with Shop OS today!** 🚀
