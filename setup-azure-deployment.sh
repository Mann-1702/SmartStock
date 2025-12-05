#!/bin/bash
# Quick Azure deployment setup script
# This script helps you set up Azure pipeline variables and environment

set -e

echo "🚀 SmartStock Azure Deployment Setup"
echo "===================================="
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "   https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Get user inputs
read -p "Enter your Azure DevOps organization URL (e.g., https://dev.azure.com/myorg): " ORG_URL
read -p "Enter your Azure DevOps project name: " PROJECT_NAME
read -p "Enter your Azure Service Connection name (e.g., smartstock-azure): " SERVICE_CONN
read -p "Enter your Azure App Service name (e.g., smartstock): " APP_NAME

echo ""
echo "Setting up Azure Pipeline variables..."

# Authenticate with Azure DevOps
az devops configure --defaults organization="$ORG_URL" project="$PROJECT_NAME"

# Get pipeline ID (assumes pipeline is already created)
PIPELINE_ID=$(az pipelines list --query "[0].id" --output tsv 2>/dev/null || echo "")

if [ -z "$PIPELINE_ID" ]; then
    echo "⚠️  Could not find pipeline ID. Make sure your azure-pipelines.yml is committed."
    echo "    After committing, run this script again, or manually add variables in Azure DevOps UI."
else
    echo "📝 Creating pipeline variables..."
    
    # Create variables
    az pipelines variable create \
        --name azureSubscription \
        --value "$SERVICE_CONN" \
        --pipeline-id "$PIPELINE_ID" \
        2>/dev/null || echo "   (Variable may already exist)"
    
    az pipelines variable create \
        --name webAppName \
        --value "$APP_NAME" \
        --pipeline-id "$PIPELINE_ID" \
        2>/dev/null || echo "   (Variable may already exist)"
    
    echo "✅ Pipeline variables set!"
fi

echo ""
echo "📋 Next steps:"
echo "1. Go to Azure Portal → Your App Service → Configuration"
echo "2. Add these application settings:"
echo "   - NODE_ENV=production"
echo "   - PORT=8080"
echo "   - MONGO_URI=your_mongodb_connection_string"
echo "   - EMAIL_USER=your_email@gmail.com"
echo "   - EMAIL_PASSWORD=your_app_password"
echo "   - GOOGLE_CLIENT_ID=your_client_id"
echo "   - GOOGLE_CLIENT_SECRET=your_client_secret"
echo "   - GOOGLE_CALLBACK_URL=https://$APP_NAME.azurewebsites.net/auth/google/callback"
echo "   - JWT_SECRET=generate_secure_random_string"
echo "   - SESSION_SECRET=generate_secure_random_string"
echo ""
echo "3. Set Startup command to: npm start"
echo "4. Queue a new build in Azure Pipelines"
echo ""
echo "✨ Setup complete!"
