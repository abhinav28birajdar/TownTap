/**
 * TownTap - Role Selection Screen
 * New users select their role (customer or business owner)
 */

import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const Colors = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  secondary: '#10B981',
  secondaryLight: '#D1FAE5',
  grayDark: '#111827',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
  white: '#FFFFFF',
};

type Role = 'customer' | 'business_owner';

export default function RoleSelectionScreen() {
  const { user, refreshProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole || !user) return;

    try {
      setLoading(true);

      // Update the user's profile with selected role (user_type column)
      const { error } = await supabase
        .from('profiles')
        .update({ 
          user_type: selectedRole,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh the profile in context
      await refreshProfile();

      Toast.show({
        type: 'success',
        text1: 'Welcome to TownTap!',
        text2: selectedRole === 'customer' 
          ? 'Start exploring local services' 
          : 'Set up your business profile',
      });

      // Navigate based on role
      if (selectedRole === 'business_owner') {
        router.replace('/business/(tabs)');
      } else {
        router.replace('/customer/(tabs)');
      }
    } catch (error: any) {
      console.error('Error setting role:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to set up your account',
      });
    } finally {
      setLoading(false);
    }
  };

  const RoleCard = ({ 
    role, 
    title, 
    description, 
    icon, 
    features 
  }: { 
    role: Role; 
    title: string; 
    description: string; 
    icon: keyof typeof Ionicons.glyphMap;
    features: string[];
  }) => {
    const isSelected = selectedRole === role;
    
    return (
      <TouchableOpacity
        style={[
          styles.roleCard,
          isSelected && styles.roleCardSelected,
        ]}
        onPress={() => setSelectedRole(role)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.roleIconContainer,
          isSelected && styles.roleIconContainerSelected,
        ]}>
          <Ionicons 
            name={icon} 
            size={32} 
            color={isSelected ? Colors.white : Colors.primary} 
          />
        </View>
        
        <Text style={[
          styles.roleTitle,
          isSelected && styles.roleTitleSelected,
        ]}>
          {title}
        </Text>
        
        <Text style={styles.roleDescription}>{description}</Text>
        
        <View style={styles.featuresList}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons 
                name="checkmark-circle" 
                size={16} 
                color={isSelected ? Colors.primary : Colors.gray} 
              />
              <Text style={[
                styles.featureText,
                isSelected && styles.featureTextSelected,
              ]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>
        
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="storefront" size={40} color={Colors.primary} />
        </View>
        <Text style={styles.headerTitle}>Welcome to TownTap</Text>
        <Text style={styles.headerSubtitle}>
          How would you like to use TownTap?
        </Text>
      </View>

      {/* Role Cards */}
      <View style={styles.rolesContainer}>
        <RoleCard
          role="customer"
          title="I'm a Customer"
          description="Looking for local services and businesses"
          icon="person"
          features={[
            'Discover local services',
            'Book appointments easily',
            'Track orders in real-time',
            'Leave reviews & ratings',
          ]}
        />

        <RoleCard
          role="business_owner"
          title="I'm a Business Owner"
          description="I want to grow my business on TownTap"
          icon="business"
          features={[
            'List your services',
            'Manage bookings',
            'Connect with customers',
            'Grow your business',
          ]}
        />
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            !selectedRole && styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedRole || loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Text style={styles.continueBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.switchText}>
          You can change this later in settings
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.grayDark,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
  },
  rolesContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 16,
  },
  roleCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.grayLight,
    position: 'relative',
  },
  roleCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '20',
  },
  roleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleIconContainerSelected: {
    backgroundColor: Colors.primary,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.grayDark,
    marginBottom: 4,
  },
  roleTitleSelected: {
    color: Colors.primary,
  },
  roleDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 12,
  },
  featuresList: {
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: Colors.gray,
  },
  featureTextSelected: {
    color: Colors.grayDark,
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  continueBtnDisabled: {
    backgroundColor: Colors.gray,
  },
  continueBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  switchText: {
    fontSize: 13,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 12,
  },
});
