/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Elegant color palette for AMOLED dark and clean light themes
const tintColorLight = '#2563EB'; // Elegant blue for light mode
const tintColorDark = '#60A5FA'; // Bright blue for dark mode

export const Colors = {
  light: {
    text: '#1F2937', // Rich dark gray for text
    background: '#F9FAFB', // Very light gray for better contrast with white cards
    tint: tintColorLight,
    icon: '#9CA3AF', // Soft gray for icons
    tabIconDefault: '#6B7280', // Darker gray for unselected tabs
    tabIconSelected: '#FFFFFF', // White for selected tab (contrast against blue indicator)
    // Tab bar specific colors
    tabBarBackground: '#F9FAFB', // Very light gray with slight warmth
    tabBarBlur: 'rgba(249, 250, 251, 0.9)', // Light blur overlay
    tabBarShadow: 'rgba(0, 0, 0, 0.08)', // Subtle shadow
    tabBarIndicator: tintColorLight, // Active tab indicator
    tabBarBorder: '#E5E7EB', // Light border
  },
  dark: {
    text: '#F9FAFB', // Almost white for text
    background: '#000000', // Pure AMOLED black
    tint: tintColorDark,
    icon: '#6B7280', // Muted gray for icons
    tabIconDefault: '#6B7280', // Gray for unselected tabs
    tabIconSelected: '#FFFFFF', // Pure white for selected tab (contrast against blue indicator)
    // Tab bar specific colors
    tabBarBackground: '#0A0A0A', // Slightly off-black
    tabBarBlur: 'rgba(10, 10, 10, 0.85)', // Dark blur overlay
    tabBarShadow: 'rgba(0, 0, 0, 0.5)', // Stronger shadow for depth
    tabBarIndicator: tintColorDark, // Active tab indicator
    tabBarBorder: '#1F2937', // Dark border
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
