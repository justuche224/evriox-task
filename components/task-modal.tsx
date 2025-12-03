import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTaskStore } from "@/store/use-task-store";
import DateTimePicker from "@react-native-community/datetimepicker";
import Feather from "@react-native-vector-icons/feather";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ThemedText } from "./themed-text";

export function TaskModal() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const { isModalOpen, editingTask, closeModal, addTask, updateTask } =
    useTaskStore();

  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);

  // Initialize form when modal opens or editing task changes
  useEffect(() => {
    if (isModalOpen) {
      if (editingTask) {
        setNote(editingTask.note);
        setDate(new Date(editingTask.date));
        setImageUris(editingTask.imageUris || []);
      } else {
        setNote("");
        setDate(new Date());
        setImageUris([]);
      }
    }
  }, [isModalOpen, editingTask]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handlePickImages = async () => {
    try {
      setIsPickingImage(true);
      const { pickAndSaveMultipleImages } = await import("@/lib/image-service");
      const newUris = await pickAndSaveMultipleImages();
      if (newUris.length > 0) {
        setImageUris([...imageUris, ...newUris]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images. Please try again.");
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleRemoveImage = (uriToRemove: string) => {
    setImageUris(imageUris.filter((uri) => uri !== uriToRemove));
  };

  const handleSave = async () => {
    if (!note.trim()) {
      Alert.alert("Validation Error", "Please enter a task note.");
      return;
    }

    try {
      setIsSubmitting(true);
      const dateStr = date.toISOString().split("T")[0];

      if (editingTask) {
        // Update existing task
        await updateTask(editingTask.id, {
          note: note.trim(),
          date: dateStr,
          imageUris: imageUris.length > 0 ? imageUris : null,
        });
      } else {
        // Create new task
        await addTask(
          note.trim(),
          dateStr,
          imageUris.length > 0 ? imageUris : undefined
        );
      }

      closeModal();
    } catch (error) {
      Alert.alert("Error", "Failed to save task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    closeModal();
  };

  if (!isModalOpen) return null;

  return (
    <Modal
      visible={isModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <BlurView
          intensity={20}
          tint={colorScheme === "dark" ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colorScheme === "dark" ? "#1A1A1A" : "#FFFFFF",
              },
            ]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {editingTask ? "Edit Task" : "New Task"}
              </ThemedText>
              <Pressable onPress={handleCancel} style={styles.closeButton}>
                <Feather name="x" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Date Picker */}
              <View style={styles.section}>
                <ThemedText style={styles.label}>Date</ThemedText>
                <Pressable
                  style={[
                    styles.dateButton,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#2D2D2D" : "#F3F4F6",
                      borderColor:
                        colorScheme === "dark" ? "#3D3D3D" : "#E5E7EB",
                    },
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Feather
                    name="calendar"
                    size={20}
                    color={colors.tint}
                    style={styles.dateIcon}
                  />
                  <Text style={[styles.dateText, { color: colors.text }]}>
                    {date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </Pressable>

                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleDateChange}
                  />
                )}
              </View>

              {/* Note Input */}
              <View style={styles.section}>
                <ThemedText style={styles.label}>Note</ThemedText>
                <TextInput
                  style={[
                    styles.noteInput,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#2D2D2D" : "#F3F4F6",
                      borderColor:
                        colorScheme === "dark" ? "#3D3D3D" : "#E5E7EB",
                      color: colors.text,
                    },
                  ]}
                  placeholder="Enter your task note..."
                  placeholderTextColor={colors.icon}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Image Section */}
              <View style={styles.section}>
                <View style={styles.imageLabelRow}>
                  <ThemedText style={styles.label}>
                    Images ({imageUris.length})
                  </ThemedText>
                  {imageUris.length > 0 && (
                    <Pressable
                      style={styles.addMoreButton}
                      onPress={handlePickImages}
                      disabled={isPickingImage}
                    >
                      <Feather name="plus" size={16} color={colors.tint} />
                      <ThemedText
                        style={[styles.addMoreText, { color: colors.tint }]}
                      >
                        Add More
                      </ThemedText>
                    </Pressable>
                  )}
                </View>

                {imageUris.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imageScrollView}
                    contentContainerStyle={styles.imageScrollContent}
                  >
                    {imageUris.map((uri, index) => (
                      <View key={uri} style={styles.imagePreviewContainer}>
                        <Image source={{ uri }} style={styles.imagePreview} />
                        <Pressable
                          style={[
                            styles.removeImageButton,
                            {
                              backgroundColor:
                                colorScheme === "dark" ? "#1A1A1A" : "#FFFFFF",
                            },
                          ]}
                          onPress={() => handleRemoveImage(uri)}
                        >
                          <Feather name="x" size={18} color="#EF4444" />
                        </Pressable>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <Pressable
                    style={[
                      styles.addImageButton,
                      {
                        backgroundColor:
                          colorScheme === "dark" ? "#2D2D2D" : "#F3F4F6",
                        borderColor:
                          colorScheme === "dark" ? "#3D3D3D" : "#E5E7EB",
                      },
                    ]}
                    onPress={handlePickImages}
                    disabled={isPickingImage}
                  >
                    {isPickingImage ? (
                      <ActivityIndicator size="small" color={colors.tint} />
                    ) : (
                      <>
                        <Feather name="image" size={24} color={colors.tint} />
                        <ThemedText
                          style={[styles.addImageText, { color: colors.tint }]}
                        >
                          Add Images
                        </ThemedText>
                      </>
                    )}
                  </Pressable>
                )}
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.modalFooter}>
              <Pressable
                style={[
                  styles.button,
                  styles.cancelButton,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2D2D2D" : "#F3F4F6",
                  },
                ]}
                onPress={handleCancel}
                disabled={isSubmitting}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={[colors.tint, "#3B82F6"]}
                  style={styles.saveButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editingTask ? "Update" : "Create"}
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "90%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  dateIcon: {
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
  },
  noteInput: {
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 120,
  },
  imageLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addMoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
  imageScrollView: {
    marginHorizontal: -4,
  },
  imageScrollContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  addImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    gap: 12,
  },
  addImageText: {
    fontSize: 16,
    fontWeight: "600",
  },
  imagePreviewContainer: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    width: 120,
    height: 120,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  removeImageButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  button: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    overflow: "hidden",
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
