#!/bin/bash
# Quick setup script for Flutter mobile app

echo "📱 Setting up Expense Tracker Mobile App..."

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter is not installed!"
    echo "   Please install Flutter from: https://flutter.dev/docs/get-started/install"
    exit 1
fi

# Get Flutter dependencies
echo "📦 Getting Flutter dependencies..."
flutter pub get

# Generate localization files
echo "🌍 Generating localization files..."
flutter gen-l10n

# Get local IP address
echo ""
echo "🌐 Getting your local IP address..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
else
    # Windows or other
    LOCAL_IP="YOUR_IP_HERE"
fi

echo "   Your local IP appears to be: $LOCAL_IP"
echo ""
echo "⚙️  IMPORTANT: Update the API base URL!"
echo "   Edit: lib/core/constants/app_constants.dart"
echo "   Change: baseUrl = 'http://$LOCAL_IP:8000'"
echo ""
read -p "Press enter after updating the IP address..."

# Check for connected devices
echo ""
echo "📱 Checking for connected devices..."
flutter devices

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 You can now run the app with:"
echo "   flutter run"
echo ""
echo "   Or for a specific device:"
echo "   flutter run -d <device-id>"
echo ""
