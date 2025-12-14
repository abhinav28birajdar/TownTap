import { ThemedButton, ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const paymentMethods = [
  {
    id: 'upi',
    title: 'UPI',
    description: 'Google Pay, PhonePe, Paytm',
    icon: 'phone-portrait',
    color: '#4CAF50',
  },
  {
    id: 'card',
    title: 'Credit/Debit Card',
    description: 'Visa, Mastercard, Rupay',
    icon: 'card',
    color: '#2196F3',
  },
  {
    id: 'wallet',
    title: 'Digital Wallet',
    description: 'Amazon Pay, Mobikwik',
    icon: 'wallet',
    color: '#FF9800',
  },
  {
    id: 'cash',
    title: 'Cash on Delivery',
    description: 'Pay after service completion',
    icon: 'cash',
    color: '#9C27B0',
  },
];

export default function PaymentMethodScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const [selectedMethod, setSelectedMethod] = useState('');

  const handleContinue = () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    // Navigate to booking confirmation
    router.push({
      pathname: '/customer/booking-confirmation' as any,
      params: {
        ...params,
        paymentMethod: selectedMethod,
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Payment Method</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100)}>
          <ThemedText style={styles.sectionTitle}>Choose Payment Method</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Select your preferred way to pay
          </ThemedText>
        </Animated.View>

        <View style={styles.methodsContainer}>
          {paymentMethods.map((method, index) => (
            <Animated.View
              key={method.id}
              entering={FadeInDown.delay(200 + index * 100)}
            >
              <TouchableOpacity
                style={[
                  styles.methodCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: selectedMethod === method.id ? method.color : colors.border,
                  },
                ]}
                onPress={() => setSelectedMethod(method.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: method.color }]}>
                  <Ionicons name={method.icon as any} size={28} color="#FFFFFF" />
                </View>

                <View style={styles.methodInfo}>
                  <ThemedText style={styles.methodTitle}>{method.title}</ThemedText>
                  <ThemedText style={styles.methodDescription}>
                    {method.description}
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.radioButton,
                    {
                      borderColor: selectedMethod === method.id ? method.color : colors.border,
                      backgroundColor:
                        selectedMethod === method.id ? method.color : 'transparent',
                    },
                  ]}
                >
                  {selectedMethod === method.id && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Security Note */}
        <Animated.View
          entering={FadeInDown.delay(700)}
          style={[styles.securityNote, { backgroundColor: colors.card }]}
        >
          <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          <View style={styles.securityTextContainer}>
            <ThemedText style={styles.securityTitle}>Secure Payment</ThemedText>
            <ThemedText style={styles.securityDescription}>
              Your payment information is encrypted and secure
            </ThemedText>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.totalContainer}>
          <ThemedText style={styles.totalLabel}>Total Amount</ThemedText>
          <ThemedText style={styles.totalAmount}>₹{params.totalAmount || '0'}</ThemedText>
        </View>
        <ThemedButton
          title="Continue to Confirmation"
          onPress={handleContinue}
          disabled={!selectedMethod}
        />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 24,
  },
  methodsContainer: {
    gap: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 12,
    opacity: 0.6,
  },
  radioButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 100,
  },
  securityTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 12,
    opacity: 0.6,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    opacity: 0.6,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
