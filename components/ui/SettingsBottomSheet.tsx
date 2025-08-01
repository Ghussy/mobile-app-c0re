// SettingsBottomSheet.tsx
import React, { useCallback, useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { use$, observer } from "@legendapp/state/react"; // Import observer
import { bottomSheetState$ } from "@/lib/legendState/bottomSheet"; // Your new state observable
import Button from "./Button"; // Your custom Button component
import { MenuItem } from "@/types/types"; // Your MenuItem type
import { supabase } from "@/lib/supabaseClient"; // For direct actions like delete
import { router } from "expo-router";


type SettingsBottomSheetProps = {
  bottomSheetRef: React.RefObject<BottomSheet>;
};

// Make the component an observer to react to bottomSheetState$ changes
export const SettingsBottomSheet = observer(({
  bottomSheetRef,
}: SettingsBottomSheetProps) => {
  const menuItems = use$(bottomSheetState$.menuItems);
  const snapIndex = use$(bottomSheetState$.snapIndex);
  const isOpen = use$(bottomSheetState$.isOpen);

  // State for two-step delete confirmation, specific to this component's instance
  const [confirmingItem, setConfirmingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.snapToIndex(snapIndex);
    } else {
      bottomSheetRef.current?.close();
      setConfirmingItem(null); // Reset confirmation when sheet closes
    }
  }, [isOpen, snapIndex, bottomSheetRef]);

  const handleItemPress = (item: MenuItem) => {
    if (item.isConfirming && !confirmingItem) {
      setConfirmingItem(item);
    } else if (item.onConfirm && confirmingItem?.label === item.label) {
      item.onConfirm();
      setConfirmingItem(null); // Reset after confirm
      bottomSheetState$.isOpen.set(false); // Close sheet
    } else if (item.onPress) {
      item.onPress();
      // No need to set isOpen to false here if onPress navigates or explicitly closes
    }
  };

  const handleCancelConfirm = () => {
    confirmingItem?.onCancelConfirm?.();
    setConfirmingItem(null);
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        style={[props.style, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}
        pressBehavior="close" // Or "none" if you want to control closing explicitly
        onPress={() => bottomSheetState$.isOpen.set(false)} // Close when backdrop is pressed
      />
    ),
    []
  );

  const handleSheetChanges = useCallback((index: number) => {
    // Update Legend-State if sheet is closed by swipe or backdrop
    if (index === -1 && bottomSheetState$.isOpen.peek()) {
      bottomSheetState$.isOpen.set(false);
      setConfirmingItem(null);
    }
    bottomSheetState$.snapIndex.set(index);
  }, []);


  // Special handling for global settings delete account, as it was in your original code
  const globalContext = use$(bottomSheetState$.contextType);
  const [showGlobalDeleteConfirm, setShowGlobalDeleteConfirm] = useState(false);

  useEffect(() => {
    // Reset global delete confirm if context changes or sheet closes
    if (globalContext !== 'globalSettings' || !isOpen) {
        setShowGlobalDeleteConfirm(false);
    }
  }, [globalContext, isOpen]);

  const handleDeleteAccountGlobal = async () => {
    if (!showGlobalDeleteConfirm) {
      setShowGlobalDeleteConfirm(true);
      return;
    }
    try {
      const { error } = await supabase.functions.invoke("delete_user");
      if (error) throw error;
      // TODO: add delete account logic here
      await supabase.auth.signOut();
      bottomSheetState$.isOpen.set(false); // Close sheet
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
        setShowGlobalDeleteConfirm(false);
    }
  };
  const cancelDeleteAccountGlobal = () => setShowGlobalDeleteConfirm(false);


  // Determine which set of items to render
  let itemsToRender = menuItems;

  if (globalContext === 'globalSettings' && menuItems.some(item => item.label === "Delete Account")) {
      // Rebuild menu items for global settings to include confirmation logic for delete
      const originalDeleteAccountItem = menuItems.find(item => item.label === "Delete Account");
      const otherItems = menuItems.filter(item => item.label !== "Delete Account");

      itemsToRender = showGlobalDeleteConfirm
        ? [
            { label: "Confirm Delete Account", onPress: handleDeleteAccountGlobal, variant: 'destructive' },
            { label: "Cancel", onPress: cancelDeleteAccountGlobal, variant: 'secondary' },
            ...otherItems, // Add other items after confirm/cancel for delete
          ]
        : [
            { ...originalDeleteAccountItem!, onPress: handleDeleteAccountGlobal }, // Override onPress
            ...otherItems,
          ];
  }


  return (
    // GestureHandlerRootView might be needed at a higher level in your app (e.g., RootLayout)
    // If it's already there, you might not need it here.
    // <GestureHandlerRootView style={styles.container}>
      <BottomSheet
        ref={bottomSheetRef}
        index={snapIndex} // Controlled by Legend-State
        snapPoints={[450]} // Or make this dynamic based on content
        enablePanDownToClose
        onChange={handleSheetChanges} // Sync internal state with Legend-State
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.content}>
          <View style={styles.buttonContainer}>
            {itemsToRender.map((item, index) => (
              <React.Fragment key={item.label + index}>
                {item.label === '---divider---' ? (
                    <View style={styles.divider} />
                ) : (
                    <View style={styles.buttonWrapper}>
                    <Button
                        onPress={() => handleItemPress(item)}
                        // variant={item.variant || 'secondary'} // Default to secondary if not specified
                        buttonStyles={
                        item.variant === 'destructive' && !confirmingItem // Initial destructive button style
                            ? styles.deleteButton
                            : confirmingItem?.label === item.label && item.isConfirming // Active confirm button style
                            ? styles.deleteConfirmButton
                            : undefined
                        }
                        textStyles={
                        item.variant === 'destructive' && !confirmingItem
                            ? styles.deleteButtonText
                            : undefined
                        }
                    >
                        {confirmingItem?.label === item.label && item.isConfirming
                        ? item.confirmLabel || `Confirm ${item.label}`
                        : item.label}
                    </Button>
                    </View>
                )}
                 {/* Add divider logic if needed, e.g. after certain items */}
              </React.Fragment>
            ))}
          </View>
        </BottomSheetView>
      </BottomSheet>
    // </GestureHandlerRootView>
  );
});

// ... (styles remain the same)

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
