import React, { useCallback, useState } from "react";
import { View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import Button from "./Button";
import { cleanupLocalData } from "@/lib/utils/cleanup";

type SettingsBottomSheetProps = {
  bottomSheetRef: React.RefObject<BottomSheet>;
};

export function SettingsBottomSheet({
  bottomSheetRef,
}: SettingsBottomSheetProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      // Delete the user on the server
      const { error } = await supabase.functions.invoke("delete_user");
      if (error) throw error;

      // Clean up local data
      await cleanupLocalData();

      // Sign out
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error deleting account:", error);
      setShowDeleteConfirm(false); // Reset the confirmation state on error
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const navigateToSetGoal = () => {
    router.push({
      pathname: "/(setup)/setGoal",
      params: { isEditing: "true" },
    });
  };

  const navigateToSetGym = () => {
    router.push({
      pathname: "/(setup)/setGym",
    });
  };

  const navigateToSetName = () => {
    router.push({
      pathname: "/(setup)/setName",
      params: { isEditing: "true" },
    });
  };

  const navigateToHistory = () => {
    router.push({
      pathname: "/(tabs)/history",
    });
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        style={[props.style, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={[450]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.content}>
          <View style={styles.buttonContainer}>
            {showDeleteConfirm ? (
              <>
                <View style={styles.buttonWrapper}>
                  <Button
                    onPress={handleDeleteAccount}
                    buttonStyles={styles.deleteConfirmButton}
                  >
                    Confirm Delete Account
                  </Button>
                </View>
                <View style={styles.buttonWrapper}>
                  <Button onPress={cancelDelete} variant="secondary">
                    Cancel
                  </Button>
                </View>
                <View style={styles.divider} />
              </>
            ) : (
              <>
                <View style={styles.buttonWrapper}>
                  <Button
                    onPress={handleDeleteAccount}
                    buttonStyles={styles.deleteButton}
                    textStyles={styles.deleteButtonText}
                  >
                    Delete Account
                  </Button>
                </View>
                <View style={styles.buttonWrapper}>
                  <Button onPress={handleLogout} variant="secondary">
                    Logout
                  </Button>
                </View>
                <View style={styles.divider} />
              </>
            )}
            <View style={styles.buttonWrapper}>
              <Button onPress={navigateToSetGym} variant="secondary">
                Edit Gym Locations
              </Button>
            </View>
            <View style={styles.buttonWrapper}>
              <Button onPress={navigateToSetGoal} variant="secondary">
                Update Goal
              </Button>
            </View>
            <View style={styles.buttonWrapper}>
              <Button onPress={navigateToSetName} variant="secondary">
                Update Name
              </Button>
            </View>
            <View style={styles.buttonWrapper}>
              <Button onPress={navigateToHistory} variant="secondary">
                View History
              </Button>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  bottomSheetBackground: {
    backgroundColor: "#09090b",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content: {
    padding: 16,
  },
  handleIndicator: {
    backgroundColor: "#27272a",
    width: 40,
    height: 4,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
    paddingVertical: 8,
    paddingBottom: 32,
  },
  buttonWrapper: {
    width: "100%",
  },
  divider: {
    height: 1,
    backgroundColor: "#27272a",
    marginVertical: 8,
  },
  deleteButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#27272A",
  },
  deleteButtonText: {
    color: "#FAFAFA",
  },
  deleteConfirmButton: {
    backgroundColor: "#dc2626",
  },
});
