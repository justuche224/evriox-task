import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Feather from "@react-native-vector-icons/feather";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ThemedText } from "./themed-text";

interface ImageViewerProps {
  visible: boolean;
  imageUris: string[];
  initialIndex: number;
  onClose: () => void;
}

const { width, height } = Dimensions.get("window");

export function ImageViewer({
  visible,
  imageUris,
  initialIndex,
  onClose,
}: ImageViewerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Update index when scrolling
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color="#FFFFFF" />
          </Pressable>
          <ThemedText style={styles.counter}>
            {currentIndex + 1} / {imageUris.length}
          </ThemedText>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          contentOffset={{ x: initialIndex * width, y: 0 }}
        >
          {imageUris.map((uri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image
                source={{ uri }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  closeButton: {
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
  },
  counter: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageContainer: {
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
