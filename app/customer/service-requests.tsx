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
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface ServiceRequest {
  id: string;
  title: string;
  category: string;
  description: string;
  budget: {
    min: number;
    max: number;
  };
  location: string;
  preferredDate: string;
  preferredTime: string;
  status: 'active' | 'expired' | 'fulfilled' | 'cancelled';
  createdAt: string;
  expiresIn: number; // hours
  responses: number;
  images?: string[];
}

interface QuoteResponse {
  id: string;
  requestId: string;
  providerId: string;
  providerName: string;
  businessName: string;
  rating: number;
  reviews: number;
  price: number;
  message: string;
  estimatedDuration: string;
  availability: string;
  verified: boolean;
  responseTime: string;
}

const mockRequests: ServiceRequest[] = [
  {
    id: '1',
    title: 'Deep Cleaning for 3BHK',
    category: 'Cleaning',
    description: 'Need thorough cleaning including kitchen, bathrooms, and all rooms. Have pets, so eco-friendly products preferred.',
    budget: { min: 1500, max: 2500 },
    location: 'Koramangala, Bangalore',
    preferredDate: '2024-01-25',
    preferredTime: '10:00 AM - 2:00 PM',
    status: 'active',
    createdAt: '2024-01-20',
    expiresIn: 48,
    responses: 5,
  },
  {
    id: '2',
    title: 'AC Installation - Split AC',
    category: 'AC Services',
    description: '1.5 ton split AC installation needed. Wall mounting required. Building is 2 floors.',
    budget: { min: 1000, max: 1500 },
    location: 'HSR Layout, Bangalore',
    preferredDate: '2024-01-26',
    preferredTime: '9:00 AM - 12:00 PM',
    status: 'fulfilled',
    createdAt: '2024-01-18',
    expiresIn: 0,
    responses: 3,
  },
  {
    id: '3',
    title: 'Plumbing - Multiple Repairs',
    category: 'Plumbing',
    description: 'Leaky faucet in kitchen, clogged drain in bathroom, and toilet flush repair needed.',
    budget: { min: 500, max: 1200 },
    location: 'Indiranagar, Bangalore',
    preferredDate: '2024-01-24',
    preferredTime: 'Flexible',
    status: 'active',
    createdAt: '2024-01-21',
    expiresIn: 24,
    responses: 8,
  },
];

const mockQuotes: QuoteResponse[] = [
  {
    id: '1',
    requestId: '1',
    providerId: 'p1',
    providerName: 'Rajesh Kumar',
    businessName: 'CleanPro Services',
    rating: 4.9,
    reviews: 2456,
    price: 1800,
    message: 'Hi! I can do this job with eco-friendly products. Have 5 years experience with pet-friendly homes.',
    estimatedDuration: '4 hours',
    availability: 'Available on your preferred date',
    verified: true,
    responseTime: '2 hours ago',
  },
  {
    id: '2',
    requestId: '1',
    providerId: 'p2',
    providerName: 'Amit Sharma',
    businessName: 'SparkleClean',
    rating: 4.7,
    reviews: 1823,
    price: 1600,
    message: 'I can help! Been doing deep cleaning for 3 years. Will bring all supplies.',
    estimatedDuration: '3.5 hours',
    availability: 'Available anytime',
    verified: true,
    responseTime: '4 hours ago',
  },
  {
    id: '3',
    requestId: '1',
    providerId: 'p3',
    providerName: 'Priya Patel',
    businessName: 'CleanStar',
    rating: 4.8,
    reviews: 987,
    price: 2000,
    message: 'Premium service with organic products. Team of 3 for faster completion.',
    estimatedDuration: '2.5 hours',
    availability: 'Morning slots available',
    verified: true,
    responseTime: '6 hours ago',
  },
];

const categories = [
  'Cleaning',
  'AC Services',
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Appliance Repair',
  'Pest Control',
  'Other',
];

export default function ServiceRequestScreen() {
  const colors = useColors();
  const [requests, setRequests] = useState<ServiceRequest[]>(mockRequests);
  const [activeTab, setActiveTab] = useState<'requests' | 'create'>('requests');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showQuotesModal, setShowQuotesModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Create form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
    location: '',
    preferredDate: '',
    preferredTime: '',
  });

  const filteredRequests = statusFilter
    ? requests.filter((r) => r.status === statusFilter)
    : requests;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'fulfilled':
        return colors.primary;
      case 'expired':
        return colors.textSecondary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Cleaning':
        return 'sparkles';
      case 'AC Services':
        return 'snow';
      case 'Plumbing':
        return 'water';
      case 'Electrical':
        return 'flash';
      case 'Carpentry':
        return 'construct';
      case 'Painting':
        return 'color-palette';
      case 'Appliance Repair':
        return 'settings';
      case 'Pest Control':
        return 'bug';
      default:
        return 'help-circle';
    }
  };

  const handleCreateRequest = () => {
    const newRequest: ServiceRequest = {
      id: Date.now().toString(),
      title: formData.title,
      category: formData.category,
      description: formData.description,
      budget: {
        min: parseInt(formData.budgetMin) || 0,
        max: parseInt(formData.budgetMax) || 0,
      },
      location: formData.location,
      preferredDate: formData.preferredDate,
      preferredTime: formData.preferredTime,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      expiresIn: 72,
      responses: 0,
    };
    setRequests((prev) => [newRequest, ...prev]);
    setShowCreateModal(false);
    setFormData({
      title: '',
      category: '',
      description: '',
      budgetMin: '',
      budgetMax: '',
      location: '',
      preferredDate: '',
      preferredTime: '',
    });
  };

  const renderRequest = ({ item }: { item: ServiceRequest }) => (
    <TouchableOpacity
      style={[styles.requestCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedRequest(item);
        setShowQuotesModal(true);
      }}
    >
      <View style={styles.requestHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name={getCategoryIcon(item.category) as any} size={22} color={colors.primary} />
        </View>
        <View style={styles.requestInfo}>
          <ThemedText style={styles.requestTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText style={[styles.requestCategory, { color: colors.textSecondary }]}>
            {item.category}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={[styles.requestDesc, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.description}
      </ThemedText>

      <View style={styles.requestDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
            ₹{item.budget.min} - ₹{item.budget.max}
          </ThemedText>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.location}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.requestFooter, { borderTopColor: colors.border }]}>
        <View style={styles.footerLeft}>
          {item.status === 'active' && item.expiresIn > 0 && (
            <View style={styles.expiresRow}>
              <Ionicons name="time-outline" size={14} color={colors.info} />
              <ThemedText style={[styles.expiresText, { color: colors.info }]}>
                Expires in {item.expiresIn}h
              </ThemedText>
            </View>
          )}
        </View>
        <View style={styles.responsesRow}>
          <Ionicons name="chatbubbles-outline" size={14} color={colors.primary} />
          <ThemedText style={[styles.responsesText, { color: colors.primary }]}>
            {item.responses} {item.responses === 1 ? 'quote' : 'quotes'}
          </ThemedText>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderQuote = ({ item }: { item: QuoteResponse }) => (
    <View style={[styles.quoteCard, { backgroundColor: colors.background }]}>
      <View style={styles.quoteHeader}>
        <View style={[styles.quoteAvatar, { backgroundColor: colors.primary + '15' }]}>
          <ThemedText style={[styles.quoteAvatarText, { color: colors.primary }]}>
            {item.providerName.split(' ').map((n) => n[0]).join('')}
          </ThemedText>
        </View>
        <View style={styles.quoteInfo}>
          <View style={styles.quoteNameRow}>
            <ThemedText style={styles.quoteName}>{item.providerName}</ThemedText>
            {item.verified && (
              <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
            )}
          </View>
          <ThemedText style={[styles.quoteBusiness, { color: colors.textSecondary }]}>
            {item.businessName}
          </ThemedText>
          <View style={styles.quoteRating}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <ThemedText style={styles.quoteRatingText}>{item.rating}</ThemedText>
            <ThemedText style={[styles.quoteReviews, { color: colors.textSecondary }]}>
              ({item.reviews})
            </ThemedText>
          </View>
        </View>
        <View style={styles.quotePriceSection}>
          <ThemedText style={[styles.quotePrice, { color: colors.primary }]}>
            ₹{item.price}
          </ThemedText>
          <ThemedText style={[styles.quoteTime, { color: colors.textSecondary }]}>
            {item.responseTime}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.quoteMessage, { backgroundColor: colors.card }]}>
        <ThemedText style={styles.quoteMessageText}>"{item.message}"</ThemedText>
      </View>

      <View style={styles.quoteMeta}>
        <View style={styles.quoteMetaItem}>
          <Ionicons name="time" size={14} color={colors.textSecondary} />
          <ThemedText style={[styles.quoteMetaText, { color: colors.textSecondary }]}>
            {item.estimatedDuration}
          </ThemedText>
        </View>
        <View style={styles.quoteMetaItem}>
          <Ionicons name="calendar" size={14} color={colors.success} />
          <ThemedText style={[styles.quoteMetaText, { color: colors.success }]}>
            {item.availability}
          </ThemedText>
        </View>
      </View>

      <View style={styles.quoteActions}>
        <TouchableOpacity
          style={[styles.chatBtn, { borderColor: colors.primary }]}
          onPress={() => router.push({ pathname: '/messages/chat/[id]', params: { id: item.providerId } })}
        >
          <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
          <ThemedText style={[styles.chatBtnText, { color: colors.primary }]}>Chat</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            setShowQuotesModal(false);
            router.push({
              pathname: '/booking/form',
              params: { providerId: item.providerId, price: item.price },
            });
          }}
        >
          <ThemedText style={styles.acceptBtnText}>Accept Quote</ThemedText>
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
        <ThemedText style={styles.headerTitle}>Service Requests</ThemedText>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      <LinearGradient
        colors={[colors.primary, '#2D4A3E']}
        style={styles.statsCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {requests.filter((r) => r.status === 'active').length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Active</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {requests.reduce((sum, r) => sum + r.responses, 0)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Quotes</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {requests.filter((r) => r.status === 'fulfilled').length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Fulfilled</ThemedText>
          </View>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {[null, 'active', 'fulfilled', 'expired', 'cancelled'].map((status) => (
          <TouchableOpacity
            key={status || 'all'}
            style={[
              styles.filterChip,
              {
                backgroundColor: statusFilter === status ? colors.primary : colors.card,
              },
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <ThemedText
              style={[
                styles.filterChipText,
                { color: statusFilter === status ? '#fff' : colors.text },
              ]}
            >
              {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Requests List */}
      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequest}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="document-text-outline" size={50} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Requests Yet</ThemedText>
            <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Create a request to get quotes from service providers
            </ThemedText>
          </View>
        }
      />

      {/* Create FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Quotes Modal */}
      <Modal visible={showQuotesModal} transparent animationType="slide">
        <View style={[styles.quotesModal, { backgroundColor: colors.card }]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setShowQuotesModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <ThemedText style={styles.modalTitle}>
                {selectedRequest?.responses || 0} Quotes
              </ThemedText>
              <View style={{ width: 24 }} />
            </View>

            {selectedRequest && (
              <View style={[styles.requestSummary, { backgroundColor: colors.background }]}>
                <ThemedText style={styles.summaryTitle}>{selectedRequest.title}</ThemedText>
                <ThemedText style={[styles.summaryBudget, { color: colors.textSecondary }]}>
                  Budget: ₹{selectedRequest.budget.min} - ₹{selectedRequest.budget.max}
                </ThemedText>
              </View>
            )}

            <FlatList
              data={mockQuotes.filter((q) => q.requestId === selectedRequest?.id)}
              keyExtractor={(item) => item.id}
              renderItem={renderQuote}
              contentContainerStyle={styles.quotesList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.noQuotes}>
                  <Ionicons name="chatbubbles-outline" size={40} color={colors.textSecondary} />
                  <ThemedText style={[styles.noQuotesText, { color: colors.textSecondary }]}>
                    No quotes yet. Providers will respond soon!
                  </ThemedText>
                </View>
              }
            />
          </SafeAreaView>
        </View>
      </Modal>

      {/* Create Request Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={[styles.createModal, { backgroundColor: colors.background }]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <ThemedText style={styles.modalTitle}>New Request</ThemedText>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.createForm} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Title *</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.card, color: colors.text }]}
                  placeholder="e.g., Deep cleaning for 2BHK"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Category *</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryRow}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryChip,
                          {
                            backgroundColor:
                              formData.category === cat ? colors.primary : colors.card,
                          },
                        ]}
                        onPress={() => setFormData({ ...formData, category: cat })}
                      >
                        <Ionicons
                          name={getCategoryIcon(cat) as any}
                          size={14}
                          color={formData.category === cat ? '#fff' : colors.text}
                        />
                        <ThemedText
                          style={[
                            styles.categoryChipText,
                            { color: formData.category === cat ? '#fff' : colors.text },
                          ]}
                        >
                          {cat}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Description *</ThemedText>
                <TextInput
                  style={[
                    styles.formInput,
                    styles.textArea,
                    { backgroundColor: colors.card, color: colors.text },
                  ]}
                  placeholder="Describe what you need..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Budget Range *</ThemedText>
                <View style={styles.budgetRow}>
                  <TextInput
                    style={[
                      styles.formInput,
                      styles.budgetInput,
                      { backgroundColor: colors.card, color: colors.text },
                    ]}
                    placeholder="Min ₹"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={formData.budgetMin}
                    onChangeText={(text) => setFormData({ ...formData, budgetMin: text })}
                  />
                  <ThemedText style={[styles.budgetSeparator, { color: colors.textSecondary }]}>
                    to
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.formInput,
                      styles.budgetInput,
                      { backgroundColor: colors.card, color: colors.text },
                    ]}
                    placeholder="Max ₹"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={formData.budgetMax}
                    onChangeText={(text) => setFormData({ ...formData, budgetMax: text })}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Location *</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.card, color: colors.text }]}
                  placeholder="Your area or address"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <ThemedText style={styles.formLabel}>Preferred Date</ThemedText>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: colors.card, color: colors.text }]}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.preferredDate}
                    onChangeText={(text) => setFormData({ ...formData, preferredDate: text })}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <ThemedText style={styles.formLabel}>Preferred Time</ThemedText>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: colors.card, color: colors.text }]}
                    placeholder="e.g., Morning"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.preferredTime}
                    onChangeText={(text) => setFormData({ ...formData, preferredTime: text })}
                  />
                </View>
              </View>

              <View style={styles.formInfo}>
                <Ionicons name="information-circle" size={18} color={colors.info} />
                <ThemedText style={[styles.formInfoText, { color: colors.textSecondary }]}>
                  Your request will be visible to service providers in your area. They'll send you
                  quotes directly.
                </ThemedText>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  {
                    backgroundColor:
                      formData.title && formData.category && formData.description
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                disabled={!formData.title || !formData.category || !formData.description}
                onPress={handleCreateRequest}
              >
                <ThemedText style={styles.submitBtnText}>Post Request</ThemedText>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
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
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  requestCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  requestCategory: {
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  requestDesc: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  requestDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    maxWidth: 120,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerLeft: {},
  expiresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expiresText: {
    fontSize: 12,
    fontWeight: '500',
  },
  responsesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  responsesText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  quotesModal: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  requestSummary: {
    padding: 16,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryBudget: {
    fontSize: 13,
  },
  quotesList: {
    padding: 16,
  },
  quoteCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  quoteHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  quoteAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quoteAvatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  quoteInfo: {
    flex: 1,
  },
  quoteNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  quoteName: {
    fontSize: 14,
    fontWeight: '600',
  },
  quoteBusiness: {
    fontSize: 12,
    marginBottom: 4,
  },
  quoteRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  quoteRatingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quoteReviews: {
    fontSize: 11,
  },
  quotePriceSection: {
    alignItems: 'flex-end',
  },
  quotePrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  quoteTime: {
    fontSize: 11,
  },
  quoteMessage: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  quoteMessageText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  quoteMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  quoteMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quoteMetaText: {
    fontSize: 12,
  },
  quoteActions: {
    flexDirection: 'row',
    gap: 10,
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  chatBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  acceptBtn: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  noQuotes: {
    alignItems: 'center',
    padding: 40,
  },
  noQuotesText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  createModal: {
    flex: 1,
  },
  createForm: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 18,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChipText: {
    fontSize: 13,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  budgetInput: {
    flex: 1,
  },
  budgetSeparator: {
    fontSize: 14,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formInfo: {
    flexDirection: 'row',
    padding: 14,
    gap: 10,
    marginBottom: 20,
  },
  formInfoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
