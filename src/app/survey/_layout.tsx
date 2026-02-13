import { Stack } from "expo-router";

export default function SurveyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="context" />
      <Stack.Screen name="questions" />
      <Stack.Screen name="results" />
    </Stack>
  );
}
