import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { TaskFilters, useTaskStore } from "@/store/use-task-store";
import Feather from "@react-native-vector-icons/feather";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { ThemedText } from "./themed-text";

interface FilterOptionProps {
  label: string;
  description: string;
  icon: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  colors: typeof Colors.light;
  colorScheme: string | null | undefined;
}

const FilterOption: React.FC<FilterOptionProps> = ({
  label,
  description,
  icon,
  value,
  onValueChange,
  disabled,
  colors,
  colorScheme,
}) => (
  <View
    style={[
      styles.filterOption,
      {
        backgroundColor: colorScheme === "dark" ? "#1A1A1A" : "#F9FAFB",
        borderColor: colorScheme === "dark" ? "#2D2D2D" : "#E5E7EB",
        opacity: disabled ? 0.5 : 1,
      },
    ]}
  >
    <View style={styles.filterOptionLeft}>
      <View
        style={[
          styles.filterIconContainer,
          {
            backgroundColor: colorScheme === "dark" ? "#2D2D2D" : "#E0E7FF",
          },
        ]}
      >
        <Feather name={icon as any} size={18} color={colors.tint} />
      </View>
      <View style={styles.filterTextContainer}>
        <ThemedText style={styles.filterLabel}>{label}</ThemedText>
        <ThemedText style={styles.filterDescription}>{description}</ThemedText>
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: colorScheme === "dark" ? "#3D3D3D" : "#D1D5DB",
        true: colors.tint,
      }}
      thumbColor={value ? "#FFFFFF" : "#F3F4F6"}
    />
  </View>
);

export function FilterModal() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const isFilterModalOpen = useTaskStore((state) => state.isFilterModalOpen);
  const filters = useTaskStore((state) => state.filters);
  const closeFilterModal = useTaskStore((state) => state.closeFilterModal);
  const setFilters = useTaskStore((state) => state.setFilters);
  const resetFilters = useTaskStore((state) => state.resetFilters);

  const handleFilterChange = (key: keyof TaskFilters, value: boolean) => {
    // Handle mutual exclusivity for completed/pending filters
    if (key === "showCompletedOnly" && value) {
      setFilters({ showCompletedOnly: true, showPendingOnly: false });
    } else if (key === "showPendingOnly" && value) {
      setFilters({ showPendingOnly: true, showCompletedOnly: false });
    } else {
      setFilters({ [key]: value });
    }
  };

  const hasActiveFilters =
    filters.showCompletedOnly ||
    filters.showPendingOnly ||
    filters.showDaysWithTasksOnly;

  const handleApply = () => {
    closeFilterModal();
  };

  const handleReset = () => {
    resetFilters();
  };

  if (!isFilterModalOpen) return null;

  return (
    <Modal
      visible={isFilterModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={closeFilterModal}
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
              <View style={styles.headerLeft}>
                <Feather name="filter" size={24} color={colors.tint} />
                <ThemedText style={styles.modalTitle}>Filters</ThemedText>
              </View>
              <Pressable onPress={closeFilterModal} style={styles.closeButton}>
                <Feather name="x" size={24} color={colors.text} />
              </Pressable>
            </View>

            {/* Filter Options */}
            <View style={styles.filtersContainer}>
              <ThemedText style={styles.sectionTitle}>Task Status</ThemedText>

              <FilterOption
                label="Completed Only"
                description="Show only tasks that are done"
                icon="check-circle"
                value={filters.showCompletedOnly}
                onValueChange={(value) =>
                  handleFilterChange("showCompletedOnly", value)
                }
                colors={colors}
                colorScheme={colorScheme}
              />

              <FilterOption
                label="Pending Only"
                description="Show only tasks that are not done"
                icon="circle"
                value={filters.showPendingOnly}
                onValueChange={(value) =>
                  handleFilterChange("showPendingOnly", value)
                }
                colors={colors}
                colorScheme={colorScheme}
              />

              <ThemedText style={[styles.sectionTitle, { marginTop: 24 }]}>
                Timeline View
              </ThemedText>

              <FilterOption
                label="Days with Tasks Only"
                description="Hide days without any tasks"
                icon="calendar"
                value={filters.showDaysWithTasksOnly}
                onValueChange={(value) =>
                  handleFilterChange("showDaysWithTasksOnly", value)
                }
                colors={colors}
                colorScheme={colorScheme}
              />
            </View>

            {/* Footer Buttons */}
            <View style={styles.modalFooter}>
              <Pressable
                style={[
                  styles.button,
                  styles.resetButton,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2D2D2D" : "#F3F4F6",
                    opacity: hasActiveFilters ? 1 : 0.5,
                  },
                ]}
                onPress={handleReset}
                disabled={!hasActiveFilters}
              >
                <Feather name="refresh-cw" size={18} color={colors.text} />
                <Text style={[styles.resetButtonText, { color: colors.text }]}>
                  Reset
                </Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.applyButton]}
                onPress={handleApply}
              >
                <LinearGradient
                  colors={[colors.tint, "#3B82F6"]}
                  style={styles.applyButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Feather
                    name="check"
                    size={18}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.applyButtonText}>Apply</Text>
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
    maxHeight: "80%",
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  filtersContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.6,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  filterOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  filterIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  filterTextContainer: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  filterDescription: {
    fontSize: 13,
    opacity: 0.6,
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
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  applyButton: {
    overflow: "hidden",
  },
  applyButtonGradient: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
