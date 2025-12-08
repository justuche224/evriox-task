import { ConfigContext, ExpoConfig } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) return 'com.evrioxtask.dev';
  if (IS_PREVIEW) return 'com.evrioxtask.preview';
  return 'com.evrioxtask';
};

const getAppName = () => {
  if (IS_DEV) return 'Evriox Task (Dev)';
  if (IS_PREVIEW) return 'Evriox Task (Preview)';
  return 'Evriox Task';
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "evriox-task",
  version: "0.0.1",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "evrioxtask",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
    icon: {
      light: "./assets/icons/ios/ios-light.png",
      dark: "./assets/icons/ios/ios-dark.png",
      tinted: "./assets/icons/ios/ios-tinted.png"
    }
  },
  android: {
    package: getUniqueIdentifier(),
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/icons/android/adaptive-icon.png",
      backgroundImage: "./assets/icons/android/adaptive-icon.png",
      // monochromeImage: "./assets/icons/android/android-icon-monochrome.png"
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/icons/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000"
        }
      }
    ],
    "expo-sqlite",
    "expo-font",
    "expo-web-browser"
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true
  },
  extra: {
    eas: {
      projectId: "b9c54a5d-899b-41f4-9ac2-938a67ca3cb9"
    }
  }
});
