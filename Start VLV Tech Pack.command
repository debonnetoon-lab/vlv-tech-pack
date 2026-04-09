#!/bin/bash

# VLV Tech Pack Builder - Launcher
APP_DIR="/Users/toondebonne/.gemini/antigravity/scratch/fashion-tech-pack-v2"
PORT=3000

echo "🚴 VLV Tech Pack Builder opstarten..."

# Check if already running
if lsof -i :$PORT -t &>/dev/null; then
  echo "✅ Server draait al op poort $PORT"
else
  echo "⏳ Server starten..."
  cd "$APP_DIR"
  npm run dev &>/tmp/vlv-techpack.log &
  
  # Wait for server to be ready
  echo "⏳ Wachten tot de server klaar is..."
  for i in {1..30}; do
    if curl -s "http://localhost:$PORT" &>/dev/null; then
      echo "✅ Server klaar!"
      break
    fi
    sleep 1
  done
fi

# Open in Chrome as a standalone app window
echo "🌐 App openen..."
open -n -a "Google Chrome" --args --app="http://localhost:$PORT" --window-size=1400,900

echo ""
echo "✅ VLV Tech Pack Builder is open!"
echo "   Laat dit venster open – de server draait op de achtergrond."
