import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Redirect } from "expo-router";
import { useAuth } from "@/lib/supabase";
import { enrolledGyms } from "@/lib/sqlite";
import { useEffect, useState } from "react";

export default function TabsLayout() {
  const auth = useAuth();

  if (!auth.user) {
    console.log("Not signed in, redirecting to auth");
    return <Redirect href={"/(auth)"} />;
  }

  const [shouldRedirect, setRedirect] = useState(false);
  useEffect(() => {
    enrolledGyms().then((gyms) => {
      if (gyms.length === 0) {
        setRedirect(true);
      }
    });
  }, []);

  if (shouldRedirect) {
    return <Redirect href="/(setup)/setGym" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#09090b",
          borderTopColor: "rgba(255, 255, 255, 0.1)",
        },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "#71717a",
        headerStyle: {
          backgroundColor: "#09090b",
        },
        headerTintColor: "white",
      }}
      initialRouteName="leaderboard"
    >
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
