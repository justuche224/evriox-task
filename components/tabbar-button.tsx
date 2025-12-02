import { icon } from "@/constants/icon";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { PlatformPressable } from "@react-navigation/elements";
import { useLinkBuilder } from "@react-navigation/native";
import React, { useEffect } from "react";
import { GestureResponderEvent, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const TabBarButton = ({
  onPress,
  onLongPress,
  isFocused,
  routeName,
  label,
}: {
  onPress:
    | ((
        e:
          | GestureResponderEvent
          | React.MouseEvent<HTMLAnchorElement, MouseEvent>
      ) => void)
    | undefined;
  onLongPress: ((event: GestureResponderEvent) => void) | null | undefined;
  isFocused: boolean;
  routeName: string;
  label: string;
}) => {
  const colorScheme = useColorScheme();
  const { buildHref } = useLinkBuilder();

  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = withSpring(
      typeof isFocused === "boolean" ? (isFocused ? 1 : 0) : isFocused,
      { duration: 350 }
    );
  }, [scale, isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);
    const top = interpolate(scale.value, [0, 1], [0, 9]);

    return {
      transform: [{ scale: scaleValue }],
      top,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0]);

    return {
      opacity,
    };
  });

  const colors = Colors[colorScheme ?? "light"];

  return (
    <PlatformPressable
      href={buildHref(routeName)}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabbarItem}
    >
      <Animated.View style={animatedIconStyle}>
        {/* @ts-ignore */}
        {icon[routeName]({
          color: isFocused ? colors.tabIconSelected : colors.tabIconDefault,
        })}
      </Animated.View>
      <Animated.Text
        style={[
          {
            color: isFocused ? colors.tabIconSelected : colors.tabIconDefault,
            fontSize: 12,
          },
          animatedTextStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </PlatformPressable>
  );
};

export default TabBarButton;

const styles = StyleSheet.create({
  tabbarItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
});
