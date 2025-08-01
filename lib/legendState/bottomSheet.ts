// legendState/bottomSheetState.ts
import { observable } from "@legendapp/state";
import {
  MenuItem,
  BottomSheetContextType,
  BottomSheetContextData,
} from "@/types/types";
import { Tables } from "@/types/database.types";
import BottomSheet from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { supabase } from "@/lib/supabaseClient";

type BottomSheetState = {
  isOpen: boolean;
  snapIndex: number;
  menuItems: MenuItem[];
  contextType: BottomSheetContextType;
  contextData: BottomSheetContextData | null;
};

export const bottomSheetState$ = observable<BottomSheetState>({
  isOpen: false,
  snapIndex: -1, // -1 for closed, 0 for first snap point
  menuItems: [],
  contextType: null,
  contextData: null,
});

// --- Helper functions to open the bottom sheet with specific menus ---

// For Global Settings
export function openGlobalSettingsMenu(
  bottomSheetRef: React.RefObject<BottomSheet>
) {
  // Define global settings menu items here
  const items: MenuItem[] = [
    // Delete Account logic will need its own state management within the menu or passed via context
    {
      label: "Delete Account",
      onPress: () =>
        console.log("Delete Account Clicked - needs confirmation logic"),
      variant: "destructive",
    },
    {
      label: "Logout",
      onPress: async () => {
        await supabase.auth.signOut();
        bottomSheetState$.isOpen.set(false);
      },
    },
    {
      label: "Edit Activity Locations",
      onPress: () => {
        router.push("/(setup)/setGym");
        bottomSheetState$.isOpen.set(false);
      },
    },
    {
      label: "Update Name",
      onPress: () => {
        router.push({
          pathname: "/(setup)/setName",
          params: { isEditing: "true" },
        });
        bottomSheetState$.isOpen.set(false);
      },
    },
    {
      label: "View History",
      onPress: () => {
        router.push("/(tabs)/history");
        bottomSheetState$.isOpen.set(false);
      },
    },
  ];

  bottomSheetState$.set({
    isOpen: true,
    snapIndex: 0, // Snap to the first snap point
    menuItems: items,
    contextType: "globalSettings",
    contextData: null,
  });
  bottomSheetRef.current?.snapToIndex(0);
}

// For a Streak Card
export function openStreakMenu(
  streak: Tables<"activity_streaks">,
  bottomSheetRef: React.RefObject<BottomSheet>
) {
  const items: MenuItem[] = [
    {
      label: `Update Goal for Activity ID ${streak.activity_id}`,
      onPress: () => {
        router.push({
          pathname: "/(setup)/setGoal",
          params: {
            isEditing: "true",
            activity_id: streak.activity_id,
            streak_id: streak.id,
            current_goal: streak.streak_goal,
          },
        });
        bottomSheetState$.isOpen.set(false);
      },
    },
    {
      label: "View Logs for this Streak",
      onPress: () => {
        router.push({
          pathname: "/(tabs)/history",
          params: {
            streak_id: streak.id,
          },
        });
        bottomSheetState$.isOpen.set(false);
      },
    },
    // Add more streak-specific actions like "Delete Streak Tracking" (soft delete)
  ];

  bottomSheetState$.set({
    isOpen: true,
    snapIndex: 0,
    menuItems: items,
    contextType: "streakCard",
    contextData: {
      activityId: streak.activity_id,
      streakId: streak.id,
    },
  });
  bottomSheetRef.current?.snapToIndex(0);
}

// ... similar functions for openLocationMenu, openActivityLogMenu etc.
