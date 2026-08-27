# 🚀 Vercel Deployment Guide - Guest Mobile App

## Deployment Status
- **Project:** lilita-booking-system (Guest Mobile App)
- **Framework:** Vite + React 19
- **Build Size:** 528KB (production optimized)
- **Status:** ✅ Ready for Deployment

---

## Option 1: Automated Deployment with GitHub Actions (Recommended)

### Setup Steps

1. **Create Vercel Project**
   ```bash
   # Visit https://vercel.com and create a new account/login
   # Import the lilita-booking-system repository
   # Select "lilita-booking-system/frontend" as the root directory
   ```

2. **Get Vercel Credentials**
   - Visit: https://vercel.com/account/tokens
   - Create a new token and copy it
   - Go to GitHub repo Settings → Secrets and add:
     - `VERCEL_TOKEN` - Your Vercel authentication token
     - `VERCEL_ORG_ID` - Found in Vercel account settings
     - `VERCEL_PROJECT_ID` - Found in Vercel project settings

3. **GitHub Actions Workflow**
   - The workflow file is already created at `.github/workflows/deploy-vercel.yml`
   - It automatically deploys on push to `guest-mobile-app` branch
   - Also deploys on PR to `contacts-app` for preview

4. **Trigger Deployment**
   ```bash
   # Just push to guest-mobile-app and GitHub Actions will automatically deploy
   git push origin guest-mobile-app
   ```

---

## Option 2: Manual Deployment with Vercel CLI

### Prerequisites
- Vercel CLI installed (`npm install -g vercel`)
- Vercel account created
- GitHub repository connected to Vercel

### Deployment Steps

```bash
# 1. Navigate to the frontend directory
cd lilita-booking-system/frontend

# 2. Login to Vercel
vercel login

# 3. Deploy to production
vercel --prod

# 4. Follow the prompts to:
#    - Confirm you want to deploy
#    - Select your team/scope
#    - Choose project name
#    - Set environment variables (if needed)

# 5. Get your deployment URL from the terminal output
```

### Environment Variables (if using backend)
Add these in Vercel Project Settings → Environment Variables:

```env
VITE_API_URL=https://your-api-domain.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-public-anon-key
```

---

## Option 3: Deploy Pre-Built Files

### Build the App Locally
```bash
cd lilita-booking-system/frontend
npm install
npm run build
```

### Upload to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy the dist folder
cd dist
vercel --prod
```

---

## Vercel Configuration

### vercel.json (Already Created)
```json
{
  "buildCommand": "cd lilita-booking-system/frontend && npm install && npm run build",
  "outputDirectory": "lilita-booking-system/frontend/dist",
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Build Settings
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

---

## Post-Deployment Checklist

After deployment, verify the app is working:

- [ ] **Login Page**
  - [ ] Navigate to deployed URL
  - [ ] User type selector appears (Agent/Guest)
  - [ ] Click Guest App button

- [ ] **Guest App**
  - [ ] Login with demo credentials
  - [ ] Home page loads with search form
  - [ ] Loyalty points badge displays
  - [ ] Bottom navigation visible

- [ ] **Core Features**
  - [ ] Search properties work
  - [ ] View booking details
  - [ ] Navigate to wallet page
  - [ ] Access account settings

- [ ] **Performance**
  - [ ] Page load time < 2s
  - [ ] Images load quickly
  - [ ] Smooth scrolling
  - [ ] No console errors

---

## Deployment URLs

Once deployed, your app will be available at:
- **Production:** `https://your-project-name.vercel.app/`
- **Preview:** `https://your-project-name-[branch].vercel.app/`

### Demo Link (After Deployment)
Share this format with team:
```
https://lilita-booking-system-guest.vercel.app/
```

---

## Environment-Specific URLs

### Development
- Local: `http://localhost:3000/`
- Dev Branch: `https://lilita-booking-system-guest-dev.vercel.app/`

### Staging
- Staging Branch: `https://lilita-booking-system-guest-staging.vercel.app/`

### Production
- Main Branch: `https://lilita-booking-system.vercel.app/`

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
vercel deploy --cwd=lilita-booking-system/frontend --prod

# Or manually rebuild
cd lilita-booking-system/frontend
rm -rf node_modules dist
npm install
npm run build
```

### Static Files Not Loading
- Check `dist/` folder exists
- Verify `index.html` is in root of `dist/`
- Check `_redirects` file for SPA routing

### Environment Variables Not Working
1. Add to Vercel project settings (not `.env` file)
2. Prefix with `VITE_` for Vite to expose them
3. Redeploy after adding variables

### Cache Issues
```bash
# Force redeploy without cache
vercel deploy --cwd=lilita-booking-system/frontend --prod --force
```

---

## Performance Optimization

### Current Metrics
- **JS Size:** 494KB (132KB gzipped)
- **CSS Size:** 67KB (12KB gzipped)
- **Total:** 528KB

### Optimization Recommendations
1. **Code Splitting:** Lazy load page components
2. **Image Optimization:** Use WebP format for images
3. **Minification:** Already handled by Vite
4. **Caching:** Set cache headers in `vercel.json`

### Add Caching Headers
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "cache-control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## Monitoring & Logging

### Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your project
3. View real-time logs and analytics

### Useful Vercel CLI Commands
```bash
# View deployment status
vercel status

# View logs
vercel logs

# List all deployments
vercel ls

# Rollback to previous deployment
vercel rollback
```

---

## CI/CD Pipeline

### Automated Workflow
```
1. Push to guest-mobile-app branch
   ↓
2. GitHub Actions runs tests/lint
   ↓
3. Build the app
   ↓
4. Deploy to Vercel preview URL
   ↓
5. PR preview available
   ↓
6. Merge to contacts-app (or main)
   ↓
7. Auto-deploy to production
```

---

## Rollback Instructions

If something goes wrong after deployment:

```bash
# Using Vercel CLI
vercel rollback

# Or through Vercel Dashboard:
# 1. Go to Deployments
# 2. Find previous successful deployment
# 3. Click "Redeploy"
```

---

## Next Steps

1. **Setup GitHub Secrets** (for CI/CD)
2. **Configure Custom Domain** (optional)
3. **Setup Monitoring** (Vercel Analytics)
4. **Configure Redirects** (if needed)
5. **Test All Features** on live deployment

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Vite Docs:** https://vitejs.dev/
- **React Docs:** https://react.dev/
- **GitHub Actions:** https://docs.github.com/en/actions

---

## Quick Deploy Command

```bash
# One-liner to build and deploy
cd lilita-booking-system/frontend && npm install && npm run build && vercel --prod
```

---

**Status:** ✅ Ready to Deploy
**Last Updated:** 2026-08-27
**Estimated Deployment Time:** 2-5 minutes
