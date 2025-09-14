import { Stack } from "expo-router";



export default function EmergencyLayout({ children }: { children: React.ReactNode }) {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="index"
                options={{
                    title: "Emergency",
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="breakdown"
                options={{
                    title: "Breakdown",
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="status"
                options={{
                    title: "Status",
                    headerShown: false,
                }}
            />
        </Stack>
    );
}