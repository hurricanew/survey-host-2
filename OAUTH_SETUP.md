# Google OAuth Setup Guide

🚨 **CRITICAL**: You're currently using placeholder/example OAuth credentials that don't belong to you!

**Current Problem**: The app is trying to use example credentials which belong to a different Google Cloud project that you can't modify.

**Solution**: You MUST create your own Google Cloud project and OAuth credentials. Follow these steps:

## 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** and **Google OAuth2 API**

## 2. Configure OAuth Consent Screen

1. Navigate to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (for testing)
3. Fill in the required information:
   - App name: `TTI Survey Platform`
   - User support email: Your email
   - Developer contact information: Your email

## 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Set the following:
   - **Name**: `TTI Survey Platform Web Client`
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`

   ⚠️ **CRITICAL**: The redirect URI must be EXACTLY `http://localhost:3000/api/auth/callback/google` (no trailing slash, exact path)

## 4. Update Environment Variables

1. Copy your **Client ID** and **Client Secret**
2. Update `apps/web/.env.local`:

```env
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
```

**Important**: Your new credentials will look different from the examples and should start with a different number sequence.

## 5. Restart Development Server

```bash
cd apps/web
pnpm dev
```

## 6. Verify Configuration

Run this command to check if your setup is correct:

```bash
node scripts/check-oauth-config.js
```

You should see ✅ for all configuration items (no ⚠️ warnings about placeholder credentials).

## Current Issue

The OAuth credentials in `.env.local` are currently example/placeholder values:
- `GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com`
- `GOOGLE_CLIENT_SECRET=your_actual_client_secret_here`

These need to be replaced with real credentials from your Google Cloud Console project.

## Testing

Once configured, you should be able to:
1. Click "Sign In" in the app header
2. Get redirected to Google's OAuth consent screen
3. Grant permissions
4. Get redirected back to the app as an authenticated user

## Troubleshooting

### Error 400: redirect_uri_mismatch

This error occurs when the redirect URI configured in Google Cloud Console doesn't match what NextAuth is sending. 

**To fix this:**

1. Go to your Google Cloud Console project
2. Navigate to **APIs & Services** > **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Ensure **Authorized redirect URIs** contains EXACTLY:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. Save the changes and wait a few minutes for Google to propagate the changes

**Common mistakes:**
- Using `https://` instead of `http://` for localhost
- Adding a trailing slash: `~/google/` instead of `~/google`
- Wrong port number (should be 3000 for web app)
- Incorrect path (must be `/api/auth/callback/google`)

### Other Issues

- Ensure redirect URI exactly matches what's configured in Google Cloud Console
- Check that the Google Cloud project has the necessary APIs enabled
- Verify environment variables are loaded by checking NextAuth debug logs
- Make sure you're using real credentials, not the placeholder ones