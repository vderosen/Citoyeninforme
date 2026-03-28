#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────
# proxy-tunnel.sh
#
# Starts the RAG proxy + an ngrok tunnel, then updates .env
# with the public URL so Expo on mobile can reach the proxy.
#
# Usage:  npm run chat:tunnel
# Then in another terminal:  npx expo start --tunnel -c
# ──────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"
PROXY_PORT="${LLM_PROXY_PORT:-3001}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill "$NGROK_PID" 2>/dev/null || true
  kill "$PROXY_PID" 2>/dev/null || true
  # Restore original URL in .env
  if [[ -n "${ORIGINAL_URL:-}" ]]; then
    sed -i "s|^EXPO_PUBLIC_LLM_PROXY_URL=.*|EXPO_PUBLIC_LLM_PROXY_URL=$ORIGINAL_URL|" "$ENV_FILE"
    echo -e "${GREEN}Restored .env to original URL: $ORIGINAL_URL${NC}"
  fi
  exit 0
}

trap cleanup SIGINT SIGTERM

# Save original URL
ORIGINAL_URL=$(grep '^EXPO_PUBLIC_LLM_PROXY_URL=' "$ENV_FILE" | cut -d= -f2-)

# 1) Start the RAG proxy
echo -e "${YELLOW}Starting RAG proxy on port $PROXY_PORT...${NC}"
node "$SCRIPT_DIR/rag-proxy.js" &
PROXY_PID=$!
sleep 1

# Check proxy started OK
if ! kill -0 "$PROXY_PID" 2>/dev/null; then
  echo -e "${RED}Proxy failed to start. Check GEMINI_API_KEY in .env${NC}"
  exit 1
fi
echo -e "${GREEN}Proxy running (PID $PROXY_PID)${NC}"

# 2) Start ngrok tunnel
echo -e "${YELLOW}Starting ngrok tunnel...${NC}"
ngrok http "$PROXY_PORT" --log=stdout --log-level=warn > /dev/null 2>&1 &
NGROK_PID=$!

# Wait for ngrok to be ready
echo -n "Waiting for tunnel"
for i in $(seq 1 30); do
  sleep 1
  echo -n "."
  TUNNEL_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null \
    | grep -o '"public_url":"https://[^"]*"' \
    | head -1 \
    | cut -d'"' -f4) || true
  if [[ -n "${TUNNEL_URL:-}" ]]; then
    break
  fi
done
echo ""

if [[ -z "${TUNNEL_URL:-}" ]]; then
  echo -e "${RED}Failed to start ngrok tunnel. Is ngrok configured?${NC}"
  echo -e "${RED}Run 'ngrok config add-authtoken <token>' if needed.${NC}"
  kill "$PROXY_PID" 2>/dev/null || true
  kill "$NGROK_PID" 2>/dev/null || true
  exit 1
fi

# 3) Update .env with tunnel URL
sed -i "s|^EXPO_PUBLIC_LLM_PROXY_URL=.*|EXPO_PUBLIC_LLM_PROXY_URL=$TUNNEL_URL|" "$ENV_FILE"

echo ""
echo -e "${GREEN}All good! Proxy + tunnel running.${NC}"
echo -e "  Proxy:  http://localhost:$PROXY_PORT"
echo -e "  Tunnel: ${GREEN}$TUNNEL_URL${NC}"
echo -e "  .env updated (will restore on Ctrl+C)"
echo ""
echo -e "${YELLOW}Now start Expo in another terminal:${NC}"
echo -e "  npx expo start --tunnel -c"
echo ""

# Keep running until interrupted
wait "$PROXY_PID" 2>/dev/null || true
