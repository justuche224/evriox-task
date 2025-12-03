import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Feather from "@react-native-vector-icons/feather";
import { LinearGradient } from "expo-linear-gradient";
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
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [searchText, setSearchText] = useState("");
  const colors = Colors[colorScheme ?? "light"];
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentDayY, setCurrentDayY] = useState<number | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

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
          <View style={styles.headerTopRow}>
            <View>
              <ThemedText style={styles.greeting}>Hi, Donald</ThemedText>
              <ThemedText style={styles.date}>Today, Nov 27</ThemedText>
            </View>
            <Pressable style={styles.profileAvatar}>
              <ThemedText style={styles.profileAvatarText}>D</ThemedText>
            </Pressable>
          </View>

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
                        >
                          {/* Task Header with Checkbox */}
                          <View style={styles.taskHeader}>
                            <ThemedText
                              style={styles.taskText}
                              numberOfLines={2}
                            >
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
                                <View
                                  key={idx}
                                  style={[
                                    styles.taskImageWrapper,
                                    idx > 0 && { marginLeft: -12 },
                                    { zIndex: task.images.length - idx },
                                    {
                                      borderColor:
                                        colorScheme === "dark"
                                          ? "#1A1A1A"
                                          : "#FFFFFF",
                                    },
                                  ]}
                                >
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
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 20,
    paddingHorizontal: 16,
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
    padding: 16,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 2,
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
