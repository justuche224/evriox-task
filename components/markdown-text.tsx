import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MarkdownIt from "markdown-it";
import React, { useMemo } from "react";
import { Linking, Platform, StyleSheet, TextStyle } from "react-native";
import Markdown from "react-native-markdown-display";

interface MarkdownTextProps {
  children: string;
  style?: TextStyle;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({
  children,
  style,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const markdownIt = useMemo(
    () =>
      new MarkdownIt({
        linkify: true,
        typographer: true,
      }),
    []
  );

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Error opening URL:", err)
    );
    return true;
  };

  const markdownStyles = StyleSheet.create({
    body: {
      color: colors.text,
      fontSize: 16,
      lineHeight: 24,
      ...(style as object),
    },
    text: {
      color: colors.text,
    },
    strong: {
      fontWeight: "700" as const,
      color: colors.text,
    },
    em: {
      fontStyle: "italic" as const,
      color: colors.text,
    },
    link: {
      color: colors.tint,
      textDecorationLine: "underline" as const,
    },
    bullet_list: {
      marginVertical: 4,
    },
    ordered_list: {
      marginVertical: 4,
    },
    list_item: {
      flexDirection: "row" as const,
      marginVertical: 2,
    },
    bullet_list_icon: {
      color: colors.text,
      marginRight: 8,
      fontSize: 16,
    },
    ordered_list_icon: {
      color: colors.text,
      marginRight: 8,
      fontSize: 16,
    },
    paragraph: {
      marginVertical: 0,
      flexWrap: "wrap" as const,
    },
    heading1: {
      fontSize: 24,
      fontWeight: "700" as const,
      color: colors.text,
      marginVertical: 8,
    },
    heading2: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.text,
      marginVertical: 6,
    },
    heading3: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: colors.text,
      marginVertical: 4,
    },
    code_inline: {
      backgroundColor: colorScheme === "dark" ? "#3D3D3D" : "#E5E7EB",
      color: colors.text,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      fontSize: 14,
    },
    fence: {
      backgroundColor: colorScheme === "dark" ? "#3D3D3D" : "#E5E7EB",
      color: colors.text,
      padding: 12,
      borderRadius: 8,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      fontSize: 14,
      marginVertical: 8,
    },
    blockquote: {
      backgroundColor: colorScheme === "dark" ? "#2D2D2D" : "#F3F4F6",
      borderLeftWidth: 4,
      borderLeftColor: colors.tint,
      paddingLeft: 12,
      paddingVertical: 8,
      marginVertical: 8,
    },
  });

  return (
    <Markdown
      style={markdownStyles}
      onLinkPress={handleLinkPress}
      mergeStyle={true}
      markdownit={markdownIt}
    >
      {children}
    </Markdown>
  );
};
