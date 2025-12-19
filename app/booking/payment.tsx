import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface PaymentMethod {
  id: string;
  type: 'upi' | 'card' | 'wallet' | 'netbanking' | 'cod';
  label: string;
  details?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isDefault?: boolean;
  isAvailable?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'upi',
    label: 'UPI',
    details: 'Google Pay, PhonePe, Paytm',
    icon: 'phone-portrait',
    color: '#4285F4',
    isDefault: true,
    isAvailable: true,
  },
  {
    id: '2',
    type: 'card',
    label: 'Credit / Debit Card',
    details: 'Visa, Mastercard, Rupay',
    icon: 'card',
    color: '#5469D4',
    isAvailable: true,
  },
  {
    id: '3',
    type: 'wallet',
    label: 'TownTap Wallet',
    details: 'Balance: ₹1,250',
    icon: 'wallet',
    color: '#415D43',
    isAvailable: true,
  },
  {
    id: '4',
    type: 'netbanking',
    label: 'Net Banking',
    details: 'All major banks',
    icon: 'business',
    color: '#0066B2',
    isAvailable: true,
  },
  {
    id: '5',
    type: 'cod',
    label: 'Cash on Delivery',
    details: 'Pay after service',
    icon: 'cash',
    color: '#27AE60',
    isAvailable: true,
  },
];

const upiApps = [
  { id: 'gpay', name: 'Google Pay', color: '#4285F4' },
  { id: 'phonepe', name: 'PhonePe', color: '#5F259F' },
  { id: 'paytm', name: 'Paytm', color: '#00B9F5' },
  { id: 'other', name: 'Other UPI', color: '#333333' },
];

const savedCards = [
  {
    id: '1',
    type: 'visa',
    last4: '4242',
    expiry: '12/26',
    isDefault: true,
  },
  {
    id: '2',
    type: 'mastercard',
    last4: '5555',
    expiry: '08/25',
    isDefault: false,
  },
];

export default function PaymentScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const [selectedMethod, setSelectedMethod] = useState<string>('1');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [selectedCard, setSelectedCard] = useState<string>('1');
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const amount = params.amount ? Number(params.amount) : 999;
  const serviceName = params.service as string || 'Deep Home Cleaning';

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handlePayment = () => {
    // Process payment logic here
    router.push('/booking/success');
  };

  const renderPaymentMethod = (method: PaymentMethod) => {
    const isSelected = selectedMethod === method.id;

    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.methodCard,
          { backgroundColor: colors.card },
          isSelected && { borderColor: colors.primary, borderWidth: 2 },
        ]}
        onPress={() => setSelectedMethod(method.id)}
      >
        <View style={[styles.methodIcon, { backgroundColor: method.color + '15' }]}>
          <Ionicons name={method.icon} size={22} color={method.color} />
        </View>
        <View style={styles.methodInfo}>
          <View style={styles.methodLabelRow}>
            <ThemedText style={styles.methodLabel}>{method.label}</ThemedText>
            {method.isDefault && (
              <View style={[styles.defaultBadge, { backgroundColor: colors.success + '15' }]}>
                <ThemedText style={[styles.defaultText, { color: colors.success }]}>
                  Default
                </ThemedText>
              </View>
            )}
          </View>
          {method.details && (
            <ThemedText style={[styles.methodDetails, { color: colors.textSecondary }]}>
              {method.details}
            </ThemedText>
          )}
        </View>
        <View style={[
          styles.radioOuter,
          { borderColor: isSelected ? colors.primary : colors.border }
        ]}>
          {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderUpiSection = () => (
    <View style={[styles.expandedSection, { backgroundColor: colors.card }]}>
      <ThemedText style={[styles.expandedTitle, { color: colors.textSecondary }]}>
        SELECT UPI APP
      </ThemedText>
      <View style={styles.upiApps}>
        {upiApps.map((app) => (
          <TouchableOpacity
            key={app.id}
            style={[
              styles.upiApp,
              selectedUpiApp === app.id && { backgroundColor: app.color + '15', borderColor: app.color }
            ]}
            onPress={() => setSelectedUpiApp(app.id)}
          >
            <View style={[styles.upiAppIcon, { backgroundColor: app.color }]}>
              <ThemedText style={styles.upiAppIconText}>{app.name[0]}</ThemedText>
            </View>
            <ThemedText style={[
              styles.upiAppName,
              { color: selectedUpiApp === app.id ? app.color : colors.text }
            ]}>
              {app.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
      <ThemedText style={[styles.orText, { color: colors.textSecondary }]}>OR</ThemedText>
      <View style={styles.upiIdContainer}>
        <TextInput
          style={[styles.upiIdInput, { backgroundColor: colors.background, color: colors.text }]}
          placeholder="Enter UPI ID (e.g., name@upi)"
          placeholderTextColor={colors.textSecondary}
          value={upiId}
          onChangeText={setUpiId}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.verifyButton, { backgroundColor: colors.primary }]}
          disabled={!upiId}
        >
          <ThemedText style={styles.verifyButtonText}>Verify</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCardSection = () => (
    <View style={[styles.expandedSection, { backgroundColor: colors.card }]}>
      <ThemedText style={[styles.expandedTitle, { color: colors.textSecondary }]}>
        SAVED CARDS
      </ThemedText>
      {savedCards.map((card) => (
        <TouchableOpacity
          key={card.id}
          style={[
            styles.savedCard,
            { backgroundColor: colors.background },
            selectedCard === card.id && { borderColor: colors.primary, borderWidth: 1 }
          ]}
          onPress={() => {
            setSelectedCard(card.id);
            setShowNewCardForm(false);
          }}
        >
          <View style={styles.cardDetails}>
            <Ionicons
              name={card.type === 'visa' ? 'card' : 'card-outline'}
              size={24}
              color={card.type === 'visa' ? '#1A1F71' : '#EB001B'}
            />
            <View style={styles.cardInfo}>
              <ThemedText style={styles.cardNumber}>•••• •••• •••• {card.last4}</ThemedText>
              <ThemedText style={[styles.cardExpiry, { color: colors.textSecondary }]}>
                Expires {card.expiry}
              </ThemedText>
            </View>
          </View>
          <View style={[
            styles.radioOuter,
            { borderColor: selectedCard === card.id ? colors.primary : colors.border }
          ]}>
            {selectedCard === card.id && !showNewCardForm && (
              <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
            )}
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.addNewCard, { borderColor: colors.border }]}
        onPress={() => {
          setShowNewCardForm(true);
          setSelectedCard('');
        }}
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
        <ThemedText style={[styles.addNewCardText, { color: colors.primary }]}>
          Add New Card
        </ThemedText>
      </TouchableOpacity>

      {showNewCardForm && (
        <View style={styles.newCardForm}>
          <View style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Card Number
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={colors.textSecondary}
              value={formatCardNumber(cardNumber)}
              onChangeText={(text) => setCardNumber(text.replace(/\s/g, ''))}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Expiry
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="MM/YY"
                placeholderTextColor={colors.textSecondary}
                value={formatExpiry(cardExpiry)}
                onChangeText={(text) => setCardExpiry(text.replace(/\D/g, ''))}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                CVV
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="123"
                placeholderTextColor={colors.textSecondary}
                value={cardCvv}
                onChangeText={setCardCvv}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Name on Card
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="John Doe"
              placeholderTextColor={colors.textSecondary}
              value={cardName}
              onChangeText={setCardName}
              autoCapitalize="words"
            />
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Payment</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <LinearGradient
          colors={[colors.primary, '#2d4a2f']}
          style={styles.summaryCard}
        >
          <View style={styles.summaryHeader}>
            <Ionicons name="receipt-outline" size={24} color="#FFF" />
            <ThemedText style={styles.summaryTitle}>Order Summary</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>{serviceName}</ThemedText>
            <ThemedText style={styles.summaryValue}>₹{amount}</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Tax (18%)</ThemedText>
            <ThemedText style={styles.summaryValue}>₹{Math.round(amount * 0.18)}</ThemedText>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryTotalLabel}>Total Amount</ThemedText>
            <ThemedText style={styles.summaryTotalValue}>
              ₹{amount + Math.round(amount * 0.18)}
            </ThemedText>
          </View>
        </LinearGradient>

        {/* Payment Methods */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Payment Method</ThemedText>
          {paymentMethods.map(renderPaymentMethod)}
        </View>

        {/* Expanded Sections */}
        {selectedMethod === '1' && renderUpiSection()}
        {selectedMethod === '2' && renderCardSection()}

        {/* Offers */}
        <View style={styles.section}>
          <View style={[styles.offersCard, { backgroundColor: colors.success + '10' }]}>
            <Ionicons name="pricetag" size={20} color={colors.success} />
            <View style={styles.offerInfo}>
              <ThemedText style={[styles.offerTitle, { color: colors.success }]}>
                10% Cashback
              </ThemedText>
              <ThemedText style={[styles.offerDesc, { color: colors.textSecondary }]}>
                Pay via UPI and get 10% cashback up to ₹50
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <ThemedText style={[styles.securityText, { color: colors.textSecondary }]}>
            100% Secure Payment. All data is encrypted.
          </ThemedText>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Pay Button */}
      <View style={[styles.footer, { backgroundColor: colors.card }]}>
        <View style={styles.footerInfo}>
          <ThemedText style={[styles.footerLabel, { color: colors.textSecondary }]}>
            Total Payable
          </ThemedText>
          <ThemedText style={styles.footerAmount}>
            ₹{amount + Math.round(amount * 0.18)}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: colors.primary }]}
          onPress={handlePayment}
        >
          <ThemedText style={styles.payButtonText}>Pay Now</ThemedText>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
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
  summaryCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  summaryTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  summaryValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 10,
  },
  summaryTotalLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryTotalValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
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
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
    marginLeft: 14,
  },
  methodLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  methodLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  defaultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
  },
  methodDetails: {
    fontSize: 12,
    marginTop: 2,
  },
  radioOuter: {
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
  expandedSection: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  expandedTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
  },
  upiApps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  upiApp: {
    width: (width - 72) / 4,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  upiAppIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  upiAppIconText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  upiAppName: {
    fontSize: 11,
    fontWeight: '500',
  },
  orText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 12,
  },
  upiIdContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  upiIdInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 14,
  },
  verifyButton: {
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardInfo: {},
  cardNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardExpiry: {
    fontSize: 12,
    marginTop: 2,
  },
  addNewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
  },
  addNewCardText: {
    fontSize: 14,
    fontWeight: '500',
  },
  newCardForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
  },
  offersCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  offerInfo: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  offerDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  securityText: {
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  footerInfo: {},
  footerLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  footerAmount: {
    fontSize: 22,
    fontWeight: '700',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
