import { TabBar } from "@/components/tabbar"
import { Tabs } from "expo-router"

const TabsLayout = () => {
    return (
        <Tabs tabBar={props => <TabBar {...props} />}>
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
            <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
        </Tabs>
    )
}

export default TabsLayout