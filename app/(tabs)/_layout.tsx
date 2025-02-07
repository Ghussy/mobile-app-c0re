import { Stack } from "expo-router";
import { TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Stack screenOptions={{
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => router.push("/(tabs)/settings")}
          style={{ marginRight: 15 }}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>⚙️</Text>
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: '#09090b',
      },
      headerTintColor: 'white'
    }}>
      <Stack.Screen 
        name="leaderboard" 
        options={{ 
          title: "Leaderboard",
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          presentation: 'modal',
          title: "Settings"
        }} 
      />
    </Stack>
  );
} 