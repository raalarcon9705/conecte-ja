#!/bin/bash

# Script to clear all caches for React Native/Expo development
# This helps resolve issues with slow loading or stale code

echo "🧹 Clearing development caches..."

# Clear Metro bundler cache
echo "📦 Clearing Metro bundler cache..."
rm -rf $TMPDIR/metro-* 2>/dev/null
rm -rf $TMPDIR/react-* 2>/dev/null
rm -rf $TMPDIR/haste-* 2>/dev/null

# Clear Expo cache
echo "🚀 Clearing Expo cache..."
rm -rf ~/.expo/cache 2>/dev/null
rm -rf .expo/cache 2>/dev/null
rm -rf apps/mobile/.expo/cache 2>/dev/null

# Clear watchman (if installed)
if command -v watchman &> /dev/null; then
  echo "👁️  Clearing Watchman cache..."
  watchman watch-del-all 2>/dev/null
fi

# Clear node_modules cache
echo "📚 Clearing node_modules cache..."
rm -rf node_modules/.cache 2>/dev/null

# Clear Nx cache
echo "⚡ Clearing Nx cache..."
npx nx reset 2>/dev/null || echo "Nx reset not available"

# Clear React Native cache (if using react-native CLI)
if command -v react-native &> /dev/null; then
  echo "⚛️  Clearing React Native cache..."
  react-native start --reset-cache &
  sleep 2
  pkill -f "react-native" 2>/dev/null
fi

echo "✅ Cache cleared successfully!"
echo ""
echo "💡 Next steps:"
echo "   1. Run: pnpm install (to ensure dependencies are fresh)"
echo "   2. Run: pnpm mobile (to start the app)"
echo ""
