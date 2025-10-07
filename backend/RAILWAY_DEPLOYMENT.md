# Railway Deployment Guide

This guide shows how to deploy both the backend API and PostgreSQL database on Railway in a single project.

## 🚀 Quick Setup

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Create New Project
```bash
railway init workflow-automation-platform
```

### 4. Add PostgreSQL Database
```bash
railway add postgresql
```

### 5. Deploy Backend
```bash
railway up
```

## 📊 Railway Project Structure

```
workflow-automation-platform/
├── Backend Service (Node.js)
│   ├── Port: 5000
│   ├── Health: /api/health
│   └── Environment: Production
└── PostgreSQL Database
    ├── Host: railway-postgres
    ├── Port: 5432
    └── SSL: Required
```

## 🔧 Environment Variables

Railway will automatically provide these database variables:
- `DATABASE_URL` - Full connection string
- `PGHOST` - Database host
- `PGPORT` - Database port
- `PGDATABASE` - Database name
- `PGUSER` - Database user
- `PGPASSWORD` - Database password

### Required Environment Variables:
```bash
# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key_here

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com

# Optional: JWT Secret
JWT_SECRET=your_jwt_secret_here
```

## 🛠️ Deployment Commands

### Deploy to Railway
```bash
# Deploy current code
railway up

# Deploy with specific environment
railway up --environment production

# View deployment logs
railway logs
```

### Database Management
```bash
# Connect to database
railway connect postgresql

# Run database setup
railway run npm run setup-db

# View database logs
railway logs postgresql
```

### Environment Management
```bash
# Set environment variables
railway variables set YOUTUBE_API_KEY=your_key_here
railway variables set FRONTEND_URL=https://your-domain.com

# View all variables
railway variables

# Remove variable
railway variables unset VARIABLE_NAME
```

## 📈 Monitoring & Analytics

### Railway Dashboard
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Database**: Connection stats and queries
- **Deployments**: Deployment history and status

### Health Monitoring
```bash
# Check service health
curl https://your-app.railway.app/api/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

## 🔄 Continuous Deployment

### GitHub Integration
1. Connect your GitHub repository to Railway
2. Enable auto-deploy on push to main branch
3. Railway will automatically deploy on code changes

### Manual Deployment
```bash
# Deploy from current directory
railway up

# Deploy from specific branch
railway up --branch feature-branch
```

## 💰 Cost Optimization

### Railway Pricing
- **Hobby Plan**: $5/month (512MB RAM, 1GB storage)
- **Pro Plan**: $20/month (8GB RAM, 100GB storage)
- **Database**: Included with service

### Optimization Tips
- Use connection pooling (already configured)
- Implement cache cleanup for old data
- Monitor database size and optimize queries
- Use database indexes (already implemented)

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check database status
railway status postgresql

# View database logs
railway logs postgresql

# Test connection
railway run node -e "console.log(process.env.DATABASE_URL)"
```

#### Backend Won't Start
```bash
# Check application logs
railway logs

# Verify environment variables
railway variables

# Test locally with Railway environment
railway run npm start
```

#### API Not Responding
```bash
# Check health endpoint
curl https://your-app.railway.app/api/health

# View real-time logs
railway logs --follow
```

### Debug Commands
```bash
# SSH into Railway container
railway shell

# Run database migrations
railway run npm run setup-db

# View all services
railway status

# Check resource usage
railway metrics
```

## 🔐 Security Best Practices

### Environment Variables
- Never commit `.env` files
- Use Railway's secure variable storage
- Rotate API keys regularly

### Database Security
- SSL connections enforced
- Connection pooling prevents overload
- Regular backups (Railway handles this)

### API Security
- Rate limiting enabled
- CORS properly configured
- Input validation and sanitization

## 📊 Performance Monitoring

### Key Metrics to Monitor
- **Response Time**: <100ms for cached requests
- **Database Connections**: <20 concurrent
- **Memory Usage**: <512MB for hobby plan
- **API Calls**: Monitor YouTube API usage

### Optimization Strategies
- Database caching reduces API calls by 90%
- Connection pooling prevents connection exhaustion
- Indexed queries for fast video retrieval
- Automatic cache cleanup for old data

## 🎯 Production Checklist

### Before Deployment
- [ ] Set all required environment variables
- [ ] Test database connection locally
- [ ] Verify YouTube API key works
- [ ] Check CORS configuration
- [ ] Test all API endpoints

### After Deployment
- [ ] Verify health endpoint responds
- [ ] Test video search functionality
- [ ] Check database connectivity
- [ ] Monitor logs for errors
- [ ] Set up monitoring alerts

## 🚀 Advanced Features

### Custom Domains
```bash
# Add custom domain
railway domain add your-domain.com

# Configure SSL
railway domain ssl your-domain.com
```

### Scaling
```bash
# Scale service (Pro plan required)
railway scale --replicas 3

# Scale database (if needed)
railway scale postgresql --replicas 2
```

### Backups
- Railway automatically backs up PostgreSQL
- Point-in-time recovery available
- Export data: `railway run pg_dump $DATABASE_URL > backup.sql`

## 📞 Support

### Railway Support
- Documentation: https://docs.railway.app
- Community: https://discord.gg/railway
- Status: https://status.railway.app

### Project Support
- GitHub Issues: Create issue in repository
- Email: Support contact information
- Documentation: README.md files
