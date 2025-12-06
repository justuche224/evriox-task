import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import Feather from "@react-native-vector-icons/feather";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const EditProfileModal = ({
  visible,
  onClose,
}: EditProfileModalProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const storedUsername = useOnboardingStore((state) => state.username);
  const updateUsername = useOnboardingStore((state) => state.updateUsername);

  const [username, setUsername] = useState(storedUsername);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setUsername(storedUsername);
    }
  }, [visible, storedUsername]);

  const handleSave = async () => {
    if (!username.trim()) return;

    setIsLoading(true);
    try {
      await updateUsername(username);
      onClose();
    } catch (error) {
      console.error("Failed to update username", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Backdrop */}
        {visible && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.backdrop}
          >
            <Pressable style={styles.backdropPressable} onPress={onClose} />
          </Animated.View>
        )}

        {/* Modal Content */}
        {visible && (
          <Animated.View
            entering={SlideInDown.springify()}
            exiting={SlideOutDown}
            style={[
              styles.content,
              {
                backgroundColor: colorScheme === "dark" ? "#1A1A1A" : "#FFFFFF",
              },
            ]}
          >
            <View style={styles.header}>
              <ThemedText style={styles.title}>Edit Profile</ThemedText>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color={colors.icon} />
              </Pressable>
            </View>

            <View style={styles.formContainer}>
              <ThemedText style={styles.label}>Name</ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2D2D2D" : "#F3F4F6",
                    borderColor: colorScheme === "dark" ? "#404040" : "#E5E7EB",
                  },
                ]}
              >
                <Feather
                  name="user"
                  size={20}
                  color={colors.icon}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.icon}
                  autoFocus
                  onSubmitEditing={handleSave}
                />
              </View>
            </View>

            <Pressable
              onPress={handleSave}
              disabled={isLoading || !username.trim()}
              style={({ pressed }) => [
                styles.saveButton,
                { opacity: pressed || isLoading || !username.trim() ? 0.7 : 1 },
              ]}
            >
              <LinearGradient
                colors={[colors.tint, "#3B82F6"]}
                style={styles.saveButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ThemedText style={styles.saveButtonText}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </ThemedText>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropPressable: {
    flex: 1,
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.7,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    height: "100%",
  },
  saveButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
