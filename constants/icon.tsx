import { Feather } from "@react-native-vector-icons/feather";
 
export const icon = {
    index: (props: any) => <Feather name="home" size={24} {...props} />,
    settings: (props: any) => <Feather name="settings" size={24} {...props} />,
    calendar: (props: any) => <Feather name="calendar" size={24} {...props} />
}