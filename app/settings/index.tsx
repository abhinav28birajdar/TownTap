import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedCard } from '@/components/ui/themed-card';
import { ThemedText } from '@/components/ui/themed-text-enhanced';
import { Spacing } from '@/constants/spacing';
import { useAuth } from '@/contexts/auth-context';
import { useColors, useThemeContext } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { Stack, router } from 'expo-router';
import React from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  View
} from 'react-native';

type SettingItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  variant?: 'default' | 'danger';
};

function SettingItem({ icon, title, subtitle, onPress, rightElement, variant = 'default' }: SettingItemProps) {
  const colors = useColors();
  const iconColor = variant === 'danger' ? colors.error : colors.textSecondary;
  const titleColor = variant === 'danger' ? colors.error : colors.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingItem,
        { backgroundColor: pressed ? colors.backgroundTertiary : colors.surface },
      ]}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.backgroundTertiary }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      
      <View style={styles.settingContent}>
        <ThemedText variant="bodyMedium" weight="medium" style={{ color: titleColor }}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText variant="bodySmall" color="secondary" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      
      {rightElement || (
        onPress && <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const { themeMode, setThemeMode, isDark } = useThemeContext();
  const { signOut, profile, user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);

  const handleThemePress = () => {
    Alert.alert(
      'Choose Theme',
      'Select your preferred theme',
      [
        {
          text: 'Light',
          onPress: () => setThemeMode('light'),
        },
        {
          text: 'Dark',
          onPress: () => setThemeMode('dark'),
        },
        {
          text: 'System',
          onPress: () => setThemeMode('system'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/welcome');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        {profile && (
          <ThemedCard variant="elevated" style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <ThemedText variant="headlineMedium" color="inverse">
                  {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                </ThemedText>
              </View>
              <View style={styles.profileInfo}>
                <ThemedText variant="titleLarge" weight="semibold">
                  {profile.full_name || 'User'}
                </ThemedText>
                <ThemedText variant="bodySmall" color="secondary">
                  {user?.email || 'No email'}
                </ThemedText>
                <ThemedText variant="labelSmall" color="secondary" style={styles.roleTag}>
                  {profile.role.replace('_', ' ').toUpperCase()}
                </ThemedText>
              </View>
            </View>
            <ThemedButton
              title="Edit Profile"
              variant="outline"
              size="small"
              icon="create-outline"
              fullWidth
              onPress={() => router.push('/profile/edit')}
              style={styles.editButton}
            />
          </ThemedCard>
        )}

        {/* Appearance */}
        <View style={styles.section}>
          <ThemedText variant="titleSmall" color="secondary" style={styles.sectionTitle}>
            Appearance
          </ThemedText>
          <ThemedCard variant="outlined" padding={0}>
            <SettingItem
              icon="color-palette-outline"
              title="Theme"
              subtitle={getThemeLabel()}
              onPress={handleThemePress}
            />
          </ThemedCard>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <ThemedText variant="titleSmall" color="secondary" style={styles.sectionTitle}>
            Preferences
          </ThemedText>
          <ThemedCard variant="outlined" padding={0}>
            <SettingItem
              icon="notifications-outline"
              title="Push Notifications"
              subtitle="Receive booking updates and messages"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.borderLight, true: colors.primaryLight }}
                  thumbColor={colors.surface}
                />
              }
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingItem
              icon="location-outline"
              title="Location Services"
              subtitle="Find businesses near you"
              rightElement={
                <Switch
                  value={locationEnabled}
                  onValueChange={setLocationEnabled}
                  trackColor={{ false: colors.borderLight, true: colors.primaryLight }}
                  thumbColor={colors.surface}
                />
              }
            />
          </ThemedCard>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <ThemedText variant="titleSmall" color="secondary" style={styles.sectionTitle}>
            Account
          </ThemedText>
          <ThemedCard variant="outlined" padding={0}>
            <SettingItem
              icon="key-outline"
              title="Change Password"
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingItem
              icon="shield-checkmark-outline"
              title="Privacy & Security"
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}
            />
          </ThemedCard>
        </View>

        {/* About */}
        <View style={styles.section}>
          <ThemedText variant="titleSmall" color="secondary" style={styles.sectionTitle}>
            About
          </ThemedText>
          <ThemedCard variant="outlined" padding={0}>
            <SettingItem
              icon="information-circle-outline"
              title="App Version"
              subtitle={Application.nativeApplicationVersion || '1.0.0'}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingItem
              icon="document-text-outline"
              title="Terms of Service"
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingItem
              icon="shield-outline"
              title="Privacy Policy"
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}
            />
          </ThemedCard>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <ThemedCard variant="outlined" padding={0}>
            <SettingItem
              icon="log-out-outline"
              title="Sign Out"
              onPress={handleSignOut}
              variant="danger"
            />
          </ThemedCard>
        </View>

        <View style={styles.footer}>
          <ThemedText variant="bodySmall" color="tertiary" align="center">
            TownTap © 2025
          </ThemedText>
          <ThemedText variant="bodySmall" color="tertiary" align="center">
            Made with ❤️ for local businesses
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  profileCard: {
    marginBottom: Spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  roleTag: {
    marginTop: 4,
  },
  editButton: {
    marginTop: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  settingContent: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
  },
  footer: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
});
