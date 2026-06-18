import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OWNER_TABS = [
  { key: 'Dashboard', label: 'Dashboard', icon: 'grid-outline'   as const, iconActive: 'grid'   as const },
  { key: 'Account',   label: 'Account',   icon: 'person-outline' as const, iconActive: 'person' as const },
];

interface Props {
  role: 'student' | 'mess_owner';
  activeTab: string;
  onTabPress: (key: string) => void;
}

export default function BottomNavBar({ activeTab, onTabPress }: Props) {
  return (
    <View style={s.container}>
      {OWNER_TABS.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={s.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            {isActive && <View style={s.activePill} />}
            <Ionicons
              name={isActive ? tab.iconActive : tab.icon}
              size={22}
              color={isActive ? '#AB3500' : '#8D7168'}
            />
            <Text style={[s.label, isActive ? s.labelActive : s.labelInactive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F4EBE4',
    paddingTop: 10,
    paddingBottom: 24,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    position: 'relative',
    paddingVertical: 4,
  },
  activePill: {
    position: 'absolute',
    top: -2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF1ED',
  },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  labelActive:   { color: '#AB3500' },
  labelInactive: { color: '#8D7168' },
});
