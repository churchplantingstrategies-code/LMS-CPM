# Google OAuth Setup Guide

Your app is already configured to use Google OAuth. Follow these steps to make it functional:

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top (currently "My First Project")
3. Click **"NEW PROJECT"**
4. Enter project name: **eDiscipleship**
5. Click **CREATE**
6. Wait for the project to be created (about 30 seconds)

## Step 2: Enable Google+ API

1. In the sidebar, go to **APIs & Services** → **Library**
2. Search for **Google+ API**
3. Click on it
4. Click **ENABLE**
5. Wait for it to activate

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials** (left sidebar)
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth client ID"**
4. If prompted to create a consent screen first, click **"Configure Consent Screen"**

### Configure OAuth Consent Screen

1. Choose **External** user type
2. Click **CREATE**
3. Fill in the form:
   - **App name**: eDiscipleship
   - **User support email**: your-email@gmail.com
   - **Developer contact**: your-email@gmail.com
4. Click **SAVE AND CONTINUE**
5. Skip scopes (optional for testing)
6. Click **SAVE AND CONTINUE**
7. Review and click **BACK TO DASHBOARD**

### Create OAuth Credentials

1. Back on **Credentials** page, click **"+ CREATE CREDENTIALS"**
2. Select **"OAuth client ID"**
3. Application type: **Web application**
4. Name: **eDiscipleship Dev**
5. Under **Authorized JavaScript origins**, add:
   ```
   http://localhost:3000
   ```
6. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click **CREATE**
8. Copy your credentials:
   - **Client ID** → `GOOGLE_CLIENT_ID`
   - **Client Secret** → `GOOGLE_CLIENT_SECRET`

## Step 4: Add Credentials to Your App

1. Open **`.env.local`** in your project
2. Find these lines:
   ```bash
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   ```
3. Paste your credentials:
   ```bash
   GOOGLE_CLIENT_ID="your-client-id-from-google"
   GOOGLE_CLIENT_SECRET="your-client-secret-from-google"
   ```
4. **Save the file** (do NOT commit this to git!)

## Step 5: Restart Your Development Server

```powershell
# Kill the current dev server (Ctrl+C)
npm run dev
```

## Step 6: Test Google Login

1. Go to http://localhost:3000
2. Click **"Continue with Google"** on the login page
3. You'll be redirected to Google's login
4. Sign in with your Google account
5. After authorization, you'll be logged in to eDiscipleship

## 🚀 For Production Deployment

When deploying to production, add these URLs to your Google OAuth settings:

1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **APIs & Services** → **Credentials**
3. Click your **eDiscipleship Dev** OAuth client
4. Add your production URL to:
   - **JavaScript origins**: `https://yourdomain.com`
   - **Redirect URIs**: `https://yourdomain.com/api/auth/callback/google`
5. Update `.env` on production server with production credentials

## ✅ How It Works

1. User clicks "Continue with Google"
2. Redirected to Google's login page
3. User authenticates with Google
4. Google redirects back with authorization code
5. NextAuth exchanges code for user info
6. User is created/logged in automatically
7. Session is created

## 🔗 Your Current Setup

- ✅ NextAuth is configured (no changes needed)
- ✅ Google provider is enabled in `lib/auth.ts`
- ✅ Login page has Google button (check `app/(auth)/login/page.tsx`)
- ✅ Redirect URL matches: `http://localhost:3000/api/auth/callback/google`

## 🐛 Troubleshooting

**"Invalid client" error**
- Double-check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are copied exactly
- Make sure they have no extra spaces

**"Redirect URI mismatch"**
- Verify `http://localhost:3000/api/auth/callback/google` is in Google Console
- Don't add trailing slashes

**"User not found after Google login"**
- This is normal - first-time users are auto-created in database
- Check `Credentials` on Google OAuth screen for user email

**Still seeing only email/password login?**
- Restart dev server: `npm run dev`
- Check `.env.local` was saved correctly
- Reload browser page (Ctrl+R or Cmd+R)

## 📚 Reference

- [NextAuth Google Provider Docs](https://next-auth.js.org/providers/google)
- [Google OAuth Console](https://console.cloud.google.com/)
- [NextAuth Credentials Docs](https://next-auth.js.org/configuration/providers/credentials)

---

**Your app is ready! Just add the Google credentials and you're done.** ✨
