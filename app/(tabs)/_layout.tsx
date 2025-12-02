import { TabBar } from "@/components/tabbar";
import { Tabs } from "expo-router";

const TabsLayout = () => {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{ title: "Home", headerShown: false }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: "Settings", headerShown: false }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ title: "Calendar", headerShown: false }}
      />
    </Tabs>
  );
};

export default TabsLayout;
