# Lucide_v2 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-13

## Active Technologies
- TypeScript 5.x on React Native 0.80+ (Expo SDK 54+) + Expo (managed workflow), Expo Router, Zustand, react-i18next, gluestack-ui v3, NativeWind v4, react-native-mmkv, expo-sqlite, openai (Node SDK) (001-civic-election-app)
- MMKV for key-value (user profile, preferences); SQLite for structured election dataset; bundled JSON for initial data seeding (001-civic-election-app)
- TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54) + Expo Router 6.0, Zustand 5.0.3, react-i18next 15.4.1, NativeWind 4.1.23, @gluestack-ui/themed 1.1.73, react-native-mmkv, expo-sqlite 16.0.3 (002-frontend-redesign)
- MMKV (user preferences, survey results), SQLite (election dataset on native), bundled JSON (seed data), localStorage (web fallback) (002-frontend-redesign)
- TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54) + Expo Router 6.0, NativeWind 4.1.23, @gluestack-ui/themed 1.1.73, @expo/vector-icons 15.0.3, react-native-safe-area-context 5.6.0 (003-ui-polish)
- N/A (no storage changes) (003-ui-polish)
- TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54) + NativeWind 4.1.23, Tailwind CSS 3.4.17, react-native-reanimated 4.1.1, expo-font 14.0.11, @expo-google-fonts/space-grotesk (NEW), @expo-google-fonts/inter (NEW), react-native-svg (Expo built-in) (004-neighborhood-pulse-redesign)
- N/A — no storage changes (004-neighborhood-pulse-redesign)
- TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54, managed workflow) + Expo Router 6.0, Zustand 5.0.3, react-i18next 15.4.1, NativeWind 4.1.23 + Tailwind CSS 3.4.17, @gluestack-ui/themed 1.1.73, react-native-reanimated 4.1.1, @expo/vector-icons 15.0.3 (005-production-readiness)
- AsyncStorage (user preferences, survey results via Zustand persist), SQLite via expo-sqlite 16.0.3 (election dataset), bundled JSON (seed data), MMKV referenced but currently using AsyncStorage adapter in `storage.native.ts` (005-production-readiness)
- TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54) + Expo Router 6.0, NativeWind 4.1.23, react-native-reanimated 4.1.1, @expo/vector-icons 15.0.3, react-i18next 15.4.1 (006-onboarding-redesign)
- AsyncStorage via Zustand persist (existing `hasCompletedOnboarding` flag in `app-state` key) (006-onboarding-redesign)
- TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54) + Expo Router 6.0, Zustand 5.0.3, react-i18next 15.4.1, NativeWind 4.1.23, @gluestack-ui/themed 1.1.73, react-native-reanimated 4.1.1 (007-ui-cleanup-ux)
- AsyncStorage (native) / localStorage (web) via Zustand persist middleware; key `"assistant-state"` for chat data (007-ui-cleanup-ux)
- TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54) + Expo Router 6.0, Zustand 5.0.3, react-i18next 15.4.1, NativeWind 4.1.23, @gluestack-ui/themed 1.1.73, react-native-reanimated 4.1.1, @expo/vector-icons 15.0.3 (Ionicons), react-native-markdown-display (NEW) (008-assistant-chat-redesign)
- AsyncStorage (native) / localStorage (web) via Zustand persist middleware; key `"assistant-state"` — no changes (008-assistant-chat-redesign)
- TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54) + NativeWind 4.1.23, react-native-reanimated 4.1.1, @expo/vector-icons 15.0.3, react-i18next 15.4.1 (010-candidates-grid-redesign)
- TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54) + Expo Router 6.0, NativeWind 4.1.23, @expo/vector-icons 15.0.3 (Ionicons), react-i18next 15.4.1 (013-comparison-redesign)
- TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54) + @sentry/react-native, expo-file-system, zustand 5.0.3, @react-native-async-storage/async-storage, expo-router 6.0, react-i18next 15.4.1 (014-fix-critical-bugs)
- AsyncStorage (native) / localStorage (web) via Zustand persist middleware; keys: `app-state`, `survey-state`, `assistant-state`, `feedback_entries` (014-fix-critical-bugs)
- TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54) + Expo Router 6.0, Zustand 5.0.3, react-i18next 15.4.1, NativeWind 4.1.23, react-native-reanimated 4.1.1, @expo/vector-icons 15.0.3 (Ionicons) (017-rapid-debate-mode)
- In-memory only (Zustand state, NOT persisted). Debate history is ephemeral. (017-rapid-debate-mode)
- TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54) + Expo Router 6.0, NativeWind 4.1.23, react-native-reanimated 4.1.1, @expo/vector-icons 15.0.3 (Ionicons), react-i18next 15.4.1, Zustand 5.0.3 (018-unified-candidates-view)
- N/A — selection state is ephemeral (local component state, not persisted) (018-unified-candidates-view)
- TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54) + Expo Router 6.0, Zustand 5.0.3, react-i18next 15.4.1, NativeWind 4.1.23, react-native-reanimated 4.1.1, react-native-gesture-handler 2.28.0 (transitive → add as direct dependency) (019-swipe-survey-redesign)
- AsyncStorage via Zustand persist (key: `survey-state`) (019-swipe-survey-redesign)
- Bundled JSON files (static imports via Metro bundler), Zustand in-memory store (021-data-restructuring)

- TypeScript 5.x on React Native 0.80+ (Expo SDK 54+) + Expo (managed workflow), Expo Router, Zustand, react-i18next, gluestack-ui v3, NativeWind v4, react-native-mmkv, expo-sqlite (001-civic-election-app)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x on React Native 0.80+ (Expo SDK 54+): Follow standard conventions

## Recent Changes
- 021-data-restructuring: Added TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54) + Expo Router 6.0, Zustand 5.0.3, react-i18next 15.4.1, NativeWind 4.1.23
- 019-swipe-survey-redesign: Added TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54) + Expo Router 6.0, Zustand 5.0.3, react-i18next 15.4.1, NativeWind 4.1.23, react-native-reanimated 4.1.1, react-native-gesture-handler 2.28.0 (transitive → add as direct dependency)
- 018-unified-candidates-view: Added TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54) + Expo Router 6.0, NativeWind 4.1.23, react-native-reanimated 4.1.1, @expo/vector-icons 15.0.3 (Ionicons), react-i18next 15.4.1, Zustand 5.0.3


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
