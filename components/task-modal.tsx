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
import { ImageViewer } from "./image-viewer";

type ModalMode = "view" | "edit" | "create";

export function TaskModal() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const {
    isModalOpen,
    editingTask,
    closeModal,
    addTask,
    updateTask,
    deleteTask,
  } = useTaskStore();

  const [mode, setMode] = useState<ModalMode>("create");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);

  // Image viewer state
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [initialImageIndex, setInitialImageIndex] = useState(0);

  // Initialize form when modal opens or editing task changes
  useEffect(() => {
    if (isModalOpen) {
      if (editingTask) {
        setMode("view");
        setNote(editingTask.note);
        setDate(new Date(editingTask.date));
        setImageUris(editingTask.imageUris || []);
      } else {
        setMode("create");
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

  const handleDelete = () => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (editingTask) {
            await deleteTask(editingTask.id);
            closeModal();
          }
        },
      },
    ]);
  };

  const handleImagePress = (index: number) => {
    if (mode === "view") {
      setInitialImageIndex(index);
      setIsImageViewerOpen(true);
    }
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
        setMode("view"); // Switch back to view mode after edit
      } else {
        // Create new task
        await addTask(
          note.trim(),
          dateStr,
          imageUris.length > 0 ? imageUris : undefined
        );
        closeModal();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (mode === "edit") {
      // Revert changes
      if (editingTask) {
        setNote(editingTask.note);
        setDate(new Date(editingTask.date));
        setImageUris(editingTask.imageUris || []);
        setMode("view");
      } else {
        closeModal();
      }
    } else {
      closeModal();
    }
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
                {mode === "create"
                  ? "New Task"
                  : mode === "edit"
                  ? "Edit Task"
                  : "Task Details"}
              </ThemedText>
              <Pressable onPress={handleCancel} style={styles.closeButton}>
                <Feather name="x" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Date Section */}
              <View style={styles.section}>
                <ThemedText style={styles.label}>Date</ThemedText>
                {mode === "view" ? (
                  <View style={styles.readOnlyField}>
                    <Feather
                      name="calendar"
                      size={20}
                      color={colors.tint}
                      style={styles.dateIcon}
                    />
                    <ThemedText style={styles.readOnlyText}>
                      {date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </ThemedText>
                  </View>
                ) : (
                  <>
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
                  </>
                )}
              </View>

              {/* Note Section */}
              <View style={styles.section}>
                <ThemedText style={styles.label}>Note</ThemedText>
                {mode === "view" ? (
                  <View
                    style={[
                      styles.readOnlyNoteContainer,
                      {
                        backgroundColor:
                          colorScheme === "dark" ? "#2D2D2D" : "#F3F4F6",
                      },
                    ]}
                  >
                    <ThemedText style={styles.readOnlyNoteText}>
                      {note}
                    </ThemedText>
                  </View>
                ) : (
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
                )}
              </View>

              {/* Image Section */}
              <View style={styles.section}>
                <View style={styles.imageLabelRow}>
                  <ThemedText style={styles.label}>
                    Images ({imageUris.length})
                  </ThemedText>
                  {mode !== "view" && imageUris.length > 0 && (
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
                        <Pressable onPress={() => handleImagePress(index)}>
                          <Image source={{ uri }} style={styles.imagePreview} />
                        </Pressable>
                        {mode !== "view" && (
                          <Pressable
                            style={[
                              styles.removeImageButton,
                              {
                                backgroundColor:
                                  colorScheme === "dark"
                                    ? "#1A1A1A"
                                    : "#FFFFFF",
                              },
                            ]}
                            onPress={() => handleRemoveImage(uri)}
                          >
                            <Feather name="x" size={18} color="#EF4444" />
                          </Pressable>
                        )}
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  mode !== "view" && (
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
                            style={[
                              styles.addImageText,
                              { color: colors.tint },
                            ]}
                          >
                            Add Images
                          </ThemedText>
                        </>
                      )}
                    </Pressable>
                  )
                )}
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.modalFooter}>
              {mode === "view" ? (
                <>
                  <Pressable
                    style={[
                      styles.button,
                      styles.deleteButton,
                      {
                        backgroundColor:
                          colorScheme === "dark" ? "#2D2D2D" : "#FEE2E2",
                      },
                    ]}
                    onPress={handleDelete}
                  >
                    <Feather name="trash-2" size={20} color="#EF4444" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.button, styles.saveButton]}
                    onPress={() => setMode("edit")}
                  >
                    <LinearGradient
                      colors={[colors.tint, "#3B82F6"]}
                      style={styles.saveButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Feather
                        name="edit-2"
                        size={20}
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.saveButtonText}>Edit Task</Text>
                    </LinearGradient>
                  </Pressable>
                </>
              ) : (
                <>
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
                    <Text
                      style={[styles.cancelButtonText, { color: colors.text }]}
                    >
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
                          {mode === "edit" ? "Update" : "Create"}
                        </Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </View>

        <ImageViewer
          visible={isImageViewerOpen}
          imageUris={imageUris}
          initialIndex={initialImageIndex}
          onClose={() => setIsImageViewerOpen(false)}
        />
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
  readOnlyField: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  readOnlyText: {
    fontSize: 16,
    fontWeight: "500",
  },
  readOnlyNoteContainer: {
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
  },
  readOnlyNoteText: {
    fontSize: 16,
    lineHeight: 24,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  deleteButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
});
