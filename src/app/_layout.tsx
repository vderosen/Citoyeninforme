import { useEffect } from "react";
import { LogBox, Pressable, Text, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Sentry from "@sentry/react-native";
import * as SplashScreen from "expo-splash-screen";
import { useReducedMotion } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
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
import {
  updateCrashReportingConsent,
  captureException,
} from "../services/crash-reporting";
import { PRIVACY_POLICY_VERSION } from "./privacy-consent";
import "../i18n";
import "../../global.css";

SplashScreen.preventAutoHideAsync();
LogBox.ignoreLogs([
  "SafeAreaView has been deprecated and will be removed in a future release.",
]);

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function RootLayout() {
  const { t } = useTranslation("common");
  const loadDataset = useElectionStore((s) => s.loadDataset);
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const privacyConsentVersion = useAppStore((s) => s.privacyConsentVersion);
  const crashReportingOptIn = useAppStore((s) => s.crashReportingOptIn);
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

  // Initialize crash reporting (re-fires on rehydration + runtime toggle)
  useEffect(() => {
    updateCrashReportingConsent(crashReportingOptIn);
  }, [crashReportingOptIn]);

  // Set up global error handler
  useEffect(() => {
    const defaultHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      captureException(error, { fatal: String(isFatal ?? false) });
      if (isFatal) {
        defaultHandler(error, isFatal);
      }
    });
  }, []);

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

  // Navigation gate: privacy consent → onboarding → tabs
  useEffect(() => {
    if (!isLoaded) return;

    const inConsent = segments[0] === "privacy-consent";
    const inOnboarding = segments[0] === "onboarding";

    // Check privacy consent first
    if (privacyConsentVersion !== PRIVACY_POLICY_VERSION) {
      if (!inConsent) {
        router.replace("/privacy-consent");
      }
      return;
    }

    // Then check onboarding
    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace("/onboarding");
    } else if (hasCompletedOnboarding && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [isLoaded, hasCompletedOnboarding, privacyConsentVersion, segments]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GluestackUIProvider>
        <ErrorBoundary>
          <View style={{ flex: 1 }}>
            <OfflineBanner />
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
                headerBackButtonDisplayMode: "minimal",
                headerLeft: ({ canGoBack }) =>
                  canGoBack ? (
                    <Pressable
                      onPress={() => router.back()}
                      accessibilityRole="button"
                      accessibilityLabel={t("back")}
                      className="ml-2 flex-row items-center rounded-full px-3 py-2"
                      hitSlop={8}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.72 : 1,
                      })}
                    >
                      <Ionicons
                        name="chevron-back"
                        size={18}
                        color="#FAFAF8"
                      />
                      <Text
                        className="ml-1 font-body-medium text-sm text-text-inverse"
                      >
                        {t("back")}
                      </Text>
                    </Pressable>
                  ) : null,
                animation: reduceMotion ? "none" : "slide_from_bottom",
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="onboarding"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="privacy-consent"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="candidate/[id]" />
              <Stack.Screen
                name="comparison"
                options={{ title: "Comparaison" }}
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
  );
}

export default Sentry.wrap(RootLayout);
