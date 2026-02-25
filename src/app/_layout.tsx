import { useEffect, useState } from "react";
import { LogBox, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useReducedMotion } from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StackHeader } from "../components/shared/StackHeader";
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
import { useSurveyStore } from "../stores/survey";
import { loadBundledDataset } from "../data/loader";
import { ErrorBoundary } from "../components/shared/ErrorBoundary";
import { OfflineBanner } from "../components/shared/OfflineBanner";
import "../i18n";
import "../../global.css";

SplashScreen.preventAutoHideAsync();
LogBox.ignoreAllLogs(true);

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function RootLayout() {
  const loadDataset = useElectionStore((s) => s.loadDataset);
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const privacyConsentVersion = useAppStore((s) => s.privacyConsentVersion);
  const surveyStatus = useSurveyStore((s) => s.status);
  const router = useRouter();
  const segments = useSegments();
  const [initialRouteHandled, setInitialRouteHandled] = useState(false);

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

  // Navigation gate: onboarding → tabs
  useEffect(() => {
    if (!isLoaded) return;

    const inOnboarding = segments[0] === "onboarding";

    // Check onboarding (this now handles privacy under the hood)
    if (!hasCompletedOnboarding) {
      if (!inOnboarding) {
        router.replace("/onboarding");
      }
      return;
    }

    // User has completed onboarding
    if (inOnboarding) {
      // Just finished onboarding, redirect to home
      router.replace("/(tabs)");
      setInitialRouteHandled(true);
      return;
    }

    // Smart routing on app launch for returning users
    if (!initialRouteHandled && segments.length > 0) {
      setInitialRouteHandled(true);

      // Only redirect if they landed on the default tabs index
      if (segments[0] === "(tabs)" && segments.length === 1) {
        const isSurveyFinished = surveyStatus === "results_ready" || surveyStatus === "completed";
        if (!isSurveyFinished) {
          router.replace("/(tabs)/cards");
        } else {
          router.replace("/(tabs)/matches");
        }
      }
    }
  }, [isLoaded, hasCompletedOnboarding, segments, surveyStatus, initialRouteHandled]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GluestackUIProvider>
          <ErrorBoundary>
            <View style={{ flex: 1 }}>
              <OfflineBanner />
              <Stack
                screenOptions={{
                  header: (props) => <StackHeader {...props} />,
                  animation: reduceMotion ? "none" : "slide_from_bottom",
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="onboarding"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="survey" options={{ headerShown: false }} />
                <Stack.Screen
                  name="settings"
                  options={{ title: "Paramètres" }}
                />
              </Stack>
            </View>
            <StatusBar style="light" />
          </ErrorBoundary>
        </GluestackUIProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default RootLayout;
