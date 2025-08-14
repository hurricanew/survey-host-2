#!/bin/bash

echo "🔐 Google OAuth Setup Helper"
echo "=============================="
echo ""

# Check if .env.local exists
if [ ! -f "apps/web/.env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "   Creating apps/web/.env.local..."
    mkdir -p apps/web
    cat > apps/web/.env.local << 'EOF'
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=2530fe37ddb48d209e8205076f3861fe2b29f99488a62a4259babe2c9c7b53761cca522c4fef133fad0eb926e02ba49511548fd8755d329de6fbfa737853c46d

# Google OAuth Configuration - REPLACE THESE WITH YOUR REAL CREDENTIALS
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
    echo "✅ Created .env.local file"
else
    echo "✅ .env.local file already exists"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. 🌐 Go to Google Cloud Console: https://console.cloud.google.com/"
echo "2. 📁 Create a new project (or select existing)"
echo "3. 🔑 Enable OAuth2 API and create OAuth 2.0 credentials"
echo "4. 🔗 Set redirect URI to: http://localhost:3000/api/auth/callback/google"
echo "5. 📝 Copy your Client ID and Client Secret"
echo "6. ✏️  Edit apps/web/.env.local and replace the placeholder values"
echo "7. 🔍 Run: node scripts/check-oauth-config.js to verify"
echo ""
echo "📚 See OAUTH_SETUP.md for detailed instructions"
echo ""
echo "⚠️  Important: You MUST use your own Google Cloud credentials!"
echo "   The current placeholder values will NOT work."