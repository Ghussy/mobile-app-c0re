import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Navigation, Plus } from "lucide-react-native";
import DarkSwitch from "@/components/ui/permission/DarkSwitch";

interface ToggleCardProps {
  name: string;
  isSelected?: boolean;
  onToggle: () => void;
  variant?: 'default' | 'add';
  icon?: 'navigation' | 'plus';
}

const ToggleCard = ({ name, isSelected = false, onToggle, variant = 'default', icon = 'navigation' }: ToggleCardProps) => {
  return (
    <Pressable onPress={onToggle} style={styles.cardContent}>
      {icon === 'navigation' ? (
        <Navigation size={24} color="#fafafa" />
      ) : (
        <Plus size={24} color="#fafafa" />
      )}
      <View style={styles.textWrapper}>
        <Text style={styles.name}>{name}</Text>
      </View>
      {variant === 'default' && (
        <DarkSwitch isOn={isSelected} onToggle={onToggle} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderColor: '#27272a',
    borderWidth: 1,
    width: '100%',
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
    fontFamily: 'Inter_500Medium',
    color: '#fafafa',
  },
});

export default ToggleCard; 