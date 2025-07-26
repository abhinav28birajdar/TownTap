#!/bin/bash

echo "🏪 TownTap - Quick Setup Script"
echo "================================"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if supabase CLI is installed
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI is available"
    echo "💡 You can run 'supabase start' to start a local instance"
else
    echo "⚠️  Supabase CLI not found. Install with: npm install -g supabase"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Set up your Supabase database:"
echo "   - Go to https://supabase.com/dashboard"
echo "   - Run the SQL script from supabase/database_setup.sql"
echo "   - Enable real-time for all tables"
echo ""
echo "2. Start the development server:"
echo "   npm start"
echo ""
echo "3. Open the app on your device/emulator"
echo ""
echo "📱 The app will show a category selection screen where users can choose:"
echo "   - Customer (4 tabs: Home, Explore, Orders, Profile)"
echo "   - Business Owner (5 tabs: Dashboard, Customers, Orders, Business, Profile)"
echo ""
echo "🚀 Happy coding!"
