import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Promotion {
  id: string;
  title: string;
  description: string;
  type: 'percentage' | 'flat' | 'bogo' | 'free-service';
  value: number;
  code: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'expired' | 'paused';
  usageCount: number;
  maxUsage: number;
  minOrder: number;
  services: string[];
}

const promotions: Promotion[] = [
  {
    id: '1',
    title: 'Holiday Special',
    description: 'Get 20% off on all cleaning services',
    type: 'percentage',
    value: 20,
    code: 'HOLIDAY20',
    startDate: 'Dec 20, 2024',
    endDate: 'Jan 5, 2025',
    status: 'active',
    usageCount: 45,
    maxUsage: 100,
    minOrder: 500,
    services: ['Deep Cleaning', 'Regular Cleaning', 'Carpet Cleaning'],
  },
  {
    id: '2',
    title: 'New Year Offer',
    description: 'Flat ₹200 off on first booking',
    type: 'flat',
    value: 200,
    code: 'NEWYEAR200',
    startDate: 'Jan 1, 2025',
    endDate: 'Jan 15, 2025',
    status: 'scheduled',
    usageCount: 0,
    maxUsage: 50,
    minOrder: 999,
    services: ['All Services'],
  },
  {
    id: '3',
    title: 'Winter Sale',
    description: '15% discount on AC services',
    type: 'percentage',
    value: 15,
    code: 'WINTER15',
    startDate: 'Dec 1, 2024',
    endDate: 'Dec 15, 2024',
    status: 'expired',
    usageCount: 78,
    maxUsage: 100,
    minOrder: 300,
    services: ['AC Repair', 'AC Servicing', 'AC Installation'],
  },
  {
    id: '4',
    title: 'Diwali Bonus',
    description: 'Free sanitization with deep cleaning',
    type: 'free-service',
    value: 0,
    code: 'DIWALI',
    startDate: 'Oct 15, 2024',
    endDate: 'Nov 15, 2024',
    status: 'expired',
    usageCount: 120,
    maxUsage: 150,
    minOrder: 1500,
    services: ['Deep Cleaning'],
  },
];

export default function PromotionsManagementScreen() {
  const colors = useColors();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPromo, setNewPromo] = useState({
    title: '',
    code: '',
    type: 'percentage',
    value: '',
    minOrder: '',
    maxUsage: '',
  });

  const filteredPromotions = promotions.filter(promo => {
    if (filterStatus === 'all') return true;
    return promo.status === filterStatus;
  });

  const getStatusColor = (status: Promotion['status']) => {
    switch (status) {
      case 'active': return colors.success;
      case 'scheduled': return colors.info;
      case 'expired': return colors.textSecondary;
      case 'paused': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const getTypeIcon = (type: Promotion['type']) => {
    switch (type) {
      case 'percentage': return 'pricetag';
      case 'flat': return 'cash';
      case 'bogo': return 'gift';
      case 'free-service': return 'star';
      default: return 'pricetag';
    }
  };

  const activeCount = promotions.filter(p => p.status === 'active').length;
  const totalUsage = promotions.reduce((acc, p) => acc + p.usageCount, 0);

  const renderPromotion = (item: Promotion) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.promoCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedPromotion(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.promoHeader}>
        <View style={[styles.promoIcon, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name={getTypeIcon(item.type) as any} size={24} color={colors.primary} />
        </View>
        <View style={styles.promoInfo}>
          <ThemedText style={styles.promoTitle}>{item.title}</ThemedText>
          <ThemedText style={[styles.promoDescription, { color: colors.textSecondary }]}>
            {item.description}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.codeContainer, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.codeLabel, { color: colors.textSecondary }]}>CODE</ThemedText>
        <ThemedText style={[styles.codeValue, { color: colors.primary }]}>{item.code}</ThemedText>
      </View>

      <View style={styles.promoStats}>
        <View style={styles.promoStatItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <ThemedText style={[styles.promoStatText, { color: colors.textSecondary }]}>
            {item.startDate} - {item.endDate}
          </ThemedText>
        </View>
        <View style={styles.promoStatItem}>
          <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
          <ThemedText style={[styles.promoStatText, { color: colors.textSecondary }]}>
            {item.usageCount}/{item.maxUsage} used
          </ThemedText>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: item.usageCount / item.maxUsage > 0.8 ? colors.warning : colors.primary,
              width: `${Math.min((item.usageCount / item.maxUsage) * 100, 100)}%`,
            },
          ]}
        />
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
        <ThemedText style={styles.headerTitle}>Promotions</ThemedText>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <LinearGradient
          colors={[colors.primary, '#2d4a2f']}
          style={styles.statsCard}
        >
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Ionicons name="pricetags" size={28} color="#FFF" />
              <ThemedText style={styles.statBlockValue}>{promotions.length}</ThemedText>
              <ThemedText style={styles.statBlockLabel}>Total Offers</ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.statBlock}>
              <Ionicons name="flash" size={28} color="#FFF" />
              <ThemedText style={styles.statBlockValue}>{activeCount}</ThemedText>
              <ThemedText style={styles.statBlockLabel}>Active</ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.statBlock}>
              <Ionicons name="trending-up" size={28} color="#FFF" />
              <ThemedText style={styles.statBlockValue}>{totalUsage}</ThemedText>
              <ThemedText style={styles.statBlockLabel}>Total Usage</ThemedText>
            </View>
          </View>
        </LinearGradient>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'active', 'scheduled', 'paused', 'expired'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterTab,
                  filterStatus === status && { backgroundColor: colors.primary }
                ]}
                onPress={() => setFilterStatus(status)}
              >
                <ThemedText style={[
                  styles.filterText,
                  { color: filterStatus === status ? '#FFF' : colors.textSecondary }
                ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Promotions List */}
        <View style={styles.section}>
          {filteredPromotions.length > 0 ? (
            filteredPromotions.map(renderPromotion)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="pricetags-outline" size={64} color={colors.textSecondary} />
              <ThemedText style={styles.emptyTitle}>No Promotions</ThemedText>
              <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                Create your first promotion to attract more customers
              </ThemedText>
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowCreateModal(true)}
              >
                <ThemedText style={styles.createButtonText}>Create Promotion</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Promotion Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Promotion Details</ThemedText>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedPromotion && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Promo Header */}
                <View style={styles.detailHeader}>
                  <View style={[styles.detailIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name={getTypeIcon(selectedPromotion.type) as any} size={32} color={colors.primary} />
                  </View>
                  <ThemedText style={styles.detailTitle}>{selectedPromotion.title}</ThemedText>
                  <ThemedText style={[styles.detailDescription, { color: colors.textSecondary }]}>
                    {selectedPromotion.description}
                  </ThemedText>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(selectedPromotion.status) + '15', marginTop: 10 }
                  ]}>
                    <ThemedText style={[styles.statusText, { color: getStatusColor(selectedPromotion.status) }]}>
                      {selectedPromotion.status.charAt(0).toUpperCase() + selectedPromotion.status.slice(1)}
                    </ThemedText>
                  </View>
                </View>

                {/* Code Display */}
                <View style={[styles.codeDisplay, { backgroundColor: colors.background }]}>
                  <ThemedText style={[styles.codeDisplayLabel, { color: colors.textSecondary }]}>
                    PROMO CODE
                  </ThemedText>
                  <ThemedText style={[styles.codeDisplayValue, { color: colors.primary }]}>
                    {selectedPromotion.code}
                  </ThemedText>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                  <View style={[styles.gridItem, { backgroundColor: colors.background }]}>
                    <Ionicons name="people" size={24} color={colors.info} />
                    <ThemedText style={styles.gridValue}>
                      {selectedPromotion.usageCount}/{selectedPromotion.maxUsage}
                    </ThemedText>
                    <ThemedText style={[styles.gridLabel, { color: colors.textSecondary }]}>
                      Usage
                    </ThemedText>
                  </View>
                  <View style={[styles.gridItem, { backgroundColor: colors.background }]}>
                    <Ionicons name="cart" size={24} color={colors.success} />
                    <ThemedText style={styles.gridValue}>₹{selectedPromotion.minOrder}</ThemedText>
                    <ThemedText style={[styles.gridLabel, { color: colors.textSecondary }]}>
                      Min. Order
                    </ThemedText>
                  </View>
                  <View style={[styles.gridItem, { backgroundColor: colors.background }]}>
                    <Ionicons name="pricetag" size={24} color={colors.warning} />
                    <ThemedText style={styles.gridValue}>
                      {selectedPromotion.type === 'percentage'
                        ? `${selectedPromotion.value}%`
                        : selectedPromotion.type === 'flat'
                        ? `₹${selectedPromotion.value}`
                        : 'Free'
                      }
                    </ThemedText>
                    <ThemedText style={[styles.gridLabel, { color: colors.textSecondary }]}>
                      Discount
                    </ThemedText>
                  </View>
                </View>

                {/* Validity */}
                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                    VALIDITY
                  </ThemedText>
                  <View style={[styles.validityCard, { backgroundColor: colors.background }]}>
                    <View style={styles.validityRow}>
                      <View style={styles.validityItem}>
                        <Ionicons name="calendar" size={16} color={colors.success} />
                        <ThemedText style={styles.validityLabel}>Start</ThemedText>
                        <ThemedText style={styles.validityValue}>{selectedPromotion.startDate}</ThemedText>
                      </View>
                      <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
                      <View style={styles.validityItem}>
                        <Ionicons name="calendar" size={16} color={colors.error} />
                        <ThemedText style={styles.validityLabel}>End</ThemedText>
                        <ThemedText style={styles.validityValue}>{selectedPromotion.endDate}</ThemedText>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Applicable Services */}
                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                    APPLICABLE SERVICES
                  </ThemedText>
                  <View style={styles.servicesList}>
                    {selectedPromotion.services.map((service, index) => (
                      <View
                        key={index}
                        style={[styles.serviceBadge, { backgroundColor: colors.primary + '15' }]}
                      >
                        <ThemedText style={[styles.serviceText, { color: colors.primary }]}>
                          {service}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Actions */}
                {selectedPromotion.status !== 'expired' && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalActionButton, { backgroundColor: colors.info }]}
                    >
                      <Ionicons name="create" size={18} color="#FFF" />
                      <ThemedText style={styles.modalActionText}>Edit</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.modalActionButton,
                        { backgroundColor: selectedPromotion.status === 'paused' ? colors.success : colors.warning }
                      ]}
                    >
                      <Ionicons
                        name={selectedPromotion.status === 'paused' ? 'play' : 'pause'}
                        size={18}
                        color="#FFF"
                      />
                      <ThemedText style={styles.modalActionText}>
                        {selectedPromotion.status === 'paused' ? 'Resume' : 'Pause'}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.deleteButton, { borderColor: colors.error }]}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                  <ThemedText style={[styles.deleteButtonText, { color: colors.error }]}>
                    Delete Promotion
                  </ThemedText>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Create Promotion Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Create Promotion</ThemedText>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Title */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Promotion Title
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="e.g., Summer Sale"
                  placeholderTextColor={colors.textSecondary}
                  value={newPromo.title}
                  onChangeText={(text) => setNewPromo({ ...newPromo, title: text })}
                />
              </View>

              {/* Promo Code */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Promo Code
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="e.g., SUMMER20"
                  placeholderTextColor={colors.textSecondary}
                  value={newPromo.code}
                  onChangeText={(text) => setNewPromo({ ...newPromo, code: text.toUpperCase() })}
                  autoCapitalize="characters"
                />
              </View>

              {/* Discount Type */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Discount Type
                </ThemedText>
                <View style={styles.typeOptions}>
                  {[
                    { key: 'percentage', label: 'Percentage', icon: 'pricetag' },
                    { key: 'flat', label: 'Flat', icon: 'cash' },
                    { key: 'free-service', label: 'Free Service', icon: 'star' },
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        styles.typeOption,
                        newPromo.type === type.key && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                      ]}
                      onPress={() => setNewPromo({ ...newPromo, type: type.key })}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={20}
                        color={newPromo.type === type.key ? colors.primary : colors.textSecondary}
                      />
                      <ThemedText style={[
                        styles.typeOptionText,
                        { color: newPromo.type === type.key ? colors.primary : colors.textSecondary }
                      ]}>
                        {type.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Value & Min Order */}
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    {newPromo.type === 'percentage' ? 'Discount (%)' : 'Discount (₹)'}
                  </ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                    placeholder="20"
                    placeholderTextColor={colors.textSecondary}
                    value={newPromo.value}
                    onChangeText={(text) => setNewPromo({ ...newPromo, value: text })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Min. Order (₹)
                  </ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                    placeholder="500"
                    placeholderTextColor={colors.textSecondary}
                    value={newPromo.minOrder}
                    onChangeText={(text) => setNewPromo({ ...newPromo, minOrder: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Max Usage */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Maximum Usage
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="100"
                  placeholderTextColor={colors.textSecondary}
                  value={newPromo.maxUsage}
                  onChangeText={(text) => setNewPromo({ ...newPromo, maxUsage: text })}
                  keyboardType="numeric"
                />
              </View>

              {/* Create Button */}
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
              >
                <ThemedText style={styles.submitButtonText}>Create Promotion</ThemedText>
              </TouchableOpacity>
            </ScrollView>
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
  statsCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statBlockValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  statBlockLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 50,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
  },
  promoCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  promoIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  promoDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  codeValue: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  promoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  promoStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promoStatText: {
    fontSize: 12,
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 14,
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
    maxHeight: '90%',
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
  detailHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  detailIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  codeDisplay: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  codeDisplayLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
  },
  codeDisplayValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  gridLabel: {
    fontSize: 11,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 10,
  },
  validityCard: {
    padding: 14,
    borderRadius: 12,
  },
  validityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  validityItem: {
    alignItems: 'center',
  },
  validityLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  validityValue: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  serviceText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  modalActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 20,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
  },
  typeOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  typeOptionText: {
    fontSize: 11,
    fontWeight: '500',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
