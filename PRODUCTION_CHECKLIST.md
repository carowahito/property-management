# Production Deployment Checklist

## Pre-Deployment

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No console errors or warnings
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Code reviewed and approved

### Security
- [ ] Environment variables configured (no hardcoded secrets)
- [ ] NEXTAUTH_SECRET generated (`openssl rand -base64 32`)
- [ ] Database credentials secured
- [ ] API keys stored in environment variables
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] CSRF protection enabled via NextAuth

### Database
- [ ] Production database created
- [ ] Database migrations applied (`npm run db:migrate`)
- [ ] Database backups configured
- [ ] Connection pooling configured
- [ ] Database user has minimal required permissions
- [ ] SSL connection enabled

### Performance
- [ ] Next.js optimizations enabled
- [ ] Images optimized
- [ ] Static pages pre-rendered
- [ ] API responses cached where appropriate
- [ ] Database queries optimized (indexes added)
- [ ] Bundle size analyzed

## Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login
   vercel login

   # Deploy
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - Ensure `NEXTAUTH_URL` matches production URL

3. **Database Setup**
   - Use hosted PostgreSQL (Vercel Postgres, Supabase, or Railway)
   - Update `DATABASE_URL` in environment variables
   - Run migrations: `npm run db:migrate`
   - Seed data: `npm run db:seed`

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t property-management .
   ```

2. **Run Container**
   ```bash
   docker run -p 3001:3001 \
     -e DATABASE_URL="your-db-url" \
     -e NEXTAUTH_SECRET="your-secret" \
     property-management
   ```

### Traditional VPS Deployment

1. **Server Setup**
   ```bash
   # Install Node.js 20+
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   npm install -g pm2

   # Install PostgreSQL
   sudo apt-get install postgresql
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/yourorg/property-management.git
   cd property-management

   # Install dependencies
   npm install

   # Build
   npm run build

   # Start with PM2
   pm2 start npm --name "property-management" -- start
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Post-Deployment

### Verification
- [ ] Homepage loads correctly
- [ ] Login works with test account
- [ ] Create/Read/Update/Delete operations work
- [ ] File uploads work (if enabled)
- [ ] Email notifications sent (if enabled)
- [ ] SMS notifications sent (if enabled)
- [ ] All API endpoints respond correctly
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing completed

### Monitoring
- [ ] Error tracking configured (Sentry/LogRocket)
- [ ] Analytics configured (Google Analytics/Posthog)
- [ ] Uptime monitoring enabled (UptimeRobot/Pingdom)
- [ ] Performance monitoring enabled (Vercel Analytics)
- [ ] Database monitoring enabled
- [ ] Log aggregation configured

### DNS & SSL
- [ ] Domain pointed to deployment
- [ ] SSL certificate installed (Let's Encrypt recommended)
- [ ] HTTPS redirect enabled
- [ ] WWW redirect configured (if applicable)

### Backups
- [ ] Database backups automated (daily)
- [ ] File backups automated (if using local storage)
- [ ] Backup restoration tested
- [ ] Off-site backup storage configured

### Documentation
- [ ] Admin user guide created
- [ ] API documentation published
- [ ] Runbook for common operations created
- [ ] Incident response plan documented

## Environment Variables (Production)

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Email (SendGrid)
SENDGRID_API_KEY=your-production-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-production-sid
TWILIO_AUTH_TOKEN=your-production-token
TWILIO_PHONE_NUMBER=+1234567890

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-production-key
AWS_SECRET_ACCESS_KEY=your-production-secret
AWS_S3_BUCKET=your-production-bucket

# Monitoring
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Feature Flags
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=true
ENABLE_FILE_UPLOADS=true

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

## Rollback Procedure

If issues occur in production:

1. **Immediate Rollback**
   ```bash
   # Vercel
   vercel rollback

   # Docker
   docker pull property-management:previous
   docker-compose up -d

   # PM2
   pm2 start previous-version
   ```

2. **Restore Database** (if needed)
   ```bash
   pg_restore -d property_management backup.sql
   ```

3. **Notify Users**
   - Post status update
   - Send email notification if appropriate

## Performance Targets

- [ ] Page load time < 2s
- [ ] API response time < 500ms
- [ ] Time to First Byte (TTFB) < 200ms
- [ ] Lighthouse score > 90
- [ ] Uptime > 99.9%

## Compliance

- [ ] GDPR compliance verified (if applicable)
- [ ] Data retention policies configured
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent banner added (if needed)

## Launch

- [ ] All checklist items completed
- [ ] Stakeholders notified
- [ ] Support team trained
- [ ] Launch announcement prepared
- [ ] 🚀 **GO LIVE!**
