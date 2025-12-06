import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import Feather from "@react-native-vector-icons/feather";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Feature data for step 2
const features = [
  {
    icon: "calendar" as const,
    title: "Timeline View",
    description: "See all your tasks organized by date in a beautiful timeline",
  },
  {
    icon: "check-circle" as const,
    title: "Task Management",
    description: "Create, edit, and complete tasks with ease",
  },
  {
    icon: "image" as const,
    title: "Image Attachments",
    description: "Add photos to your tasks to remember every detail",
  },
];

// Welcome Step Component
const WelcomeStep = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Floating animation for the icon
  const floatY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <View style={styles.stepContainer}>
      <Animated.View
        entering={FadeInUp.delay(200).springify()}
        style={[styles.iconContainer, floatingStyle]}
      >
        <LinearGradient
          colors={[colors.tint, "#3B82F6"]}
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Feather name="check-square" size={64} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <ThemedText style={styles.welcomeTitle}>Welcome to Taskify</ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).springify()}>
        <ThemedText style={styles.welcomeSubtitle}>
          Your personal task manager that helps you stay organized and
          productive every day.
        </ThemedText>
      </Animated.View>
    </View>
  );
};

// Features Step Component
const FeaturesStep = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.stepContainer}>
      <Animated.View entering={FadeInUp.delay(100).springify()}>
        <ThemedText style={styles.sectionTitle}>What you'll love</ThemedText>
      </Animated.View>

      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <Animated.View
            key={feature.title}
            entering={FadeInDown.delay(200 + index * 150).springify()}
            style={[
              styles.featureCard,
              {
                backgroundColor: colorScheme === "dark" ? "#1A1A1A" : "#FFFFFF",
                borderColor: colorScheme === "dark" ? "#2D2D2D" : "#E5E7EB",
              },
            ]}
          >
            <View
              style={[
                styles.featureIconWrapper,
                { backgroundColor: `${colors.tint}15` },
              ]}
            >
              <Feather name={feature.icon} size={24} color={colors.tint} />
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>
                {feature.title}
              </ThemedText>
              <ThemedText style={styles.featureDescription}>
                {feature.description}
              </ThemedText>
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

// Username Step Component
const UsernameStep = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const username = useOnboardingStore((s) => s.username);
  const setUsername = useOnboardingStore((s) => s.setUsername);

  return (
    <View style={styles.stepContainer}>
      <Animated.View entering={FadeInUp.delay(100).springify()}>
        <ThemedText style={styles.sectionTitle}>Almost there!</ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <ThemedText style={styles.inputLabel}>
          What should we call you?
        </ThemedText>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(300).springify()}
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colorScheme === "dark" ? "#1A1A1A" : "#FFFFFF",
            borderColor: colorScheme === "dark" ? "#2D2D2D" : "#E5E7EB",
          },
        ]}
      >
        <Feather
          name="user"
          size={24}
          color={colors.icon}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          placeholder="Enter your name"
          placeholderTextColor={colors.icon}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="words"
          autoCorrect={false}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <ThemedText style={styles.inputHint}>
          This will be used for display and stays on your devices
        </ThemedText>
      </Animated.View>
    </View>
  );
};

// Dot Indicator Component
const DotIndicator = ({ currentStep }: { currentStep: number }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.dotsContainer}>
      {[0, 1, 2].map((step) => (
        <View
          key={step}
          style={[
            styles.dot,
            {
              backgroundColor:
                step === currentStep
                  ? colors.tint
                  : colorScheme === "dark"
                  ? "#2D2D2D"
                  : "#E5E7EB",
              width: step === currentStep ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );
};

// Main Onboarding Screen
export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const currentStep = useOnboardingStore((s) => s.currentStep);
  const username = useOnboardingStore((s) => s.username);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  const handleNext = async () => {
    if (currentStep === 2) {
      // Complete onboarding
      if (username.trim()) {
        await completeOnboarding();
        router.replace("/(main)");
      }
    } else {
      nextStep();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      prevStep();
    }
  };

  const isNextDisabled = currentStep === 2 && !username.trim();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Skip button (only on first two screens) */}
        {currentStep < 2 && (
          <Animated.View
            entering={FadeIn.delay(500)}
            exiting={FadeOut}
            style={styles.skipContainer}
          >
            <Pressable
              onPress={() => useOnboardingStore.getState().setStep(2)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <ThemedText style={[styles.skipText, { color: colors.tint }]}>
                Skip
              </ThemedText>
            </Pressable>
          </Animated.View>
        )}

        {/* Step Content */}
        <View style={styles.contentContainer}>
          <Animated.View
            key={currentStep}
            entering={SlideInRight.springify()}
            exiting={SlideOutLeft.springify()}
            style={styles.stepWrapper}
          >
            {currentStep === 0 && <WelcomeStep />}
            {currentStep === 1 && <FeaturesStep />}
            {currentStep === 2 && <UsernameStep />}
          </Animated.View>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomContainer}>
          <DotIndicator currentStep={currentStep} />

          <View style={styles.navigationRow}>
            {/* Back Button - only show after step 0 */}
            {currentStep > 0 && (
              <Pressable
                onPress={handleBack}
                style={({ pressed }) => [
                  styles.backButton,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#1A1A1A" : "#F3F4F6",
                    borderColor: colorScheme === "dark" ? "#2D2D2D" : "#E5E7EB",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Feather name="arrow-left" size={24} color={colors.text} />
              </Pressable>
            )}

            {/* Next/Get Started Button */}
            <Pressable
              onPress={handleNext}
              disabled={isNextDisabled}
              style={({ pressed }) => [
                styles.nextButton,
                {
                  opacity: isNextDisabled ? 0.5 : pressed ? 0.8 : 1,
                  marginLeft: currentStep > 0 ? 16 : 0,
                },
              ]}
            >
              <LinearGradient
                colors={[colors.tint, "#3B82F6"]}
                style={styles.nextButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ThemedText style={styles.nextButtonText}>
                  {currentStep === 2 ? "Get Started" : "Next"}
                </ThemedText>
                <Feather
                  name={currentStep === 2 ? "check" : "arrow-right"}
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  skipContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 20,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stepWrapper: {
    width: "100%",
  },
  stepContainer: {
    alignItems: "center",
    paddingHorizontal: 8,
  },

  // Welcome Step
  iconContainer: {
    marginBottom: 40,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 17,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 26,
    paddingHorizontal: 16,
  },

  // Features Step
  sectionTitle: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 32,
    letterSpacing: -0.3,
  },
  featuresContainer: {
    width: "100%",
    gap: 16,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  featureIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.6,
    lineHeight: 20,
  },

  // Username Step
  inputLabel: {
    fontSize: 18,
    fontWeight: "500",
    opacity: 0.7,
    marginBottom: 24,
    textAlign: "center",
  },
  inputWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
  },
  inputHint: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: "center",
  },

  // Bottom Navigation
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  navigationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  nextButton: {
    flex: 1,
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    gap: 8,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
