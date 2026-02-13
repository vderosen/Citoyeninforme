import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { useElectionStore } from "../stores/election";
import { loadBundledDataset } from "../data/loader";
import { ChatbotFAB } from "../components/chatbot/ChatbotFAB";
import { ChatbotPanel } from "../components/chatbot/ChatbotPanel";
import "../i18n";
import "../../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const loadDataset = useElectionStore((s) => s.loadDataset);
  const isLoaded = useElectionStore((s) => s.isLoaded);

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

  return (
    <GluestackUIProvider>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="learn" />
          <Stack.Screen name="survey" />
        </Stack>
        <ChatbotPanel />
        <ChatbotFAB />
      </View>
      <StatusBar style="auto" />
    </GluestackUIProvider>
  );
}
