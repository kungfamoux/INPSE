# Deploy Backend to Render

## 🚀 Step-by-Step Deployment Guide

### Prerequisites
- GitHub account with the project repository
- Render account (free tier available)
- Supabase project already set up

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Create Render Service
1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the `backend` folder
5. Configure settings:

#### Basic Settings:
- **Name**: `inpse-backend-api`
- **Region**: Choose nearest region
- **Branch**: `main`
- **Root Directory**: `backend`

#### Build Settings:
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### Environment Variables:
Add these environment variables:
```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://atuzzmrfwuhhxzmqnebx.supabase.co
SUPABASE_SERVICE_KEY=YOUR_SUPABASE_SERVICE_KEY_HERE
JWT_SECRET=YOUR_JWT_SECRET_HERE
FRONTEND_URL=https://inpse.vercel.app
```

#### Advanced Settings:
- **Health Check Path**: `/health`
- **Auto-Deploy**: ✅ Enabled

### Step 3: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment to complete
3. Test the deployed API

### Step 4: Test Deployment
Once deployed, test:
```bash
# Health check
curl https://your-service-name.onrender.com/health

# Login test
curl -X POST https://your-service-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@inpse.com","password":"admin123"}'
```

### Step 5: Custom Domain (Optional)
1. Go to service settings → "Domains"
2. Add custom domain: `api.inpse.com`
3. Update DNS records in Namecheap

## 🎯 Expected Results
- Backend URL: `https://inpse-backend-api.onrender.com`
- API Base URL: `https://inpse-backend-api.onrender.com/api`
- Health Check: `https://inpse-backend-api.onrender.com/health`

## 🔧 Troubleshooting
- Check deployment logs for errors
- Verify environment variables
- Ensure Supabase connection is working
- Test health check endpoint first

## 💰 Cost
- **Free Tier**: $0/month (sufficient for development)
- **Starter Plan**: $7/month (recommended for production)
