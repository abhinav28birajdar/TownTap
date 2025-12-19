import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const cancellationReasons = [
  { id: 'schedule', label: 'Schedule conflict', icon: 'calendar-outline' },
  { id: 'found_better', label: 'Found a better option', icon: 'search-outline' },
  { id: 'price', label: 'Price too high', icon: 'pricetag-outline' },
  { id: 'not_needed', label: 'Service no longer needed', icon: 'close-circle-outline' },
  { id: 'delay', label: 'Provider is taking too long', icon: 'time-outline' },
  { id: 'emergency', label: 'Personal emergency', icon: 'alert-circle-outline' },
  { id: 'other', label: 'Other reason', icon: 'chatbubble-outline' },
];

export default function CancelOrderScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = async () => {
    if (!selectedReason) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    
    // Navigate back with success
    router.replace({
      pathname: '/orders',
      params: { cancelled: 'true' },
    });
  };

  const isValid = selectedReason && (selectedReason !== 'other' || customReason.trim().length > 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Cancel Order</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Warning Banner */}
        <View style={[styles.warningBanner, { backgroundColor: colors.warning + '15' }]}>
          <Ionicons name="warning" size={24} color={colors.warning} />
          <View style={styles.warningContent}>
            <ThemedText style={[styles.warningTitle, { color: colors.warning }]}>
              Cancellation Policy
            </ThemedText>
            <ThemedText style={[styles.warningText, { color: colors.textSecondary }]}>
              Cancelling within 2 hours of scheduled time may incur a 20% cancellation fee.
            </ThemedText>
          </View>
        </View>

        {/* Order Summary */}
        <View style={[styles.orderSummary, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.orderLabel}>Order ID</ThemedText>
          <ThemedText style={[styles.orderId, { color: colors.textSecondary }]}>
            #{params.id || 'ORD-123456'}
          </ThemedText>
        </View>

        {/* Reason Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Please select a reason for cancellation
          </ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            This helps us improve our service
          </ThemedText>

          <View style={styles.reasonsList}>
            {cancellationReasons.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.reasonCard,
                  { 
                    backgroundColor: colors.card,
                    borderColor: selectedReason === reason.id ? colors.primary : colors.border,
                    borderWidth: selectedReason === reason.id ? 2 : 1,
                  },
                ]}
                onPress={() => setSelectedReason(reason.id)}
              >
                <View style={[
                  styles.reasonIcon,
                  { backgroundColor: selectedReason === reason.id ? colors.primary + '15' : colors.background }
                ]}>
                  <Ionicons
                    name={reason.icon as any}
                    size={20}
                    color={selectedReason === reason.id ? colors.primary : colors.textSecondary}
                  />
                </View>
                <ThemedText
                  style={[
                    styles.reasonLabel,
                    selectedReason === reason.id && { color: colors.primary, fontWeight: '600' },
                  ]}
                >
                  {reason.label}
                </ThemedText>
                <View style={[
                  styles.radioButton,
                  { borderColor: selectedReason === reason.id ? colors.primary : colors.border },
                ]}>
                  {selectedReason === reason.id && (
                    <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Reason Input */}
        {selectedReason === 'other' && (
          <View style={styles.section}>
            <ThemedText style={styles.inputLabel}>Tell us more (required)</ThemedText>
            <TextInput
              style={[
                styles.textInput,
                { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Please describe your reason..."
              placeholderTextColor={colors.textSecondary}
              value={customReason}
              onChangeText={setCustomReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Refund Info */}
        <View style={[styles.refundInfo, { backgroundColor: colors.success + '10' }]}>
          <Ionicons name="information-circle" size={20} color={colors.success} />
          <ThemedText style={[styles.refundText, { color: colors.success }]}>
            Eligible refund will be processed within 5-7 business days to your original payment method.
          </ThemedText>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.keepButton, { borderColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <ThemedText style={[styles.keepButtonText, { color: colors.primary }]}>
            Keep Order
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.cancelButton,
            { backgroundColor: isValid ? colors.error : colors.border },
          ]}
          onPress={handleCancel}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <ThemedText style={styles.cancelButtonText}>
              Confirm Cancellation
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  warningBanner: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  orderLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  orderId: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  reasonsList: {
    gap: 10,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  reasonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonLabel: {
    flex: 1,
    fontSize: 15,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    height: 100,
    fontSize: 15,
  },
  refundInfo: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
  },
  refundText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  keepButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  keepButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
