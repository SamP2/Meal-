import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

interface Mess {
  id: string;
  name: string;
  address: string;
  verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
}

// ─── Row component ────────────────────────────────────────────────────────────
function ActionRow({
  icon,
  label,
  sublabel,
  onPress,
  destructive = false,
  chevron = true,
}: {
  icon: any;
  label: string;
  sublabel?: string;
  onPress: () => void;
  destructive?: boolean;
  chevron?: boolean;
}) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.rowIcon, destructive && s.rowIconDestructive]}>
        <Ionicons name={icon} size={18} color={destructive ? '#DC2626' : '#AB3500'} />
      </View>
      <View style={s.rowText}>
        <Text style={[s.rowLabel, destructive && s.rowLabelDestructive]}>{label}</Text>
        {sublabel && <Text style={s.rowSublabel}>{sublabel}</Text>}
      </View>
      {chevron && (
        <Ionicons name="chevron-forward" size={16} color="#C4A99E" />
      )}
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function OwnerAccountScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [messes, setMesses] = useState<Mess[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadMesses();
    }, [])
  );

  const loadMesses = async () => {
    try {
      const { data } = await apiClient.get('/messes/mine');
      setMesses(data || []);
    } catch {
      // silently fail — messes list is supplementary here
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'StudentStack', params: { screen: 'StudentHome' } }],
            });
          },
        },
      ]
    );
  };

  const handleDeleteMess = (mess: Mess) => {
    Alert.alert(
      'Delete Mess',
      `Are you sure you want to delete "${mess.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/messes/${mess.id}`);
              setMesses(prev => prev.filter(m => m.id !== mess.id));
              Alert.alert('Deleted', `${mess.name} has been removed.`);
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Could not delete mess.');
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@messfinder.app?subject=Owner Support Request');
  };

  // Derive initials from email
  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'OW';

  // Overall verification: verified if at least one mess is verified
  const isVerified = messes.some(m => m.verified);

  return (
    <SafeAreaView style={s.root} edges={['top', 'left', 'right']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Page title ── */}
        <Text style={s.pageTitle}>Account</Text>

        {/* ── Profile card ── */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileEmail}>{user?.email}</Text>
            <Text style={s.profileRole}>Mess Owner</Text>
          </View>
        </View>

        {/* ── Verification status ── */}
        <View style={[s.verificationCard, isVerified ? s.verifiedCard : s.pendingCard]}>
          <Ionicons
            name={isVerified ? 'checkmark-circle' : 'time-outline'}
            size={20}
            color={isVerified ? '#10B981' : '#D97706'}
          />
          <View style={{ flex: 1 }}>
            <Text style={[s.verificationTitle, isVerified ? s.verifiedText : s.pendingText]}>
              {isVerified ? 'Verified Mess Owner' : 'Verification Pending'}
            </Text>
            <Text style={s.verificationSub}>
              {isVerified
                ? 'Your mess is verified and trusted by students.'
                : 'Your mess is under review. This usually takes 1–2 days.'}
            </Text>
          </View>
        </View>

        {/* ── Mess management ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Mess Management</Text>
          <View style={s.card}>
            <ActionRow
              icon="add-circle-outline"
              label="Add New Mess"
              sublabel="Register another mess location"
              onPress={() => navigation.navigate('SimpleRegisterMess')}
            />
            {messes.map((mess, index) => (
              <View key={mess.id}>
                {index > 0 && <View style={s.divider} />}
                <View style={s.divider} />
                <ActionRow
                  icon="trash-outline"
                  label={`Delete "${mess.name}"`}
                  sublabel={mess.address}
                  onPress={() => handleDeleteMess(mess)}
                  destructive
                />
              </View>
            ))}
          </View>
        </View>

        {/* ── Support ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Support</Text>
          <View style={s.card}>
            <ActionRow
              icon="mail-outline"
              label="Contact Support"
              sublabel="Get help with your account or mess"
              onPress={handleContactSupport}
            />
          </View>
        </View>

        {/* ── Logout ── */}
        <View style={s.section}>
          <View style={s.card}>
            <ActionRow
              icon="log-out-outline"
              label="Logout"
              onPress={handleLogout}
              destructive
              chevron={false}
            />
          </View>
        </View>

        {/* App version */}
        <Text style={s.version}>MessFinder · Owner v1.0</Text>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#FFF8F6' },
  scroll:  { flex: 1 },
  content: { padding: 20 },

  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#261814',
    marginBottom: 20,
  },

  // Profile card
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFDBD0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#AB3500' },
  profileInfo: { flex: 1 },
  profileEmail: { fontSize: 15, fontWeight: '700', color: '#261814', marginBottom: 2 },
  profileRole:  { fontSize: 13, color: '#594139' },

  // Verification
  verificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  verifiedCard: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  pendingCard:  { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  verificationTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  verifiedText: { color: '#065F46' },
  pendingText:  { color: '#92400E' },
  verificationSub: { fontSize: 12, color: '#594139', lineHeight: 17 },

  // Sections
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8D7168',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  divider: { height: 1, backgroundColor: '#F4EBE4', marginLeft: 56 },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF1ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDestructive: { backgroundColor: '#FEF2F2' },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: '#261814' },
  rowLabelDestructive: { color: '#DC2626' },
  rowSublabel: { fontSize: 12, color: '#8D7168', marginTop: 1 },

  // Version
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#C4A99E',
    marginTop: 8,
  },
});
