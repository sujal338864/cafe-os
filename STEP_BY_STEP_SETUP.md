# 🚀 Shop OS - Step-by-Step Setup Guide

## ⚠️ Prerequisites (Install First)

### Step 1: Install Node.js
1. Go to https://nodejs.org/
2. Download **LTS version** (18 or higher)
3. Run installer and follow prompts
4. Verify installation:
```bash
node --version
npm --version
```

### Step 2: Install PostgreSQL
1. Go to https://www.postgresql.org/download/
2. Download for your OS
3. Run installer
4. Remember the password you set
5. Verify installation:
```bash
psql --version
```

### Step 3: Install Git (Optional but Recommended)
1. Go to https://git-scm.com/
2. Download and install
3. Verify:
```bash
git --version
```

---

## 📋 Setup Steps

### STEP 1: Create Database

**Windows (Command Prompt):**
```bash
psql -U postgres
```

When prompted, enter the password you set during PostgreSQL installation.

Then run:
```sql
CREATE DATABASE shopos;
\q
```

**Mac/Linux:**
```bash
psql postgres
CREATE DATABASE shopos;
\q
```

✅ **Database created!**

---

### STEP 2: Backend Setup

#### 2.1 Navigate to Backend Folder
```bash
cd c:\Users\Lenovo\Downloads\files\backend
```

#### 2.2 Install Dependencies
```bash
npm install
```
⏳ This takes 2-3 minutes. Wait for it to complete.

#### 2.3 Create Environment File
```bash
copy .env.example .env
```

#### 2.4 Edit .env File
Open `backend/.env` in a text editor and update:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/shopos"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long-12345"
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."
```

**Replace:**
- `YOUR_PASSWORD` with your PostgreSQL password
- `JWT_SECRET` with any random string (min 32 characters)

#### 2.5 Setup Database
```bash
npx prisma migrate dev
```

When asked for migration name, type: `init`

✅ **Backend database ready!**

#### 2.6 Start Backend Server
```bash
npm run dev
```

You should see:
```
🚀 Shop OS API running on port 4000
```

**Keep this terminal open!** ✅

---

### STEP 3: Frontend Setup

#### 3.1 Open New Terminal/Command Prompt

#### 3.2 Navigate to Frontend Folder
```bash
cd c:\Users\Lenovo\Downloads\files\frontend
```

#### 3.3 Install Dependencies
```bash
npm install
```
⏳ This takes 2-3 minutes.

#### 3.4 Create Environment File
```bash
copy .env.example .env.local
```

#### 3.5 Edit .env.local File
Open `frontend/.env.local` and update:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

#### 3.6 Start Frontend Server
```bash
npm run dev
```

You should see:
```
▲ Next.js 14.0.0
- Local: http://localhost:3000
```

✅ **Frontend running!**

---

## 🎉 You're Ready!

### Access the Application

1. **Open Browser**: http://localhost:3000
2. **You should see**: Shop OS Dashboard

### Create Your First Account

1. Click **"Register"**
2. Fill in:
   - Shop Name: `My Test Shop`
   - Owner Name: `Your Name`
   - Email: `test@example.com`
   - Password: `password123`
   - Phone: `9876543210`
3. Click **"Register"**
4. You're logged in! ✅

---

## 🧪 Test the Application

### Test 1: Add a Product
1. Go to **Products** section
2. Click **"Add Product"**
3. Fill in:
   - Name: `Basmati Rice 5kg`
   - Cost Price: `180`
   - Selling Price: `320`
   - Stock: `100`
4. Click **"Add Product"**
5. Product appears in list ✅

### Test 2: Create an Order
1. Go to **New Sale** (POS)
2. Search for your product
3. Click to add to cart
4. Click **"Charge"** button
5. Invoice created ✅

### Test 3: View Dashboard
1. Go to **Dashboard**
2. See your sales stats
3. View charts ✅

---

## 🔧 Troubleshooting

### Problem: "Port 4000 already in use"

**Windows:**
```bash
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:4000 | xargs kill -9
```

### Problem: "Database connection error"

1. Check PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Test connection:
```bash
psql -U postgres -d shopos
```

### Problem: "npm install fails"

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Port 3000 already in use"

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

---

## 📊 Verify Everything Works

### Check Backend
```bash
curl http://localhost:4000/health
```

Should return:
```json
{"status":"ok","version":"1.0.0"}
```

### Check Frontend
Open http://localhost:3000 in browser

### Check Database
```bash
psql -U postgres -d shopos
SELECT COUNT(*) FROM "Shop";
\q
```

---

## 🎯 Next Steps

### After Setup Works:

1. **Explore Features**
   - Add more products
   - Create customers
   - Make sales
   - View analytics

2. **Read Documentation**
   - Open `README.md`
   - Read `API_DOCS.md`
   - Check `QUICK_REFERENCE.md`

3. **Customize**
   - Edit colors in `frontend/tailwind.config.ts`
   - Add new features in `backend/src/routes/`
   - Modify UI in `frontend/src/`

4. **Deploy** (Later)
   - Follow `DEPLOYMENT_GUIDE.md`
   - Deploy to Vercel (frontend)
   - Deploy to Railway (backend)

---

## 📁 File Locations

```
c:\Users\Lenovo\Downloads\files\
├── backend/
│   ├── .env                    ← Edit this
│   ├── src/
│   └── package.json
├── frontend/
│   ├── .env.local              ← Edit this
│   ├── src/
│   └── package.json
├── schema.prisma               ← Database schema
└── README.md                   ← Read this
```

---

## 💡 Tips

### Keep Terminals Open
- Terminal 1: Backend (`npm run dev`)
- Terminal 2: Frontend (`npm run dev`)
- Terminal 3: For other commands

### Default Login
After registration, you can login with:
- Email: `test@example.com`
- Password: `password123`

### View Database
```bash
npx prisma studio
```
Opens visual database editor at http://localhost:5555

### Stop Servers
- Press `Ctrl+C` in each terminal

### Restart Servers
- Stop with `Ctrl+C`
- Run `npm run dev` again

---

## ✅ Checklist

- [ ] Node.js installed
- [ ] PostgreSQL installed
- [ ] Database created
- [ ] Backend dependencies installed
- [ ] Backend .env configured
- [ ] Backend database migrated
- [ ] Backend running on port 4000
- [ ] Frontend dependencies installed
- [ ] Frontend .env.local configured
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can register account
- [ ] Can add product
- [ ] Can create order
- [ ] Can view dashboard

---

## 🎉 Success!

If you can:
✅ Access http://localhost:3000
✅ Register an account
✅ Add a product
✅ Create an order
✅ View dashboard

**Then Shop OS is fully set up and working!** 🚀

---

## 📞 Need Help?

1. Check **QUICK_REFERENCE.md** for common commands
2. Check **SETUP_GUIDE.md** for detailed setup
3. Check **Troubleshooting** section above
4. Read error messages carefully

---

**Happy coding! 🎊**
