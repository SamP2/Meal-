import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  location?: string;
  // Legacy props kept for backward compatibility — no longer rendered
  greeting?: string;
  userName?: string;
  userImage?: string;
}

export default function Header({ location = 'Shivajinagar, Pune' }: HeaderProps) {
  const navigation  = useNavigation<any>();
  const { user }    = useAuth();
  const insets      = useSafeAreaInsets();
  const [showMenu, setShowMenu] = useState(false);

  const handleOwnerAccess = () => {
    setShowMenu(false);
    if (user?.role === 'mess_owner') {
      navigation.getParent()?.navigate('OwnerStack', { screen: 'Dashboard' });
    } else {
      navigation.navigate('OwnerLogin');
    }
  };

  // Top padding: use safe area inset, fallback to StatusBar height
  const topPad = insets.top > 0 ? insets.top : (StatusBar.currentHeight ?? 24);

  return (
    <View style={[styles.container, { paddingTop: topPad + 10 }]}>
      {/* Location */}
      <View style={styles.locationRow}>
        <Ionicons name="location-sharp" size={16} color="#AB3500" />
        <Text style={styles.locationText}>{location}</Text>
      </View>

      {/* Owner access — 3-dot */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setShowMenu(v => !v)}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#594139" />
      </TouchableOpacity>

      {/* Dropdown */}
      {showMenu && (
        <>
          <Pressable style={styles.backdrop} onPress={() => setShowMenu(false)} />
          <View style={styles.dropdown}>
            <TouchableOpacity style={styles.dropdownItem} onPress={handleOwnerAccess}>
              <Ionicons name="business-outline" size={17} color="#AB3500" />
              <Text style={styles.dropdownText}>
                {user?.role === 'mess_owner' ? 'Owner Dashboard' : 'Are you a mess owner?'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#FFF8F6',
    zIndex: 100,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#261814',
    letterSpacing: 0.1,
  },
  menuButton: {
    padding: 6,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: -1000,
    right: -1000,
    bottom: -2000,
    zIndex: 98,
  },
  dropdown: {
    position: 'absolute',
    top: 52,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 6,
    minWidth: 210,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 99,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#261814',
  },
});
