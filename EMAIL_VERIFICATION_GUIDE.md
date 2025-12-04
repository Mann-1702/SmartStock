# Email Verification Checklist

## ✅ Configuration Check

Your `.env` file has:
- ✅ EMAIL_SERVICE=gmail
- ✅ EMAIL_USER=makwananayanp@gmail.com
- ✅ EMAIL_PASSWORD=ftwk dyqb yfco wxgc (16-character app password)
- ✅ nodemailer installed (version 7.0.11)

## 🔍 Verification Steps

### Step 1: Test Email Endpoint (Easiest)
Make a POST request to test if email service is working:

**Endpoint:** `POST http://localhost:3000/api/autoorders/test/send-email`

**Body:**
```json
{
  "recipientEmail": "makwananayanp@gmail.com",
  "recipientName": "Nayan Makwana"
}
```

**Check Console Output:**
- Look for: `✅ Email sent to makwananayanp@gmail.com`
- Or error message if configuration is wrong

### Step 2: Real Checkout Test
1. Login to the application
2. Add a product to cart
3. Perform checkout
4. Check backend console for email logs

**Expected Logs:**
```
Auto-order created and placed with vendor for product: [Product Name]
📧 Auto-order notification sent to [Your Email]
```

### Step 3: Check Email Reception
Check these places in order:
1. **Gmail Inbox** - main inbox
2. **Gmail Spam/Promotions** - sometimes emails go here
3. **Gmail All Mail** - check if it arrived but filtered

### Step 4: Verify Backend is Receiving Auth Token
In the checkout response, check if:
- Order is created successfully (status 201)
- Stock is updated
- No authentication errors

## 🐛 Common Issues & Solutions

### Issue 1: Email Not Sending (No Console Logs)
**Possible Cause:** Email configuration not loaded
**Solution:**
1. Restart the backend server: `node server.js`
2. Verify `.env` file has the email settings
3. Check for spaces in EMAIL_PASSWORD - there should be spaces in "ftwk dyqb yfco wxgc"

### Issue 2: "Email not configured" Warning
**Possible Cause:** Environment variables not loaded
**Solution:**
1. Check `.env` file exists in `/src/backend/` directory
2. Restart server
3. Verify EMAIL_USER and EMAIL_PASSWORD are set

### Issue 3: Gmail Still Not Receiving
**Possible Cause:** App password expired or invalid
**Solution:**
1. Go to https://myaccount.google.com/apppasswords
2. Delete old app password
3. Generate new one for "Mail" and "Windows Computer"
4. Update `.env` with new 16-character password
5. Restart backend server

### Issue 4: Authentication Error on Checkout
**Possible Cause:** Frontend not sending token
**Solution:**
1. Verify order.service.ts has HttpHeaders import
2. Verify checkoutCart method includes Authorization header
3. Check localStorage has 'token' key when logged in

## 📋 Code Verification

### Backend Routes (✅ Updated)
- ✅ `/api/orders/checkout` - has authMiddleware
- ✅ Auto-order creation sends email
- ✅ `/api/autoorders/test/send-email` - test endpoint added

### Frontend Service (✅ Updated)
- ✅ order.service.ts has HttpHeaders
- ✅ checkoutCart includes Authorization header

### Email Service (✅ Configured)
- ✅ sendAutoOrderNotification function exists
- ✅ Nodemailer transporter configured
- ✅ Email template has all details

## 📧 Email Configuration Format

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy 16-character password (includes spaces)
5. In `.env`: `EMAIL_PASSWORD=xxxx xxxx xxxx xxxx`
6. Restart server

## 🧪 Test the Test Endpoint

### Using cURL:
```bash
curl -X POST http://localhost:3000/api/autoorders/test/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "makwananayanp@gmail.com",
    "recipientName": "Nayan Makwana"
  }'
```

### Using Postman:
1. Create new POST request
2. URL: `http://localhost:3000/api/autoorders/test/send-email`
3. Body (JSON):
```json
{
  "recipientEmail": "makwananayanp@gmail.com",
  "recipientName": "Nayan Makwana"
}
```
4. Send and check response

## ✨ Next Steps

1. **Test the endpoint first** - use `/api/autoorders/test/send-email`
2. **Check console output** - look for success or error messages
3. **If test works:** Do a real checkout to trigger auto-order email
4. **If test fails:** Check Gmail app password configuration
5. **Report the exact error** - share console output for debugging

---

**Status:** All code is in place ✅ 
**Waiting for:** Email service verification
