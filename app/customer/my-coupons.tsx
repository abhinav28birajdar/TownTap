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
    Share,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'flat';
  minOrder?: number;
  maxDiscount?: number;
  validUntil: string;
  category?: string;
  isUsed: boolean;
  isExpired: boolean;
  terms: string[];
}

const mockCoupons: Coupon[] = [
  {
    id: '1',
    code: 'FIRST50',
    title: '50% Off First Booking',
    description: 'Get 50% off on your first service booking',
    discount: 50,
    discountType: 'percentage',
    maxDiscount: 500,
    validUntil: 'Jan 31, 2025',
    isUsed: false,
    isExpired: false,
    terms: [
      'Valid for first-time users only',
      'Maximum discount of ₹500',
      'Valid on all services',
      'Cannot be combined with other offers',
    ],
  },
  {
    id: '2',
    code: 'CLEAN200',
    title: '₹200 Off Cleaning',
    description: 'Flat ₹200 off on cleaning services',
    discount: 200,
    discountType: 'flat',
    minOrder: 999,
    validUntil: 'Feb 15, 2025',
    category: 'Cleaning',
    isUsed: false,
    isExpired: false,
    terms: [
      'Valid on cleaning services only',
      'Minimum order value ₹999',
      'One-time use per user',
    ],
  },
  {
    id: '3',
    code: 'WEEKEND25',
    title: '25% Weekend Special',
    description: 'Extra 25% off on weekend bookings',
    discount: 25,
    discountType: 'percentage',
    maxDiscount: 300,
    validUntil: 'Feb 28, 2025',
    isUsed: false,
    isExpired: false,
    terms: [
      'Valid only for Saturday & Sunday bookings',
      'Maximum discount of ₹300',
      'All services eligible',
    ],
  },
  {
    id: '4',
    code: 'AC100',
    title: '₹100 Off AC Service',
    description: 'Get ₹100 off on AC servicing',
    discount: 100,
    discountType: 'flat',
    validUntil: 'Dec 31, 2024',
    category: 'AC Repair',
    isUsed: true,
    isExpired: false,
    terms: ['Valid on AC services only', 'One-time use'],
  },
  {
    id: '5',
    code: 'SUMMER30',
    title: '30% Summer Sale',
    description: 'Summer special discount on all services',
    discount: 30,
    discountType: 'percentage',
    maxDiscount: 400,
    validUntil: 'Dec 15, 2024',
    isUsed: false,
    isExpired: true,
    terms: ['Valid on all services', 'Maximum discount of ₹400'],
  },
];

export default function MyCouponsScreen() {
  const colors = useColors();
  const [coupons] = useState<Coupon[]>(mockCoupons);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [filter, setFilter] = useState<'active' | 'used' | 'expired'>('active');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredCoupons = coupons.filter((coupon) => {
    if (filter === 'active') return !coupon.isUsed && !coupon.isExpired;
    if (filter === 'used') return coupon.isUsed;
    if (filter === 'expired') return coupon.isExpired;
    return true;
  });

  const handleCopyCode = (code: string) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleShareCoupon = async (coupon: Coupon) => {
    try {
      await Share.share({
        message: `Use code ${coupon.code} to get ${coupon.discountType === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`} off on TownTap! ${coupon.description}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getStatusColor = (coupon: Coupon) => {
    if (coupon.isExpired) return colors.error;
    if (coupon.isUsed) return colors.textSecondary;
    return colors.success;
  };

  const getStatusText = (coupon: Coupon) => {
    if (coupon.isExpired) return 'Expired';
    if (coupon.isUsed) return 'Used';
    return 'Active';
  };

  const renderCoupon = ({ item }: { item: Coupon }) => (
    <TouchableOpacity
      style={[
        styles.couponCard,
        { backgroundColor: colors.card },
        (item.isUsed || item.isExpired) && { opacity: 0.7 },
      ]}
      onPress={() => {
        setSelectedCoupon(item);
        setShowDetailsModal(true);
      }}
    >
      <View style={styles.couponLeft}>
        <LinearGradient
          colors={
            item.isExpired || item.isUsed
              ? [colors.textSecondary, colors.textSecondary]
              : [colors.primary, colors.primary + 'CC']
          }
          style={styles.discountBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ThemedText style={styles.discountText}>
            {item.discountType === 'percentage' ? `${item.discount}%` : `₹${item.discount}`}
          </ThemedText>
          <ThemedText style={styles.discountLabel}>OFF</ThemedText>
        </LinearGradient>
      </View>

      <View style={styles.couponDivider}>
        <View style={[styles.dividerCircle, styles.dividerTop, { backgroundColor: colors.background }]} />
        <View style={[styles.dividerLine, { borderColor: colors.border }]} />
        <View style={[styles.dividerCircle, styles.dividerBottom, { backgroundColor: colors.background }]} />
      </View>

      <View style={styles.couponRight}>
        <View style={styles.couponHeader}>
          <ThemedText style={styles.couponTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item) + '15' }]}>
            <ThemedText style={[styles.statusText, { color: getStatusColor(item) }]}>
              {getStatusText(item)}
            </ThemedText>
          </View>
        </View>

        <ThemedText style={[styles.couponDesc, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.description}
        </ThemedText>

        <View style={styles.couponCode}>
          <View style={[styles.codeBox, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.codeText, { color: colors.primary }]}>{item.code}</ThemedText>
          </View>
          {!item.isUsed && !item.isExpired && (
            <TouchableOpacity
              style={[styles.copyBtn, { backgroundColor: colors.primary }]}
              onPress={() => handleCopyCode(item.code)}
            >
              <Ionicons
                name={copiedCode === item.code ? 'checkmark' : 'copy'}
                size={14}
                color="#fff"
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.couponFooter}>
          {item.category && (
            <View style={[styles.categoryBadge, { backgroundColor: colors.info + '15' }]}>
              <ThemedText style={[styles.categoryText, { color: colors.info }]}>
                {item.category}
              </ThemedText>
            </View>
          )}
          <ThemedText style={[styles.validText, { color: colors.textSecondary }]}>
            Valid till {item.validUntil}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>My Coupons</ThemedText>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsSection}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="pricetag" size={20} color={colors.success} />
          </View>
          <View>
            <ThemedText style={styles.statValue}>
              {coupons.filter((c) => !c.isUsed && !c.isExpired).length}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Active
            </ThemedText>
          </View>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.textSecondary + '15' }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.textSecondary} />
          </View>
          <View>
            <ThemedText style={styles.statValue}>
              {coupons.filter((c) => c.isUsed).length}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Used
            </ThemedText>
          </View>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.error + '15' }]}>
            <Ionicons name="time" size={20} color={colors.error} />
          </View>
          <View>
            <ThemedText style={styles.statValue}>
              {coupons.filter((c) => c.isExpired).length}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Expired
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterSection}>
        {(['active', 'used', 'expired'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterTab,
              filter === f && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilter(f)}
          >
            <ThemedText
              style={[styles.filterText, { color: filter === f ? '#fff' : colors.text }]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Coupons List */}
      <FlatList
        data={filteredCoupons}
        keyExtractor={(item) => item.id}
        renderItem={renderCoupon}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="pricetag-outline" size={60} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Coupons</ThemedText>
            <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              {filter === 'active'
                ? "You don't have any active coupons"
                : filter === 'used'
                ? "You haven't used any coupons yet"
                : 'No expired coupons'}
            </ThemedText>
          </View>
        }
      />

      {/* Coupon Details Modal */}
      <Modal visible={showDetailsModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDetailsModal(false)}
        >
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />

            {selectedCoupon && (
              <>
                <View style={styles.modalHeader}>
                  <LinearGradient
                    colors={
                      selectedCoupon.isExpired || selectedCoupon.isUsed
                        ? [colors.textSecondary, colors.textSecondary]
                        : [colors.primary, colors.primary + 'CC']
                    }
                    style={styles.modalDiscountBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <ThemedText style={styles.modalDiscountText}>
                      {selectedCoupon.discountType === 'percentage'
                        ? `${selectedCoupon.discount}%`
                        : `₹${selectedCoupon.discount}`}
                    </ThemedText>
                    <ThemedText style={styles.modalDiscountLabel}>OFF</ThemedText>
                  </LinearGradient>
                </View>

                <ThemedText style={styles.modalTitle}>{selectedCoupon.title}</ThemedText>
                <ThemedText style={[styles.modalDesc, { color: colors.textSecondary }]}>
                  {selectedCoupon.description}
                </ThemedText>

                <View style={[styles.modalCodeBox, { backgroundColor: colors.background }]}>
                  <ThemedText style={[styles.modalCode, { color: colors.primary }]}>
                    {selectedCoupon.code}
                  </ThemedText>
                  <TouchableOpacity onPress={() => handleCopyCode(selectedCoupon.code)}>
                    <Ionicons
                      name={copiedCode === selectedCoupon.code ? 'checkmark' : 'copy'}
                      size={20}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.termsSection}>
                  <ThemedText style={styles.termsTitle}>Terms & Conditions</ThemedText>
                  {selectedCoupon.terms.map((term, index) => (
                    <View key={index} style={styles.termRow}>
                      <View style={[styles.termBullet, { backgroundColor: colors.primary }]} />
                      <ThemedText style={[styles.termText, { color: colors.textSecondary }]}>
                        {term}
                      </ThemedText>
                    </View>
                  ))}
                </View>

                <View style={styles.modalInfo}>
                  {selectedCoupon.minOrder && (
                    <View style={styles.infoRow}>
                      <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Min. Order
                      </ThemedText>
                      <ThemedText style={styles.infoValue}>₹{selectedCoupon.minOrder}</ThemedText>
                    </View>
                  )}
                  {selectedCoupon.maxDiscount && (
                    <View style={styles.infoRow}>
                      <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Max. Discount
                      </ThemedText>
                      <ThemedText style={styles.infoValue}>₹{selectedCoupon.maxDiscount}</ThemedText>
                    </View>
                  )}
                  <View style={styles.infoRow}>
                    <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Valid Until
                    </ThemedText>
                    <ThemedText style={styles.infoValue}>{selectedCoupon.validUntil}</ThemedText>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.shareBtn, { borderColor: colors.primary }]}
                    onPress={() => handleShareCoupon(selectedCoupon)}
                  >
                    <Ionicons name="share-social" size={18} color={colors.primary} />
                    <ThemedText style={[styles.shareBtnText, { color: colors.primary }]}>
                      Share
                    </ThemedText>
                  </TouchableOpacity>
                  {!selectedCoupon.isUsed && !selectedCoupon.isExpired && (
                    <TouchableOpacity
                      style={[styles.useBtn, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        setShowDetailsModal(false);
                        router.push('/(tabs)/home');
                      }}
                    >
                      <ThemedText style={styles.useBtnText}>Use Now</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Coupon Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddModal(false)}
        >
          <View style={[styles.addModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.addModalTitle}>Add Coupon Code</ThemedText>
            <ThemedText style={[styles.addModalDesc, { color: colors.textSecondary }]}>
              Enter a coupon code to add it to your wallet
            </ThemedText>

            <View style={[styles.addInput, { backgroundColor: colors.background }]}>
              <Ionicons name="pricetag" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.inputField, { color: colors.text }]}
                placeholder="Enter coupon code"
                placeholderTextColor={colors.textSecondary}
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.applyBtn,
                { backgroundColor: couponCode ? colors.primary : colors.textSecondary },
              ]}
              disabled={!couponCode}
            >
              <ThemedText style={styles.applyBtnText}>Apply Coupon</ThemedText>
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
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
  },
  filterSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  couponCard: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  couponLeft: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  discountBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  discountLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: '600',
  },
  couponDivider: {
    width: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  dividerCircle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  dividerTop: {
    top: -10,
    left: -10,
  },
  dividerBottom: {
    bottom: -10,
    left: -10,
  },
  dividerLine: {
    flex: 1,
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 14,
  },
  couponRight: {
    flex: 1,
    padding: 14,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  couponTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  couponDesc: {
    fontSize: 12,
    marginBottom: 10,
  },
  couponCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  codeBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  copyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  validText: {
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
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
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalDiscountBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDiscountText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  modalDiscountLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalCode: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
  },
  termsSection: {
    marginBottom: 16,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  termBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  termText: {
    flex: 1,
    fontSize: 13,
  },
  modalInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  useBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  useBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  addModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  addModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  addModalDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  addInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  applyBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
