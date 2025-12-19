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
    Switch,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Promotion {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'free_service';
  value: number;
  code: string;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  minOrderValue: number;
  maxDiscount: number;
  status: 'active' | 'scheduled' | 'expired' | 'paused';
  applicableServices: string[];
}

const mockPromotions: Promotion[] = [
  {
    id: '1',
    name: 'New Year Sale',
    type: 'percentage',
    value: 25,
    code: 'NEWYEAR25',
    startDate: 'Dec 28, 2024',
    endDate: 'Jan 5, 2025',
    usageLimit: 100,
    usedCount: 45,
    minOrderValue: 500,
    maxDiscount: 500,
    status: 'active',
    applicableServices: ['All Services'],
  },
  {
    id: '2',
    name: 'First Time Discount',
    type: 'percentage',
    value: 50,
    code: 'FIRST50',
    startDate: 'Jan 1, 2024',
    endDate: 'Dec 31, 2024',
    usageLimit: 0,
    usedCount: 256,
    minOrderValue: 299,
    maxDiscount: 300,
    status: 'active',
    applicableServices: ['All Services'],
  },
  {
    id: '3',
    name: 'Flat ₹200 Off',
    type: 'fixed',
    value: 200,
    code: 'FLAT200',
    startDate: 'Dec 15, 2024',
    endDate: 'Dec 31, 2024',
    usageLimit: 50,
    usedCount: 50,
    minOrderValue: 999,
    maxDiscount: 200,
    status: 'expired',
    applicableServices: ['Deep Cleaning', 'AC Service'],
  },
  {
    id: '4',
    name: 'Weekend Special',
    type: 'percentage',
    value: 15,
    code: 'WEEKEND15',
    startDate: 'Jan 1, 2025',
    endDate: 'Jan 31, 2025',
    usageLimit: 200,
    usedCount: 0,
    minOrderValue: 400,
    maxDiscount: 250,
    status: 'scheduled',
    applicableServices: ['All Services'],
  },
];

const promotionTypes = [
  { id: 'percentage', label: 'Percentage', icon: 'pricetag' },
  { id: 'fixed', label: 'Fixed Amount', icon: 'cash' },
  { id: 'free_service', label: 'Free Service', icon: 'gift' },
];

export default function PromotionsManagementScreen() {
  const colors = useColors();
  const [promotions, setPromotions] = useState(mockPromotions);
  const [selectedTab, setSelectedTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  // Create modal state
  const [newPromo, setNewPromo] = useState({
    name: '',
    type: 'percentage',
    value: '',
    code: '',
    minOrderValue: '',
    maxDiscount: '',
    usageLimit: '',
  });

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'expired', label: 'Expired' },
  ];

  const filteredPromotions = promotions.filter((p) =>
    selectedTab === 'all' ? true : p.status === selectedTab
  );

  const stats = {
    total: promotions.length,
    active: promotions.filter((p) => p.status === 'active').length,
    totalUsed: promotions.reduce((sum, p) => sum + p.usedCount, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'scheduled':
        return '#2196F3';
      case 'expired':
        return colors.textSecondary;
      case 'paused':
        return '#FF9800';
      default:
        return colors.textSecondary;
    }
  };

  const getTypeLabel = (type: string, value: number) => {
    switch (type) {
      case 'percentage':
        return `${value}% OFF`;
      case 'fixed':
        return `₹${value} OFF`;
      case 'free_service':
        return 'Free Service';
      default:
        return '';
    }
  };

  const togglePromoStatus = (id: string) => {
    setPromotions((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: p.status === 'active' ? 'paused' : 'active',
            }
          : p
      )
    );
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPromo({ ...newPromo, code });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Promotions</ThemedText>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="pricetags" size={20} color={colors.primary} />
          </View>
          <View>
            <ThemedText style={styles.statValue}>{stats.total}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total
            </ThemedText>
          </View>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          </View>
          <View>
            <ThemedText style={styles.statValue}>{stats.active}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Active
            </ThemedText>
          </View>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={[styles.statIcon, { backgroundColor: '#2196F3' + '15' }]}>
            <Ionicons name="people" size={20} color="#2196F3" />
          </View>
          <View>
            <ThemedText style={styles.statValue}>{stats.totalUsed}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Used
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsList}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                {
                  backgroundColor:
                    selectedTab === tab.id ? colors.primary : colors.card,
                  borderColor:
                    selectedTab === tab.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: selectedTab === tab.id ? '#fff' : colors.text },
                ]}
              >
                {tab.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Promotions List */}
      <FlatList
        data={filteredPromotions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="pricetags-outline" size={48} color={colors.border} />
            <ThemedText style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              No promotions found
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              Create your first promotion to attract more customers
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.card }]}
            onPress={() => {
              setSelectedPromotion(item);
              setShowDetailsModal(true);
            }}
          >
            <View style={styles.promoHeader}>
              <View style={styles.promoTitleRow}>
                <View
                  style={[
                    styles.promoTypeIcon,
                    { backgroundColor: colors.primary + '15' },
                  ]}
                >
                  <Ionicons
                    name={
                      item.type === 'percentage'
                        ? 'pricetag'
                        : item.type === 'fixed'
                        ? 'cash'
                        : 'gift'
                    }
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.promoTitleSection}>
                  <ThemedText style={styles.promoName}>{item.name}</ThemedText>
                  <ThemedText style={[styles.promoValue, { color: colors.primary }]}>
                    {getTypeLabel(item.type, item.value)}
                  </ThemedText>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) + '15' },
                ]}
              >
                <ThemedText
                  style={[styles.statusText, { color: getStatusColor(item.status) }]}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.codeContainer, { backgroundColor: colors.background }]}>
              <ThemedText style={[styles.codeLabel, { color: colors.textSecondary }]}>
                CODE
              </ThemedText>
              <ThemedText style={[styles.codeText, { color: colors.primary }]}>
                {item.code}
              </ThemedText>
            </View>

            <View style={styles.promoDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                  {item.startDate} - {item.endDate}
                </ThemedText>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
                <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                  {item.usedCount}
                  {item.usageLimit > 0 ? `/${item.usageLimit}` : ''} used
                </ThemedText>
              </View>
            </View>

            {item.usageLimit > 0 && (
              <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(item.usedCount / item.usageLimit) * 100}%`,
                      backgroundColor:
                        item.usedCount >= item.usageLimit ? colors.error : colors.primary,
                    },
                  ]}
                />
              </View>
            )}

            <View style={styles.promoActions}>
              <Switch
                value={item.status === 'active'}
                onValueChange={() => togglePromoStatus(item.id)}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={item.status === 'active' ? colors.primary : colors.textSecondary}
                disabled={item.status === 'expired'}
              />
              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Create Promotion Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.createModal, { backgroundColor: colors.card }]}>
            <View style={styles.createModalHeader}>
              <ThemedText style={styles.modalTitle}>Create Promotion</ThemedText>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Promotion Name */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Promotion Name</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="e.g., Summer Sale"
                  placeholderTextColor={colors.textSecondary}
                  value={newPromo.name}
                  onChangeText={(text) => setNewPromo({ ...newPromo, name: text })}
                />
              </View>

              {/* Discount Type */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Discount Type</ThemedText>
                <View style={styles.typeOptions}>
                  {promotionTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeOption,
                        {
                          backgroundColor:
                            newPromo.type === type.id ? colors.primary + '15' : colors.background,
                          borderColor:
                            newPromo.type === type.id ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setNewPromo({ ...newPromo, type: type.id })}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={18}
                        color={newPromo.type === type.id ? colors.primary : colors.textSecondary}
                      />
                      <ThemedText
                        style={[
                          styles.typeOptionText,
                          { color: newPromo.type === type.id ? colors.primary : colors.text },
                        ]}
                      >
                        {type.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Value */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>
                  {newPromo.type === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                </ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder={newPromo.type === 'percentage' ? 'e.g., 25' : 'e.g., 200'}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={newPromo.value}
                  onChangeText={(text) => setNewPromo({ ...newPromo, value: text })}
                />
              </View>

              {/* Code */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Promo Code</ThemedText>
                <View style={styles.codeInputRow}>
                  <TextInput
                    style={[styles.codeInput, { backgroundColor: colors.background, color: colors.text }]}
                    placeholder="e.g., SAVE25"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="characters"
                    value={newPromo.code}
                    onChangeText={(text) => setNewPromo({ ...newPromo, code: text.toUpperCase() })}
                  />
                  <TouchableOpacity
                    style={[styles.generateButton, { backgroundColor: colors.primary }]}
                    onPress={generateCode}
                  >
                    <Ionicons name="refresh" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Min Order & Max Discount */}
              <View style={styles.formRow}>
                <View style={[styles.formSection, { flex: 1 }]}>
                  <ThemedText style={styles.formLabel}>Min. Order (₹)</ThemedText>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                    placeholder="0"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={newPromo.minOrderValue}
                    onChangeText={(text) => setNewPromo({ ...newPromo, minOrderValue: text })}
                  />
                </View>
                {newPromo.type === 'percentage' && (
                  <View style={[styles.formSection, { flex: 1 }]}>
                    <ThemedText style={styles.formLabel}>Max Discount (₹)</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                      placeholder="No limit"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      value={newPromo.maxDiscount}
                      onChangeText={(text) => setNewPromo({ ...newPromo, maxDiscount: text })}
                    />
                  </View>
                )}
              </View>

              {/* Usage Limit */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Usage Limit</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="Leave empty for unlimited"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={newPromo.usageLimit}
                  onChangeText={(text) => setNewPromo({ ...newPromo, usageLimit: text })}
                />
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowCreateModal(false)}
            >
              <ThemedText style={styles.createButtonText}>Create Promotion</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Promotion Details Modal */}
      <Modal visible={showDetailsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.detailsModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            {selectedPromotion && (
              <>
                <View style={styles.detailsHeader}>
                  <View>
                    <ThemedText style={styles.detailsTitle}>{selectedPromotion.name}</ThemedText>
                    <ThemedText style={[styles.detailsValue, { color: colors.primary }]}>
                      {getTypeLabel(selectedPromotion.type, selectedPromotion.value)}
                    </ThemedText>
                  </View>
                  <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={[styles.detailsCode, { backgroundColor: colors.background }]}>
                  <ThemedText style={[styles.detailsCodeLabel, { color: colors.textSecondary }]}>
                    PROMO CODE
                  </ThemedText>
                  <ThemedText style={styles.detailsCodeText}>{selectedPromotion.code}</ThemedText>
                </View>

                <View style={styles.detailsGrid}>
                  <View style={styles.detailsGridItem}>
                    <Ionicons name="calendar" size={20} color={colors.primary} />
                    <ThemedText style={styles.detailsGridLabel}>Start Date</ThemedText>
                    <ThemedText style={styles.detailsGridValue}>{selectedPromotion.startDate}</ThemedText>
                  </View>
                  <View style={styles.detailsGridItem}>
                    <Ionicons name="calendar" size={20} color={colors.error} />
                    <ThemedText style={styles.detailsGridLabel}>End Date</ThemedText>
                    <ThemedText style={styles.detailsGridValue}>{selectedPromotion.endDate}</ThemedText>
                  </View>
                  <View style={styles.detailsGridItem}>
                    <Ionicons name="cart" size={20} color="#FF9800" />
                    <ThemedText style={styles.detailsGridLabel}>Min Order</ThemedText>
                    <ThemedText style={styles.detailsGridValue}>₹{selectedPromotion.minOrderValue}</ThemedText>
                  </View>
                  <View style={styles.detailsGridItem}>
                    <Ionicons name="people" size={20} color="#2196F3" />
                    <ThemedText style={styles.detailsGridLabel}>Used</ThemedText>
                    <ThemedText style={styles.detailsGridValue}>
                      {selectedPromotion.usedCount}
                      {selectedPromotion.usageLimit > 0 ? ` / ${selectedPromotion.usageLimit}` : ''}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.detailsActions}>
                  <TouchableOpacity
                    style={[styles.detailsActionButton, { backgroundColor: colors.primary }]}
                  >
                    <Ionicons name="create" size={20} color="#fff" />
                    <ThemedText style={styles.detailsActionText}>Edit</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.detailsActionButton, { backgroundColor: colors.error }]}
                  >
                    <Ionicons name="trash" size={20} color="#fff" />
                    <ThemedText style={styles.detailsActionText}>Delete</ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
  },
  tabsContainer: {
    marginBottom: 12,
  },
  tabsList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
  },
  promoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  promoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  promoTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoTitleSection: {
    flex: 1,
  },
  promoName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  promoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  codeText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  promoDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  promoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  editButton: {
    padding: 6,
  },
  deleteButton: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  createModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  createModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  formSection: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  typeOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  codeInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  codeInput: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    letterSpacing: 1,
  },
  generateButton: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  createButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailsValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  detailsCode: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsCodeLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1,
    marginBottom: 4,
  },
  detailsCodeText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  detailsGridItem: {
    width: (width - 60) / 2 - 6,
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  detailsGridLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    marginBottom: 2,
  },
  detailsGridValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  detailsActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
