import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NavItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

interface BottomNavProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'discover', icon: 'compass', label: 'Discover' },
  { id: 'search', icon: 'search', label: 'Search' },
  { id: 'meals', icon: 'restaurant', label: 'My Meals' },
  { id: 'profile', icon: 'person-circle', label: 'Profile' },
];

export default function BottomNav({ activeTab, onTabPress }: BottomNavProps) {
  return (
    <View style={styles.container}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === activeTab;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.navItem, isActive && styles.navItemActive]}
            onPress={() => onTabPress(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={isActive ? '#AB3500' : '#A8A29E'}
            />
            <Text style={[styles.navLabel, isActive ? styles.navLabelActive : styles.navLabelInactive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F4EBE4',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  navItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
  },
  navItemActive: {
    // Optional: add background for active state
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#AB3500',
    fontWeight: '700',
  },
  navLabelInactive: {
    color: '#A8A29E',
  },
});
