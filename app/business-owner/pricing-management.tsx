/**
 * Pricing Management - Phase 9
 * Manage service pricing and packages
 */

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { BorderRadius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface PricingTier {
  id: string;
  service_name: string;
  tier_name: string;
  price: number;
  duration_minutes: number;
  description: string;
  features: string[];
  active: boolean;
}

export default function PricingManagementPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthStore();

  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tierName, setTierName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadPricingTiers();
  }, []);

  const loadPricingTiers = async () => {
    try {
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user?.id || '')
        .single();

      if (businessError) throw businessError;

      const { data, error } = await supabase
        .from('service_pricing_tiers')
        .select(`
          *,
          services (name)
        `)
        .eq('business_id', (businessData as any).id)
        .order('price');

      if (error) throw error;

      if (data) {
        setPricingTiers(
          data.map((tier: any) => ({
            id: tier.id,
            service_name: tier.services?.name || 'Unknown',
            tier_name: tier.tier_name,
            price: tier.price,
            duration_minutes: tier.duration_minutes,
            description: tier.description,
            features: tier.features || [],
            active: tier.active,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading pricing tiers:', error);
    }
  };

  const handleSavePricing = async () => {
    if (!tierName.trim() || !price || !duration) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user?.id || '')
        .single();

      if (businessError) throw businessError;

      // This would require selecting a service first
      // For now, showing the structure
      alert('Pricing tier creation requires service selection - coming soon!');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert('Failed to save pricing');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Pricing Management
          </Text>
        </View>

        {/* Pricing Strategy Card */}
        <Card style={styles.strategyCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Pricing Strategy
          </Text>
          <View style={styles.strategyItem}>
            <Ionicons name="cash" size={24} color={colors.primary} />
            <View style={styles.strategyContent}>
              <Text style={[styles.strategyTitle, { color: colors.text }]}>
                Competitive Pricing
              </Text>
              <Text style={[styles.strategyDesc, { color: colors.textSecondary }]}>
                Your prices are 12% below market average
              </Text>
            </View>
          </View>
          <View style={styles.strategyItem}>
            <Ionicons name="stats-chart" size={24} color={colors.primary} />
            <View style={styles.strategyContent}>
              <Text style={[styles.strategyTitle, { color: colors.text }]}>
                Dynamic Pricing
              </Text>
              <Text style={[styles.strategyDesc, { color: colors.textSecondary }]}>
                Adjust prices based on demand
              </Text>
            </View>
            <Badge text="Coming Soon" variant="info" />
          </View>
        </Card>

        {/* Add Button */}
        <Card style={styles.addCard}>
          <Button
            title="+ Add Pricing Tier"
            onPress={() => setShowAddModal(true)}
            style={styles.addButton}
          />
        </Card>

        {/* Pricing Tiers */}
        {pricingTiers.map((tier) => (
          <Card key={tier.id} style={styles.tierCard}>
            <View style={styles.tierHeader}>
              <View style={styles.tierLeft}>
                <Text style={[styles.tierName, { color: colors.text }]}>
                  {tier.tier_name}
                </Text>
                <Text style={[styles.serviceName, { color: colors.textSecondary }]}>
                  {tier.service_name}
                </Text>
              </View>
              {!tier.active && <Badge text="Inactive" variant="error" />}
            </View>

            <View style={styles.tierPrice}>
              <Text style={[styles.priceValue, { color: colors.primary }]}>
                ₹{tier.price}
              </Text>
              <Text style={[styles.priceDuration, { color: colors.textSecondary }]}>
                {tier.duration_minutes} minutes
              </Text>
            </View>

            {tier.description && (
              <Text style={[styles.tierDescription, { color: colors.textSecondary }]}>
                {tier.description}
              </Text>
            )}

            {tier.features.length > 0 && (
              <View style={styles.featuresSection}>
                <Text style={[styles.featuresTitle, { color: colors.text }]}>
                  Includes:
                </Text>
                {tier.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={[styles.featureIcon, { color: colors.primary }]}>✓</Text>
                    <Text style={[styles.featureText, { color: colors.text }]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.tierActions}>
              <Button title="Edit" style={([styles.tierButton, { backgroundColor: colors.primary }] as any)} />
              <Button
                title="Duplicate"
                style={([styles.tierButton, styles.duplicateButton] as any)}
              />
            </View>
          </Card>
        ))}

        {pricingTiers.length === 0 && (
          <Card style={styles.emptyCard}>
            <Ionicons name="wallet" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No pricing tiers yet. Add your first pricing option!
            </Text>
          </Card>
        )}

        {/* Pricing Tips */}
        <Card style={styles.tipsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Pricing Tips
          </Text>
          <View style={styles.tipItem}>
            <Text style={[styles.tipNumber, { backgroundColor: colors.primary }]}>1</Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              Offer multiple tiers to cater to different customer budgets
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={[styles.tipNumber, { backgroundColor: colors.primary }]}>2</Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              Include clear descriptions of what each tier includes
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={[styles.tipNumber, { backgroundColor: colors.primary }]}>3</Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              Review and adjust pricing based on customer feedback and demand
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Add Pricing Tier
              </Text>

              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Tier Name *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.muted,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="e.g., Basic, Premium, Deluxe"
                placeholderTextColor={colors.textSecondary}
                value={tierName}
                onChangeText={setTierName}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Price (₹) *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.muted,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="500"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Duration (minutes) *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.muted,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="60"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={duration}
                onChangeText={setDuration}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Description
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    color: colors.text,
                    backgroundColor: colors.muted,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Describe what's included..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setShowAddModal(false)}
                  style={([styles.modalButton, styles.cancelButton] as any)}
                />
                <Button
                  title="Save"
                  onPress={handleSavePricing}
                  style={([styles.modalButton, { backgroundColor: colors.primary }] as any)}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  backIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  strategyCard: {
    margin: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  strategyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: spacing.md,
  },
  strategyContent: {
    flex: 1,
  },
  strategyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  strategyDesc: {
    fontSize: 14,
  },
  addCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  addButton: {},
  tierCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tierLeft: {
    flex: 1,
  },
  tierName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  serviceName: {
    fontSize: 14,
  },
  tierPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  priceDuration: {
    fontSize: 14,
  },
  tierDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  featuresSection: {
    marginBottom: spacing.md,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  featureIcon: {
    fontSize: 16,
  },
  featureText: {
    fontSize: 14,
  },
  tierActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tierButton: {
    flex: 1,
  },
  editButton: {},
  duplicateButton: {
    backgroundColor: '#999',
  },
  emptyCard: {
    margin: spacing.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: spacing.md,
  },
  tipsCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
    backgroundColor: '#E3F2FD',
  },
  tipItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    margin: spacing.md,
    marginTop: spacing.xl * 3,
    borderRadius: BorderRadius.lg,
    padding: spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  confirmButton: {},
});
