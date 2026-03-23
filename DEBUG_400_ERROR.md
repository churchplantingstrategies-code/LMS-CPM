# 400 Bad Request Error - Diagnosis Guide

## 🔍 Common Causes

Your `POST /api/auth/register` is returning **400 (Bad Request)**, which means the validation is failing.

### ❌ Most Likely Issues

#### 1. **Database Not Initialized**
```bash
# Check: Is the database connected?
npx prisma db push
# If you see errors, the DB isn't set up yet

# If using Docker, verify it's running:
docker ps
```

#### 2. **Missing or Invalid Fields**
Your form is sending these fields:
```json
{
  "name": "Your Name",
  "email": "email@example.com",
  "password": "password123",
  "plan": "starter" // optional
}
```

**Schema Validation Requirements:**
- `name` → string, 2-100 characters ✓
- `email` → valid email format ✓
- `password` → string, **8-100 characters** ← Must be at least 8!
- `plan` → optional string

#### 3. **Incorrect Password Length**
```
❌ FAILS: "password" (8 chars but might have spaces)
❌ FAILS: "pass123" (7 chars - too short!)
✅ WORKS: "password123" (11 chars)
✅ WORKS: "Testing@2024" (12 chars)
```

---

## 🛠️ How to Debug

### Step 1: Check Browser Console
Right-click → Inspect → Console tab

You should see the detailed error response. Look for:
```javascript
{
  error: "Validation failed",
  details: {
    password: ["String must contain at least 8 character(s)"],
    email: ["Invalid email"],
    name: ["String must contain at least 2 character(s)"]
  },
  hints: { ... }
}
```

### Step 2: Check Server Logs
In your terminal where `npm run dev` is running, look for:
```
[REGISTER] Received body: { name: "...", email: "...", password: "..." }
[REGISTER] Validation failed: { password: ["..."], ... }
```

### Step 3: Test Each Field

Try this in browser console:
```javascript
// Test if fields are valid
const name = "John Doe";
const email = "john@example.com";
const password = "SecurePass123";

console.log("Name length:", name.length); // Should be > 2
console.log("Email valid:", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)); // Should be true
console.log("Password length:", password.length); // Should be >= 8
```

---

## ✅ Solution Checklist

- [ ] **Step 1: Start Database**
  ```powershell
  docker-compose up -d
  # Wait 10 seconds
  npx prisma db push
  ```

- [ ] **Step 2: Verify .env.local**
  ```
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ediscipleship"
  NEXTAUTH_URL="http://localhost:3000"
  NEXTAUTH_SECRET="dev-testing-secret-change-in-production-12345"
  ```

- [ ] **Step 3: Restart Dev Server**
  ```powershell
  # Ctrl+C to stop
  npm run dev
  ```

- [ ] **Step 4: Test Registration**
  Go to http://localhost:3000/register
  - Name: `John Doe` (>2 chars)
  - Email: `john@example.com` (valid format)
  - Password: `SecurePass123` (>=8 chars)
  - Confirm: `SecurePass123`
  - Click "Sign Up"

---

## 🐛 Specific Error Cases

### Error: "email: Invalid email"
- Your email doesn't match pattern `...@...`
- Examples that FAIL: `john`, `john@`, `john@localhost`
- Examples that WORK: `john@example.com`, `test@test.co`

### Error: "password: String must contain at least 8 character(s)"
- Your password is shorter than 8 characters
- FAILS: `pass1`, `secret`, `test123`
- WORKS: `SecurePass123`, `MyPassword2024`, `TestPass!2024`

### Error: "name: String must contain at least 2 character(s)"
- Your name is less than 2 characters
- FAILS: `J`, `A`
- WORKS: `John`, `Jane Doe`, `JD`

### Error: "Internal server error" (500)
- Database connection failed
- Check:
  ```bash
  npx prisma db push
  npx prisma studio  # Should open database viewer
  ```

---

## 🔍 Advanced Debugging

### Option A: Check Prisma Connection
```bash
# Open Prisma Studio to see database
npx prisma studio

# Should open at http://localhost:5555
# If it connects, database is working
```

### Option B: Check Network Request
1. Open DevTools (F12) → Network tab
2. Go to registration form
3. Fill in form and submit
4. Look for POST request to `/api/auth/register`
5. Click it and check:
   - **Request** tab → see what was sent
   - **Response** tab → see actual error message

### Option C: Direct Database Test
```bash
# If using PostgreSQL locally
psql -U postgres -d ediscipleship

# Check if User table exists
\dt

# Should show tables like: User, Account, Session, etc.
```

---

## 📊 Valid Test Data

```
✅ Use This to Test:

Name: John Doe
Email: john@example.com
Password: TestPass123
Confirm: TestPass123
```

---

## 🚀 After Fixing

Once registration works:
1. Create an account at http://localhost:3000/register
2. You'll auto-login to dashboard
3. Go to http://localhost:3000/admin to see admin panel

---

## 📞 Still Having Issues?

Check these files:
- [GET_STARTED.md](./GET_STARTED.md) - Setup guide
- [SETUP.md](./SETUP.md) - Detailed troubleshooting
- `app/api/auth/register/route.ts` - API endpoint
- `app/(auth)/register/page.tsx` - Registration form

Error logs now include detailed validation failures. Check your **browser console** (F12) and **terminal** running `npm run dev`.
