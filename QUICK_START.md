# 🚀 QUICK START - 5 Minutes to Running Shop OS

## 📋 What You Need

- ✅ Node.js 18+ (https://nodejs.org/)
- ✅ PostgreSQL (https://www.postgresql.org/download/)
- ✅ Text Editor (VS Code recommended)

---

## ⚡ 5-Minute Setup

### 1️⃣ Create Database (1 minute)

**Open Command Prompt/Terminal:**

```bash
psql -U postgres
```

Enter your PostgreSQL password, then:

```sql
CREATE DATABASE shopos;
\q
```

✅ Done!

---

### 2️⃣ Setup Backend (2 minutes)

**Open Command Prompt:**

```bash
cd c:\Users\Lenovo\Downloads\files\backend
npm install
copy .env.example .env
```

**Edit `.env` file:**
- Find: `DATABASE_URL="postgresql://postgres:password@localhost:5432/shopos"`
- Replace `password` with your PostgreSQL password

**Then run:**

```bash
npx prisma migrate dev
npm run dev
```

**Wait for:**
```
🚀 Shop OS API running on port 4000
```

✅ Backend running!

---

### 3️⃣ Setup Frontend (2 minutes)

**Open NEW Command Prompt:**

```bash
cd c:\Users\Lenovo\Downloads\files\frontend
npm install
copy .env.example .env.local
npm run dev
```

**Wait for:**
```
▲ Next.js 14.0.0
- Local: http://localhost:3000
```

✅ Frontend running!

---

## 🎉 You're Done!

### Open Browser: http://localhost:3000

### Register Account:
- Shop Name: `My Shop`
- Owner Name: `Your Name`
- Email: `test@example.com`
- Password: `password123`
- Phone: `9876543210`

### Click Register ✅

---

## 🎯 What's Next?

| Action | Where |
|--------|-------|
| Add Products | Products → Add Product |
| Create Sale | New Sale → Add items → Charge |
| View Dashboard | Dashboard |
| View Orders | Orders |
| Manage Customers | Customers |

---

## 🆘 Quick Fixes

### Backend won't start?
```bash
# Kill port 4000
netstat -ano | findstr :4000
taskkill /PID <PID> /F
npm run dev
```

### Frontend won't start?
```bash
# Kill port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
npm run dev
```

### Database error?
```bash
# Check PostgreSQL
psql -U postgres
\q
```

---

## 📚 Full Guides

- **Detailed Setup**: `STEP_BY_STEP_SETUP.md`
- **API Reference**: `API_DOCS.md`
- **Deployment**: `DEPLOYMENT_GUIDE.md`
- **Quick Commands**: `QUICK_REFERENCE.md`

---

**That's it! Shop OS is running! 🎊**
