---
description: Boot the iOS simulator and launch the app for visual testing via MCP
---

# Launch iOS Simulator for Visual Testing

## Prerequisites
- The `ios-simulator` MCP server must be configured in `.gemini/antigravity/mcp_config.json`
- The MCP server PATH must include the `idb` venv: `/Users/vass/.gemini/antigravity/mcp-server-simulator-ios-idb/venv/bin`

## Steps

1. Boot the iPhone 16 simulator
// turbo
```bash
xcrun simctl boot "iPhone 16" 2>/dev/null || true && open -a Simulator
```

2. Start the Expo dev server with `--localhost` (required for simulator connectivity)
```bash
npx expo start --ios --localhost
```
Wait for `iOS Bundled` in the output before proceeding.

3. Verify the MCP server is connected
Use `mcp_ios-simulator_get_booted_sim_id` — should return the iPhone 16 UUID.

4. Take an initial screenshot to confirm the app is loaded
Use `mcp_ios-simulator_screenshot` and view the result.

5. If the app shows the iOS home screen instead of the app, open the Expo URL manually:
// turbo
```bash
xcrun simctl openurl booted "exp://localhost:8081"
```
Wait 8 seconds, then screenshot again.

## Onboarding Dismissal

If the app shows the onboarding screen, dismiss it:

1. Use `mcp_ios-simulator_ui_describe_all` to find button coordinates
2. Tap the "OK" button (typically at center of its AXFrame)
3. Tap "OK, j'ai compris" on the second screen
4. You should land on the Home tab with "Citoyen Informé" header

## Tab Navigation

Tab bar buttons are at `y=770` in the 393×852 logical coordinate space:

| Tab | Center X |
|---|---|
| Accueil | 49 |
| Cartes Swipe | 147 |
| Résultats | 246 |
| Assistant IA | 344 |

Example: `mcp_ios-simulator_ui_tap(x=147, y=794)` → navigates to Cartes Swipe.

## Known Issues

- **Metro must use `--localhost`:** Without it, the simulator can't reach the bundler (LAN IP doesn't work).
