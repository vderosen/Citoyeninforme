import { SafeAreaView } from "react-native-safe-area-context";
import { OnboardingPager } from "../components/onboarding/OnboardingPager";

export default function OnboardingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-warm-white">
      <OnboardingPager />
    </SafeAreaView>
  );
}
