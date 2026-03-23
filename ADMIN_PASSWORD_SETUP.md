# Admin Password Configuration for Payment Settings Security

## Overview

The admin settings form now includes **password-protected access** to the Payment configuration tab. This ensures that sensitive API keys (PayMongo credentials, etc.) cannot be accidentally exposed or modified by unauthorized administrators.

## Setup Instructions

### 1. Generate a Bcrypt Hash of Your Admin Password

Run this command in your Node.js environment (or Node.js REPL):

```bash
npm install bcryptjs
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your_secure_password_here', 10).then(hash => console.log('ADMIN_PASSWORD_HASH=' + hash))"
```

Replace `your_secure_password_here` with your chosen admin password.

Example output:
```
ADMIN_PASSWORD_HASH=$2a$10$xyz...abc
```

### 2. Add to Environment Variables

Add the hash to your `.env.local` file:

```
ADMIN_PASSWORD_HASH=$2a$10$xyz...abc
```

**Important**: Never commit this hash to version control. It should only be in `.env.local`.

### 3. Verify Setup

1. Log in as an admin user (`role: ADMIN` in your database)
2. Go to **Admin → Settings**
3. Click the **Payment** tab
4. You should see a "Verify Admin Access" dialog
5. Enter your admin password from step 1
6. If verification succeeds, you can now edit payment settings

## Security Features

- **Role-based access**: Only users with `role: ADMIN` can verify and edit payment settings
- **Password verification**: Each time an admin accesses the Payment tab, they must re-enter their password
- **Password hashing**: Passwords are compared using bcryptjs (never stored in plain text)
- **Session independent**: Password verification is separate from login session for extra security

## Troubleshooting

### "Admin password not configured" error

This means `ADMIN_PASSWORD_HASH` is not set in your environment variables.

**Solution**: Follow the setup instructions above to generate and add the hash.

### "Invalid password" error

This means the password you entered doesn't match the hash.

**Solution**: 
1. Verify you're entering the original password (not the hash)
2. Re-generate the hash if needed
3. Check for typos in the `.env.local` file

### Password verification endpoint returns 401

This means you're not logged in as an admin.

**Solution**: 
1. Ensure your user account has `role: 'ADMIN'` in the database
2. Log out and log back in so the new role is reflected in your session
3. Check your NextAuth session configuration in `lib/auth.ts`

## File References

- **Frontend**: [components/admin/admin-settings-form.tsx](components/admin/admin-settings-form.tsx)
  - Password verification modal
  - Payment tab protection
  
- **Backend**: [app/api/admin/verify-password/route.ts](app/api/admin/verify-password/route.ts)
  - Password verification endpoint
  - Admin role check
  - Bcryptjs verification

- **Auth configuration**: [lib/auth.ts](lib/auth.ts)
  - Session management
  - Role-based access control

## API Endpoint

**POST** `/api/admin/verify-password`

### Request Body
```json
{
  "password": "your_admin_password"
}
```

### Response (Success - 200)
```json
{
  "success": true
}
```

### Response (Invalid Password - 403)
```json
{
  "error": "Invalid password"
}
```

### Response (Not Admin - 401)
```json
{
  "error": "Unauthorized"
}
```

## Best Practices

1. **Use a strong password**: At least 12 characters with uppercase, lowercase, numbers, and symbols
2. **Don't share the password**: Only give it to trusted admin users
3. **Rotate periodically**: Update the password and hash every 90 days
4. **Monitor logs**: Check server logs for repeated failed attempts (possible attacks)
5. **Separate from login password**: Use a different password for admin settings access than your user login password

## Related Documentation

- [SETUP.md](SETUP.md) - General project setup
- [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) - OAuth configuration
- [PAYMENT_SETUP.md](PAYMENT_SETUP.md) - Payment provider setup
