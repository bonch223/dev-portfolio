# Railway Cron Jobs Setup Guide

## Overview
This guide explains how to set up automated video scraping on Railway using cron jobs.

## Configuration

### Cron Jobs Defined
The `cron.yaml` file defines three automated jobs:

1. **scrape-videos-every-6-hours**
   - Schedule: `0 */6 * * *` (Every 6 hours)
   - Command: `node scripts/run-scheduled-scraper.js`
   - Purpose: Regular scraping throughout the day

2. **scrape-videos-daily**
   - Schedule: `0 2 * * *` (Daily at 2 AM)
   - Command: `node scripts/run-scheduled-scraper.js`
   - Purpose: Comprehensive daily scraping during low-traffic hours

3. **cleanup-old-logs**
   - Schedule: `0 0 * * 0` (Weekly, Sunday at midnight)
   - Command: `node scripts/cleanup-logs.js`
   - Purpose: Remove old logs and completed jobs to keep database clean

## Setup on Railway

### Method 1: Using Railway Dashboard (Recommended)
1. Go to your Railway project
2. Click on your backend service
3. Navigate to "Cron Jobs" tab
4. Click "Add Cron Job"
5. For each job in `cron.yaml`:
   - Name: (e.g., "scrape-videos-every-6-hours")
   - Schedule: (e.g., "0 */6 * * *")
   - Command: (e.g., "node scripts/run-scheduled-scraper.js")
6. Save and enable each cron job

### Method 2: Using Railway CLI
```bash
# Navigate to backend directory
cd backend

# Deploy with cron configuration
railway up

# Verify cron jobs
railway cron list
```

## Environment Variables
Make sure these environment variables are set in Railway:
- `DATABASE_URL` - PostgreSQL database connection string
- `BACKEND_URL` - Your backend service URL (e.g., https://your-app.up.railway.app)

## Monitoring

### View Job Status
Access the scraping dashboard at:
```
https://your-frontend-url.com/scraping-dashboard
```

### Check Logs
```bash
railway logs --service backend
```

### Database Queries
Monitor active jobs:
```sql
SELECT * FROM scraping_jobs WHERE status = 'running';
```

View recent job history:
```sql
SELECT * FROM scraping_jobs ORDER BY created_at DESC LIMIT 10;
```

## Cron Schedule Syntax

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday = 0)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

### Common Examples:
- `0 */6 * * *` - Every 6 hours
- `0 2 * * *` - Daily at 2 AM
- `0 0 * * 0` - Weekly on Sunday at midnight
- `*/30 * * * *` - Every 30 minutes
- `0 */3 * * *` - Every 3 hours

## Troubleshooting

### Cron Job Not Running
1. Check if the cron job is enabled in Railway dashboard
2. Verify the schedule syntax is correct
3. Check Railway logs for errors
4. Ensure all required dependencies are installed

### Job Fails to Start
1. Verify `DATABASE_URL` is set correctly
2. Check if database schema is applied (run `/api/jobs/setup-schema`)
3. Verify yt-dlp is installed on the Railway instance

### No Videos Being Scraped
1. Check job logs in the database
2. Verify YouTube API is accessible
3. Check for rate limiting or quota issues
4. Review quality score filters

## Manual Testing
Test the scheduled scraper locally:
```bash
cd backend
node scripts/run-scheduled-scraper.js
```

Test cleanup script:
```bash
node scripts/cleanup-logs.js
```

## Best Practices

1. **Start Small**: Begin with one cron job and scale up
2. **Monitor Regularly**: Check the dashboard for job status
3. **Adjust Schedules**: Modify cron schedules based on your needs
4. **Database Maintenance**: Keep the cleanup job running weekly
5. **Log Rotation**: Review and clean old logs periodically

## Support
For issues or questions:
1. Check Railway documentation: https://docs.railway.app/
2. Review job logs in the scraping dashboard
3. Check database logs: `SELECT * FROM job_logs ORDER BY created_at DESC`

