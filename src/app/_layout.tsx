import { useEffect } from "react";
import { LogBox, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useReducedMotion } from "react-native-reanimated";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import {
  Inter_400Regular,
  Inter_500Medium,
} from "@expo-google-fonts/inter";
import { useElectionStore } from "../stores/election";
import { useAppStore } from "../stores/app";
import { loadBundledDataset } from "../data/loader";
import "../i18n";
import "../../global.css";

SplashScreen.preventAutoHideAsync();
LogBox.ignoreLogs([
  "SafeAreaView has been deprecated and will be removed in a future release.",
]);

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const loadDataset = useElectionStore((s) => s.loadDataset);
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const router = useRouter();
  const segments = useSegments();

  const reduceMotion = useReducedMotion();

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
  });

  useEffect(() => {
    try {
      const dataset = loadBundledDataset();
      loadDataset(dataset);
    } catch (error) {
      console.error("Failed to load election dataset:", error);
    }
  }, [loadDataset]);

  useEffect(() => {
    if (isLoaded && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded, fontsLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    const inOnboarding = segments[0] === "onboarding";

    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace("/onboarding");
    } else if (hasCompletedOnboarding && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [isLoaded, hasCompletedOnboarding, segments]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GluestackUIProvider>
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: true,
              headerStyle: { backgroundColor: "#1B2A4A" },
              headerTintColor: "#FAFAF8",
              headerTitleStyle: {
                fontFamily: "SpaceGrotesk_600SemiBold",
                fontSize: 17,
                color: "#FAFAF8",
              },
              headerShadowVisible: false,
              animation: reduceMotion ? "none" : "slide_from_bottom",
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="candidate/[id]" />
            <Stack.Screen name="comparison" options={{ title: "Comparaison" }} />
            <Stack.Screen name="survey" options={{ headerShown: false }} />
          </Stack>
        </View>
        <StatusBar style="light" />
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
