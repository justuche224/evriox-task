import { useOnboardingStore } from "@/store/use-onboarding-store";
import { Redirect } from "expo-router";

export default function Index() {
  const hasOnboarded = useOnboardingStore((state) => state.hasOnboarded);

  if (hasOnboarded) {
    return <Redirect href="/(main)" />;
  }

  return <Redirect href="/onboarding" />;
}
