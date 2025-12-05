# Azure Deployment Setup Guide

This guide will help you configure your SmartStock application for deployment to Azure.

## Prerequisites
- Azure DevOps account with a project
- Azure Web App (App Service) created
- GitHub repository with admin access
- MongoDB Atlas or Azure Cosmos DB connection string

---

## Step 1: Set Up Azure DevOps Pipeline Variables

The `azure-pipelines.yml` file requires two variables. Set them up as follows:

### Option A: Using Azure DevOps UI

1. Go to **Azure DevOps** → Your Project → **Pipelines**
2. Click on your pipeline (or create new from `azure-pipelines.yml`)
3. Click **Edit** in the top right
4. Click **Variables** button in the top right
5. Add these variables:

| Variable Name | Value | Scope |
|---|---|---|
| `azureSubscription` | Your Azure Service Connection name (see Step 2) | Pipeline |
| `webAppName` | Your Azure App Service name (e.g., `smartstock`) | Pipeline |

6. Click **Save**

### Option B: Using Azure CLI

```bash
# First, get your Azure DevOps organization and project
# Then run:

az pipelines variable create \
  --name azureSubscription \
  --value "Your-Service-Connection-Name" \
  --organization "https://dev.azure.com/your-org" \
  --project "Your-Project"

az pipelines variable create \
  --name webAppName \
  --value "smartstock" \
  --organization "https://dev.azure.com/your-org" \
  --project "Your-Project"
```

---

## Step 2: Create Azure Service Connection

The `azureSubscription` variable should reference your Azure Service Connection:

1. In Azure DevOps, go to **Project Settings** → **Service Connections**
2. Click **Create service connection**
3. Choose **Azure Resource Manager**
4. Select **Service principal (automatic)**
5. Choose your subscription
6. Name it (e.g., `smartstock-azure`)
7. Grant permissions
8. **Save**
9. Use this connection name for the `azureSubscription` variable

---

## Step 3: Configure GitHub Actions Secrets (Optional)

If you want to use GitHub Actions (`.github/workflows/deploy.yml`) instead of Azure Pipelines:

1. Go to **GitHub** → Your Repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add this secret:
   - **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - **Value**: Your Azure Web App publish profile (download from Azure Portal)

### How to get Publish Profile:
1. Go to **Azure Portal** → Your App Service → **Download publish profile**
2. Open the `.PublishSettings` file and copy its contents
3. Paste into the GitHub secret

---

## Step 4: Configure Azure App Service Environment Variables

Your deployed app needs these environment variables in Azure:

1. Go to **Azure Portal** → Your App Service → **Settings** → **Configuration**
2. Click **+ New application setting** for each:

| Name | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Required for production mode |
| `PORT` | `8080` | Azure default port (app will auto-use this) |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/db` | Your MongoDB connection string |
| `EMAIL_SERVICE` | `gmail` | Email provider |
| `EMAIL_USER` | `your-email@gmail.com` | Gmail address for sending emails |
| `EMAIL_PASSWORD` | `xxxx xxxx xxxx xxxx` | Gmail App Password (16 chars with spaces) |
| `GOOGLE_CLIENT_ID` | `your-client-id.apps.googleusercontent.com` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxxxxxxxxxxx` | From Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | `https://smartstock.azurewebsites.net/auth/google/callback` | Replace with your app URL |
| `JWT_SECRET` | `your-secure-random-string` | Generate a strong random string |
| `SESSION_SECRET` | `your-secure-random-string` | Generate a strong random string |

3. Click **Save**

### How to generate secure random strings:
```bash
# Linux/Mac
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use online: https://generate-random.org/ (copy 64-character hex string)
```

---

## Step 5: Configure App Service Startup Command

1. In Azure Portal, go to **Settings** → **Configuration** → **General settings**
2. Set **Startup command** to:
   ```
   npm start
   ```
3. Verify **Runtime stack**: Node.js 18 LTS (or later)
4. Click **Save**

---

## Step 6: Enable Application Insights (Optional but Recommended)

1. Go to App Service → **Application Insights**
2. Click **Turn on Application Insights**
3. This helps with monitoring and debugging

---

## Step 7: Queue a Build

### Using Azure Pipelines:
1. Go to **Pipelines** → Your pipeline
2. Click **Run pipeline**
3. Select your branch (`email_Service` or `main`)
4. Click **Run**

### Using GitHub Actions:
1. Push a commit to `main` or `email_Service`
2. Go to **GitHub** → **Actions** to monitor

---

## Troubleshooting

### Pipeline Build Fails
- Check logs in Azure DevOps Pipelines → Your build
- Verify Node.js version in pipeline (should be 18+)
- Ensure `npm run build` succeeds locally first

### "404 Not Found" After Deployment
- Check App Service logs: **Monitoring** → **Log stream**
- Verify `dist/` folder exists in deployed package
- Check that `npm start` command is correct

### "Cannot find module" Errors
- Backend dependencies might not have been installed
- In `azure-pipelines.yml`, ensure `npm ci --omit=dev` runs before deployment

### Email Not Sending
- Verify `EMAIL_PASSWORD` is an **App Password**, not your Gmail password
- Check Gmail account has 2FA enabled
- Test locally with `.env` file first

### CORS Errors
- Frontend and backend should be on same domain in production
- Verify `CORS` in `app.js` is set to allow the Azure domain

---

## Local Testing Before Deployment

```bash
# Build frontend
npm run build

# Copy to backend
mkdir -p src/backend/dist
cp -r dist/smartstock-frontend/* src/backend/dist/

# Install backend deps
cd src/backend
npm ci

# Test locally
NODE_ENV=production PORT=3000 npm start
```

Then visit `http://localhost:3000` in your browser.

---

## Monitoring Your Deployment

1. **Azure Portal** → App Service → **Log stream**: View real-time logs
2. **Azure Portal** → App Service → **Monitoring** → **Metrics**: View performance
3. **GitHub Actions**: Check workflow runs for build/deploy status

---

## Need Help?

Check these files in your repo:
- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `azure-pipelines.yml` - Azure DevOps pipeline
- `src/backend/app.js` - Express configuration
- `src/backend/package.json` - Backend dependencies

