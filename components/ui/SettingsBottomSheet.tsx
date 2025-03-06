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

type SettingsBottomSheetProps = {
  bottomSheetRef: React.RefObject<BottomSheet>;
};

export function SettingsBottomSheet({
  bottomSheetRef,
}: SettingsBottomSheetProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    if (!showLogoutConfirm) {
      setShowLogoutConfirm(true);
      return;
    }
    await supabase.auth.signOut();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
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
            {showLogoutConfirm ? (
              <>
                <View style={styles.buttonWrapper}>
                  <Button
                    onPress={handleLogout}
                    buttonStyles={styles.logoutConfirmButton}
                  >
                    Confirm Logout
                  </Button>
                </View>
                <View style={styles.buttonWrapper}>
                  <Button onPress={cancelLogout} variant="secondary">
                    Cancel
                  </Button>
                </View>
                <View style={styles.divider} />
              </>
            ) : (
              <>
                <View style={styles.buttonWrapper}>
                  <Button
                    onPress={handleLogout}
                    buttonStyles={styles.logoutButton}
                    textStyles={styles.logoutButtonText}
                  >
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
  logoutButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#27272A",
  },
  logoutButtonText: {
    color: "#FAFAFA",
  },
  logoutConfirmButton: {
    backgroundColor: "#dc2626",
  },
});
