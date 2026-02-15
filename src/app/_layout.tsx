import { useEffect } from "react";
import { View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useElectionStore } from "../stores/election";
import { useAppStore } from "../stores/app";
import { loadBundledDataset } from "../data/loader";
import { ContextBar } from "../components/shell/ContextBar";
import "../i18n";
import "../../global.css";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const loadDataset = useElectionStore((s) => s.loadDataset);
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    try {
      const dataset = loadBundledDataset();
      loadDataset(dataset);
    } catch (error) {
      console.error("Failed to load election dataset:", error);
    }
  }, [loadDataset]);

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    const inOnboarding = segments[0] === "onboarding";

    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace("/onboarding");
    } else if (hasCompletedOnboarding && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [isLoaded, hasCompletedOnboarding, segments]);

  return (
    <SafeAreaProvider>
      <GluestackUIProvider>
        <View style={{ flex: 1 }}>
          {isLoaded && hasCompletedOnboarding && <ContextBar />}
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="candidate/[id]" />
            <Stack.Screen name="comparison" />
            <Stack.Screen name="survey" />
          </Stack>
        </View>
        <StatusBar style="auto" />
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
