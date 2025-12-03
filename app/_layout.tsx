import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { initDatabase } from "@/lib/database";
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
  const loadTasks = useTaskStore((state) => state.loadTasks);

  useEffect(() => {
    async function initialize() {
      try {
        await initDatabase();
        await loadTasks();
        console.log("App initialized successfully");
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    }

    initialize();
  }, []);

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? CustomDarkTheme : CustomLightTheme}
    >
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
