import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Feather from "@react-native-vector-icons/feather";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

interface CalendarViewProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  datesWithTasks: string[]; // ISO format dates
}

export function CalendarView({
  visible,
  onClose,
  onDateSelect,
  datesWithTasks,
}: CalendarViewProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    return { daysInMonth, startDayOfWeek, year, month };
  };

  const { daysInMonth, startDayOfWeek, year, month } =
    getDaysInMonth(currentMonth);

  const hasTasksOnDate = (day: number) => {
    // Construct ISO date string manually to avoid timezone issues
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return datesWithTasks.includes(dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const handleDatePress = (day: number) => {
    // Construct ISO date string manually to avoid timezone issues
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    onDateSelect(dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const renderCalendar = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + startDayOfWeek) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const day = i - startDayOfWeek + 1;
      const isValidDay = day > 0 && day <= daysInMonth;

      days.push(
        <Pressable
          key={i}
          style={[styles.dayCell, !isValidDay && styles.emptyCell]}
          onPress={() => isValidDay && handleDatePress(day)}
          disabled={!isValidDay}
        >
          {isValidDay && (
            <View style={styles.dayContent}>
              <View
                style={[
                  styles.dayCircle,
                  isToday(day) && {
                    backgroundColor: colors.tint,
                  },
                ]}
              >
                <ThemedText
                  style={[styles.dayText, isToday(day) && styles.todayText]}
                >
                  {day}
                </ThemedText>
              </View>
              {hasTasksOnDate(day) && (
                <View
                  style={[styles.taskDot, { backgroundColor: colors.tint }]}
                />
              )}
            </View>
          )}
        </Pressable>
      );
    }

    return days;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.calendarContainer,
            {
              backgroundColor: colorScheme === "dark" ? "#1A1A1A" : "#FFFFFF",
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <ThemedText style={styles.monthYear}>
                {monthNames[month]} {year}
              </ThemedText>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color={colors.text} />
              </Pressable>
            </View>

            {/* Navigation */}
            <View style={styles.navigation}>
              <Pressable
                onPress={goToPreviousMonth}
                style={[
                  styles.navButton,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2D2D2D" : "#F3F4F6",
                  },
                ]}
              >
                <Feather name="chevron-left" size={20} color={colors.text} />
              </Pressable>

              <Pressable
                onPress={goToToday}
                style={[
                  styles.todayButton,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2D2D2D" : "#F3F4F6",
                  },
                ]}
              >
                <ThemedText style={styles.todayButtonText}>Today</ThemedText>
              </Pressable>

              <Pressable
                onPress={goToNextMonth}
                style={[
                  styles.navButton,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2D2D2D" : "#F3F4F6",
                  },
                ]}
              >
                <Feather name="chevron-right" size={20} color={colors.text} />
              </Pressable>
            </View>
          </View>

          {/* Day names */}
          <View style={styles.dayNamesRow}>
            {dayNames.map((name) => (
              <View key={name} style={styles.dayNameCell}>
                <ThemedText style={styles.dayName}>{name}</ThemedText>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>{renderCalendar()}</View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  calendarContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthYear: {
    fontSize: 24,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  todayButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  todayButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dayNamesRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayNameCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  dayName: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.6,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 4,
  },
  emptyCell: {
    opacity: 0,
  },
  dayContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
  },
  todayText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});
