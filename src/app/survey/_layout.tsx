import { Stack } from "expo-router";

export default function SurveyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="intro" />
      <Stack.Screen name="questions" />
      <Stack.Screen name="results" />
    </Stack>
  );
}
