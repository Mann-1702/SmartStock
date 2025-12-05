# Quick Fix for Azure Deployment Error

## The Problem
The "Application Error" was caused by the `dist` folder (containing your Angular frontend) **not being deployed** to Azure because it was in `.gitignore`.

## What Was Fixed ✅

### 1. **Updated .gitignore files**
- Root [.gitignore](.gitignore:4-6) - Now allows `src/backend/dist`
- Backend [src/backend/.gitignore](src/backend/.gitignore:4-5) - Commented out `/dist` ignore

### 2. **Added Azure deployment files**
- [src/backend/web.config](src/backend/web.config) - IIS configuration for Node.js
- [src/backend/.deployment](src/backend/.deployment) - Azure deployment config
- [src/backend/process.json](src/backend/process.json) - PM2 configuration

### 3. **Improved app.js**
- [src/backend/app.js](src/backend/app.js:94-149) - Better error logging and path handling

### 4. **Created GitHub Actions workflow**
- [.github/workflows/azure-deploy.yml](.github/workflows/azure-deploy.yml) - Automated deployment

---

## Deploy NOW - 3 Steps

### Step 1: Commit All Changes
```bash
git add .
git commit -m "Fix Azure deployment: Include dist folder and add deployment configs"
git push origin email_Service
```

### Step 2: Set Up GitHub Secret

You need to add your Azure publish profile to GitHub:

1. **Download Publish Profile:**
   - Go to Azure Portal → Your App Service
   - Click **Download publish profile**
   - Open the `.PublishSettings` file in a text editor
   - Copy ALL the contents

2. **Add to GitHub:**
   - Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Value: Paste the entire publish profile XML
   - Click **Add secret**

### Step 3: Update Workflow File (if needed)

In [.github/workflows/azure-deploy.yml](.github/workflows/azure-deploy.yml:12), update the app name:

```yaml
AZURE_WEBAPP_NAME: your-actual-app-name  # Change this!
```

Then commit:
```bash
git add .github/workflows/azure-deploy.yml
git commit -m "Update Azure app name in workflow"
git push origin email_Service
```

---

## The Deployment Will Now:

1. ✅ Build your Angular frontend (`npm run build`)
2. ✅ Copy the build to `src/backend/dist/`
3. ✅ Install backend dependencies
4. ✅ Deploy everything to Azure
5. ✅ Serve the frontend from the backend

---

## Alternative: Manual Deployment (if GitHub Actions doesn't work)

If you prefer to deploy directly:

```bash
# 1. Make sure dist is built
npm run build

# 2. Copy to backend (if not already there)
cp -r dist/smartstock-frontend/* src/backend/dist/

# 3. Deploy from backend folder
cd src/backend
az webapp up --name <your-app-name> --resource-group <your-resource-group>
```

---

## Verify It's Working

After deployment, check:

1. **Azure Portal** → App Service → **Log Stream**
   - You should see: `Serving Angular from: /home/site/wwwroot/dist`

2. **Visit your app URL**
   - `https://<your-app>.azurewebsites.net`
   - Should now load the Angular frontend!

3. **Check API**
   - `https://<your-app>.azurewebsites.net/api`
   - Should return: `{"message": "Welcome to SmartStock Backend API"}`

---

## If You Still Get Errors

Check the logs:

```bash
az webapp log tail --name <your-app-name> --resource-group <your-resource-group>
```

Look for these messages:
- ✅ `Serving Angular from: /home/site/wwwroot/dist`
- ❌ `Warning: dist folder not found` - means dist wasn't deployed
- ❌ `MongoDB connection error` - check MONGO_URI in Azure Configuration

---

## Environment Variables (Double-Check)

Make sure these are set in **Azure Portal** → App Service → **Configuration**:

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

## Summary

The frontend files ARE NOW in git (check `git ls-files src/backend/dist/`). They will be deployed when you push. The issue was that `.gitignore` was preventing them from being committed before.

**Just commit, push, and wait for GitHub Actions to deploy!** 🚀
