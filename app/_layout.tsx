import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { initDatabase } from "@/lib/database";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import { useTaskStore } from "@/store/use-task-store";

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.tint,
    background: Colors.light.background,
    card: Colors.light.tabBarBackground,
    text: Colors.light.text,
    border: Colors.light.tabBarBorder,
    notification: Colors.light.tint,
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    card: Colors.dark.tabBarBackground,
    text: Colors.dark.text,
    border: Colors.dark.tabBarBorder,
    notification: Colors.dark.tint,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const loadTasks = useTaskStore((state) => state.loadTasks);

  const hasOnboarded = useOnboardingStore((state) => state.hasOnboarded);
  const isLoading = useOnboardingStore((state) => state.isLoading);
  const loadOnboardingState = useOnboardingStore(
    (state) => state.loadOnboardingState
  );

  useEffect(() => {
    async function initialize() {
      try {
        // Load onboarding state first
        await loadOnboardingState();
        await initDatabase();
        await loadTasks();
        console.log("App initialized successfully");
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    }

    initialize();
  }, []);

  // Show loading screen while checking onboarding state
  if (isLoading) {
    return (
      <ThemeProvider
        value={colorScheme === "dark" ? CustomDarkTheme : CustomLightTheme}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
          }}
        >
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? CustomDarkTheme : CustomLightTheme}
    >
      <Stack screenOptions={{ headerShown: false }}>
        {hasOnboarded ? (
          <Stack.Screen name="(main)" />
        ) : (
          <Stack.Screen name="onboarding" />
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
