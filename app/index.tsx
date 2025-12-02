import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import Feather from "@react-native-vector-icons/feather";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock data for timeline - ordered from PAST to FUTURE
// Past days (20-26) -> Current day (27) -> Future days (28+)
const timelineData = [
  {
    day: 20,
    month: "November",
    tasks: [
      {
        id: 101,
        text: "Completed task from last week",
        time: "02:30 PM",
        images: [1],
      },
    ],
  },
  {
    day: 21,
    month: "November",
    tasks: [],
  },
  {
    day: 22,
    month: "November",
    tasks: [
      {
        id: 102,
        text: "Friday meeting notes and action items",
        time: "11:00 AM",
        images: [1, 2],
      },
    ],
  },
  {
    day: 23,
    month: "November",
    tasks: [],
  },
  {
    day: 24,
    month: "November",
    tasks: [],
  },
  {
    day: 25,
    month: "November",
    tasks: [
      {
        id: 103,
        text: "Weekend project planning session",
        time: "10:00 AM",
        images: [1, 2, 3],
      },
    ],
  },
  {
    day: 26,
    month: "November",
    tasks: [
      {
        id: 104,
        text: "Yesterday's summary and notes",
        time: "04:15 PM",
        images: [1],
      },
    ],
  },
  // CURRENT DAY (27) - Will scroll to this on mount
  {
    day: 27,
    month: "November",
    isCurrent: true,
    tasks: [
      {
        id: 1,
        text: "Lorem Ipsum Dolo sit amet consectetur adipiscing elit Cras finibus, mauris in .....",
        time: "09:25 AM",
        images: [1, 2, 3],
      },
      {
        id: 2,
        text: "Lorem Ipsum Dolo sit amet consectetur adipiscing elit Cras finibus, mauris in ......",
        time: "09:25 AM",
        images: [1, 2, 3],
      },
      {
        id: 3,
        text: "Lorem Ipsum Dolo sit amet consectetur adipiscing elit Cras finibus, mauris in ......",
        time: "09:25 AM",
        images: [1, 2, 3],
      },
    ],
  },
  // FUTURE DAYS
  {
    day: 28,
    month: "November",
    tasks: [],
  },
  {
    day: 29,
    month: "November",
    tasks: [
      {
        id: 5,
        text: "Upcoming meeting preparation",
        time: "02:00 PM",
        images: [1, 2],
      },
    ],
  },
  {
    day: 30,
    month: "November",
    tasks: [],
  },
  {
    day: 1,
    month: "December",
    tasks: [
      {
        id: 4,
        text: "Lorem Ipsum Dolo sit amet consectetur adipiscing elit Cras finibus, mauris in ......",
        time: "09:25 AM",
        images: [1, 2, 3],
      },
    ],
  },
  {
    day: 2,
    month: "December",
    tasks: [],
  },
];

const HomeScreen = () => {
  const colorScheme = useColorScheme();
  const [searchText, setSearchText] = useState("");
  const colors = Colors[colorScheme ?? "light"];
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentDayY, setCurrentDayY] = useState<number | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Find current day index
  const currentDayIndex = timelineData.findIndex((day) => day.isCurrent);

  // Scroll to current day once layout is complete
  useEffect(() => {
    if (currentDayY !== null && !hasScrolled && scrollViewRef.current) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, currentDayY - 50),
          animated: true,
        });
        setHasScrolled(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [currentDayY, hasScrolled]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText style={styles.greeting}>Hi, Donald</ThemedText>

          <View style={styles.searchContainer}>
            <View
              style={[
                styles.searchInputWrapper,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#1A1A1A" : "#F3F4F6",
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
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.filterButton,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#1A1A1A" : "#F3F4F6",
                  borderColor: colorScheme === "dark" ? "#2D2D2D" : "#E5E7EB",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Feather name="sliders" size={22} color={colors.tint} />
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
                // Capture current day position
                if (dayItem.isCurrent && currentDayY === null) {
                  const { y } = event.nativeEvent.layout;
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
                  <View
                    style={[
                      styles.dayCircle,
                      {
                        backgroundColor: dayItem.isCurrent
                          ? colors.tint
                          : colorScheme === "dark"
                          ? "#1A1A1A"
                          : "#FFFFFF",
                        borderColor: colors.tint,
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
                      <ThemedText style={styles.emptyDayText}>
                        Nothing on this day
                      </ThemedText>
                    </View>
                  ) : (
                    dayItem.tasks.map((task) => (
                      <View
                        key={task.id}
                        style={[
                          styles.taskCard,
                          {
                            backgroundColor:
                              colorScheme === "dark" ? "#1A1A1A" : "#FFFFFF",
                            borderColor:
                              colorScheme === "dark" ? "#2D2D2D" : "#E5E7EB",
                          },
                        ]}
                      >
                        {/* Task Header with Checkbox */}
                        <View style={styles.taskHeader}>
                          <ThemedText style={styles.taskText} numberOfLines={2}>
                            {task.text}
                          </ThemedText>
                          <Pressable
                            style={[
                              styles.checkbox,
                              {
                                borderColor:
                                  colorScheme === "dark"
                                    ? "#4B5563"
                                    : "#D1D5DB",
                              },
                            ]}
                          >
                            <Feather
                              name="circle"
                              size={20}
                              color={
                                colorScheme === "dark" ? "#4B5563" : "#D1D5DB"
                              }
                            />
                          </Pressable>
                        </View>

                        {/* Task Images */}
                        {task.images && task.images.length > 0 && (
                          <View style={styles.taskImagesContainer}>
                            {task.images.map((img, idx) => (
                              <View key={idx} style={styles.taskImageWrapper}>
                                <Image
                                  source={require("@/assets/images/android-icon-background.png")}
                                  style={styles.taskImage}
                                  resizeMode="cover"
                                />
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Task Time */}
                        <View style={styles.taskFooter}>
                          <ThemedText style={styles.taskTime}>
                            {task.time}
                          </ThemedText>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </View>
          ))}

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>
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
    paddingTop: 25,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
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
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
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
    marginBottom: 16,
    marginTop: 8,
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
  dayCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "700",
  },
  timelineRight: {
    flex: 1,
    paddingVertical: 20,
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
    padding: 16,
    borderWidth: 1,
    width: "100%",
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
    gap: 8,
    marginBottom: 12,
  },
  taskImageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: "hidden",
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
});

export default HomeScreen;
