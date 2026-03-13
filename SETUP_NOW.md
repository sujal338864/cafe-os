# 🚀 Shop OS - Setup Instructions (You Already Have the Code!)

## ⚠️ Important: You Already Have Everything!

The code is **already in your current directory**. You don't need to clone anything!

```
c:\Users\Lenovo\Downloads\files\
├── backend/          ← Already here!
├── frontend/         ← Already here!
├── schema.prisma     ← Already here!
└── ... (all other files)
```

---

## 🎯 What You Need to Do

### Step 1: Install Prerequisites (If Not Already Done)

**Install Node.js 18+:**
- Go to https://nodejs.org/
- Download LTS version
- Run installer
- Verify: `node --version`

**Install PostgreSQL:**
- Go to https://www.postgresql.org/download/
- Download for Windows
- Run installer
- Remember the password!
- Verify: `psql --version`

---

### Step 2: Create Database

**Open Command Prompt:**

```bash
psql -U postgres
```

Enter your PostgreSQL password when prompted.

**Then type:**

```sql
CREATE DATABASE shopos;
\q
```

✅ Database created!

---

### Step 3: Setup Backend

**In Command Prompt, navigate to backend:**

```bash
cd c:\Users\Lenovo\Downloads\files\backend
```

**Install dependencies:**

```bash
npm install
```

⏳ Wait 2-3 minutes for completion.

**Create .env file:**

```bash
copy .env.example .env
```

**Edit the .env file:**

Open `c:\Users\Lenovo\Downloads\files\backend\.env` in Notepad or VS Code.

Find this line:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/shopos"
```

Replace `password` with your PostgreSQL password.

**Setup database:**

```bash
npx prisma migrate dev
```

When asked for migration name, type: `init`

**Start backend:**

```bash
npm run dev
```

You should see:
```
🚀 Shop OS API running on port 4000
```

✅ **Keep this terminal open!**

---

### Step 4: Setup Frontend

**Open NEW Command Prompt (don't close the first one!)**

**Navigate to frontend:**

```bash
cd c:\Users\Lenovo\Downloads\files\frontend
```

**Install dependencies:**

```bash
npm install
```

⏳ Wait 2-3 minutes.

**Create .env.local file:**

```bash
copy .env.example .env.local
```

**Start frontend:**

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

## 🎉 You're Done!

### Open Browser

Go to: **http://localhost:3000**

### Register Account

1. Click "Register"
2. Fill in:
   - Shop Name: `My Test Shop`
   - Owner Name: `Your Name`
   - Email: `test@example.com`
   - Password: `password123`
   - Phone: `9876543210`
3. Click "Register"

✅ **You're logged in!**

---

## 🧪 Test Everything

### Test 1: Add Product
1. Go to **Products**
2. Click **"Add Product"**
3. Fill in details
4. Click **"Add Product"**

### Test 2: Create Sale
1. Go to **New Sale**
2. Search for product
3. Click to add to cart
4. Click **"Charge"**

### Test 3: View Dashboard
1. Go to **Dashboard**
2. See your stats

---

## 🆘 Troubleshooting

### Problem: "Port 4000 already in use"

```bash
netstat -ano | findstr :4000
taskkill /PID <PID> /F
npm run dev
```

### Problem: "Port 3000 already in use"

```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
npm run dev
```

### Problem: "Database connection error"

1. Check PostgreSQL is running
2. Verify password in .env
3. Test: `psql -U postgres -d shopos`

### Problem: "npm install fails"

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📋 Checklist

- [ ] Node.js installed
- [ ] PostgreSQL installed
- [ ] Database created
- [ ] Backend .env configured
- [ ] Backend dependencies installed
- [ ] Backend database migrated
- [ ] Backend running on port 4000
- [ ] Frontend dependencies installed
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can register account
- [ ] Can add product
- [ ] Can create order

---

## 📁 File Locations

```
c:\Users\Lenovo\Downloads\files\
├── backend/
│   ├── .env              ← Edit this (add password)
│   ├── src/
│   ├── package.json
│   └── prisma/
│       └── schema.prisma ← Database schema
├── frontend/
│   ├── .env.local        ← Already configured
│   ├── src/
│   └── package.json
└── (other files)
```

---

## 💡 Important Notes

### Keep Terminals Open
- Terminal 1: Backend (npm run dev)
- Terminal 2: Frontend (npm run dev)
- Terminal 3: For other commands

### Don't Close Terminals
If you close a terminal, the server stops!

### To Stop Servers
Press `Ctrl+C` in each terminal

### To Restart Servers
1. Press `Ctrl+C`
2. Run `npm run dev` again

---

## 🎯 Next Steps

After setup works:

1. **Explore Features**
   - Add products
   - Create customers
   - Make sales
   - View analytics

2. **Read Documentation**
   - Open `README.md`
   - Read `API_DOCS.md`
   - Check `QUICK_REFERENCE.md`

3. **Customize**
   - Edit backend routes
   - Modify frontend UI
   - Add new features

4. **Deploy** (Later)
   - Follow `DEPLOYMENT_GUIDE.md`

---

## ✅ Success!

If you can:
✅ Access http://localhost:3000
✅ Register account
✅ Add product
✅ Create order
✅ View dashboard

**Then Shop OS is fully working!** 🚀

---

**Happy coding! 🎊**
