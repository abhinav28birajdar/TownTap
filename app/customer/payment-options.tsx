import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

interface PaymentCard {
  id: string;
  type: 'visa' | 'mastercard' | 'amex' | 'rupay';
  lastFour: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  isDefault: boolean;
  color: string;
}

interface UpiId {
  id: string;
  upiId: string;
  provider: string;
  icon: string;
  isDefault: boolean;
}

interface NetBanking {
  id: string;
  bankName: string;
  accountNumber: string;
  icon: string;
}

const mockCards: PaymentCard[] = [
  {
    id: '1',
    type: 'visa',
    lastFour: '4242',
    expiryMonth: '12',
    expiryYear: '27',
    cardholderName: 'Rahul Sharma',
    isDefault: true,
    color: '#1E3A5F',
  },
  {
    id: '2',
    type: 'mastercard',
    lastFour: '8888',
    expiryMonth: '06',
    expiryYear: '26',
    cardholderName: 'Rahul Sharma',
    isDefault: false,
    color: '#8B0000',
  },
];

const mockUpiIds: UpiId[] = [
  {
    id: '1',
    upiId: 'rahul@paytm',
    provider: 'Paytm',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg',
    isDefault: true,
  },
  {
    id: '2',
    upiId: 'rahul@gpay',
    provider: 'Google Pay',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg',
    isDefault: false,
  },
];

const mockNetBanking: NetBanking[] = [
  {
    id: '1',
    bankName: 'HDFC Bank',
    accountNumber: 'XXXX1234',
    icon: 'https://www.hdfcbank.com/content/dam/hdfcbank/common/favicon.ico',
  },
];

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: 'card', color: '#3B82F6' },
  { id: 'upi', name: 'UPI', icon: 'qr-code', color: '#10B981' },
  { id: 'netbanking', name: 'Net Banking', icon: 'business', color: '#8B5CF6' },
  { id: 'wallet', name: 'Wallet', icon: 'wallet', color: '#F59E0B' },
];

export default function PaymentOptionsScreen() {
  const colors = useColors();
  const [cards, setCards] = useState<PaymentCard[]>(mockCards);
  const [upiIds, setUpiIds] = useState<UpiId[]>(mockUpiIds);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddUpiModal, setShowAddUpiModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'cards' | 'upi' | 'netbanking'>('cards');
  const [newCard, setNewCard] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });
  const [newUpi, setNewUpi] = useState('');

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      case 'amex':
        return 'card';
      default:
        return 'card';
    }
  };

  const getCardTypeName = (type: string) => {
    switch (type) {
      case 'visa':
        return 'VISA';
      case 'mastercard':
        return 'Mastercard';
      case 'amex':
        return 'American Express';
      case 'rupay':
        return 'RuPay';
      default:
        return 'Card';
    }
  };

  const handleSetDefaultCard = (id: string) => {
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        isDefault: card.id === id,
      }))
    );
  };

  const handleSetDefaultUpi = (id: string) => {
    setUpiIds((prev) =>
      prev.map((upi) => ({
        ...upi,
        isDefault: upi.id === id,
      }))
    );
  };

  const handleDeleteCard = (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  const handleDeleteUpi = (id: string) => {
    setUpiIds((prev) => prev.filter((upi) => upi.id !== id));
  };

  const renderCard = ({ item }: { item: PaymentCard }) => (
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={[item.color, `${item.color}CC`]}
        style={styles.paymentCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardTop}>
          <ThemedText style={styles.cardType}>{getCardTypeName(item.type)}</ThemedText>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <ThemedText style={styles.defaultText}>Default</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.cardMiddle}>
          <View style={styles.cardChip} />
          <ThemedText style={styles.cardNumber}>•••• •••• •••• {item.lastFour}</ThemedText>
        </View>

        <View style={styles.cardBottom}>
          <View>
            <ThemedText style={styles.cardLabel}>CARD HOLDER</ThemedText>
            <ThemedText style={styles.cardValue}>{item.cardholderName}</ThemedText>
          </View>
          <View>
            <ThemedText style={styles.cardLabel}>EXPIRES</ThemedText>
            <ThemedText style={styles.cardValue}>
              {item.expiryMonth}/{item.expiryYear}
            </ThemedText>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.cardActions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={[styles.cardActionBtn, { backgroundColor: colors.primary + '15' }]}
            onPress={() => handleSetDefaultCard(item.id)}
          >
            <Ionicons name="star" size={16} color={colors.primary} />
            <ThemedText style={[styles.cardActionText, { color: colors.primary }]}>
              Set Default
            </ThemedText>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.cardActionBtn, { backgroundColor: colors.error + '15' }]}
          onPress={() => handleDeleteCard(item.id)}
        >
          <Ionicons name="trash" size={16} color={colors.error} />
          <ThemedText style={[styles.cardActionText, { color: colors.error }]}>Remove</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUpiId = ({ item }: { item: UpiId }) => (
    <View style={[styles.upiCard, { backgroundColor: colors.card }]}>
      <View style={[styles.upiIcon, { backgroundColor: colors.success + '15' }]}>
        <Ionicons name="qr-code" size={24} color={colors.success} />
      </View>
      <View style={styles.upiInfo}>
        <View style={styles.upiHeader}>
          <ThemedText style={styles.upiIdText}>{item.upiId}</ThemedText>
          {item.isDefault && (
            <View style={[styles.upiDefaultBadge, { backgroundColor: colors.success + '15' }]}>
              <ThemedText style={[styles.upiDefaultText, { color: colors.success }]}>
                Default
              </ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={[styles.upiProvider, { color: colors.textSecondary }]}>
          {item.provider}
        </ThemedText>
      </View>
      <View style={styles.upiActions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.upiActionBtn}
            onPress={() => handleSetDefaultUpi(item.id)}
          >
            <Ionicons name="star-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.upiActionBtn} onPress={() => handleDeleteUpi(item.id)}>
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Payment Options</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'cards' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab('cards')}
            >
              <Ionicons
                name="card"
                size={18}
                color={activeTab === 'cards' ? '#fff' : colors.text}
              />
              <ThemedText
                style={[styles.tabText, { color: activeTab === 'cards' ? '#fff' : colors.text }]}
              >
                Cards
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'upi' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab('upi')}
            >
              <Ionicons
                name="qr-code"
                size={18}
                color={activeTab === 'upi' ? '#fff' : colors.text}
              />
              <ThemedText
                style={[styles.tabText, { color: activeTab === 'upi' ? '#fff' : colors.text }]}
              >
                UPI
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'netbanking' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab('netbanking')}
            >
              <Ionicons
                name="business"
                size={18}
                color={activeTab === 'netbanking' ? '#fff' : colors.text}
              />
              <ThemedText
                style={[styles.tabText, { color: activeTab === 'netbanking' ? '#fff' : colors.text }]}
              >
                Net Banking
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'cards' && (
          <View style={styles.section}>
            {cards.length > 0 ? (
              <FlatList
                data={cards}
                keyExtractor={(item) => item.id}
                renderItem={renderCard}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
              />
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <Ionicons name="card-outline" size={48} color={colors.textSecondary} />
                <ThemedText style={styles.emptyTitle}>No Cards Added</ThemedText>
                <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                  Add a credit or debit card for quick payments
                </ThemedText>
              </View>
            )}

            <TouchableOpacity
              style={[styles.addBtn, { borderColor: colors.primary }]}
              onPress={() => setShowAddCardModal(true)}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
              <ThemedText style={[styles.addBtnText, { color: colors.primary }]}>
                Add New Card
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'upi' && (
          <View style={styles.section}>
            {upiIds.length > 0 ? (
              <FlatList
                data={upiIds}
                keyExtractor={(item) => item.id}
                renderItem={renderUpiId}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              />
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <Ionicons name="qr-code-outline" size={48} color={colors.textSecondary} />
                <ThemedText style={styles.emptyTitle}>No UPI IDs Added</ThemedText>
                <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                  Add a UPI ID for instant payments
                </ThemedText>
              </View>
            )}

            <TouchableOpacity
              style={[styles.addBtn, { borderColor: colors.primary }]}
              onPress={() => setShowAddUpiModal(true)}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
              <ThemedText style={[styles.addBtnText, { color: colors.primary }]}>
                Add New UPI ID
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'netbanking' && (
          <View style={styles.section}>
            {mockNetBanking.length > 0 ? (
              mockNetBanking.map((bank) => (
                <View key={bank.id} style={[styles.bankCard, { backgroundColor: colors.card }]}>
                  <View style={[styles.bankIcon, { backgroundColor: colors.info + '15' }]}>
                    <Ionicons name="business" size={24} color={colors.info} />
                  </View>
                  <View style={styles.bankInfo}>
                    <ThemedText style={styles.bankName}>{bank.bankName}</ThemedText>
                    <ThemedText style={[styles.bankAccount, { color: colors.textSecondary }]}>
                      Account: {bank.accountNumber}
                    </ThemedText>
                  </View>
                  <TouchableOpacity style={styles.bankActionBtn}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <Ionicons name="business-outline" size={48} color={colors.textSecondary} />
                <ThemedText style={styles.emptyTitle}>No Banks Linked</ThemedText>
                <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                  Link your bank account for net banking payments
                </ThemedText>
              </View>
            )}

            <TouchableOpacity style={[styles.addBtn, { borderColor: colors.primary }]}>
              <Ionicons name="add" size={20} color={colors.primary} />
              <ThemedText style={[styles.addBtnText, { color: colors.primary }]}>
                Link Bank Account
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Security Note */}
        <View style={[styles.securityNote, { backgroundColor: colors.card }]}>
          <Ionicons name="shield-checkmark" size={24} color={colors.success} />
          <View style={styles.securityContent}>
            <ThemedText style={styles.securityTitle}>Your payments are secure</ThemedText>
            <ThemedText style={[styles.securityDesc, { color: colors.textSecondary }]}>
              All payment information is encrypted and securely stored
            </ThemedText>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Card Modal */}
      <Modal visible={showAddCardModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddCardModal(false)}
        >
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.modalTitle}>Add New Card</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Card Number</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={colors.textSecondary}
                value={newCard.number}
                onChangeText={(text) => setNewCard((prev) => ({ ...prev, number: text }))}
                keyboardType="number-pad"
                maxLength={19}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.inputLabel}>Expiry Date</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="MM/YY"
                  placeholderTextColor={colors.textSecondary}
                  value={newCard.expiry}
                  onChangeText={(text) => setNewCard((prev) => ({ ...prev, expiry: text }))}
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.inputLabel}>CVV</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="123"
                  placeholderTextColor={colors.textSecondary}
                  value={newCard.cvv}
                  onChangeText={(text) => setNewCard((prev) => ({ ...prev, cvv: text }))}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Cardholder Name</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="Name on card"
                placeholderTextColor={colors.textSecondary}
                value={newCard.name}
                onChangeText={(text) => setNewCard((prev) => ({ ...prev, name: text }))}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddCardModal(false)}
            >
              <ThemedText style={styles.saveBtnText}>Add Card</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add UPI Modal */}
      <Modal visible={showAddUpiModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddUpiModal(false)}
        >
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.modalTitle}>Add UPI ID</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>UPI ID</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="yourname@upi"
                placeholderTextColor={colors.textSecondary}
                value={newUpi}
                onChangeText={setNewUpi}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddUpiModal(false)}
            >
              <ThemedText style={styles.saveBtnText}>Verify & Add</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
  tabSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  cardWrapper: {
    marginBottom: 8,
  },
  paymentCard: {
    borderRadius: 16,
    padding: 20,
    aspectRatio: 1.6,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardType: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  defaultBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  defaultText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  cardMiddle: {
    gap: 16,
  },
  cardChip: {
    width: 45,
    height: 35,
    backgroundColor: '#D4AF37',
    borderRadius: 6,
  },
  cardNumber: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginBottom: 4,
  },
  cardValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cardActionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  upiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  upiIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upiInfo: {
    flex: 1,
    marginLeft: 14,
  },
  upiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upiIdText: {
    fontSize: 16,
    fontWeight: '600',
  },
  upiDefaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  upiDefaultText: {
    fontSize: 10,
    fontWeight: '600',
  },
  upiProvider: {
    fontSize: 13,
    marginTop: 2,
  },
  upiActions: {
    flexDirection: 'row',
    gap: 8,
  },
  upiActionBtn: {
    padding: 8,
  },
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  bankIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankInfo: {
    flex: 1,
    marginLeft: 14,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
  },
  bankAccount: {
    fontSize: 13,
    marginTop: 2,
  },
  bankActionBtn: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 16,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 16,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 14,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  securityDesc: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
