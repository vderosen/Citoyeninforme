# App Store Screenshots — Process Notes

**Date:** 2026-02-24  
**Output:** `~/Desktop/screenshots/` (11 files)

---

## Required Sizes (Apple 2026)

Only two device sizes are mandatory — smaller sizes auto-scale:

| Device | Size (portrait) | Covers |
|---|---|---|
| iPhone 6.9" | 1320 x 2868 px | iPhone 16/15/14 Pro Max, iPhone Air |
| iPad 13" | 2048 x 2732 px | All iPad Pro M4/M5, iPad Air M2/M3 |

---

## Screenshots Taken

### iPhone (1320 x 2868) — 6 files

| File | Screen |
|---|---|
| `iphone-01-home.png` | Home — election overview, candidate carousel, key dates |
| `iphone-02-cards.png` | Cartes Swipe — survey card with 5 vote buttons |
| `iphone-03-results.png` | Results — podium + full alignment ranking |
| `iphone-04-candidates.png` | Candidates — grid with theme tabs |
| `iphone-05-assistant.png` | Assistant IA — chat conversation |
| `iphone-06-modal.png` | Proposal explanation modal |

### iPad (2048 x 2732) — 5 files

| File | Screen |
|---|---|
| `ipad-01-home.png` | Home — all 6 candidates visible, full info |
| `ipad-02-cards.png` | Cartes Swipe — card with tutorial overlay |
| `ipad-03-results.png` | Results — podium + ranking |
| `ipad-04-candidates.png` | Candidates — grid with theme tabs |
| `ipad-05-assistant.png` | Assistant IA — conversation about Chikirou |

---

## How to Reproduce

### Simulators

| Purpose | Simulator name | UDID |
|---|---|---|
| iPhone | Screenshot iPhone 16 Pro Max | `1D28C88C-6BC0-4B00-BB36-044DA8B6D566` |
| iPad | Screenshot iPad Pro 12.9 | `0FA51EEE-D3AF-4129-AF88-4F42169CFFA8` |

### Steps

1. **Boot simulators:**
   ```bash
   xcrun simctl boot 1D28C88C-6BC0-4B00-BB36-044DA8B6D566
   xcrun simctl boot 0FA51EEE-D3AF-4129-AF88-4F42169CFFA8
   ```

2. **Start Expo dev server:**
   ```bash
   npx expo start --clear
   ```

3. **Open app in Expo Go** (already installed on both simulators):
   ```bash
   xcrun simctl openurl <UDID> "exp://localhost:8081"
   ```

4. **Clean up status bar:**
   ```bash
   xcrun simctl status_bar <UDID> override --time "9:41" --batteryState charged --batteryLevel 100 --cellularMode active --cellularBars 4
   ```

5. **Navigate via deep links** (Expo Go format):
   ```bash
   xcrun simctl openurl <UDID> "exp://localhost:8081/--/(tabs)"
   xcrun simctl openurl <UDID> "exp://localhost:8081/--/(tabs)/cards"
   xcrun simctl openurl <UDID> "exp://localhost:8081/--/(tabs)/matches"
   xcrun simctl openurl <UDID> "exp://localhost:8081/--/(tabs)/candidates"
   xcrun simctl openurl <UDID> "exp://localhost:8081/--/(tabs)/assistant"
   ```

6. **Capture:**
   ```bash
   xcrun simctl io <UDID> screenshot ~/Desktop/screenshots/<name>.png
   ```

---

## Lessons Learned / Known Issues

### Native build (`expo run:ios`) does not work on this machine right now

- **Cause:** CocoaPods 1.16+ is required for `react-native-safe-area-context` (uses `visionos` platform spec), but Xcode 26.2 beta has its own compatibility issues with the current React Native 0.81.5 setup.
- **Workaround:** Use **Expo Go** (SDK 54, already installed on both simulators). All features work except those requiring custom native modules not bundled in Expo Go.

### CI=true disables Metro hot reload

- Cursor terminals run with `CI=true`, which puts Metro into a mode where file changes require a full server restart + cache clear.
- If you need to make a source code change and re-screenshot, always run: `npx expo start --clear` and relaunch the app.

### AsyncStorage state injection

- Survey results and assistant conversation history are stored in Expo Go's AsyncStorage at:
  ```
  ~/Library/Developer/CoreSimulator/Devices/<UDID>/data/Containers/Data/Application/<AppID>/Documents/ExponentExperienceData/@vderosen/lucide/RCTAsyncLocalStorage/manifest.json
  ```
- The `<AppID>` folder changes on reinstall. Find it with:
  ```bash
  xcrun simctl get_app_container <UDID> host.exp.Exponent data
  ```
- **Important:** Zustand flushes state to disk on app shutdown. Always **terminate the app first**, then inject, then relaunch.
  ```bash
  xcrun simctl terminate <UDID> host.exp.Exponent
  sleep 3
  # edit manifest.json here
  xcrun simctl openurl <UDID> "exp://localhost:8081/--/(tabs)/matches"
  ```

### Tutorial overlay is local state

- `hasSeenSwipeTutorial` in the app store is read on mount, but the actual tutorial visibility uses a local `useState(false)` in `cards.tsx` — it always shows on fresh mount regardless of the stored value.
- To skip it for screenshots, either tap it away manually or temporarily patch `cards.tsx` to `useState(true)`.
