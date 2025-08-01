export type MenuItem = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "destructive";
  isConfirming?: boolean;
  confirmLabel?: string;
  onConfirm?: () => void;
  onCancelConfirm?: () => void;
};

export type BottomSheetContextType =
  | "globalSettings"
  | "streakCard"
  | "locationCard"
  | "activityLogItem"
  | null;

export type BottomSheetContextData = {
  streakId?: string;
  activityId?: string;
  locationId?: string;
  activityLogId?: string;
};
