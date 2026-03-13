# 🚀 Shop OS - Production Deployment Guide

## Overview

This guide covers deploying Shop OS to production using:
- **Frontend**: Vercel
- **Backend**: Railway/Render
- **Database**: AWS RDS / Heroku Postgres
- **Storage**: AWS S3 (optional)

---

## 📋 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates ready
- [ ] Domain names registered
- [ ] Payment gateway accounts (Stripe/Razorpay)
- [ ] Email service configured
- [ ] Monitoring setup
- [ ] Backup strategy defined

---

## 🗄️ Database Setup

### AWS RDS PostgreSQL

1. **Create RDS Instance**
   ```bash
   # Via AWS Console or CLI
   aws rds create-db-instance \
     --db-instance-identifier shopos-prod \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username shopos \
     --master-user-password <strong-password> \
     --allocated-storage 20 \
     --publicly-accessible false
   ```

2. **Get Connection String**
   ```
   postgresql://shopos:<password>@shopos-prod.xxxxx.us-east-1.rds.amazonaws.com:5432/shopos
   ```

3. **Create Database**
   ```bash
   psql -h shopos-prod.xxxxx.us-east-1.rds.amazonaws.com -U shopos -c "CREATE DATABASE shopos;"
   ```

### Heroku Postgres

1. **Create Postgres Add-on**
   ```bash
   heroku addons:create heroku-postgresql:standard-0 -a shopos-api
   ```

2. **Get Connection String**
   ```bash
   heroku config:get DATABASE_URL -a shopos-api
   ```

---

## 🔧 Backend Deployment (Railway)

### 1. Create Railway Project

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create project
railway init
```

### 2. Configure Environment

```bash
# Set environment variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set JWT_SECRET="<strong-random-string>"
railway variables set NODE_ENV="production"
railway variables set OPENAI_API_KEY="sk-..."
railway variables set STRIPE_SECRET_KEY="sk_live_..."
railway variables set FRONTEND_URL="https://shopos.com"
```

### 3. Deploy

```bash
# Push code
git push

# Railway auto-deploys on push
# Or manually:
railway up
```

### 4. Run Migrations

```bash
# Connect to Railway
railway shell

# Run migrations
npx prisma migrate deploy

# Exit
exit
```

### 5. Verify Deployment

```bash
# Check logs
railway logs

# Test API
curl https://api.shopos.com/health
```

---

## 🎨 Frontend Deployment (Vercel)

### 1. Connect Repository

1. Go to https://vercel.com
2. Click "New Project"
3. Select GitHub repository
4. Configure project settings

### 2. Environment Variables

```bash
# In Vercel Dashboard > Settings > Environment Variables
NEXT_PUBLIC_API_URL=https://api.shopos.com
```

### 3. Deploy

```bash
# Automatic on push to main
# Or manually:
vercel --prod
```

### 4. Configure Domain

1. Go to Vercel > Domains
2. Add custom domain
3. Update DNS records
4. Enable auto-renewal

---

## 🔐 SSL/TLS Certificates

### Automatic (Recommended)

- **Vercel**: Automatic SSL for all deployments
- **Railway**: Automatic SSL for Railway domains
- **Custom Domain**: Use Let's Encrypt via Certbot

### Manual Setup

```bash
# Using Certbot
sudo certbot certonly --standalone -d api.shopos.com

# Copy certificates to server
sudo cp /etc/letsencrypt/live/api.shopos.com/fullchain.pem /app/certs/
sudo cp /etc/letsencrypt/live/api.shopos.com/privkey.pem /app/certs/
```

---

## 📧 Email Configuration

### Gmail SMTP

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@shopos.in
SMTP_PASS=<app-password>
```

### SendGrid

```env
SENDGRID_API_KEY=SG.xxxxx
```

### AWS SES

```env
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=xxxxx
AWS_SES_SECRET_ACCESS_KEY=xxxxx
```

---

## 💳 Payment Gateway Setup

### Stripe

1. **Create Account**: https://stripe.com
2. **Get Keys**:
   - Publishable Key: `pk_live_xxxxx`
   - Secret Key: `sk_live_xxxxx`
3. **Set Environment Variables**:
   ```env
   STRIPE_SECRET_KEY=sk_live_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```
4. **Configure Webhooks**:
   - Endpoint: `https://api.shopos.com/api/subscriptions/webhook`
   - Events: `charge.succeeded`, `charge.failed`, `customer.subscription.updated`

### Razorpay

1. **Create Account**: https://razorpay.com
2. **Get Keys**:
   - Key ID: `rzp_live_xxxxx`
   - Key Secret: `xxxxx`
3. **Set Environment Variables**:
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   ```

---

## 📊 Monitoring & Logging

### Application Monitoring

```bash
# Using Sentry
npm install @sentry/node

# Configure in backend
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Database Monitoring

```bash
# AWS CloudWatch
# Monitor RDS metrics:
# - CPU Utilization
# - Database Connections
# - Storage Space
# - Read/Write Latency
```

### Log Aggregation

```bash
# Using LogRocket
npm install logrocket

# Or use CloudWatch Logs
# Or use Datadog
```

---

## 🔄 Backup Strategy

### Database Backups

```bash
# AWS RDS - Automated backups
# - Retention: 30 days
# - Backup window: 03:00-04:00 UTC

# Manual backup
aws rds create-db-snapshot \
  --db-instance-identifier shopos-prod \
  --db-snapshot-identifier shopos-backup-$(date +%Y%m%d)
```

### Application Backups

```bash
# Backup uploaded files from S3
aws s3 sync s3://shopos-uploads s3://shopos-backups/$(date +%Y%m%d)/
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 🧪 Production Testing

### Health Checks

```bash
# API Health
curl https://api.shopos.com/health

# Database Connection
curl https://api.shopos.com/api/auth/login -X POST

# Frontend
curl https://shopos.com
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 https://api.shopos.com/health

# Using k6
k6 run load-test.js
```

### Security Testing

```bash
# OWASP ZAP
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://api.shopos.com

# SSL Labs
https://www.ssllabs.com/ssltest/analyze.html?d=api.shopos.com
```

---

## 📈 Performance Optimization

### Backend

```typescript
// Enable compression
app.use(compression());

// Enable caching
app.use(cache('5 minutes'));

// Database query optimization
// - Add indexes
// - Use pagination
// - Lazy load relations
```

### Frontend

```typescript
// Code splitting
const Dashboard = dynamic(() => import('./Dashboard'), {
  loading: () => <Skeleton />,
});

// Image optimization
<Image
  src="/image.jpg"
  alt="..."
  width={800}
  height={600}
  priority
/>

// Service Worker
// - Offline support
// - Cache static assets
```

---

## 🔐 Security Hardening

### Backend

```typescript
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// Helmet
app.use(helmet());

// Input validation
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### Frontend

```typescript
// CSP Headers
<meta http-equiv="Content-Security-Policy" content="..." />

// HTTPS only
// - Redirect HTTP to HTTPS
// - Set HSTS header

// Secure cookies
// - HttpOnly flag
// - Secure flag
// - SameSite=Strict
```

---

## 📞 Incident Response

### Monitoring Alerts

Set up alerts for:
- API response time > 1s
- Error rate > 1%
- Database CPU > 80%
- Disk space < 10%
- Failed deployments

### Rollback Procedure

```bash
# Railway
railway rollback <deployment-id>

# Vercel
vercel rollback

# Database
# - Restore from backup
# - Run migrations in reverse
```

---

## 📋 Post-Deployment

- [ ] Verify all features working
- [ ] Test payment processing
- [ ] Check email notifications
- [ ] Monitor error logs
- [ ] Performance testing
- [ ] Security audit
- [ ] User acceptance testing
- [ ] Documentation updated
- [ ] Team trained
- [ ] Support process established

---

## 🆘 Troubleshooting

### 502 Bad Gateway

```bash
# Check backend logs
railway logs

# Verify database connection
psql -h <db-host> -U <user> -d shopos

# Restart backend
railway restart
```

### Slow API Response

```bash
# Check database queries
# - Add indexes
# - Optimize queries
# - Enable caching

# Check server resources
# - CPU usage
# - Memory usage
# - Disk I/O

# Scale up if needed
```

### Database Connection Issues

```bash
# Check connection string
echo $DATABASE_URL

# Verify security groups
# - Allow inbound on port 5432
# - From backend IP

# Test connection
psql $DATABASE_URL
```

---

## 📚 Resources

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [AWS RDS Docs](https://docs.aws.amazon.com/rds/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 📞 Support

For deployment issues:
- Check logs: `railway logs` or Vercel dashboard
- Review error messages
- Check environment variables
- Verify database connectivity
- Contact support team

---

**Deployment successful! 🎉**
