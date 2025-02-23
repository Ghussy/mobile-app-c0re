import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Navigation, Plus, Trash2, X } from "lucide-react-native";
import DarkSwitch from "@/components/ui/permission/DarkSwitch";

interface ToggleCardProps {
  name: string;
  subtitle?: string;
  isSelected?: boolean;
  onToggle: () => void;
  onDelete?: () => void;
  variant?: "default" | "add" | "delete";
  icon?: "navigation" | "plus";
}

const ToggleCard = ({
  name,
  subtitle,
  isSelected = false,
  onToggle,
  onDelete,
  variant = "default",
  icon = "navigation",
}: ToggleCardProps) => {
  const [showSubtitle, setShowSubtitle] = useState(false);

  return (
    <Pressable
      onPress={() => (subtitle ? setShowSubtitle(!showSubtitle) : onToggle())}
      style={styles.cardContent}
    >
      {icon === "navigation" ? (
        <Navigation size={24} color="#fafafa" />
      ) : (
        <Plus size={24} color="#fafafa" />
      )}
      <View style={styles.textWrapper}>
        <Text style={styles.name}>{showSubtitle ? subtitle : name}</Text>
      </View>
      {variant === "default" && (
        <DarkSwitch isOn={isSelected} onToggle={onToggle} />
      )}
      {variant === "delete" && (
        <Pressable onPress={onDelete}>
          <X size={24} color="#ef4444" />
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    borderColor: "#27272a",
    borderWidth: 1,
    width: "100%",
    height: 72,
    padding: 16,
    gap: 16,
    marginBottom: 16,
  },
  textWrapper: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    lineHeight: 14,
    fontFamily: "Inter_500Medium",
    color: "#fafafa",
  },
});

export default ToggleCard;
