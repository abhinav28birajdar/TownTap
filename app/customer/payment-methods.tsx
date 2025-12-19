/**
 * Payment Methods Page - Phase 11
 * Manage saved payment methods
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
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking';
  card_last4?: string;
  card_brand?: string;
  upi_id?: string;
  bank_name?: string;
  is_default: boolean;
  created_at: string;
}

export default function PaymentMethodsPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthStore();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [methodType, setMethodType] = useState<'card' | 'upi' | 'netbanking'>('card');
  
  // Card form
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  // UPI form
  const [upiId, setUpiId] = useState('');
  
  // NetBanking form
  const [bankName, setBankName] = useState('');

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user?.id || '')
        .order('is_default', { ascending: false });

      if (error) throw error;
      if (data) setPaymentMethods(data);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      let methodData: any = {
        user_id: user?.id,
        type: methodType,
        is_default: paymentMethods.length === 0,
      };

      if (methodType === 'card') {
        if (!cardNumber || !cardHolderName || !expiryDate || !cvv) {
          alert('Please fill all card details');
          return;
        }
        methodData.card_last4 = cardNumber.slice(-4);
        methodData.card_brand = detectCardBrand(cardNumber);
      } else if (methodType === 'upi') {
        if (!upiId) {
          alert('Please enter UPI ID');
          return;
        }
        methodData.upi_id = upiId;
      } else if (methodType === 'netbanking') {
        if (!bankName) {
          alert('Please select bank');
          return;
        }
        methodData.bank_name = bankName;
      }

      const { error } = await (supabase
        .from('payment_methods') as any)
        .insert([methodData]);

      if (error) throw error;

      alert('Payment method added successfully!');
      setShowAddMethod(false);
      resetForm();
      loadPaymentMethods();
    } catch (error) {
      console.error('Error adding payment method:', error);
      alert('Failed to add payment method');
    }
  };

  const detectCardBrand = (number: string): string => {
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5')) return 'Mastercard';
    if (number.startsWith('3')) return 'Amex';
    return 'Unknown';
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      // Remove default from all methods
      await (supabase
        .from('payment_methods') as any)
        .update({ is_default: false })
        .eq('user_id', user?.id || '');

      // Set new default
      const { error } = await (supabase
        .from('payment_methods') as any)
        .update({ is_default: true })
        .eq('id', methodId);

      if (error) throw error;
      loadPaymentMethods();
    } catch (error) {
      console.error('Error setting default:', error);
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('payment_methods')
                .delete()
                .eq('id', methodId);

              if (error) throw error;
              loadPaymentMethods();
            } catch (error) {
              console.error('Error deleting method:', error);
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setCardNumber('');
    setCardHolderName('');
    setExpiryDate('');
    setCvv('');
    setUpiId('');
    setBankName('');
  };

  const getMethodIcon = (method: PaymentMethod) => {
    if (method.type === 'card') return <Ionicons name="card" size={24} color={colors.primary} />;
    if (method.type === 'upi') return <Ionicons name="phone-portrait" size={24} color={colors.primary} />;
    if (method.type === 'netbanking') return <Ionicons name="business" size={24} color={colors.primary} />;
    return <Ionicons name="cash" size={24} color={colors.primary} />;
  };

  const getMethodDisplay = (method: PaymentMethod): string => {
    if (method.type === 'card') return `${method.card_brand} •••• ${method.card_last4}`;
    if (method.type === 'upi') return method.upi_id || '';
    if (method.type === 'netbanking') return method.bank_name || '';
    return '';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Payment Methods</Text>
        </View>

        {/* Add Method Button */}
        <Card style={styles.addCard}>
          <Button
            title="+ Add New Payment Method"
            onPress={() => setShowAddMethod(true)}
            style={([styles.addButton, { backgroundColor: colors.primary }] as any)}
          />
        </Card>

        {/* Payment Methods List */}
        {paymentMethods.map((method) => (
          <Card key={method.id} style={styles.methodCard}>
            <View style={styles.methodHeader}>
              <View style={styles.methodLeft}>
                <View style={styles.methodIcon}>{getMethodIcon(method)}</View>
                <View>
                  <View style={styles.methodTitleRow}>
                    <Text style={[styles.methodTitle, { color: colors.text }]}>
                      {getMethodDisplay(method)}
                    </Text>
                    {method.is_default && <Badge text="Default" variant="success" />}
                  </View>
                  <Text style={[styles.methodType, { color: colors.textSecondary }]}>
                    {method.type.toUpperCase()}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDeleteMethod(method.id)}>
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
            {!method.is_default && (
              <Button
                title="Set as Default"
                onPress={() => handleSetDefault(method.id)}
                style={styles.setDefaultButton}
              />
            )}
          </Card>
        ))}

        {paymentMethods.length === 0 && (
          <Card style={styles.emptyCard}>
            <Ionicons name="card" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No payment methods added yet
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Add Method Modal */}
      <Modal
        visible={showAddMethod}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddMethod(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Add Payment Method
              </Text>

              {/* Method Type Selection */}
              <View style={styles.typeSelection}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    methodType === 'card' && styles.typeButtonActive,
                    methodType === 'card' && { borderColor: colors.primary, backgroundColor: '#E3F2FD' },
                  ]}
                  onPress={() => setMethodType('card')}
                >
                  <Ionicons name="card" size={24} color={colors.primary} />
                  <Text style={styles.typeLabel}>Card</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    methodType === 'upi' && styles.typeButtonActive,
                    methodType === 'upi' && { borderColor: colors.primary, backgroundColor: '#E3F2FD' },
                  ]}
                  onPress={() => setMethodType('upi')}
                >
                  <Ionicons name="phone-portrait" size={24} color={colors.primary} />
                  <Text style={styles.typeLabel}>UPI</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    methodType === 'netbanking' && styles.typeButtonActive,
                    methodType === 'netbanking' && { borderColor: colors.primary, backgroundColor: '#E3F2FD' },
                  ]}
                  onPress={() => setMethodType('netbanking')}
                >
                  <Ionicons name="business" size={24} color={colors.primary} />
                  <Text style={styles.typeLabel}>NetBanking</Text>
                </TouchableOpacity>
              </View>

              {/* Card Form */}
              {methodType === 'card' && (
                <>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Card Number"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    maxLength={16}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Cardholder Name"
                    placeholderTextColor={colors.textSecondary}
                    value={cardHolderName}
                    onChangeText={setCardHolderName}
                  />
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, styles.halfInput, { color: colors.text }]}
                      placeholder="MM/YY"
                      placeholderTextColor={colors.textSecondary}
                      value={expiryDate}
                      onChangeText={setExpiryDate}
                      maxLength={5}
                    />
                    <TextInput
                      style={[styles.input, styles.halfInput, { color: colors.text }]}
                      placeholder="CVV"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      value={cvv}
                      onChangeText={setCvv}
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                </>
              )}

              {/* UPI Form */}
              {methodType === 'upi' && (
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="UPI ID (e.g., username@upi)"
                  placeholderTextColor={colors.textSecondary}
                  value={upiId}
                  onChangeText={setUpiId}
                />
              )}

              {/* NetBanking Form */}
              {methodType === 'netbanking' && (
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Bank Name"
                  placeholderTextColor={colors.textSecondary}
                  value={bankName}
                  onChangeText={setBankName}
                />
              )}

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setShowAddMethod(false);
                    resetForm();
                  }}
                  style={([styles.modalButton, styles.cancelButton] as any)}
                />
                <Button
                  title="Add Method"
                  onPress={handleAddPaymentMethod}
                  style={([styles.modalButton, styles.confirmButton] as any)}
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
  addCard: {
    margin: spacing.md,
    padding: spacing.md,
  },
  addButton: {
    // backgroundColor applied inline
  },
  methodCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  methodIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  methodType: {
    fontSize: 12,
  },
  deleteIcon: {
    fontSize: 20,
  },
  setDefaultButton: {
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
  typeSelection: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  typeButton: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    // borderColor and backgroundColor applied inline
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BorderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfInput: {
    flex: 1,
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
  confirmButton: {
    // backgroundColor applied inline
  },
});
