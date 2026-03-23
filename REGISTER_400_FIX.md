# Quick Fix: 400 Bad Request on Registration

## 🚀 Three Steps to Fix

### Step 1: Start Database
```powershell
docker-compose up -d
```
Wait ~10 seconds, then:
```powershell
npx prisma db push
```

### Step 2: Restart Server
```powershell
# Ctrl+C to stop current server
npm run dev
```

### Step 3: Test with Valid Data
Go to: http://localhost:3000/register

Fill in:
- **Name**: `John Doe` (at least 2 characters)
- **Email**: `john@example.com` (valid email format)
- **Password**: `SecurePass123` (at least 8 characters)
- **Confirm**: `SecurePass123`

Click "Sign Up" → Should redirect to dashboard

---

## 🔍 Check If Data is Valid

| Field | Requirement | ✅ Valid | ❌ Invalid |
|-------|-------------|---------|----------|
| Name | 2-100 chars | John Doe | J |
| Email | Valid format | john@example.com | john@localhost |
| Password | 8-100 chars | SecurePass123 | pass123 |

---

## See the Error Details

### In Browser (F12):
1. Open DevTools (F12)
2. Go to Console tab
3. Try to register
4. Look for error details showing what failed

### In Terminal:
Look at where you ran `npm run dev`:
```
[REGISTER] Received body: {...}
[REGISTER] Validation failed: { password: ["String must contain at least 8 character(s)"], ... }
```

---

## Most Common Fix

**Password too short!**
- Your password must be at least 8 characters
- `pass123` ❌ (7 chars)
- `password123` ✅ (11 chars)

---

For detailed debugging, see: [DEBUG_400_ERROR.md](./DEBUG_400_ERROR.md)
