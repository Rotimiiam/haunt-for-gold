# Analytics Dashboard Nginx Setup Guide

This guide explains how to set up the analytics dashboard at `dash.rotimi.name.ng`.

## Prerequisites

- Analytics service is running on port 3002 (handled by GitHub Actions deployment)
- DNS A record for `dash.rotimi.name.ng` pointing to your server IP (74.207.254.40)

## Setup Steps

### 1. Copy Nginx Configuration

SSH into your server and copy the nginx configuration:

```bash
# Copy the config file to nginx sites-available
sudo cp /var/www/haunt-for-gold/nginx-dash-config.conf /etc/nginx/sites-available/dash.rotimi.name.ng

# Create symbolic link to sites-enabled
sudo ln -s /etc/nginx/sites-available/dash.rotimi.name.ng /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 2. Set Up SSL with Certbot

```bash
# Install certbot if not already installed
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate for dash.rotimi.name.ng
sudo certbot --nginx -d dash.rotimi.name.ng

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Choose whether to redirect HTTP to HTTPS (recommended: yes)
```

Certbot will automatically:
- Obtain an SSL certificate
- Update the nginx configuration with SSL settings
- Set up automatic renewal

### 3. Verify Setup

```bash
# Check that analytics service is running
pm2 list

# Should show:
# - haunt-for-gold (port 3001)
# - haunt-analytics (port 3002)

# Check nginx status
sudo systemctl status nginx

# Test the analytics dashboard
curl -I https://dash.rotimi.name.ng
```

### 4. Verify Auto-Renewal

```bash
# Test certificate renewal (dry run)
sudo certbot renew --dry-run
```

## Troubleshooting

### Analytics service not running

```bash
# Check PM2 logs
pm2 logs haunt-analytics

# Restart analytics service
pm2 restart haunt-analytics
```

### Nginx errors

```bash
# Check nginx error logs
sudo tail -f /var/log/nginx/dash-error.log

# Check nginx configuration
sudo nginx -t
```

### Port 3002 not accessible

```bash
# Check if service is listening on port 3002
sudo netstat -tlnp | grep 3002

# Check firewall (if applicable)
sudo ufw status
```

## DNS Configuration

Make sure you have an A record in your DNS settings:

```
Type: A
Name: dash
Value: 74.207.254.40
TTL: Auto or 3600
```

## Architecture

```
Internet
    ↓
dash.rotimi.name.ng (HTTPS/443)
    ↓
Nginx (reverse proxy)
    ↓
Analytics Service (localhost:3002)
    ↓
SQLite Database
```

## Security Notes

- Analytics dashboard is publicly accessible
- Consider adding authentication if sensitive data is displayed
- SSL/TLS encryption is enabled via Let's Encrypt
- Security headers are configured in nginx

## Maintenance

The analytics service will:
- Auto-start on server reboot (via PM2)
- Auto-deploy on git push to main branch (via GitHub Actions)
- Auto-renew SSL certificates (via Certbot)

## Related Files

- Main game: `haunt.rotimi.name.ng` → port 3001
- Analytics: `dash.rotimi.name.ng` → port 3002
- Nginx configs: `/etc/nginx/sites-available/`
- PM2 processes: `pm2 list`
