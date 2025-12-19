import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    Share,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const bookingDetails = {
  id: 'BK-2024-1234',
  status: 'confirmed',
  service: {
    name: 'Deep Home Cleaning',
    category: 'Cleaning',
    description: 'Complete deep cleaning of your home including kitchen, bathrooms, bedrooms, and living areas.',
    image: 'https://via.placeholder.com/400x200',
  },
  provider: {
    name: 'CleanPro Services',
    rating: 4.8,
    reviews: 245,
    phone: '+91 98765 43210',
    image: 'https://via.placeholder.com/100',
    verified: true,
  },
  schedule: {
    date: 'December 28, 2024',
    day: 'Saturday',
    time: '10:00 AM - 2:00 PM',
    duration: '4 hours',
  },
  address: {
    type: 'Home',
    line1: '123, Green Valley Apartments',
    line2: 'Sector 42, Gurugram',
    city: 'Haryana - 122001',
    landmark: 'Near Central Mall',
  },
  payment: {
    method: 'Google Pay',
    subtotal: 1999,
    discount: 200,
    taxes: 108,
    total: 1907,
    status: 'paid',
  },
  addons: [
    { name: 'Balcony Cleaning', price: 299 },
    { name: 'Window Cleaning', price: 199 },
  ],
  instructions: 'Please bring your own cleaning supplies. The main door code is 1234.',
};

export default function BookingConfirmationDetailScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return colors.success;
      case 'pending': return colors.warning;
      case 'cancelled': return colors.error;
      case 'completed': return colors.info;
      default: return colors.textSecondary;
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Booking Confirmation - ${bookingDetails.id}\n\nService: ${bookingDetails.service.name}\nDate: ${bookingDetails.schedule.date}\nTime: ${bookingDetails.schedule.time}\n\nTownTap App`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Booking Details</ThemedText>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statusCard}
        >
          <View style={styles.statusHeader}>
            <View style={styles.statusBadge}>
              <Ionicons
                name={bookingDetails.status === 'confirmed' ? 'checkmark-circle' : 'time'}
                size={18}
                color={colors.success}
              />
              <ThemedText style={styles.statusBadgeText}>
                {bookingDetails.status.charAt(0).toUpperCase() + bookingDetails.status.slice(1)}
              </ThemedText>
            </View>
            <ThemedText style={styles.bookingId}>{bookingDetails.id}</ThemedText>
          </View>
          <View style={styles.scheduleInfo}>
            <View style={styles.scheduleItem}>
              <Ionicons name="calendar" size={20} color="rgba(255,255,255,0.8)" />
              <View>
                <ThemedText style={styles.scheduleDate}>{bookingDetails.schedule.date}</ThemedText>
                <ThemedText style={styles.scheduleDay}>{bookingDetails.schedule.day}</ThemedText>
              </View>
            </View>
            <View style={styles.scheduleDivider} />
            <View style={styles.scheduleItem}>
              <Ionicons name="time" size={20} color="rgba(255,255,255,0.8)" />
              <View>
                <ThemedText style={styles.scheduleDate}>{bookingDetails.schedule.time}</ThemedText>
                <ThemedText style={styles.scheduleDay}>{bookingDetails.schedule.duration}</ThemedText>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Service Details */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Service Details</ThemedText>
          <View style={[styles.serviceCard, { backgroundColor: colors.card }]}>
            <Image source={{ uri: bookingDetails.service.image }} style={styles.serviceImage} />
            <View style={styles.serviceInfo}>
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
                <ThemedText style={[styles.categoryText, { color: colors.primary }]}>
                  {bookingDetails.service.category}
                </ThemedText>
              </View>
              <ThemedText style={styles.serviceName}>{bookingDetails.service.name}</ThemedText>
              <ThemedText style={[styles.serviceDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                {bookingDetails.service.description}
              </ThemedText>
            </View>
          </View>

          {/* Add-ons */}
          {bookingDetails.addons.length > 0 && (
            <View style={[styles.addonsCard, { backgroundColor: colors.card }]}>
              <ThemedText style={styles.addonsTitle}>Add-ons</ThemedText>
              {bookingDetails.addons.map((addon, index) => (
                <View key={index} style={styles.addonItem}>
                  <View style={styles.addonInfo}>
                    <Ionicons name="add-circle" size={18} color={colors.success} />
                    <ThemedText style={styles.addonName}>{addon.name}</ThemedText>
                  </View>
                  <ThemedText style={[styles.addonPrice, { color: colors.primary }]}>
                    +₹{addon.price}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Service Provider */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Service Provider</ThemedText>
          <View style={[styles.providerCard, { backgroundColor: colors.card }]}>
            <Image source={{ uri: bookingDetails.provider.image }} style={styles.providerImage} />
            <View style={styles.providerInfo}>
              <View style={styles.providerHeader}>
                <ThemedText style={styles.providerName}>{bookingDetails.provider.name}</ThemedText>
                {bookingDetails.provider.verified && (
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                )}
              </View>
              <View style={styles.providerRating}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <ThemedText style={styles.ratingText}>
                  {bookingDetails.provider.rating} ({bookingDetails.provider.reviews} reviews)
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity style={[styles.callButton, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="call" size={20} color={colors.success} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Service Address</ThemedText>
          <View style={[styles.addressCard, { backgroundColor: colors.card }]}>
            <View style={[styles.addressIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="location" size={22} color={colors.primary} />
            </View>
            <View style={styles.addressInfo}>
              <View style={styles.addressTypeRow}>
                <ThemedText style={styles.addressType}>{bookingDetails.address.type}</ThemedText>
              </View>
              <ThemedText style={styles.addressLine}>{bookingDetails.address.line1}</ThemedText>
              <ThemedText style={[styles.addressLine, { color: colors.textSecondary }]}>
                {bookingDetails.address.line2}
              </ThemedText>
              <ThemedText style={[styles.addressLine, { color: colors.textSecondary }]}>
                {bookingDetails.address.city}
              </ThemedText>
              <View style={styles.landmarkRow}>
                <Ionicons name="flag-outline" size={14} color={colors.textSecondary} />
                <ThemedText style={[styles.landmark, { color: colors.textSecondary }]}>
                  {bookingDetails.address.landmark}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Special Instructions */}
        {bookingDetails.instructions && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Special Instructions</ThemedText>
            <View style={[styles.instructionsCard, { backgroundColor: colors.warning + '10' }]}>
              <Ionicons name="information-circle" size={20} color={colors.warning} />
              <ThemedText style={[styles.instructionsText, { color: colors.text }]}>
                {bookingDetails.instructions}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Payment Summary */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Payment Summary</ThemedText>
          <View style={[styles.paymentCard, { backgroundColor: colors.card }]}>
            <View style={styles.paymentRow}>
              <ThemedText style={[styles.paymentLabel, { color: colors.textSecondary }]}>
                Subtotal
              </ThemedText>
              <ThemedText style={styles.paymentValue}>₹{bookingDetails.payment.subtotal}</ThemedText>
            </View>
            {bookingDetails.addons.map((addon, index) => (
              <View key={index} style={styles.paymentRow}>
                <ThemedText style={[styles.paymentLabel, { color: colors.textSecondary }]}>
                  {addon.name}
                </ThemedText>
                <ThemedText style={styles.paymentValue}>₹{addon.price}</ThemedText>
              </View>
            ))}
            {bookingDetails.payment.discount > 0 && (
              <View style={styles.paymentRow}>
                <ThemedText style={[styles.paymentLabel, { color: colors.success }]}>
                  Discount
                </ThemedText>
                <ThemedText style={[styles.paymentValue, { color: colors.success }]}>
                  -₹{bookingDetails.payment.discount}
                </ThemedText>
              </View>
            )}
            <View style={styles.paymentRow}>
              <ThemedText style={[styles.paymentLabel, { color: colors.textSecondary }]}>
                Taxes & Fees
              </ThemedText>
              <ThemedText style={styles.paymentValue}>₹{bookingDetails.payment.taxes}</ThemedText>
            </View>
            <View style={[styles.paymentDivider, { backgroundColor: colors.border }]} />
            <View style={styles.paymentRow}>
              <ThemedText style={styles.totalLabel}>Total</ThemedText>
              <ThemedText style={[styles.totalValue, { color: colors.primary }]}>
                ₹{bookingDetails.payment.total}
              </ThemedText>
            </View>
            <View style={styles.paymentMethodRow}>
              <Ionicons name="wallet-outline" size={18} color={colors.textSecondary} />
              <ThemedText style={[styles.paymentMethod, { color: colors.textSecondary }]}>
                Paid via {bookingDetails.payment.method}
              </ThemedText>
              <View style={[styles.paidBadge, { backgroundColor: colors.success + '15' }]}>
                <ThemedText style={[styles.paidText, { color: colors.success }]}>Paid</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={() => setShowRescheduleModal(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <ThemedText style={[styles.actionButtonText, { color: colors.primary }]}>
              Reschedule
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={() => setShowCancelModal(true)}
          >
            <Ionicons name="close-circle-outline" size={20} color={colors.error} />
            <ThemedText style={[styles.actionButtonText, { color: colors.error }]}>
              Cancel Booking
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Help */}
        <TouchableOpacity style={[styles.helpCard, { backgroundColor: colors.card }]}>
          <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
          <View style={styles.helpInfo}>
            <ThemedText style={styles.helpTitle}>Need Help?</ThemedText>
            <ThemedText style={[styles.helpDescription, { color: colors.textSecondary }]}>
              Contact our support team for assistance
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Cancel Modal */}
      <Modal
        visible={showCancelModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.cancelIcon, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="alert-circle" size={48} color={colors.error} />
            </View>
            <ThemedText style={styles.modalTitle}>Cancel Booking?</ThemedText>
            <ThemedText style={[styles.modalDescription, { color: colors.textSecondary }]}>
              Are you sure you want to cancel this booking? Cancellation charges may apply based on the cancellation policy.
            </ThemedText>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.background }]}
                onPress={() => setShowCancelModal(false)}
              >
                <ThemedText style={styles.modalButtonTextSecondary}>Keep Booking</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
              >
                <ThemedText style={styles.modalButtonText}>Yes, Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        visible={showRescheduleModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowRescheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.cancelIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="calendar" size={48} color={colors.primary} />
            </View>
            <ThemedText style={styles.modalTitle}>Reschedule Booking</ThemedText>
            <ThemedText style={[styles.modalDescription, { color: colors.textSecondary }]}>
              You can reschedule this booking up to 4 hours before the scheduled time without any extra charges.
            </ThemedText>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.background }]}
                onPress={() => setShowRescheduleModal(false)}
              >
                <ThemedText style={styles.modalButtonTextSecondary}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setShowRescheduleModal(false);
                  router.push('/booking/schedule');
                }}
              >
                <ThemedText style={styles.modalButtonText}>Choose New Slot</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  statusCard: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  bookingId: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500',
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scheduleDate: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  scheduleDay: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  scheduleDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  serviceCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: 140,
  },
  serviceInfo: {
    padding: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  serviceDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  addonsCard: {
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
  },
  addonsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  addonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  addonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addonName: {
    fontSize: 14,
  },
  addonPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  providerImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
  },
  addressIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addressTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressType: {
    fontSize: 14,
    fontWeight: '600',
  },
  addressLine: {
    fontSize: 14,
    marginBottom: 2,
  },
  landmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  landmark: {
    fontSize: 13,
  },
  instructionsCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  paymentCard: {
    padding: 16,
    borderRadius: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 14,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  paymentDivider: {
    height: 1,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
  },
  paymentMethod: {
    flex: 1,
    fontSize: 13,
  },
  paidBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paidText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  helpInfo: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  helpDescription: {
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  cancelIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
  },
});
