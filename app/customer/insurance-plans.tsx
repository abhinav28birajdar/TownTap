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
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Insurance {
  id: string;
  name: string;
  provider: string;
  type: 'health' | 'auto' | 'home' | 'appliance' | 'travel';
  policyNumber: string;
  coverageAmount: number;
  premium: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending';
  covered: string[];
  claimHistory: number;
  documents: string[];
}

const mockInsurances: Insurance[] = [
  {
    id: '1',
    name: 'Comprehensive Home Insurance',
    provider: 'SecureHome Insurance',
    type: 'home',
    policyNumber: 'HI-2024-001234',
    coverageAmount: 5000000,
    premium: 12000,
    startDate: 'Jan 1, 2024',
    endDate: 'Dec 31, 2024',
    status: 'active',
    covered: ['Fire damage', 'Theft', 'Natural disasters', 'Plumbing issues', 'Electrical damage'],
    claimHistory: 1,
    documents: ['Policy document', 'Coverage details'],
  },
  {
    id: '2',
    name: 'Appliance Protection Plan',
    provider: 'TechGuard',
    type: 'appliance',
    policyNumber: 'AP-2024-005678',
    coverageAmount: 100000,
    premium: 2500,
    startDate: 'Mar 15, 2024',
    endDate: 'Mar 14, 2025',
    status: 'active',
    covered: ['AC repair', 'Refrigerator', 'Washing machine', 'Microwave', 'TV'],
    claimHistory: 2,
    documents: ['Policy document', 'Appliance list'],
  },
  {
    id: '3',
    name: 'Vehicle Insurance',
    provider: 'AutoShield Insurance',
    type: 'auto',
    policyNumber: 'VI-2024-009876',
    coverageAmount: 300000,
    premium: 8500,
    startDate: 'Jun 1, 2024',
    endDate: 'May 31, 2025',
    status: 'active',
    covered: ['Accident damage', 'Theft', 'Third-party liability', 'Roadside assistance'],
    claimHistory: 0,
    documents: ['Policy document', 'Vehicle details'],
  },
  {
    id: '4',
    name: 'Health Insurance',
    provider: 'HealthFirst',
    type: 'health',
    policyNumber: 'HE-2023-003456',
    coverageAmount: 1000000,
    premium: 15000,
    startDate: 'Jan 1, 2023',
    endDate: 'Dec 31, 2023',
    status: 'expired',
    covered: ['Hospitalization', 'Surgery', 'Medications', 'Diagnostics'],
    claimHistory: 3,
    documents: ['Policy document'],
  },
];

const availablePlans = [
  {
    id: '1',
    name: 'Basic Home Protection',
    provider: 'HomeGuard',
    type: 'home',
    coverageAmount: 1000000,
    premium: 3999,
    features: ['Fire', 'Theft', 'Basic repairs'],
  },
  {
    id: '2',
    name: 'Appliance Care Plus',
    provider: 'TechCare',
    type: 'appliance',
    coverageAmount: 150000,
    premium: 1999,
    features: ['All appliances', 'Unlimited repairs', '24/7 support'],
  },
  {
    id: '3',
    name: 'Travel Safe',
    provider: 'TravelGuard',
    type: 'travel',
    coverageAmount: 500000,
    premium: 999,
    features: ['Trip cancellation', 'Medical emergency', 'Lost baggage'],
  },
];

export default function InsurancePlansScreen() {
  const colors = useColors();
  const [insurances] = useState<Insurance[]>(mockInsurances);
  const [selectedInsurance, setSelectedInsurance] = useState<Insurance | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  const filteredInsurances = insurances.filter((ins) => {
    if (filter === 'all') return true;
    return ins.status === filter;
  });

  const activeCount = insurances.filter((i) => i.status === 'active').length;
  const totalCoverage = insurances
    .filter((i) => i.status === 'active')
    .reduce((sum, i) => sum + i.coverageAmount, 0);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      home: 'home',
      appliance: 'tv',
      auto: 'car',
      health: 'heart',
      travel: 'airplane',
    };
    return icons[type] || 'shield';
  };

  const getTypeColor = (type: string): string => {
    const typeColors: Record<string, string> = {
      home: '#4CAF50',
      appliance: '#2196F3',
      auto: '#FF9800',
      health: '#E91E63',
      travel: '#9C27B0',
    };
    return typeColors[type] || colors.primary;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'expired':
        return colors.error;
      case 'pending':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const renderInsurance = ({ item }: { item: Insurance }) => (
    <TouchableOpacity
      style={[
        styles.insuranceCard,
        { backgroundColor: colors.card },
        item.status === 'expired' && { opacity: 0.7 },
      ]}
      onPress={() => {
        setSelectedInsurance(item);
        setShowDetailsModal(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View
          style={[styles.typeIcon, { backgroundColor: getTypeColor(item.type) + '15' }]}
        >
          <Ionicons name={getTypeIcon(item.type) as any} size={22} color={getTypeColor(item.type)} />
        </View>
        <View style={styles.cardHeaderInfo}>
          <ThemedText style={styles.insuranceName} numberOfLines={1}>
            {item.name}
          </ThemedText>
          <ThemedText style={[styles.providerName, { color: colors.textSecondary }]}>
            {item.provider}
          </ThemedText>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}
        >
          <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.cardDivider, { borderBottomColor: colors.border }]} />

      <View style={styles.cardContent}>
        <View style={styles.infoItem}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Coverage
          </ThemedText>
          <ThemedText style={styles.infoValue}>
            ₹{(item.coverageAmount / 100000).toFixed(1)}L
          </ThemedText>
        </View>
        <View style={styles.infoItem}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Premium
          </ThemedText>
          <ThemedText style={styles.infoValue}>
            ₹{item.premium.toLocaleString()}/yr
          </ThemedText>
        </View>
        <View style={styles.infoItem}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Valid Till
          </ThemedText>
          <ThemedText style={styles.infoValue}>{item.endDate}</ThemedText>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <ThemedText style={[styles.policyNumber, { color: colors.textSecondary }]}>
          {item.policyNumber}
        </ThemedText>
        <TouchableOpacity style={styles.viewBtn}>
          <ThemedText style={[styles.viewBtnText, { color: colors.primary }]}>
            View Details
          </ThemedText>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
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
        <ThemedText style={styles.headerTitle}>Insurance Plans</ThemedText>
        <TouchableOpacity onPress={() => setShowPlansModal(true)}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Summary Card */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'CC']}
          style={styles.summaryCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.summaryHeader}>
            <View style={styles.shieldIcon}>
              <Ionicons name="shield-checkmark" size={28} color="#fff" />
            </View>
            <View>
              <ThemedText style={styles.summaryTitle}>You're Protected</ThemedText>
              <ThemedText style={styles.summarySubtitle}>
                {activeCount} active {activeCount === 1 ? 'plan' : 'plans'}
              </ThemedText>
            </View>
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <ThemedText style={styles.summaryStatValue}>
                ₹{(totalCoverage / 100000).toFixed(1)}L
              </ThemedText>
              <ThemedText style={styles.summaryStatLabel}>Total Coverage</ThemedText>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <ThemedText style={styles.summaryStatValue}>
                {insurances.reduce((sum, i) => sum + i.claimHistory, 0)}
              </ThemedText>
              <ThemedText style={styles.summaryStatLabel}>Claims Made</ThemedText>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsScroll}
        >
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.card }]}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="document-text" size={20} color={colors.success} />
            </View>
            <ThemedText style={styles.quickActionLabel}>File Claim</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.card }]}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.info + '15' }]}>
              <Ionicons name="call" size={20} color={colors.info} />
            </View>
            <ThemedText style={styles.quickActionLabel}>Get Support</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.card }]}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="refresh" size={20} color={colors.primary} />
            </View>
            <ThemedText style={styles.quickActionLabel}>Renew Plan</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => setShowPlansModal(true)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#9C27B0' + '15' }]}>
              <Ionicons name="add" size={20} color="#9C27B0" />
            </View>
            <ThemedText style={styles.quickActionLabel}>Add Plan</ThemedText>
          </TouchableOpacity>
        </ScrollView>

        {/* Filter */}
        <View style={styles.filterSection}>
          <ThemedText style={styles.sectionTitle}>My Plans</ThemedText>
          <View style={styles.filterTabs}>
            {(['all', 'active', 'expired'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterTab,
                  filter === f && { backgroundColor: colors.primary },
                ]}
                onPress={() => setFilter(f)}
              >
                <ThemedText
                  style={[styles.filterTabText, { color: filter === f ? '#fff' : colors.text }]}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Insurance List */}
        <FlatList
          data={filteredInsurances}
          keyExtractor={(item) => item.id}
          renderItem={renderInsurance}
          scrollEnabled={false}
          contentContainerStyle={styles.insuranceList}
          ListEmptyComponent={
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Ionicons name="shield-outline" size={60} color={colors.textSecondary} />
              <ThemedText style={styles.emptyTitle}>No Insurance Plans</ThemedText>
              <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                Protect yourself and your home with our insurance plans
              </ThemedText>
              <TouchableOpacity
                style={[styles.browseBtn, { backgroundColor: colors.primary }]}
                onPress={() => setShowPlansModal(true)}
              >
                <ThemedText style={styles.browseBtnText}>Browse Plans</ThemedText>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Why Insurance */}
        <View style={[styles.whySection, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.whyTitle}>Why Get Insured?</ThemedText>
          <View style={styles.whyList}>
            {[
              { icon: 'shield-checkmark', text: 'Protection against unexpected damages' },
              { icon: 'wallet', text: 'Save money on expensive repairs' },
              { icon: 'time', text: 'Quick claim processing' },
              { icon: 'headset', text: '24/7 customer support' },
            ].map((item, index) => (
              <View key={index} style={styles.whyItem}>
                <View style={[styles.whyIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={item.icon as any} size={18} color={colors.primary} />
                </View>
                <ThemedText style={styles.whyText}>{item.text}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Details Modal */}
      <Modal visible={showDetailsModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDetailsModal(false)}
        >
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            {selectedInsurance && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <View
                    style={[
                      styles.modalTypeIcon,
                      { backgroundColor: getTypeColor(selectedInsurance.type) + '15' },
                    ]}
                  >
                    <Ionicons
                      name={getTypeIcon(selectedInsurance.type) as any}
                      size={32}
                      color={getTypeColor(selectedInsurance.type)}
                    />
                  </View>
                  <ThemedText style={styles.modalTitle}>{selectedInsurance.name}</ThemedText>
                  <ThemedText style={[styles.modalProvider, { color: colors.textSecondary }]}>
                    {selectedInsurance.provider}
                  </ThemedText>
                  <View
                    style={[
                      styles.modalStatusBadge,
                      { backgroundColor: getStatusColor(selectedInsurance.status) + '15' },
                    ]}
                  >
                    <Ionicons
                      name={selectedInsurance.status === 'active' ? 'checkmark-circle' : 'close-circle'}
                      size={14}
                      color={getStatusColor(selectedInsurance.status)}
                    />
                    <ThemedText
                      style={[
                        styles.modalStatusText,
                        { color: getStatusColor(selectedInsurance.status) },
                      ]}
                    >
                      {selectedInsurance.status.charAt(0).toUpperCase() +
                        selectedInsurance.status.slice(1)}
                    </ThemedText>
                  </View>
                </View>

                <View style={[styles.policySection, { backgroundColor: colors.background }]}>
                  <View style={styles.policyRow}>
                    <ThemedText style={[styles.policyLabel, { color: colors.textSecondary }]}>
                      Policy Number
                    </ThemedText>
                    <ThemedText style={styles.policyValue}>
                      {selectedInsurance.policyNumber}
                    </ThemedText>
                  </View>
                  <View style={styles.policyRow}>
                    <ThemedText style={[styles.policyLabel, { color: colors.textSecondary }]}>
                      Coverage Amount
                    </ThemedText>
                    <ThemedText style={styles.policyValue}>
                      ₹{selectedInsurance.coverageAmount.toLocaleString()}
                    </ThemedText>
                  </View>
                  <View style={styles.policyRow}>
                    <ThemedText style={[styles.policyLabel, { color: colors.textSecondary }]}>
                      Annual Premium
                    </ThemedText>
                    <ThemedText style={styles.policyValue}>
                      ₹{selectedInsurance.premium.toLocaleString()}
                    </ThemedText>
                  </View>
                  <View style={styles.policyRow}>
                    <ThemedText style={[styles.policyLabel, { color: colors.textSecondary }]}>
                      Valid Period
                    </ThemedText>
                    <ThemedText style={styles.policyValue}>
                      {selectedInsurance.startDate} - {selectedInsurance.endDate}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.coveredSection}>
                  <ThemedText style={styles.coveredTitle}>What's Covered</ThemedText>
                  {selectedInsurance.covered.map((item, index) => (
                    <View key={index} style={styles.coveredItem}>
                      <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                      <ThemedText style={styles.coveredText}>{item}</ThemedText>
                    </View>
                  ))}
                </View>

                <View style={styles.documentsSection}>
                  <ThemedText style={styles.documentsTitle}>Documents</ThemedText>
                  {selectedInsurance.documents.map((doc, index) => (
                    <TouchableOpacity key={index} style={styles.documentItem}>
                      <Ionicons name="document" size={18} color={colors.primary} />
                      <ThemedText style={[styles.documentText, { color: colors.primary }]}>
                        {doc}
                      </ThemedText>
                      <Ionicons name="download" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalActions}>
                  {selectedInsurance.status === 'active' ? (
                    <>
                      <TouchableOpacity
                        style={[styles.claimBtn, { borderColor: colors.primary }]}
                      >
                        <Ionicons name="document-text" size={18} color={colors.primary} />
                        <ThemedText style={[styles.claimBtnText, { color: colors.primary }]}>
                          File Claim
                        </ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.supportBtn, { backgroundColor: colors.primary }]}>
                        <Ionicons name="headset" size={18} color="#fff" />
                        <ThemedText style={styles.supportBtnText}>Get Support</ThemedText>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={[styles.renewBtn, { backgroundColor: colors.primary }]}
                    >
                      <ThemedText style={styles.renewBtnText}>Renew Plan</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Browse Plans Modal */}
      <Modal visible={showPlansModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPlansModal(false)}
        >
          <View style={[styles.plansModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.plansModalTitle}>Available Plans</ThemedText>
            <ThemedText style={[styles.plansModalSubtitle, { color: colors.textSecondary }]}>
              Choose a plan that suits your needs
            </ThemedText>

            <ScrollView showsVerticalScrollIndicator={false}>
              {availablePlans.map((plan) => (
                <View
                  key={plan.id}
                  style={[styles.planCard, { backgroundColor: colors.background }]}
                >
                  <View style={styles.planHeader}>
                    <View
                      style={[
                        styles.planIcon,
                        { backgroundColor: getTypeColor(plan.type) + '15' },
                      ]}
                    >
                      <Ionicons
                        name={getTypeIcon(plan.type) as any}
                        size={24}
                        color={getTypeColor(plan.type)}
                      />
                    </View>
                    <View style={styles.planInfo}>
                      <ThemedText style={styles.planName}>{plan.name}</ThemedText>
                      <ThemedText style={[styles.planProvider, { color: colors.textSecondary }]}>
                        {plan.provider}
                      </ThemedText>
                    </View>
                    <View style={styles.planPrice}>
                      <ThemedText style={styles.planPremium}>
                        ₹{plan.premium.toLocaleString()}
                      </ThemedText>
                      <ThemedText style={[styles.planPeriod, { color: colors.textSecondary }]}>
                        /year
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.planFeatures}>
                    {plan.features.map((feature, index) => (
                      <View key={index} style={styles.planFeature}>
                        <Ionicons name="checkmark" size={14} color={colors.success} />
                        <ThemedText style={[styles.planFeatureText, { color: colors.textSecondary }]}>
                          {feature}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                  <View style={styles.planFooter}>
                    <ThemedText style={[styles.planCoverage, { color: colors.textSecondary }]}>
                      Coverage: ₹{(plan.coverageAmount / 100000).toFixed(1)}L
                    </ThemedText>
                    <TouchableOpacity style={[styles.getPlanBtn, { backgroundColor: colors.primary }]}>
                      <ThemedText style={styles.getPlanBtnText}>Get Plan</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
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
  summaryCard: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  shieldIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  summarySubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  summaryStat: {
    alignItems: 'center',
    flex: 1,
  },
  summaryStatValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  summaryStatLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 20,
  },
  quickActionsScroll: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  quickAction: {
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    width: 90,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 10,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  insuranceList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  insuranceCard: {
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  insuranceName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  providerName: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardDivider: {
    borderBottomWidth: 1,
    marginVertical: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {},
  infoLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  policyNumber: {
    fontSize: 11,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    marginTop: 20,
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
    marginBottom: 20,
  },
  browseBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  whySection: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  whyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  whyList: {
    gap: 14,
  },
  whyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  whyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whyText: {
    flex: 1,
    fontSize: 13,
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
    maxHeight: '85%',
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
    marginBottom: 20,
  },
  modalTypeIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalProvider: {
    fontSize: 14,
    marginBottom: 10,
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  policySection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  policyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  policyLabel: {
    fontSize: 13,
  },
  policyValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  coveredSection: {
    marginBottom: 16,
  },
  coveredTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  coveredItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  coveredText: {
    fontSize: 14,
  },
  documentsSection: {
    marginBottom: 20,
  },
  documentsTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  documentText: {
    flex: 1,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  claimBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  claimBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  supportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  supportBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  renewBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  renewBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  plansModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  plansModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  plansModalSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  planCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  planProvider: {
    fontSize: 12,
  },
  planPrice: {
    alignItems: 'flex-end',
  },
  planPremium: {
    fontSize: 18,
    fontWeight: '700',
  },
  planPeriod: {
    fontSize: 11,
  },
  planFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planFeatureText: {
    fontSize: 12,
  },
  planFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planCoverage: {
    fontSize: 12,
  },
  getPlanBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  getPlanBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
