# Shop OS - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone Repository
```bash
git clone <repo-url>
cd shop-os
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database URL and API keys

# Setup database
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev
```

Backend will run on `http://localhost:4000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with API URL

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## 📋 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/shopos"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"

# OpenAI (for AI features)
OPENAI_API_KEY="sk-..."

# Stripe (optional)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Razorpay (optional)
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="..."

# AWS S3 (optional)
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_BUCKET_NAME="shop-os-uploads"
AWS_REGION="ap-south-1"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="noreply@shopos.in"
SMTP_PASS="..."

# Logging
LOG_LEVEL="info"
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_APP_NAME="Shop OS"
```

---

## 🗄️ Database Setup

### Create Database
```bash
createdb shopos
```

### Run Migrations
```bash
cd backend
npx prisma migrate dev --name init
```

### View Database
```bash
npx prisma studio
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 🐳 Docker Setup

### Build Images
```bash
docker-compose build
```

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

---

## 🚀 Production Deployment

### Backend Deployment (Railway/Render/AWS)

1. **Build**
   ```bash
   npm run build
   ```

2. **Environment Variables**
   - Set all production environment variables
   - Use strong JWT_SECRET
   - Use production database URL

3. **Database Migration**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start**
   ```bash
   npm start
   ```

### Frontend Deployment (Vercel)

1. **Connect Repository**
   - Push code to GitHub
   - Connect to Vercel

2. **Environment Variables**
   - Set `NEXT_PUBLIC_API_URL` to production API URL

3. **Deploy**
   - Vercel auto-deploys on push

---

## 📊 Database Schema

See `schema.prisma` for complete schema.

Key tables:
- **Shop** - Multi-tenant shops
- **User** - Shop users with roles
- **Product** - Inventory items
- **Order** - Sales/invoices
- **Customer** - Customer profiles
- **Supplier** - Supplier management
- **Purchase** - Purchase orders
- **Expense** - Business expenses
- **Notification** - System notifications
- **Subscription** - SaaS billing

---

## 🔐 Security Checklist

- [ ] Use strong JWT_SECRET (min 32 chars)
- [ ] Enable HTTPS in production
- [ ] Set CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Validate all inputs
- [ ] Use bcrypt for passwords
- [ ] Enable CSRF protection
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

## 📈 Scaling

### Database
- Use connection pooling (PgBouncer)
- Add read replicas for analytics
- Regular backups

### Backend
- Use load balancer (Nginx)
- Horizontal scaling with multiple instances
- Cache with Redis
- Queue jobs with Bull/RabbitMQ

### Frontend
- CDN for static assets
- Image optimization
- Code splitting
- Service workers for offline

---

## 🆘 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres

# Verify DATABASE_URL
echo $DATABASE_URL
```

### Port Already in Use
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Prisma Issues
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (dev only)
npx prisma migrate reset
```

---

## 📚 API Documentation

See `API_DOCS.md` for complete API reference.

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Write tests
4. Submit PR

---

## 📄 License

MIT

---

## 📞 Support

- Email: support@shopos.in
- Docs: https://docs.shopos.in
- Issues: GitHub Issues
