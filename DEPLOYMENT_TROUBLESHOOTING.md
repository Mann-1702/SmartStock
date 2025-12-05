# Azure Deployment Troubleshooting Guide

## The "Application Error" Issue

If you're seeing the generic Azure "Application Error" page, this means the Node.js application is not starting correctly or cannot serve files.

---

## Quick Fixes Applied

### 1. **web.config File** ✅
- Created: `src/backend/web.config`
- This file tells Azure's IIS how to route requests to your Node.js application
- It handles both static files (from `/dist`) and dynamic API routes

### 2. **Improved Error Logging** ✅
- Updated `src/backend/app.js` to provide detailed error messages
- The app now logs:
  - Where it's looking for the `dist` folder
  - What the current directory is
  - Whether files are found or not

### 3. **Better Path Resolution** ✅
- Added fallback mechanisms in case the `dist` folder isn't where expected
- The app will now try multiple locations before failing

---

## How to Deploy the Fixes

### Step 1: Ensure Build Files Are Included

Before deploying, make sure your `dist` folder is copied to the backend:

```bash
# From project root
npm run build

# Copy dist to backend
cp -r dist/smartstock-frontend/* src/backend/dist/
```

### Step 2: Commit and Push

```bash
git add .
git commit -m "Fix Azure deployment: Add web.config and improve path resolution"
git push origin email_Service
```

### Step 3: Deploy to Azure

**Option A: Using Azure CLI**
```bash
cd src/backend
az webapp up --name <your-app-name> --resource-group <your-resource-group>
```

**Option B: Using GitHub Actions or Azure Pipelines**
- Your pipeline should automatically trigger after pushing

---

## Checking Logs in Azure

To see what's actually happening:

### 1. **Via Azure Portal**
1. Go to **Azure Portal** → Your App Service
2. Click **Monitoring** → **Log stream**
3. Look for console.log messages like:
   - "Serving Angular from: ..."
   - "Current directory: ..."
   - "dist folder not found at ..."

### 2. **Via Azure CLI**
```bash
az webapp log tail --name <your-app-name> --resource-group <your-resource-group>
```

### 3. **Download Logs**
```bash
az webapp log download --name <your-app-name> --resource-group <your-resource-group>
```

---

## Common Issues & Solutions

### Issue 1: "dist folder not found"

**Symptoms:**
- Logs show: `Warning: dist folder not found at /home/site/wwwroot/dist`

**Solution:**
Make sure your build pipeline includes:
```yaml
# In azure-pipelines.yml or GitHub workflow
- script: npm run build
  displayName: 'Build Angular Frontend'

- script: |
    mkdir -p src/backend/dist
    cp -r dist/smartstock-frontend/* src/backend/dist/
  displayName: 'Copy frontend to backend'
```

---

### Issue 2: Application won't start

**Symptoms:**
- App Service shows "Application Error"
- No logs in Log Stream

**Solution:**
Check your startup command in Azure:

1. Go to **Configuration** → **General settings**
2. **Startup Command** should be:
   ```
   node server.js
   ```
   OR
   ```
   npm start
   ```

3. **Stack**: Node 18 LTS or higher

---

### Issue 3: API routes work but frontend doesn't load

**Symptoms:**
- `/api` returns JSON
- `/` shows 404 or error

**Solution:**
1. Verify `web.config` is deployed to `src/backend/web.config`
2. Check that `dist/index.html` exists in your deployed app
3. SSH into the App Service and verify:
   ```bash
   ls -la /home/site/wwwroot/dist/
   ```

---

### Issue 4: Environment variables not set

**Symptoms:**
- MongoDB connection errors
- Google OAuth errors

**Solution:**
In Azure Portal → App Service → Configuration → Application settings, add:

```
NODE_ENV=production
PORT=8080
MONGO_URI=mongodb+srv://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://your-app.azurewebsites.net/auth/google/callback
JWT_SECRET=...
SESSION_SECRET=...
EMAIL_USER=...
EMAIL_PASSWORD=...
```

---

## Testing Locally Before Deployment

Always test the production build locally first:

```bash
# 1. Build Angular
npm run build

# 2. Copy to backend
cp -r dist/smartstock-frontend/* src/backend/dist/

# 3. Install backend dependencies
cd src/backend
npm ci

# 4. Run in production mode
NODE_ENV=production PORT=3000 npm start

# 5. Visit http://localhost:3000
```

If this works locally, it should work on Azure (assuming environment variables are set).

---

## SSH into Azure App Service

To inspect the deployed files directly:

### Via Azure Portal
1. Go to **App Service** → **SSH** or **Advanced Tools (Kudu)**
2. Click **Go**
3. Open **SSH** tab
4. Navigate to `/home/site/wwwroot`

### Via Azure CLI
```bash
az webapp ssh --name <your-app-name> --resource-group <your-resource-group>
```

Once in SSH:
```bash
# Check if files are there
ls -la /home/site/wwwroot/
ls -la /home/site/wwwroot/dist/

# Check node version
node --version

# Try running the app manually
cd /home/site/wwwroot
node server.js
```

---

## File Structure in Azure

Your deployed app should have this structure:

```
/home/site/wwwroot/
├── dist/
│   ├── index.html
│   ├── main.*.js
│   ├── styles.*.css
│   └── ...
├── models/
├── routes/
├── middleware/
├── app.js
├── server.js
├── web.config  ⬅️ IMPORTANT
├── package.json
└── node_modules/
```

---

## Still Having Issues?

### Enable Detailed Logging

1. **Azure Portal** → App Service → **Configuration** → **Application settings**
2. Add:
   - `WEBSITE_NODE_DEFAULT_VERSION`: `18-lts`
   - `SCM_DO_BUILD_DURING_DEPLOYMENT`: `true`
   - `WEBSITE_HTTPLOGGING_RETENTION_DAYS`: `7`

3. **Diagnostic Settings** → **App Service Logs**
   - Application Logging: **File System (Verbose)**
   - Web Server Logging: **File System**
   - Save

### Check Kudu Deployment Logs

1. Go to `https://<your-app-name>.scm.azurewebsites.net`
2. Click **Deployments**
3. Review the latest deployment log for errors

---

## Need More Help?

If you're still stuck:

1. Share the **Log Stream** output
2. Share the **Kudu Deployment Log**
3. Verify `ls -la /home/site/wwwroot/dist/` output from SSH
4. Check that all environment variables are set correctly

The detailed error messages in the updated `app.js` should now tell you exactly where the problem is!
