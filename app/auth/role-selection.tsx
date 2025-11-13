import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Role = 'customer' | 'business_owner';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      router.push({
        pathname: '/auth/sign-up',
        params: { role: selectedRole },
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Select how you want to use TownTap
          </Text>
        </View>

        <View style={styles.rolesContainer}>
          <RoleCard
            role="customer"
            title="I'm a Customer"
            description="Find and book services from local businesses"
            icon="person"
            selected={selectedRole === 'customer'}
            onPress={() => setSelectedRole('customer')}
          />

          <RoleCard
            role="business_owner"
            title="I'm a Business Owner"
            description="Manage your business and connect with customers"
            icon="storefront"
            selected={selectedRole === 'business_owner'}
            onPress={() => setSelectedRole('business_owner')}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedRole && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedRole}
        >
          <LinearGradient
            colors={
              selectedRole
                ? [Colors.primary, Colors.primaryDark]
                : [Colors.border, Colors.borderLight]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.background} />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

interface RoleCardProps {
  role: Role;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  title,
  description,
  icon,
  selected,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.roleCard, selected && styles.roleCardSelected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.roleIcon, selected && styles.roleIconSelected]}>
      <Ionicons
        name={icon}
        size={40}
        color={selected ? Colors.background : Colors.primary}
      />
    </View>
    <Text style={styles.roleTitle}>{title}</Text>
    <Text style={styles.roleDescription}>{description}</Text>
    {selected && (
      <View style={styles.selectedBadge}>
        <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  rolesContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  roleCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  roleCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '10',
  },
  roleIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  roleIconSelected: {
    backgroundColor: Colors.primary,
  },
  roleTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  roleDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
  continueButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md + 2,
    gap: Spacing.sm,
  },
  continueText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.background,
  },
});
