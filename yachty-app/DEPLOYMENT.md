# Deployment Guide

## Vercel Configuration

### Required Environment Variables

Set these in your Vercel project settings (Settings > Environment Variables):

1. **NEXT_PUBLIC_APP_URL**
   - Value: `https://yachty-tom-s-projects-cd38c2ac.vercel.app`
   - **IMPORTANT**: Use the base URL only, without any path (e.g., no `/auth/login`)
   - This is used for magic link redirects

2. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL

3. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous/public key

4. **SUPABASE_SERVICE_KEY**
   - Your Supabase service role key (keep this secret)

5. **Other required variables** (see `.env.example`):
   - ANTHROPIC_API_KEY
   - STRIPE_SECRET_KEY
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - STRIPE_WEBHOOK_SECRET
   - ONEDRIVE_CLIENT_ID
   - ONEDRIVE_CLIENT_SECRET
   - ONEDRIVE_TENANT_ID

### After Setting Environment Variables

**IMPORTANT**: After adding or changing environment variables, you MUST redeploy your application:
- Go to Deployments tab
- Click "..." on the latest deployment
- Select "Redeploy"
- This ensures the environment variables are baked into the build

## Supabase Configuration

### 1. Site URL Configuration

In your Supabase Dashboard:
1. Go to **Authentication** > **URL Configuration**
2. Set **Site URL** to: `https://yachty-tom-s-projects-cd38c2ac.vercel.app`

### 2. Redirect URLs Whitelist

Add these URLs to **Redirect URLs** (under Authentication > URL Configuration):
- `https://yachty-tom-s-projects-cd38c2ac.vercel.app/auth/callback`
- `http://localhost:3000/auth/callback` (for local development)

### 3. Email Templates

Verify that email templates are using the correct variables:
1. Go to **Authentication** > **Email Templates**
2. Check the **Confirm signup** and **Magic Link** templates
3. Ensure they use `{{ .SiteURL }}` or `{{ .ConfirmationURL }}` variables
4. The confirmation URL should automatically use your Site URL configuration

## Testing the Login Flow

1. Go to your production URL: `https://yachty-tom-s-projects-cd38c2ac.vercel.app/auth/login`
2. Enter your email address
3. Check your email for the magic link
4. Click the magic link - it should:
   - Redirect to `/auth/callback` with a code parameter
   - Exchange the code for a session
   - Set authentication cookies
   - Redirect you to the home page (`/`)

## Troubleshooting

### Issue: Magic link redirects to localhost
- **Cause**: `NEXT_PUBLIC_APP_URL` not set or app not redeployed after setting it
- **Solution**:
  1. Verify the environment variable is set in Vercel
  2. Redeploy the application
  3. Clear your browser cache

### Issue: Redirected back to login page after clicking magic link
- **Cause**: Redirect URL not whitelisted in Supabase or cookie issues
- **Solution**:
  1. Check Supabase Redirect URLs configuration
  2. Verify Site URL is correct
  3. Check browser console for errors
  4. Check Vercel function logs for errors

### Issue: "Authentication failed" error
- **Cause**: Code exchange failed
- **Solution**:
  1. Check Vercel function logs for detailed error
  2. Verify Supabase keys are correct
  3. Try generating a new magic link

## Local Development

For local development, you can use `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# ... other variables
```

Make sure `http://localhost:3000/auth/callback` is whitelisted in Supabase.
