# 🌐 Production Deployment Guide

## 📋 Pre-Deployment Checklist

- [ ] Domain DNS configured (both main and `en.` subdomain)
- [ ] SSL certificates ready for both domains
- [ ] Server has Node.js installed
- [ ] Git repository access configured
- [ ] Environment variables configured on server

---

## 🔐 Environment Configuration

### Production `.env` File

Update your production `.env` with:

```bash
# Google Ad Manager Configuration (keep existing)
VITE_GAM_DEBUG=false
VITE_GAM_NETWORK_CODE=23338698373
VITE_GAM_AD_UNIT_CONTENT_TOP=financeloanplatform_display_top
VITE_GAM_AD_UNIT_CONTENT_MIDDLE_1=financeloanplatform_display_middle_1
VITE_GAM_AD_UNIT_CONTENT_MIDDLE_2=financeloanplatform_display_middle_2
VITE_GAM_AD_UNIT_CONTENT_MIDDLE_3=financeloanplatform_display_middle_3
VITE_GAM_AD_UNIT_CONTENT_BOTTOM=financeloanplatform_display_bottom
VITE_GAM_AD_UNIT_NATIVE_IN_CONTENT=financeloanplatform_native_in_content
VITE_GAM_AD_UNIT_MOBILE_ANCHOR=financeloanplatform_mobile_anchor
VITE_GAM_AD_UNIT_TOP_STICKY_EXPANDABLE=financeloanplatform_top_sticky_expandable
VITE_GAM_AD_UNIT_DESKTOP_SIDE_LEFT=financeloanplatform_desktop_side_left
VITE_GAM_AD_UNIT_DESKTOP_SIDE_RIGHT=financeloanplatform_desktop_side_right
VITE_GAM_AD_UNIT_BLOG_SIDEBAR=financeloanplatform_blog_sidebar
VITE_GAM_AD_UNIT_INTERSTITIAL=financeloanplatform_interstitial
VITE_GAM_AD_UNIT_REWARDED=financeloanplatform_rewarded

# Tracking Configuration (keep existing)
VITE_BLOG_VIEW_EVENT_NAME=blog_view
VITE_BLOG_VIEW_PIXEL_URL=
VITE_TRACKING_DEBUG=false
VITE_PIXEL_PERSONAL_LOAN_ID=1541720347638153

# Domain and Language Configuration (UPDATE THESE)
VITE_MAIN_DOMAIN=https://automatedsalesplatform.com
VITE_ENGLISH_DOMAIN=https://en.automatedsalesplatform.com
VITE_DEFAULT_LANGUAGE=hi
```

**⚠️ IMPORTANT:** Replace `automatedsalesplatform.com` with your actual domain!

---

## 🏗️ Build Process

### 1. Build the Application

```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

### 2. Verify Build

```bash
# Preview build locally
npm run preview
```

Check:
- [ ] No build errors
- [ ] No console errors
- [ ] All assets load correctly
- [ ] Ads display properly

---

## 🌍 DNS Configuration

### Required DNS Records

**Main Domain (Hindi):**
```
Type: A
Host: @
Value: YOUR_SERVER_IP
TTL: 3600
```

**English Subdomain:**
```
Type: A
Host: en
Value: YOUR_SERVER_IP
TTL: 3600
```

**Alternative (CNAME for subdomain):**
```
Type: CNAME
Host: en
Value: automatedsalesplatform.com
TTL: 3600
```

### Verify DNS

```bash
# Check main domain
nslookup automatedsalesplatform.com

# Check English subdomain
nslookup en.automatedsalesplatform.com
```

Both should point to your server IP.

---

## 🚀 Deployment Options

### Option 1: Nginx (Recommended)

#### Nginx Configuration

Create `/etc/nginx/sites-available/finvexa`:

```nginx
# Hindi Main Domain
server {
    listen 80;
    listen [::]:80;
    server_name automatedsalesplatform.com www.automatedsalesplatform.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name automatedsalesplatform.com www.automatedsalesplatform.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/automatedsalesplatform.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/automatedsalesplatform.com/privkey.pem;

    # Root directory
    root /var/www/finvexa/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# English Subdomain
server {
    listen 80;
    listen [::]:80;
    server_name en.automatedsalesplatform.com;

    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name en.automatedsalesplatform.com;

    # SSL Configuration (same certificate with SAN, or separate)
    ssl_certificate /etc/letsencrypt/live/automatedsalesplatform.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/automatedsalesplatform.com/privkey.pem;

    # Same build serves both domains
    root /var/www/finvexa/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable and restart:**
```bash
sudo ln -s /etc/nginx/sites-available/finvexa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: Apache

Create `/etc/apache2/sites-available/finvexa.conf`:

```apache
# Hindi Main Domain
<VirtualHost *:80>
    ServerName automatedsalesplatform.com
    ServerAlias www.automatedsalesplatform.com
    Redirect permanent / https://automatedsalesplatform.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName automatedsalesplatform.com
    ServerAlias www.automatedsalesplatform.com

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/automatedsalesplatform.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/automatedsalesplatform.com/privkey.pem

    DocumentRoot /var/www/finvexa/dist

    <Directory /var/www/finvexa/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>

# English Subdomain
<VirtualHost *:80>
    ServerName en.automatedsalesplatform.com
    Redirect permanent / https://en.automatedsalesplatform.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName en.automatedsalesplatform.com

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/automatedsalesplatform.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/automatedsalesplatform.com/privkey.pem

    DocumentRoot /var/www/finvexa/dist

    <Directory /var/www/finvexa/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

**Enable and restart:**
```bash
sudo a2ensite finvexa
sudo a2enmod rewrite ssl
sudo systemctl reload apache2
```

---

## 🔒 SSL Certificate Setup

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get certificate for both domains
sudo certbot --nginx -d automatedsalesplatform.com -d www.automatedsalesplatform.com -d en.automatedsalesplatform.com

# Auto-renewal test
sudo certbot renew --dry-run
```

---

## 📦 Deployment Steps

### 1. Upload to Server

```bash
# On your local machine
npm run build

# Upload dist folder
scp -r dist/ user@your-server:/var/www/finvexa/

# Or use Git
git add .
git commit -m "Production build"
git push origin main

# On server
cd /var/www/finvexa
git pull origin main
npm install
npm run build
```

### 2. Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/finvexa/dist
sudo chmod -R 755 /var/www/finvexa/dist
```

### 3. Restart Web Server

```bash
# Nginx
sudo systemctl reload nginx

# Apache
sudo systemctl reload apache2
```

---

## ✅ Post-Deployment Testing

### Main Domain (Hindi)

Visit: https://automatedsalesplatform.com

- [ ] Shows Hindi blogs only
- [ ] Language button shows "हिंदी"
- [ ] SSL certificate valid
- [ ] No mixed content warnings
- [ ] Ads load correctly
- [ ] All images load
- [ ] Navigation works
- [ ] Blog detail pages work

### English Subdomain

Visit: https://en.automatedsalesplatform.com

- [ ] Shows English blogs only
- [ ] Language button shows "English"
- [ ] SSL certificate valid
- [ ] No mixed content warnings
- [ ] Ads load correctly
- [ ] All images load
- [ ] Navigation works
- [ ] Blog detail pages work

### Browser Console

Press F12 and check:
- [ ] No JavaScript errors
- [ ] No 404 errors
- [ ] No mixed content warnings
- [ ] Environment variables loaded correctly

---

## 🔍 Monitoring

### Check Server Logs

**Nginx:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Apache:**
```bash
sudo tail -f /var/log/apache2/access.log
sudo tail -f /var/log/apache2/error.log
```

---

## 🐛 Troubleshooting

### Issue: Both domains show same content

**Check:**
1. Clear browser cache
2. Verify DNS points to correct server
3. Check environment variables in build
4. Hard refresh (Ctrl+Shift+R)

### Issue: 404 on blog pages

**Fix:** Ensure web server has SPA routing configured (see Nginx/Apache configs above)

### Issue: Ads not loading

**Check:**
1. Ad blocker disabled
2. GAM environment variables correct
3. Network IDs match Google Ad Manager
4. Check browser console for errors

---

## 🔄 Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        env:
          VITE_MAIN_DOMAIN: https://automatedsalesplatform.com
          VITE_ENGLISH_DOMAIN: https://en.automatedsalesplatform.com
          VITE_DEFAULT_LANGUAGE: hi
        run: npm run build

      - name: Deploy to Server
        uses: easingthemes/ssh-deploy@main
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: /var/www/finvexa/dist
```

---

## 📊 Performance Optimization

After deployment, optimize:

1. **Enable Gzip** (included in Nginx config above)
2. **Enable Brotli** for better compression
3. **Add CDN** for static assets (Cloudflare, etc.)
4. **Enable HTTP/2** (already in config)
5. **Add caching headers** (included in config)

---

## 📞 Support

If issues occur:
1. Check server logs
2. Check browser console
3. Verify DNS propagation
4. Test SSL certificates
5. Review environment variables

---

## ✨ Done!

Your multi-language domain setup is now live in production! 🎉

**Main domain** serves Hindi content.
**English subdomain** serves English content.
**One codebase, two languages, zero hassle!**
