import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PlaceholderScreen from '../../src/components/PlaceholderScreen';
import Button from '../../src/components/ui/Button';
import { COLORS } from '../../src/config/constants';
import { useAuthStore } from '../../src/stores/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  // If no user is logged in, show placeholder
  if (!user) {
    return (
      <PlaceholderScreen 
        title="Profile" 
        description="Please login to view your profile"
        icon="👤"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>
          {user.profile?.user_type === 'business_owner' ? 'Business Account' : 'Customer Account'}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user.profile?.full_name || 'Demo User'}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>User Type</Text>
          <Text style={styles.value}>
            {user.profile?.user_type === 'business_owner' ? 'Business Owner' : 'Customer'}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{user.phone || 'Not provided'}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray[600],
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: COLORS.gray[50],
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: COLORS.gray[900],
  },
  actions: {
    padding: 20,
    paddingTop: 0,
  },
});
