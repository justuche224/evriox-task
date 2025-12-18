import { CalendarView } from "@/components/calendar-view";
import { EditProfileModal } from "@/components/edit-profile-modal";
import { FilterModal } from "@/components/filter-modal";
import { LinkifiedText } from "@/components/linkified-text";
import { TaskModal } from "@/components/task-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import { useTaskStore } from "@/store/use-task-store";
import Feather from "@react-native-vector-icons/feather";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const PulsingRing = ({ color }: { color: string }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.5, { duration: 2000 }), -1, false);
    opacity.value = withRepeat(withTiming(0, { duration: 2000 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.currentDayRing, { borderColor: color }, animatedStyle]}
    />
  );
};

const HomeScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const scrollViewRef = useRef<ScrollView>(null);
  const dayPositions = useRef<{ [key: number]: number }>({});
  const [currentDayY, setCurrentDayY] = useState<number | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Get username from onboarding store
  const username = useOnboardingStore((state) => state.username);

  const tasks = useTaskStore((state) => state.tasks);
  const searchText = useTaskStore((state) => state.searchText);
  const selectedDate = useTaskStore((state) => state.selectedDate);
  const setSearchText = useTaskStore((state) => state.setSearchText);
  const openModal = useTaskStore((state) => state.openModal);
  const toggleCompletion = useTaskStore((state) => state.toggleCompletion);
  const isCalendarOpen = useTaskStore((state) => state.isCalendarOpen);
  const openCalendar = useTaskStore((state) => state.openCalendar);
  const closeCalendar = useTaskStore((state) => state.closeCalendar);
  const openFilterModal = useTaskStore((state) => state.openFilterModal);
  const filters = useTaskStore((state) => state.filters);

  const datesWithTasks = useMemo(() => {
    const dates = new Set<string>();
    tasks.forEach((task) => {
      if (task.date) {
        dates.add(task.date);
      }
    });
    return Array.from(dates);
  }, [tasks]);

  const timelineData = useMemo(() => {
    const filteredTasks = tasks.filter((task) => {
      if (
        searchText &&
        !task.note.toLowerCase().includes(searchText.toLowerCase())
      ) {
        return false;
      }

      if (selectedDate) {
        const taskDate = new Date(task.date).toDateString();
        const filterDate = selectedDate.toDateString();
        if (taskDate !== filterDate) {
          return false;
        }
      }

      // Completed only filter
      if (filters.showCompletedOnly && !task.completed) {
        return false;
      }

      // Pending only filter
      if (filters.showPendingOnly && task.completed) {
        return false;
      }

      return true;
    });

    const tasksByDate = new Map<string, typeof tasks>();

    filteredTasks.forEach((task) => {
      const date = task.date;
      if (!tasksByDate.has(date)) {
        tasksByDate.set(date, []);
      }
      tasksByDate.get(date)!.push(task);
    });

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const allDates = Array.from(tasksByDate.keys()).sort();

    // If showing only days with tasks
    if (filters.showDaysWithTasksOnly) {
      if (allDates.length === 0) {
        return [];
      }

      const timeline: Array<{
        day: number;
        month: string;
        isCurrent: boolean;
        tasks: typeof tasks;
      }> = [];

      allDates.forEach((dateStr) => {
        const date = new Date(dateStr);
        timeline.push({
          day: date.getDate(),
          month: date.toLocaleDateString("en-US", { month: "long" }),
          isCurrent: dateStr === todayStr,
          tasks: tasksByDate.get(dateStr) || [],
        });
      });
      return timeline;
    }

    if (allDates.length === 0) {
      const timeline = [];
      for (let i = -3; i <= 3; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];

        timeline.push({
          day: date.getDate(),
          month: date.toLocaleDateString("en-US", { month: "long" }),
          isCurrent: dateStr === todayStr,
          tasks: [],
        });
      }
      return timeline;
    }

    const minDate = new Date(
      Math.min(new Date(allDates[0]).getTime(), today.getTime())
    );
    const maxDate = new Date(
      Math.max(
        new Date(allDates[allDates.length - 1]).getTime(),
        today.getTime()
      )
    );

    const timeline = [];
    const currentDate = new Date(minDate);

    while (currentDate <= maxDate) {
      const dateStr = currentDate.toISOString().split("T")[0];

      timeline.push({
        day: currentDate.getDate(),
        month: currentDate.toLocaleDateString("en-US", { month: "long" }),
        isCurrent: dateStr === todayStr,
        tasks: tasksByDate.get(dateStr) || [],
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return timeline;
  }, [tasks, searchText, selectedDate, filters]);

  useEffect(() => {
    setCurrentDayY(null);
    setHasScrolled(false);
    dayPositions.current = {};
  }, [timelineData.length]);

  useEffect(() => {
    if (currentDayY !== null && !hasScrolled && scrollViewRef.current) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, currentDayY - 100),
          animated: true,
        });
        setHasScrolled(true);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [currentDayY, hasScrolled]);

  const scrollToDate = (dateStr: string) => {
    const index = timelineData.findIndex((dayItem) => {
      if (dayItem.tasks.length > 0) {
        return dayItem.tasks[0].date === dateStr;
      }

      const monthIndex = [
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
      ].indexOf(dayItem.month);

      const year = new Date().getFullYear();
      const itemDate = new Date(year, monthIndex, dayItem.day);
      const itemDateStr = itemDate.toISOString().split("T")[0];

      return itemDateStr === dateStr;
    });

    if (index !== -1 && scrollViewRef.current) {
      const y =
        dayPositions.current[index] !== undefined
          ? dayPositions.current[index]
          : index * 200;

      scrollViewRef.current.scrollTo({
        y: Math.max(0, y - 100),
        animated: true,
      });
    }
    closeCalendar();
  };

  const handleScrollToToday = () => {
    const today = new Date().toISOString().split("T")[0];
    scrollToDate(today);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View
          style={[
            styles.header,
            {
              borderBottomColor: colorScheme === "dark" ? "#2D2D2D" : "#E5E7EB",
            },
          ]}
        >
          <View style={styles.headerTopRow}>
            <View>
              <ThemedText style={styles.greeting}>
                Hi, {username || "there"}
              </ThemedText>
              <ThemedText style={styles.date}>
                Today,{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </ThemedText>
            </View>
            <Pressable
              style={styles.profileAvatar}
              onPress={() => setIsProfileModalOpen(true)}
            >
              <ThemedText style={styles.profileAvatarText}>
                {username ? username.charAt(0).toUpperCase() : "U"}
              </ThemedText>
            </Pressable>
          </View>

          {/* Full-width Search Bar */}
          <View
            style={[
              styles.searchInputWrapper,
              {
                backgroundColor: colorScheme === "dark" ? "#1A1A1A" : "#F3F4F6",
                borderColor: colorScheme === "dark" ? "#2D2D2D" : "#E5E7EB",
              },
            ]}
          >
            <Feather
              name="search"
              size={20}
              color={colors.icon}
              style={styles.searchIcon}
            />
            <TextInput
              style={[
                styles.searchInput,
                {
                  color: colors.text,
                },
              ]}
              placeholder="Search Tasks"
              placeholderTextColor={colors.icon}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => setSearchText("")}>
                <Feather name="x-circle" size={18} color={colors.icon} />
              </Pressable>
            )}
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionButtonsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#1A1A1A" : "#F3F4F6",
                  borderColor: colorScheme === "dark" ? "#2D2D2D" : "#E5E7EB",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={openFilterModal}
            >
              <Feather name="sliders" size={16} color={colors.tint} />
              <ThemedText
                style={[styles.actionButtonLabel, { color: colors.text }]}
              >
                Filter
              </ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#1A1A1A" : "#F3F4F6",
                  borderColor: colorScheme === "dark" ? "#2D2D2D" : "#E5E7EB",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={openCalendar}
            >
              <Feather name="calendar" size={16} color={colors.tint} />
              <ThemedText
                style={[styles.actionButtonLabel, { color: colors.text }]}
              >
                Calendar
              </ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#1A1A1A" : "#F3F4F6",
                  borderColor: colorScheme === "dark" ? "#2D2D2D" : "#E5E7EB",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={handleScrollToToday}
            >
              <Feather name="target" size={16} color={colors.tint} />
              <ThemedText
                style={[styles.actionButtonLabel, { color: colors.text }]}
              >
                Today
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {timelineData.map((dayItem, dayIndex) => (
            <View
              key={`${dayItem.day}-${dayItem.month}`}
              onLayout={(event) => {
                const { y } = event.nativeEvent.layout;
                dayPositions.current[dayIndex] = y;

                // Capture current day position
                if (dayItem.isCurrent && currentDayY === null) {
                  setCurrentDayY(y);
                }
              }}
            >
              {/* Month Badge - Show at start of new month */}
              {(dayIndex === 0 ||
                timelineData[dayIndex - 1].month !== dayItem.month) && (
                <View style={styles.monthBadgeContainer}>
                  <View
                    style={[
                      styles.monthBadge,
                      {
                        backgroundColor:
                          colorScheme === "dark" ? "#1A1A1A" : "#F3F4F6",
                        borderColor:
                          colorScheme === "dark" ? "#2D2D2D" : "#E5E7EB",
                      },
                    ]}
                  >
                    <ThemedText style={styles.monthText}>
                      {dayItem.month}
                    </ThemedText>
                  </View>
                </View>
              )}

              <View style={styles.timelineRow}>
                {/* Timeline Left Side */}
                <View style={styles.timelineLeft}>
                  {/* Connecting Line (top) */}
                  {dayIndex > 0 && (
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor:
                            colorScheme === "dark" ? "#2D2D2D" : "#E5E7EB",
                        },
                      ]}
                    />
                  )}

                  {/* Day Circle - Highlight current day */}
                  <View style={styles.dayCircleContainer}>
                    {dayItem.isCurrent && <PulsingRing color={colors.tint} />}
                    <View
                      style={[
                        styles.dayCircle,
                        {
                          backgroundColor: dayItem.isCurrent
                            ? colors.tint
                            : colorScheme === "dark"
                            ? "#1A1A1A"
                            : "#FFFFFF",
                          borderColor: dayItem.isCurrent
                            ? colors.tint
                            : colorScheme === "dark"
                            ? "#2D2D2D"
                            : "#E5E7EB",
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.dayNumber,
                          dayItem.isCurrent && {
                            color: "#FFFFFF",
                          },
                        ]}
                      >
                        {dayItem.day}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Connecting Line (bottom) */}
                  {dayIndex < timelineData.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        { flex: 1 },
                        {
                          backgroundColor:
                            colorScheme === "dark" ? "#2D2D2D" : "#E5E7EB",
                        },
                      ]}
                    />
                  )}
                </View>

                {/* Timeline Right Side - Tasks */}
                <View style={styles.timelineRight}>
                  {dayItem.tasks.length === 0 ? (
                    <View style={styles.emptyDayContainer}>
                      <Feather
                        name="calendar"
                        size={24}
                        color={colorScheme === "dark" ? "#4B5563" : "#9CA3AF"}
                        style={{ marginBottom: 8, opacity: 0.6 }}
                      />
                      <ThemedText style={styles.emptyDayText}>
                        No tasks scheduled
                      </ThemedText>
                    </View>
                  ) : (
                    dayItem.tasks.map((task, index) => (
                      <Animated.View
                        entering={FadeInDown.delay(index * 100).springify()}
                        key={task.id}
                        style={[
                          styles.taskCard,
                          {
                            backgroundColor:
                              colorScheme === "dark" ? "#1A1A1A" : "#FFFFFF",
                            borderColor:
                              colorScheme === "dark" ? "#2D2D2D" : "#E5E7EB",
                            borderLeftColor: colors.tint,
                          },
                        ]}
                      >
                        <Pressable
                          style={({ pressed }) => ({
                            opacity: pressed ? 0.7 : 1,
                          })}
                          onPress={() => openModal(task)}
                        >
                          {/* Task Header with Checkbox */}
                          <View style={styles.taskHeader}>
                            <LinkifiedText
                              style={[
                                styles.taskText,
                                task.completed && {
                                  textDecorationLine: "line-through",
                                  opacity: 0.5,
                                },
                              ]}
                            >
                              {task.note}
                            </LinkifiedText>
                            <Pressable
                              style={[
                                styles.checkbox,
                                {
                                  borderColor:
                                    colorScheme === "dark"
                                      ? "#4B5563"
                                      : "#D1D5DB",
                                  backgroundColor: task.completed
                                    ? colors.tint
                                    : "transparent",
                                },
                              ]}
                              onPress={(e) => {
                                e.stopPropagation();
                                toggleCompletion(task.id);
                              }}
                            >
                              {task.completed ? (
                                <Feather
                                  name="check"
                                  size={16}
                                  color="#FFFFFF"
                                />
                              ) : (
                                <Feather
                                  name="circle"
                                  size={20}
                                  color={
                                    colorScheme === "dark"
                                      ? "#4B5563"
                                      : "#D1D5DB"
                                  }
                                />
                              )}
                            </Pressable>
                          </View>

                          {/* Task Images */}
                          {task.imageUris && task.imageUris.length > 0 && (
                            <View style={styles.taskImagesContainer}>
                              {task.imageUris
                                .slice(0, 3)
                                .map((imageUri, index) => (
                                  <View
                                    key={imageUri}
                                    style={[
                                      styles.taskImageWrapper,
                                      {
                                        borderColor:
                                          colorScheme === "dark"
                                            ? "#1A1A1A"
                                            : "#FFFFFF",
                                        marginLeft: index > 0 ? -8 : 0,
                                        zIndex: task.imageUris!.length - index,
                                      },
                                    ]}
                                  >
                                    <Image
                                      source={{ uri: imageUri }}
                                      style={styles.taskImage}
                                      resizeMode="cover"
                                    />
                                  </View>
                                ))}
                              {task.imageUris.length > 3 && (
                                <View
                                  style={[
                                    styles.taskImageWrapper,
                                    styles.moreImagesBadge,
                                    {
                                      backgroundColor:
                                        colorScheme === "dark"
                                          ? "#2D2D2D"
                                          : "#F3F4F6",
                                      borderColor:
                                        colorScheme === "dark"
                                          ? "#1A1A1A"
                                          : "#FFFFFF",
                                      marginLeft: -8,
                                    },
                                  ]}
                                >
                                  <ThemedText style={styles.moreImagesText}>
                                    +{task.imageUris.length - 3}
                                  </ThemedText>
                                </View>
                              )}
                            </View>
                          )}

                          {/* Task Time */}
                          <View style={styles.taskFooter}>
                            <ThemedText style={styles.taskTime}>
                              {task.time}
                            </ThemedText>
                          </View>
                        </Pressable>
                      </Animated.View>
                    ))
                  )}
                </View>
              </View>
            </View>
          ))}

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating Action Button */}
        <Pressable
          style={({ pressed }) => [
            styles.fabContainer,
            {
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={() => openModal()}
        >
          <LinearGradient
            colors={[colors.tint, "#3B82F6"]}
            style={styles.fab}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="plus" size={32} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>

        {/* Task Modal */}
        <TaskModal />

        {/* Filter Modal */}
        <FilterModal />

        {/* Calendar Modal */}
        <CalendarView
          visible={isCalendarOpen}
          onClose={closeCalendar}
          onDateSelect={scrollToDate}
          datesWithTasks={datesWithTasks}
        />

        {/* Edit Profile Modal */}
        <EditProfileModal
          visible={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      </SafeAreaView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 15,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  profileAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4338CA",
  },
  greeting: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  date: {
    fontSize: 15,
    fontWeight: "500",
    opacity: 0.6,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchInputWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    height: "100%",
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  monthBadgeContainer: {
    alignItems: "flex-end",
    marginBottom: 26,
    marginTop: 10,
  },
  monthBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  monthText: {
    fontSize: 14,
    fontWeight: "600",
  },
  timelineRow: {
    flexDirection: "row",
    marginBottom: 0,
    width: "100%",
    alignItems: "center", // Center align tasks with day circles
  },
  timelineLeft: {
    width: 50,
    alignItems: "center",
    marginRight: 16,
    flexShrink: 0, // Don't shrink the timeline
    alignSelf: "stretch", // Stretch to match the height of tasks
  },
  timelineLine: {
    width: 2,
    minHeight: 20,
  },
  dayCircleContainer: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  currentDayRing: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    opacity: 0.3,
  },
  dayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "700",
  },
  timelineRight: {
    flex: 1,
    paddingVertical: 20,
    paddingTop: 60,
    gap: 12,
  },
  emptyDayContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyDayText: {
    fontSize: 15,
    opacity: 0.4,
    fontStyle: "italic",
  },
  taskCard: {
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    width: "100%",
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  taskText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  taskImagesContainer: {
    flexDirection: "row",
    marginBottom: 12,
    paddingLeft: 4, // Add padding to account for the first image's border if needed
  },
  taskImageWrapper: {
    width: 45,
    height: 45,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 2,
  },
  moreImagesBadge: {
    alignItems: "center",
    justifyContent: "center",
  },
  moreImagesText: {
    fontSize: 11,
    fontWeight: "600",
  },
  taskImage: {
    width: "100%",
    height: "100%",
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  taskTime: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: "500",
  },
  fabContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HomeScreen;
