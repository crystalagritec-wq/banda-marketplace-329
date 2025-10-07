import React from "react";
import { View, ViewProps, AccessibilityRole, Platform } from "react-native";

// Extend role to include "text" for web builds
type ExtendedAccessibilityRole = AccessibilityRole | "text";

interface AccessibilityWrapperProps
  extends Omit<ViewProps, "accessibilityRole" | "role"> {
  role?: ExtendedAccessibilityRole;
}

export const AccessibilityWrapper: React.FC<AccessibilityWrapperProps> = ({
  role,
  ...props
}) => {
  // Only pass "text" on web; fallback to undefined on native
  const safeRole: AccessibilityRole | undefined =
    role === "text" && Platform.OS !== "web" ? undefined : (role as AccessibilityRole);

  return <View accessibilityRole={safeRole} {...props} />;
};
