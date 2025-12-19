import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface BookingSlot {
  id: string;
  time: string;
  available: boolean;
  slots: number;
}

interface DateOption {
  date: Date;
  dayName: string;
  dayNumber: number;
  monthName: string;
}

const services = [
  { id: '1', name: 'Deep Home Cleaning', price: 1999, duration: '3-4 hours', selected: true },
  { id: '2', name: 'Kitchen Deep Clean', price: 799, duration: '2 hours', selected: false },
];

const addOns = [
  { id: '1', name: 'Chimney Cleaning', price: 299, selected: false },
  { id: '2', name: 'Balcony Cleaning', price: 199, selected: true },
  { id: '3', name: 'Window Cleaning', price: 149, selected: false },
];

const timeSlots: BookingSlot[] = [
  { id: '1', time: '08:00 AM', available: true, slots: 3 },
  { id: '2', time: '09:00 AM', available: true, slots: 2 },
  { id: '3', time: '10:00 AM', available: false, slots: 0 },
  { id: '4', time: '11:00 AM', available: true, slots: 5 },
  { id: '5', time: '12:00 PM', available: true, slots: 4 },
  { id: '6', time: '01:00 PM', available: true, slots: 3 },
  { id: '7', time: '02:00 PM', available: false, slots: 0 },
  { id: '8', time: '03:00 PM', available: true, slots: 2 },
  { id: '9', time: '04:00 PM', available: true, slots: 1 },
  { id: '10', time: '05:00 PM', available: true, slots: 3 },
  { id: '11', time: '06:00 PM', available: true, slots: 2 },
];

const addresses = [
  { id: '1', type: 'Home', address: 'Tower A, Flat 302, Green Valley Apartments, Andheri West', default: true },
  { id: '2', type: 'Office', address: '5th Floor, Tech Park Building, BKC', default: false },
];

export default function BookingFormScreen() {
  const colors = useColors();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>('4');
  const [selectedAddress, setSelectedAddress] = useState('1');
  const [instructions, setInstructions] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Generate dates for next 14 days
  const getDateOptions = (): DateOption[] => {
    const dates: DateOption[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString('en-US', { month: 'short' }),
      });
    }
    return dates;
  };

  const dateOptions = getDateOptions();

  const subtotal = services.reduce((sum, s) => s.selected ? sum + s.price : sum, 0) +
                   addOns.reduce((sum, a) => a.selected ? sum + a.price : sum, 0);
  const discount = Math.round(subtotal * 0.1);
  const tax = Math.round((subtotal - discount) * 0.18);
  const total = subtotal - discount + tax;

  const renderDateOption = ({ item, index }: { item: DateOption; index: number }) => {
    const isSelected = selectedDate.toDateString() === item.date.toDateString();
    const isToday = index === 0;

    return (
      <TouchableOpacity
        style={[
          styles.dateCard,
          { backgroundColor: isSelected ? colors.primary : colors.card },
        ]}
        onPress={() => setSelectedDate(item.date)}
      >
        {isToday && (
          <ThemedText style={[styles.todayLabel, { color: isSelected ? '#FFF' : colors.primary }]}>
            Today
          </ThemedText>
        )}
        <ThemedText style={[styles.dayName, { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>
          {item.dayName}
        </ThemedText>
        <ThemedText style={[styles.dayNumber, { color: isSelected ? '#FFF' : colors.text }]}>
          {item.dayNumber}
        </ThemedText>
        <ThemedText style={[styles.monthName, { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>
          {item.monthName}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  const renderTimeSlot = ({ item }: { item: BookingSlot }) => {
    const isSelected = selectedSlot === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.timeSlot,
          { backgroundColor: colors.card },
          !item.available && { opacity: 0.5 },
          isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
        ]}
        onPress={() => item.available && setSelectedSlot(item.id)}
        disabled={!item.available}
      >
        <ThemedText style={[
          styles.slotTime,
          { color: isSelected ? '#FFF' : colors.text },
          !item.available && { color: colors.textSecondary }
        ]}>
          {item.time}
        </ThemedText>
        <ThemedText style={[
          styles.slotAvailability,
          { color: isSelected ? 'rgba(255,255,255,0.8)' : item.available ? colors.success : colors.error }
        ]}>
          {item.available ? `${item.slots} slots` : 'Full'}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Book Service</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          {['Date', 'Time', 'Address', 'Review'].map((step, index) => (
            <View key={step} style={styles.progressStep}>
              <View style={[
                styles.progressDot,
                { backgroundColor: index <= 1 ? colors.primary : colors.border }
              ]}>
                {index < 1 && (
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                )}
              </View>
              <ThemedText style={[
                styles.progressLabel,
                { color: index <= 1 ? colors.primary : colors.textSecondary }
              ]}>
                {step}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Service Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <View style={styles.summaryHeader}>
            <ThemedText style={styles.summaryTitle}>Service Summary</ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.editLink, { color: colors.primary }]}>Edit</ThemedText>
            </TouchableOpacity>
          </View>
          {services.filter(s => s.selected).map((service) => (
            <View key={service.id} style={styles.summaryItem}>
              <View style={styles.summaryItemInfo}>
                <ThemedText style={styles.summaryItemName}>{service.name}</ThemedText>
                <ThemedText style={[styles.summaryItemDuration, { color: colors.textSecondary }]}>
                  {service.duration}
                </ThemedText>
              </View>
              <ThemedText style={[styles.summaryItemPrice, { color: colors.primary }]}>
                ₹{service.price}
              </ThemedText>
            </View>
          ))}
          {addOns.filter(a => a.selected).length > 0 && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <ThemedText style={[styles.addOnsLabel, { color: colors.textSecondary }]}>
                Add-ons
              </ThemedText>
              {addOns.filter(a => a.selected).map((addon) => (
                <View key={addon.id} style={styles.summaryItem}>
                  <ThemedText style={styles.summaryItemName}>{addon.name}</ThemedText>
                  <ThemedText style={[styles.summaryItemPrice, { color: colors.primary }]}>
                    +₹{addon.price}
                  </ThemedText>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Select Date</ThemedText>
            <TouchableOpacity onPress={() => setShowCalendarModal(true)}>
              <Ionicons name="calendar-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={dateOptions}
            renderItem={renderDateOption}
            keyExtractor={(item) => item.date.toISOString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesList}
          />
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Select Time Slot</ThemedText>
          <View style={styles.timeSlotsGrid}>
            {timeSlots.map((slot) => (
              <View key={slot.id} style={styles.slotWrapper}>
                {renderTimeSlot({ item: slot })}
              </View>
            ))}
          </View>
        </View>

        {/* Address Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Service Address</ThemedText>
            <TouchableOpacity onPress={() => setShowAddressModal(true)}>
              <ThemedText style={[styles.changeLink, { color: colors.primary }]}>Change</ThemedText>
            </TouchableOpacity>
          </View>
          {addresses.filter(a => a.id === selectedAddress).map((address) => (
            <View key={address.id} style={[styles.addressCard, { backgroundColor: colors.card }]}>
              <View style={[styles.addressIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons
                  name={address.type === 'Home' ? 'home' : 'business'}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.addressInfo}>
                <View style={styles.addressHeader}>
                  <ThemedText style={styles.addressType}>{address.type}</ThemedText>
                  {address.default && (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.success + '20' }]}>
                      <ThemedText style={[styles.defaultBadgeText, { color: colors.success }]}>
                        Default
                      </ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={[styles.addressText, { color: colors.textSecondary }]} numberOfLines={2}>
                  {address.address}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Special Instructions */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Special Instructions (Optional)</ThemedText>
          <TextInput
            style={[styles.instructionsInput, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="Any specific instructions for the service provider..."
            placeholderTextColor={colors.textSecondary}
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Price Summary */}
        <View style={[styles.priceCard, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.priceTitle}>Price Details</ThemedText>
          <View style={styles.priceRow}>
            <ThemedText style={[styles.priceLabel, { color: colors.textSecondary }]}>Subtotal</ThemedText>
            <ThemedText style={styles.priceValue}>₹{subtotal}</ThemedText>
          </View>
          <View style={styles.priceRow}>
            <ThemedText style={[styles.priceLabel, { color: colors.success }]}>Discount (10%)</ThemedText>
            <ThemedText style={[styles.priceValue, { color: colors.success }]}>-₹{discount}</ThemedText>
          </View>
          <View style={styles.priceRow}>
            <ThemedText style={[styles.priceLabel, { color: colors.textSecondary }]}>Tax (18%)</ThemedText>
            <ThemedText style={styles.priceValue}>₹{tax}</ThemedText>
          </View>
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <ThemedText style={styles.totalLabel}>Total</ThemedText>
            <ThemedText style={[styles.totalValue, { color: colors.primary }]}>₹{total}</ThemedText>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.bottomInfo}>
          <ThemedText style={[styles.bottomLabel, { color: colors.textSecondary }]}>Total Amount</ThemedText>
          <ThemedText style={[styles.bottomPrice, { color: colors.primary }]}>₹{total}</ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.proceedButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/booking/payment')}
        >
          <ThemedText style={styles.proceedButtonText}>Proceed to Payment</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Address Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Address</ThemedText>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {addresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                style={[
                  styles.addressOption,
                  { backgroundColor: colors.background },
                  selectedAddress === address.id && { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => {
                  setSelectedAddress(address.id);
                  setShowAddressModal(false);
                }}
              >
                <View style={[styles.addressIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons
                    name={address.type === 'Home' ? 'home' : 'business'}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.addressInfo}>
                  <ThemedText style={styles.addressType}>{address.type}</ThemedText>
                  <ThemedText style={[styles.addressText, { color: colors.textSecondary }]} numberOfLines={2}>
                    {address.address}
                  </ThemedText>
                </View>
                {selectedAddress === address.id && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={[styles.addAddressButton, { borderColor: colors.primary }]}>
              <Ionicons name="add" size={20} color={colors.primary} />
              <ThemedText style={[styles.addAddressText, { color: colors.primary }]}>
                Add New Address
              </ThemedText>
            </TouchableOpacity>
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  summaryCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  editLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryItemInfo: {},
  summaryItemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryItemDuration: {
    fontSize: 12,
    marginTop: 2,
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  addOnsLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 14,
  },
  changeLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  datesList: {
    gap: 10,
  },
  dateCard: {
    width: 70,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
  },
  todayLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayName: {
    fontSize: 11,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  monthName: {
    fontSize: 11,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotWrapper: {
    width: (width - 52) / 3,
  },
  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  slotTime: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  slotAvailability: {
    fontSize: 10,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
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
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressType: {
    fontSize: 15,
    fontWeight: '600',
  },
  defaultBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 13,
    lineHeight: 18,
  },
  instructionsInput: {
    padding: 14,
    borderRadius: 14,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priceCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
  },
  priceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
  },
  bottomInfo: {},
  bottomLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  proceedButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  proceedButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 10,
    gap: 8,
  },
  addAddressText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
