import { useEffect, useState } from "react";
import { Alert, LogBox, Pressable, Text, View } from "react-native";
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
import { checkMandatoryUpdate } from "../services/mandatory-update";
import {
  FIRST_SURVEY_ROUND,
  useSurveyStore,
} from "../stores/survey";
import { useTranslation } from "react-i18next";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { openExternalUrl } from "../services/open-url";
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
  const candidates = useElectionStore((s) => s.candidates);
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const crashReportingOptIn = useAppStore((s) => s.crashReportingOptIn);
  const ensureRoundCandidateSnapshot = useSurveyStore(
    (s) => s.ensureRoundCandidateSnapshot
  );
  const router = useRouter();
  const segments = useSegments();
  const navigationRef = useNavigationContainerRef();
  const { t } = useTranslation("common");
  const { isConnected } = useNetworkStatus();
  const [initialRouteHandled, setInitialRouteHandled] = useState(false);
  const [mandatoryUpdateUrl, setMandatoryUpdateUrl] = useState<string | null>(null);

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
    if (!isLoaded || candidates.length === 0) return;

    ensureRoundCandidateSnapshot(FIRST_SURVEY_ROUND, candidates);
  }, [candidates, ensureRoundCandidateSnapshot, isLoaded]);

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
    let canceled = false;

    if (!isConnected) return undefined;

    void checkMandatoryUpdate().then((result) => {
      if (canceled) return;
      if (result.isRequired && result.storeUrl) {
        setMandatoryUpdateUrl(result.storeUrl);
      }
    });

    return () => {
      canceled = true;
    };
  }, [isConnected]);

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
              {mandatoryUpdateUrl && (
                <View
                  className="absolute inset-0 bg-black/50 items-center justify-center px-6"
                  pointerEvents="auto"
                >
                  <View className="w-full max-w-md rounded-2xl bg-warm-white p-5">
                    <Text className="font-display-bold text-xl text-civic-navy mb-3">
                      {t("updateRequiredTitle")}
                    </Text>
                    <Text className="font-body text-text-body mb-5">
                      {t("updateRequiredMessage")}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t("updateRequiredButton")}
                      className="rounded-xl px-4 py-3 items-center"
                      style={{ backgroundColor: "#E84855" }}
                      onPress={() => {
                        void (async () => {
                          const opened = await openExternalUrl(mandatoryUpdateUrl);
                          if (!opened) {
                            Alert.alert(
                              t("linkOpenErrorTitle"),
                              t("linkOpenErrorMessage")
                            );
                          }
                        })();
                      }}
                    >
                      <Text className="font-display-semibold text-white">
                        {t("updateRequiredButton")}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
            <StatusBar style="light" />
          </ErrorBoundary>
        </GluestackUIProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
