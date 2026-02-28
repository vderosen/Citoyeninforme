import { useEffect, useState } from "react";
import { LogBox, View } from "react-native";
import { Stack, useRouter, useSegments, useNavigationContainerRef } from "expo-router";
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
import { loadBundledDataset } from "../data/loader";
import { ErrorBoundary } from "../components/shared/ErrorBoundary";
import { OfflineBanner } from "../components/shared/OfflineBanner";
import * as Sentry from "@sentry/react-native";
import {
  captureException,
  updateCrashReportingConsent,
  navigationIntegration,
} from "../services/crash-reporting";
import "../i18n";
import "../../global.css";

SplashScreen.preventAutoHideAsync();
LogBox.ignoreAllLogs(true);

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

type GlobalErrorHandler = (error: unknown, isFatal?: boolean) => void;
type ErrorUtilsApi = {
  getGlobalHandler: () => GlobalErrorHandler;
  setGlobalHandler: (handler: GlobalErrorHandler) => void;
};
type GlobalWithErrorUtils = typeof globalThis & {
  ErrorUtils?: ErrorUtilsApi;
};

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === "string" ? error : "Unknown error");
}

function RootLayout() {
  const loadDataset = useElectionStore((s) => s.loadDataset);
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const crashReportingOptIn = useAppStore((s) => s.crashReportingOptIn);
  const router = useRouter();
  const segments = useSegments();
  const navigationRef = useNavigationContainerRef();
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

  useEffect(() => {
    void updateCrashReportingConsent(crashReportingOptIn).catch((error) => {
      console.error("Failed to update crash reporting consent:", error);
    });
  }, [crashReportingOptIn]);

  useEffect(() => {
    if (navigationRef) {
      navigationIntegration.registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);

  useEffect(() => {
    const globalErrorUtils = globalThis as GlobalWithErrorUtils;
    const errorUtils = globalErrorUtils.ErrorUtils;
    if (!errorUtils?.getGlobalHandler || !errorUtils?.setGlobalHandler) {
      return;
    }

    const previousHandler = errorUtils.getGlobalHandler();
    const crashReportingHandler: GlobalErrorHandler = (error, isFatal) => {
      captureException(toError(error), {
        source: "global-error-handler",
        isFatal: String(Boolean(isFatal)),
      });
      previousHandler(error, isFatal);
    };

    errorUtils.setGlobalHandler(crashReportingHandler);
    return () => {
      errorUtils.setGlobalHandler(previousHandler);
    };
  }, []);

  // Navigation gate: first launch -> onboarding, otherwise always land on cards.
  useEffect(() => {
    if (!isLoaded) return;

    const inOnboarding = segments[0] === "onboarding";

    if (!hasCompletedOnboarding) {
      if (!inOnboarding) {
        router.replace("/onboarding");
      }
      return;
    }

    if (inOnboarding) {
      router.replace("/(tabs)/cards");
      setInitialRouteHandled(true);
      return;
    }

    // Force cards as default entry route for returning users.
    if (!initialRouteHandled && segments.length > 0) {
      setInitialRouteHandled(true);
      if (segments[0] === "(tabs)" && segments[1] !== "cards") {
        router.replace("/(tabs)/cards");
      }
    }
  }, [isLoaded, hasCompletedOnboarding, segments, initialRouteHandled]);

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

export default Sentry.wrap(RootLayout);
