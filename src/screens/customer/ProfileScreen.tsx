import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useModernTheme } from '../../context/ModernThemeContext';
import { useAuthStore } from '../../stores/authStore';

const ProfileScreen: React.FC = () => {
  const { colors, toggleTheme, isDark } = useModernTheme();
  const { user, userProfile, logout, loading: authLoading } = useAuthStore();

  // The profile data is already available in the user object from the auth store.
  // No need to fetch it again.
  const profile = userProfile;

  if (authLoading && !profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.colors?.primary || '#3B82F6'} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: colors.colors?.error || 'red' }}>Could not load profile. Please try again later.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.colors?.background || '#F8FAFC' }]}>
      <View style={styles.header}>
        <Image
          source={profile?.profile_picture_url ? { uri: profile.profile_picture_url } : require('../../../assets/images/icon.png')}
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: colors.colors?.text || '#1E293B' }]}>{profile?.full_name || 'User'}</Text>
        <Text style={[styles.email, { color: colors.colors?.secondary || '#64748B' }]}>{user?.email}</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.colors?.primary || '#3B82F6' }]}>{(profile as any)?.total_orders || 0}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.colors?.primary || '#3B82F6' }]}>{(profile as any)?.review_count || 0}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.colors?.primary || '#3B82F6' }]}>{(profile as any)?.rating || 0}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={[styles.menuText, { color: colors.colors?.text || '#1E293B' }]}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={[styles.menuText, { color: colors.colors?.text || '#1E293B' }]}>Order History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={[styles.menuText, { color: colors.colors?.text || '#1E293B' }]}>My Reviews</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
          <Text style={[styles.menuText, { color: colors.colors?.text || '#1E293B' }]}>Switch to {isDark ? 'Light' : 'Dark'} Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.colors?.error || '#EF4444' }]} onPress={logout}>
          <Text style={[styles.menuText, { color: '#fff' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginTop: 32, marginBottom: 16 },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },
  name: { fontSize: 22, fontWeight: 'bold' },
  email: { fontSize: 15, marginBottom: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 13, color: '#64748B' },
  menu: { marginTop: 24, marginHorizontal: 24 },
  menuItem: { padding: 16, borderRadius: 10, backgroundColor: '#F1F5F9', marginBottom: 12 },
  menuText: { fontSize: 16 },
});

export default ProfileScreen;
