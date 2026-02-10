# Email Configuration Guide

## Quick Setup for Contact Form

The contact form requires email configuration to send notifications. Follow this guide to set up email services.

---

## 📧 Email Services Supported

### 1. Gmail (Recommended for Testing)

**Pros:**
- Free and easy to set up
- Reliable and fast
- Good for development and small deployments

**Cons:**
- Daily sending limits (500 emails/day)
- Requires app password setup

**Setup Steps:**

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select: "Mail" and "Other (Custom name)"
   - Name it: "CertiChain Backend"
   - Copy the 16-character password

3. **Update .env File**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=youremail@gmail.com
   SMTP_PASS=your-16-char-app-password
   SMTP_FROM=CertiChain <youremail@gmail.com>
   ADMIN_EMAIL=admin@yourdomain.com
   ```

### 2. Outlook/Office 365

**Setup:**
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=youremail@outlook.com
SMTP_PASS=your-password
SMTP_FROM=CertiChain <youremail@outlook.com>
ADMIN_EMAIL=admin@yourdomain.com
```

### 3. Yahoo Mail

**Setup:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=youremail@yahoo.com
SMTP_PASS=your-app-password
SMTP_FROM=CertiChain <youremail@yahoo.com>
ADMIN_EMAIL=admin@yourdomain.com
```

### 4. SendGrid (For Production)

**Pros:**
- 100 emails/day free
- Excellent deliverability
- Perfect for production
- Detailed analytics

**Setup Steps:**

1. Sign up at https://sendgrid.com
2. Create an API key
3. Configure:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=CertiChain <noreply@yourdomain.com>
ADMIN_EMAIL=admin@yourdomain.com
```

### 5. Mailgun (For Production)

**Setup:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username@yourdomain.com
SMTP_PASS=your-mailgun-password
SMTP_FROM=CertiChain <noreply@yourdomain.com>
ADMIN_EMAIL=admin@yourdomain.com
```

### 6. Amazon SES (For Production)

**Setup:**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-access-key
SMTP_PASS=your-ses-secret-key
SMTP_FROM=CertiChain <noreply@yourdomain.com>
ADMIN_EMAIL=admin@yourdomain.com
```

---

## 🔧 Configuration Parameters

### Required Parameters

```env
# SMTP Server
SMTP_HOST=your.smtp.server.com
SMTP_PORT=587                    # or 465 for SSL
SMTP_USER=your-username
SMTP_PASS=your-password

# Sender Email
SMTP_FROM=AppName <noreply@yourdomain.com>

# Admin Email (receives contact form messages)
ADMIN_EMAIL=admin@yourdomain.com
```

### Optional Parameters

```env
# Use SSL instead of TLS (use port 465)
SMTP_SECURE=true

# Branding
APP_NAME=CertiChain
EMAIL_LOGO_URL=https://yourdomain.com/logo.png

# Support Contact
SUPPORT_EMAIL=support@yourdomain.com

# Email Verification
EMAIL_VERIFICATION_TTL_HOURS=24

# URLs
APP_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
```

---

## 🧪 Testing Email Configuration

### Method 1: Health Check
```bash
curl http://localhost:3001/api/contact/health
```

Expected output:
```json
{
  "status": "OK",
  "emailService": "configured",
  "adminEmail": "configured"
}
```

### Method 2: Send Test Email
```bash
curl -X POST http://localhost:3001/api/contact/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-email@example.com",
    "subject": "Test Email Configuration",
    "message": "Testing the email configuration for the contact form."
  }'
```

### Method 3: Run Test Script
```bash
node test-contact-api.js
```

### Method 4: Frontend Form
1. Start backend: `npm start`
2. Start frontend: `npm run dev`
3. Navigate to Contact page
4. Submit test message
5. Check your inbox

---

## 🐛 Troubleshooting

### "Authentication failed"

**Cause:** Wrong username or password

**Solutions:**
- ✅ Verify SMTP_USER and SMTP_PASS
- ✅ For Gmail: Use App Password, not regular password
- ✅ Check if 2FA is enabled (required for Gmail)
- ✅ Ensure no extra spaces in .env values

### "Connection timeout"

**Cause:** Firewall or wrong SMTP settings

**Solutions:**
- ✅ Check SMTP_HOST is correct
- ✅ Verify port (587 for TLS, 465 for SSL)
- ✅ Check firewall settings
- ✅ Try alternative port

### "Email not delivered"

**Cause:** Spam filters or sender issues

**Solutions:**
- ✅ Check spam/junk folder
- ✅ Verify SMTP_FROM email is valid
- ✅ For custom domains: Set up SPF/DKIM records
- ✅ Use reputable email service (SendGrid, Mailgun)

### "Self-signed certificate" error

**Cause:** SSL certificate issues

**Solution:**
```env
# Only for development/testing!
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### Admin not getting emails

**Cause:** ADMIN_EMAIL not configured

**Solution:**
```env
ADMIN_EMAIL=your-admin@example.com
```

### User not getting confirmation

**Cause:** User email delivery failed (non-critical)

**Solution:**
- Check backend logs for errors
- Verify user email is valid
- Admin email still sent successfully

---

## 🔐 Security Best Practices

### 1. Never Commit Credentials
```bash
# Add to .gitignore
.env
.env.local
.env.production
```

### 2. Use App Passwords
- Never use your main email password
- Generate app-specific passwords
- Revoke if compromised

### 3. Environment Variables
```bash
# Production: Use environment variables, not .env files
export SMTP_PASS="your-password"
```

### 4. Rotate Credentials
- Change passwords periodically
- Rotate API keys
- Monitor for suspicious activity

### 5. Use Production Services
- For production, use SendGrid, Mailgun, or AWS SES
- Better deliverability
- Analytics and monitoring
- Higher sending limits

---

## 📊 Email Service Comparison

| Service | Free Tier | Best For | Difficulty |
|---------|-----------|----------|------------|
| Gmail | 500/day | Development | Easy |
| Outlook | 300/day | Development | Easy |
| SendGrid | 100/day | Small Production | Medium |
| Mailgun | 100/day | Production | Medium |
| AWS SES | 62,000/month* | Large Production | Hard |

*First 62,000 emails free when sending from EC2

---

## 🎯 Quick Start (Gmail)

Most common setup for development:

1. **Enable Gmail 2FA**
   ```
   https://myaccount.google.com/security
   → 2-Step Verification → Enable
   ```

2. **Create App Password**
   ```
   https://myaccount.google.com/apppasswords
   → Select Mail → Other (Custom name)
   → Copy password
   ```

3. **Update .env**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=youremail@gmail.com
   SMTP_PASS=xxxx-xxxx-xxxx-xxxx
   SMTP_FROM=CertiChain <youremail@gmail.com>
   ADMIN_EMAIL=youremail@gmail.com
   ```

4. **Test**
   ```bash
   node test-contact-api.js
   ```

---

## 📧 Email Template Customization

### Update Branding

```env
APP_NAME=YourAppName
EMAIL_LOGO_URL=https://yourdomain.com/logo.png
SUPPORT_EMAIL=support@yourdomain.com
```

### Modify Templates

Edit colors and styles in:
```
utils/contactEmail.js
utils/emailVerification.js
```

Look for:
- `background:linear-gradient(135deg,#6d28d9,#8b5cf6)` - Header gradient
- `color:#6d28d9` - Link colors
- `background:#f8fafc` - Light backgrounds

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Use production email service (SendGrid/Mailgun)
- [ ] Set up custom domain for emails
- [ ] Configure SPF records
- [ ] Configure DKIM records
- [ ] Test email deliverability
- [ ] Set up monitoring/alerts
- [ ] Configure proper SMTP_FROM address
- [ ] Use strong passwords/API keys
- [ ] Set up email analytics
- [ ] Test spam folder placement
- [ ] Verify rate limiting works
- [ ] Test all email templates

---

## 💡 Tips

1. **Development**: Use Gmail with app password
2. **Staging**: Use SendGrid free tier
3. **Production**: Use SendGrid/Mailgun/AWS SES paid
4. **Testing**: Use Mailtrap.io (catches all emails)
5. **Monitoring**: Set up Sentry or similar for errors

---

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid Setup](https://docs.sendgrid.com/)
- [Email Best Practices](https://sendgrid.com/blog/email-best-practices/)

---

Need help? Check `CONTACT_INTEGRATION.md` for more details!
