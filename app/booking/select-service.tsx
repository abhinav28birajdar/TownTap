/**
 * Service Selection Page - Phase 3
 * Select services from business for booking
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Service {
  id: string;
  name: string;
  description: string;
  final_price: number;
  duration: number;
  base_price: number;
  discount_percentage: number;
}

export default function SelectServicePage() {
  const { businessId } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, [businessId]);

  const loadServices = async () => {
    try {
      const { data: businessData } = await supabase
        .from('businesses')
        .select('business_name')
        .eq('id', businessId)
        .single();

      if (businessData) setBusinessName(businessData.business_name);

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) throw error;
      if (data) setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (serviceId: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServices(newSelected);
  };

  const calculateTotal = () => {
    return services
      .filter((s) => selectedServices.has(s.id))
      .reduce((sum, s) => sum + s.final_price, 0);
  };

  const handleContinue = () => {
    if (selectedServices.size === 0) return;

    const selectedServicesList = services.filter((s) => selectedServices.has(s.id));
    router.push({
      pathname: '/booking/booking-form',
      params: {
        businessId,
        services: JSON.stringify(selectedServicesList),
      },
    });
  };

  const renderServiceCard = ({ item }: { item: Service }) => {
    const isSelected = selectedServices.has(item.id);

    return (
      <TouchableOpacity
        onPress={() => toggleService(item.id)}
        activeOpacity={0.7}
      >
        <Card
          style={[
            styles.serviceCard,
            isSelected && {
              borderColor: colors.primary,
              borderWidth: 2,
            },
          ]}
        >
          <View style={styles.cardContent}>
            <View style={styles.checkbox}>
              {isSelected && <View style={styles.checkboxInner} />}
            </View>

            <View style={styles.serviceInfo}>
              <Text style={[styles.serviceName, { color: colors.text }]}>
                {item.name}
              </Text>

              {item.description && (
                <Text style={[styles.serviceDesc, { color: colors.textSecondary }]}>
                  {item.description}
                </Text>
              )}

              <View style={styles.serviceDetails}>
                {item.duration && (
                  <Text style={[styles.duration, { color: colors.textSecondary }]}>
                    ⏱️ {item.duration} mins
                  </Text>
                )}

                <View style={styles.priceContainer}>
                  {item.discount_percentage > 0 && (
                    <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                      ₹{item.base_price}
                    </Text>
                  )}
                  <Text style={[styles.price, { color: colors.primary }]}>
                    ₹{item.final_price}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Select Services</Text>
          <Text style={[styles.businessName, { color: colors.textSecondary }]}>
            {businessName}
          </Text>
        </View>
      </View>

      {/* Services List */}
      <FlatList
        data={services}
        renderItem={renderServiceCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Summary */}
      {selectedServices.size > 0 && (
        <View style={[styles.footer, { backgroundColor: colors.surface }]}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                {selectedServices.size} service(s) selected
              </Text>
              <Text style={[styles.totalAmount, { color: colors.text }]}>
                ₹{calculateTotal()}
              </Text>
            </View>

            <Button
              title="Continue"
              onPress={handleContinue}
              style={styles.continueButton}
            />
          </View>
        </View>
      )}
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
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  backIcon: {
    fontSize: 24,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  businessName: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
  },
  serviceCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  serviceDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    fontSize: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  continueButton: {
    minWidth: 140,
  },
});
