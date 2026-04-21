import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, fontSize, fontWeight } from '../theme';

interface NavItem {
  key: string;
  label: string;
  emoji: string;
}

const STUDENT_TABS: NavItem[] = [
  { key: 'Discover', label: 'Discover', emoji: '🧭' },
  { key: 'Saved', label: 'Saved', emoji: '🔖' },
  { key: 'Updates', label: 'Updates', emoji: '🔔' },
  { key: 'Profile', label: 'Profile', emoji: '👤' },
];

const OWNER_TABS: NavItem[] = [
  { key: 'Dashboard', label: 'Today', emoji: '🏪' },
  { key: 'MenuManagement', label: 'Menus', emoji: '📋' },
  { key: 'OwnerReviews', label: 'Reviews', emoji: '⭐' },
  { key: 'OwnerProfile', label: 'Account', emoji: '👤' },
];

interface Props {
  role: 'student' | 'mess_owner';
  activeTab: string;
  onTabPress: (key: string) => void;
}

export default function BottomNavBar({ role, activeTab, onTabPress }: Props) {
  const { colors } = useTheme();
  const tabs = role === 'student' ? STUDENT_TABS : OWNER_TABS;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && { backgroundColor: colors.primaryLight }]}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{tab.emoji}</Text>
            <Text style={[styles.label, { color: isActive ? colors.primary : colors.textSecondary }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingBottom: 24,
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radius.lg,
    gap: 2,
  },
  emoji: { fontSize: 22 },
  label: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
});
