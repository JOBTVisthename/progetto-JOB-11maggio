# Deployment Guide - JobTV on app.jobtv.it

## Prerequisites

- Node.js 18+ installed
- PM2 installed globally: `npm install -g pm2`
- Nginx installed and configured
- SSL certificate configured for app.jobtv.it

## Environment Setup

### 1. Production Environment Variables

Copy `.env.production` to the server and configure:

```bash
cp .env.production .env
```

**IMPORTANT**: Update the following values in `.env`:

1. **Stripe Keys** - Replace with production keys:
   ```
   VITE_STRIPE_PUBLIC_KEY=pk_live_YOUR_ACTUAL_KEY
   VITE_STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_SECRET
   ```

2. **SMTP Password** - Replace with actual SMTP password if different

3. **API URL** - Verify it's set to:
   ```
   VITE_API_URL=https://app.jobtv.it
   ```

## Build & Deploy

### 1. Install Dependencies

```bash
npm ci --production=false
```

### 2. Build Frontend

```bash
npm run build:prod
```

This creates the `dist/` directory with static files.

### 3. Start API Server with PM2

```bash
# Start the API server
pm2 start server.js --name jobtv-api --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on reboot
pm2 startup
```

### 4. Configure Nginx

Create or update `/etc/nginx/sites-available/app.jobtv.it`:

```nginx
server {
    listen 80;
    server_name app.jobtv.it;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.jobtv.it;

    # SSL configuration
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    # Root directory for frontend static files
    root /home/andrea/jobtv/dist;
    index index.html;

    # Content Security Policy - manages CSP instead of HTML meta tag
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co https://blob.lovable.dev https://*.stripe.com https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://*.supabase.co https://*.stripe.com https://lovable-uploads.s3.eu-central-1.amazonaws.com; connect-src 'self' https://*.supabase.co https://*.stripe.com https://*.stripe.network wss://*.supabase.co blob:; frame-src 'self' https://*.stripe.com https://js.stripe.com;" always;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend routes - serve index.html for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/app.jobtv.it /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Post-Deployment Checklist

- [ ] Frontend loads at https://app.jobtv.it
- [ ] API health check responds: `curl https://app.jobtv.it/api/health`
- [ ] Stripe checkout works with production keys
- [ ] Email service sends emails correctly
- [ ] User registration works
- [ ] User authentication works
- [ ] Admin dashboard loads (if accessible)

## Monitoring

### Check PM2 status

```bash
pm2 status
pm2 logs jobtv-api
```

### Check Nginx logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart services

```bash
# Restart API server
pm2 restart jobtv-api

# Reload Nginx (no downtime)
sudo systemctl reload nginx
```

## Security Notes

### CRITICAL: Service Role Key Exposure

The file `src/integrations/supabase/admin.ts` contains a service role key that:
- **MUST NEVER be exposed to the browser**
- Currently used in `AdminDashboard.tsx` - this is a security vulnerability
- Should be moved to server-side API routes or Supabase Edge Functions

### Recommended Fix

Create server-side admin API endpoints that use the service role key internally,
then have the frontend call these endpoints instead of using supabaseAdmin directly.

## Development Notes

### CSP in Development

The CSP meta tag has been removed from `index.html` to allow API calls to localhost during development.
In production, CSP is managed by Nginx (see configuration above).

When running locally with `npm run dev`, there are no CSP restrictions.

## Troubleshooting

### API not responding

1. Check if PM2 process is running: `pm2 status`
2. Check API logs: `pm2 logs jobtv-api`
3. Verify port 3001 is listening: `netstat -tlnp | grep 3001`

### Frontend showing blank page

1. Check nginx error logs
2. Verify `dist/` directory exists and contains `index.html`
3. Check file permissions

### Stripe checkout failing

1. Verify production keys are set in `.env`
2. Check Stripe dashboard for webhook configuration
3. Verify webhook URL is set to: `https://app.jobtv.it/api/stripe-webhook`

### Emails not sending

1. Verify SMTP credentials in `.env`
2. Check firewall allows outbound connections on port 587
3. Verify SMTP provider hasn't blocked the server IP

### Profile errors after registration

The application now includes retry logic for profile queries after registration.
If users still see errors, check:
1. Supabase logs for trigger execution
2. RLS policies are correctly configured
3. Database migrations have been applied
