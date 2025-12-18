import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { Linking, StyleSheet, Text, TextProps } from "react-native";

interface LinkifiedTextProps extends TextProps {
  children: string;
  lightColor?: string;
  darkColor?: string;
  linkColor?: string;
}

// URL regex pattern that matches http, https, and www URLs
const URL_REGEX =
  /(https?:\/\/[^\s<>[\]{}|\\^]+|www\.[^\s<>[\]{}|\\^]+\.[^\s<>[\]{}|\\^]+)/gi;

export const LinkifiedText: React.FC<LinkifiedTextProps> = ({
  children,
  style,
  lightColor,
  darkColor,
  linkColor,
  ...rest
}) => {
  const textColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "text"
  );
  const tintColor = useThemeColor({}, "tint");
  const finalLinkColor = linkColor || tintColor;

  const handleLinkPress = async (url: string) => {
    // Add https:// if the URL starts with www.
    const finalUrl = url.startsWith("www.") ? `https://${url}` : url;

    try {
      const canOpen = await Linking.canOpenURL(finalUrl);
      if (canOpen) {
        await Linking.openURL(finalUrl);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  const renderContent = () => {
    if (typeof children !== "string") {
      return children;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // Reset regex lastIndex
    URL_REGEX.lastIndex = 0;

    while ((match = URL_REGEX.exec(children)) !== null) {
      // Add text before the URL
      if (match.index > lastIndex) {
        parts.push(
          <Text key={`text-${lastIndex}`}>
            {children.substring(lastIndex, match.index)}
          </Text>
        );
      }

      // Add the URL as a clickable link
      const url = match[0];
      parts.push(
        <Text
          key={`link-${match.index}`}
          style={[styles.link, { color: finalLinkColor }]}
          onPress={() => handleLinkPress(url)}
        >
          {url}
        </Text>
      );

      lastIndex = match.index + url.length;
    }

    // Add remaining text after the last URL
    if (lastIndex < children.length) {
      parts.push(
        <Text key={`text-${lastIndex}`}>{children.substring(lastIndex)}</Text>
      );
    }

    return parts.length > 0 ? parts : children;
  };

  return (
    <Text style={[{ color: textColor }, style]} selectable={true} {...rest}>
      {renderContent()}
    </Text>
  );
};

const styles = StyleSheet.create({
  link: {
    textDecorationLine: "underline",
  },
});
