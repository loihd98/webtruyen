# SSL Certificate Renewal Guide for khotruyen.vn

## Overview
This guide provides the exact step-by-step commands for renewing Let's Encrypt SSL certificates for khotruyen.vn.

**Certificate Information:**
- Domain: khotruyen.vn, www.khotruyen.vn
- Provider: Let's Encrypt
- Validity: 90 days
- Renewal Recommended: Every 60-80 days

---

## Complete Renewal Process

### Prerequisites
```bash
# Navigate to project directory
cd /opt/webtruyen
```

---

### Step 1: Check Certificate Status

```bash
# Check if certificates exist
docker run --rm -v webtruyen_certbot-certs:/certs alpine ls -la /certs/live/
```

**Expected Output:**
```
total 16
drwx------    3 root     root          4096 Oct  5 19:14 .
drwxr-xr-x    7 root     root          4096 Oct  9 12:59 ..
-rw-r--r--    1 root     root           740 Oct  5 19:14 README
drwxr-xr-x    2 root     root          4096 Oct  5 19:14 khotruyen.vn
```

```bash
# Check certificate expiration dates
docker run --rm -v webtruyen_certbot-certs:/certs alpine/openssl x509 -in /certs/live/khotruyen.vn/fullchain.pem -noout -dates -subject
```

**Expected Output:**
```
notBefore=Oct  5 18:15:34 2025 GMT
notAfter=Jan  3 18:15:33 2026 GMT
subject=CN=khotruyen.vn
```

```bash
# Check certbot configuration
docker run --rm -v webtruyen_certbot-certs:/certs alpine cat /certs/renewal/khotruyen.vn.conf
```

```bash
# Check certificate from external perspective
curl -vI https://khotruyen.vn 2>&1 | grep -E "expire|subject|issuer"
```

**If certificate is expired, you'll see:**
```
* SSL certificate problem: certificate has expired
```

---

### Step 2: Backup Current Certificates

```bash
# Create backup directory
mkdir -p ~/ssl-backup-$(date +%Y%m%d)

# Backup certificates
docker run --rm -v webtruyen_certbot-certs:/certs -v ~/ssl-backup-$(date +%Y%m%d):/backup alpine sh -c "cp -r /certs/* /backup/"
```

**No output means success.**

---

### Step 3: Renew Certificate

```bash
# Run certbot renewal
docker compose -f docker-compose.prod.yml run --rm certbot renew --force-renewal
```

**Expected Output:**
```
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Processing /etc/letsencrypt/renewal/khotruyen.vn.conf
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Renewing an existing certificate for khotruyen.vn and www.khotruyen.vn

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Congratulations, all renewals succeeded: 
  /etc/letsencrypt/live/khotruyen.vn/fullchain.pem (success)
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

---

### Step 4: Reload Nginx

```bash
# Gracefully reload nginx (no downtime)
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

**No output means success.**

---

### Step 5: Verify New Certificate

```bash
# Check new certificate expiration (should be 90 days from now)
docker run --rm -v webtruyen_certbot-certs:/certs alpine/openssl x509 -in /certs/live/khotruyen.vn/fullchain.pem -noout -dates
```

**Expected Output:**
```
notBefore=Jan  4 14:50:56 2026 GMT
notAfter=Apr  4 14:50:55 2026 GMT
```

✅ **Done! Certificate renewed successfully.**

---

## Quick Copy-Paste Commands

```bash
cd /opt/webtruyen
docker run --rm -v webtruyen_certbot-certs:/certs alpine ls -la /certs/live/
docker run --rm -v webtruyen_certbot-certs:/certs alpine/openssl x509 -in /certs/live/khotruyen.vn/fullchain.pem -noout -dates -subject
docker run --rm -v webtruyen_certbot-certs:/certs alpine cat /certs/renewal/khotruyen.vn.conf
curl -vI https://khotruyen.vn 2>&1 | grep -E "expire|subject|issuer"
mkdir -p ~/ssl-backup-$(date +%Y%m%d)
docker run --rm -v webtruyen_certbot-certs:/certs -v ~/ssl-backup-$(date +%Y%m%d):/backup alpine sh -c "cp -r /certs/* /backup/"
docker compose -f docker-compose.prod.yml run --rm certbot renew --force-renewal
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
docker run --rm -v webtruyen_certbot-certs:/certs alpine/openssl x509 -in /certs/live/khotruyen.vn/fullchain.pem -noout -dates
```

---

## What This Process Does NOT Affect

✅ Backend service - keeps running  
✅ Frontend service - keeps running  
✅ PostgreSQL database - keeps running  
✅ Uploads volume - not touched  
✅ User sessions - preserved  
✅ Application data - unchanged  
check and renew certificates twice daily at 3:00 AM and 3:00 PM
0 3,15 * * * cd /opt/webtruyen && docker compose -f docker-compose.prod.yml run --rm certbot renew --quiet

---

## Automatic Renewal Setup

### Option 1: Using Cron Job (Recommended)

```bash
# Edit root crontab
crontab -e

# Add this line to renew certificates twice daily at 3:00 AM and 3:00 PM
0 3,15 * * * cd /opt/webtruyen && docker compose -f docker-compose.prod.yml run --rm certbot renew && docker compose -f docker-compose.prod.yml exec nginx nginx -s reload >> /var/log/certbot-renew.log 2>&1
```

### Option 2: Using Systemd Timer

Create `/etc/systemd/system/certbot-renew.service`:

```ini
[Unit]
Description=Renew Let's Encrypt SSL certificates
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
WorkingDirectory=/opt/webtruyen
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml run --rm certbot renew
ExecStartPost=/usr/bin/docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
StandardOutput=journal
```

Create `/etc/systemd/system/certbot-renew.timer`:

```ini
[Unit]
Description=Run certbot renewal twice daily

[Timer]
OnCalendar=03:00
OnCalendar=15:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable the timer:

```bash
systemctl daemon-reload
systemctl enable certbot-renew.timer
systemctl start certbot-renew.timer

# Check timer status
systemctl list-timers certbot-renew.timer
```

---

## Troubleshooting

### Issue 1: Certificate Renewal Fails

**Symptoms:**
```
Challenge failed for domain khotruyen.vn
```

**Solution:**
```bash
# Check if port 80 is accessible
curl -I http://khotruyen.vn/.well-known/acme-challenge/test

# Verify nginx is serving certbot webroot
docker compose -f docker-compose.prod.yml exec nginx ls -la /var/www/certbot

# Check nginx logs
docker compose -f docker-compose.prod.yml logs nginx | tail -50

# Ensure DNS is pointing correctly
nslookup khotruyen.vn
```

### Issue 2: Nginx Fails to Reload

**Symptoms:**
```
nginx: [error] invalid PID number
```

**Solution:**
```bash
# Restart nginx container instead
docker compose -f docker-compose.prod.yml restart nginx

# Check nginx error logs
docker compose -f docker-compose.prod.yml logs nginx --tail 100
```

### Issue 3: Certificate Not Updated After Renewal

**Symptoms:**
Browser still shows old/expired certificate

**Solution:**
```bash
# Hard restart nginx
docker compose -f docker-compose.prod.yml stop nginx
docker compose -f docker-compose.prod.yml start nginx

# Clear browser cache and test in incognito mode

# Verify certificate files were actually updated
docker run --rm -v webtruyen_certbot-certs:/certs alpine ls -la /certs/live/khotruyen.vn/
```

### Issue 4: Rate Limit Exceeded

**Symptoms:**
```
too many certificates already issued for: khotruyen.vn
```

**Solution:**
- Wait 7 days before trying again (Let's Encrypt rate limit: 5 duplicate certificates per week)
- Use `--dry-run` flag to test without hitting rate limits
- Use staging server for testing: `--server https://acme-staging-v02.api.letsencrypt.org/directory`

---

## Emergency Rollback Procedure

If renewal causes issues:

```bash
# 1. Stop nginx
docker compose -f docker-compose.prod.yml stop nginx

# 2. Restore old certificates from backup
docker run --rm \
  -v webtruyen_certbot-certs:/certs \
  -v ~/ssl-backup-YYYYMMDD:/backup \
  alpine sh -c "rm -rf /certs/* && cp -r /backup/* /certs/"

# 3. Start nginx
docker compose -f docker-compose.prod.yml start nginx

# 4. Verify site works
curl -I https://khotruyen.vn
```

---

## Common Issues & Solutions

### Issue: "certificate has expired"
**Solution:** Run the renewal process immediately (Steps 2-5 above)

### Issue: Certbot renewal fails with challenge error
**Check:**
```bash
# Verify port 80 is accessible
curl -I http://khotruyen.vn/.well-known/acme-challenge/

# Check nginx is serving certbot webroot
docker compose -f docker-compose.prod.yml exec nginx ls -la /var/www/certbot
```

### Issue: Nginx reload fails
**Solution:** Restart nginx container instead
```bash
docker compose -f docker-compose.prod.yml restart nginx
```

---

## Monitoring Certificate Expiration
Quick Certificate Check

```bash
# Check when certificate expires
docker run --rm -v webtruyen_certbot-certs:/certs alpine/openssl x509 -in /certs/live/khotruyen.vn/fullchain.pem -noout -dates
```

---

## Notes

- **Renewal Frequency:** Let's Encrypt certificates last 90 days. Renew when 30 days or less remain.
- **Rate Limits:** Let's Encrypt allows 5 duplicate certificates per week. Don't renew unnecessarily.
- **Backup Location:** Certificates are backed up to `~/ssl-backup-YYYYMMDD/`
- **No Downtime:** Nginx graceful reload keeps all connections alive.

---

## Last Updated

**2026-01-04** - Successfully renewed expired certificate (Jan 3, 2026 → Apr 4, 2026)