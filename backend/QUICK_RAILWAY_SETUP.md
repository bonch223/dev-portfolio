# 🚀 Quick Railway Setup

Deploy your backend API and PostgreSQL database on Railway in 5 minutes!

## Prerequisites
- Railway account (free at railway.app)
- YouTube API key
- Node.js installed locally

## Step-by-Step Setup

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Create Project & Add Database
```bash
# Create new Railway project
railway init workflow-automation-platform

# Add PostgreSQL database
railway add postgresql
```

### 4. Set Environment Variables
```bash
# Set your YouTube API key
railway variables set YOUTUBE_API_KEY=your_youtube_api_key_here

# Set frontend URL (update with your actual domain)
railway variables set FRONTEND_URL=https://your-frontend-domain.com
```

### 5. Deploy Backend
```bash
# Deploy to Railway
railway up
```

### 6. Setup Database
```bash
# Initialize database schema
railway run npm run setup-db
```

## 🎉 You're Done!

Your backend is now live on Railway with:
- ✅ **Backend API** running on Railway
- ✅ **PostgreSQL Database** hosted on Railway
- ✅ **Automatic SSL** and security
- ✅ **Database caching** for 90% API reduction
- ✅ **Health monitoring** at `/api/health`

## 📊 Check Your Deployment

### View Status
```bash
railway status
```

### View Logs
```bash
railway logs
```

### Test API
```bash
# Get your app URL from railway status, then:
curl https://your-app.railway.app/api/health
```

## 🔧 Useful Commands

```bash
# View all services
railway status

# View real-time logs
railway logs --follow

# Connect to database
railway connect postgresql

# View environment variables
railway variables

# Scale your service (Pro plan)
railway scale --replicas 2
```

## 💰 Cost

- **Hobby Plan**: $5/month
  - 512MB RAM
  - 1GB storage
  - PostgreSQL included
  - Perfect for development/testing

- **Pro Plan**: $20/month
  - 8GB RAM
  - 100GB storage
  - Better for production

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check database status
railway status postgresql

# Test database connection
railway run node -e "console.log(process.env.DATABASE_URL)"
```

### Backend Won't Start
```bash
# Check logs
railway logs

# Verify environment variables
railway variables
```

### API Not Responding
```bash
# Check health endpoint
curl https://your-app.railway.app/api/health

# View deployment status
railway status
```

## 📈 Next Steps

1. **Update Frontend**: Point your frontend to the new Railway backend URL
2. **Monitor Usage**: Check Railway dashboard for metrics
3. **Scale Up**: Upgrade to Pro plan for production
4. **Custom Domain**: Add your own domain name

## 🎯 Production Checklist

- [ ] Set all environment variables
- [ ] Test all API endpoints
- [ ] Verify database connectivity
- [ ] Check CORS configuration
- [ ] Monitor logs for errors
- [ ] Set up monitoring alerts

Your Workflow Automation Platform backend is now live on Railway! 🚀
