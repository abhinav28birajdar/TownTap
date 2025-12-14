import { ThemedButton, ThemedText } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookingConfirmationScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [isBooking, setIsBooking] = useState(false);

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    
    try {
      // Simulate booking API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success and navigate to tracking
      Alert.alert(
        'Booking Confirmed! 🎉',
        'Your service has been booked successfully',
        [
          {
            text: 'Track Order',
            onPress: () => router.replace('/customer/tracking?bookingId=123'),
          },
          {
            text: 'View Orders',
            onPress: () => router.replace('/customer/orders'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Confirmation</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.iconContainer}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.iconGradient}
          >
            <Ionicons name="checkmark-circle" size={80} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.titleContainer}>
          <ThemedText style={styles.title}>Review Your Booking</ThemedText>
          <ThemedText style={styles.subtitle}>
            Please confirm your booking details
          </ThemedText>
        </Animated.View>

        {/* Booking Details */}
        <Animated.View
          entering={FadeInDown.delay(300)}
          style={[styles.card, { backgroundColor: colors.card }]}
        >
          <ThemedText style={styles.cardTitle}>Service Details</ThemedText>
          
          <View style={styles.detailRow}>
            <Ionicons name="briefcase" size={20} color={colors.textSecondary} />
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Service</ThemedText>
              <ThemedText style={styles.detailValue}>{params.serviceName || 'Selected Service'}</ThemedText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="business" size={20} color={colors.textSecondary} />
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Business</ThemedText>
              <ThemedText style={styles.detailValue}>{params.businessName || 'Service Provider'}</ThemedText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={20} color={colors.textSecondary} />
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Date & Time</ThemedText>
              <ThemedText style={styles.detailValue}>
                {params.date || 'Today'} at {params.time || '10:00 AM'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color={colors.textSecondary} />
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Address</ThemedText>
              <ThemedText style={styles.detailValue}>
                {params.address || 'Your selected address'}
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Payment Details */}
        <Animated.View
          entering={FadeInDown.delay(400)}
          style={[styles.card, { backgroundColor: colors.card }]}
        >
          <ThemedText style={styles.cardTitle}>Payment Summary</ThemedText>
          
          <View style={styles.priceRow}>
            <ThemedText style={styles.priceLabel}>Service Charge</ThemedText>
            <ThemedText style={styles.priceValue}>₹{params.serviceCharge || '500'}</ThemedText>
          </View>

          <View style={styles.priceRow}>
            <ThemedText style={styles.priceLabel}>Taxes & Fees</ThemedText>
            <ThemedText style={styles.priceValue}>₹{params.taxes || '50'}</ThemedText>
          </View>

          {params.discount && (
            <View style={styles.priceRow}>
              <ThemedText style={[styles.priceLabel, { color: colors.success }]}>
                Discount
              </ThemedText>
              <ThemedText style={[styles.priceValue, { color: colors.success }]}>
                -₹{params.discount}
              </ThemedText>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.priceRow}>
            <ThemedText style={styles.totalLabel}>Total Amount</ThemedText>
            <ThemedText style={styles.totalValue}>₹{params.totalAmount || '550'}</ThemedText>
          </View>

          <View style={styles.paymentMethodRow}>
            <Ionicons name="card" size={20} color={colors.textSecondary} />
            <ThemedText style={styles.paymentMethodText}>
              {params.paymentMethod === 'upi' ? 'UPI' :
               params.paymentMethod === 'card' ? 'Card' :
               params.paymentMethod === 'wallet' ? 'Wallet' : 'Cash on Delivery'}
            </ThemedText>
          </View>
        </Animated.View>

        {/* Terms & Conditions */}
        <Animated.View
          entering={FadeInDown.delay(500)}
          style={[styles.termsCard, { backgroundColor: colors.card }]}
        >
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <ThemedText style={styles.termsText}>
            By confirming, you agree to our Terms of Service and Cancellation Policy
          </ThemedText>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <ThemedButton
          title={isBooking ? "Confirming..." : "Confirm Booking"}
          onPress={handleConfirmBooking}
          loading={isBooking}
          style={styles.confirmButton}
        />
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
          <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
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
  iconContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  paymentMethodText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  termsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  termsText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
  },
  confirmButton: {
    marginBottom: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
