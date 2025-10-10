export const lightTheme = {
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111827',
  mutedText: '#6B7280',
  primary: '#2D5016',
  primaryLight: '#4A7C59',
  accent: '#10B981',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  brown: '#8B4513',
  yellow: '#FFD700',
  cream: '#F5F5DC',
  tabIconDefault: '#9CA3AF',
  tabIconSelected: '#2D5016',
};

export const darkTheme = {
  background: '#0B0F0E',
  card: '#111418',
  text: '#F3F4F6',
  mutedText: '#9CA3AF',
  primary: '#34D399',
  primaryLight: '#6EE7B7',
  accent: '#8B5CF6',
  border: '#1F2937',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  brown: '#A0522D',
  yellow: '#FCD34D',
  cream: '#FEF3C7',
  tabIconDefault: '#6B7280',
  tabIconSelected: '#34D399',
};

export type ThemeColors = typeof lightTheme;

export default {
  light: lightTheme,
  dark: darkTheme,
};