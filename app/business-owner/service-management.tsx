import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  image: string;
  active: boolean;
  bookings: number;
  rating: number;
}

const services: ServiceItem[] = [
  {
    id: '1',
    name: 'Deep Home Cleaning',
    description: 'Complete deep cleaning service for homes up to 3 BHK',
    price: 1999,
    duration: '3-4 hours',
    category: 'Cleaning',
    image: 'https://via.placeholder.com/100',
    active: true,
    bookings: 156,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Kitchen Deep Clean',
    description: 'Thorough cleaning of kitchen including appliances',
    price: 799,
    duration: '1-2 hours',
    category: 'Cleaning',
    image: 'https://via.placeholder.com/100',
    active: true,
    bookings: 89,
    rating: 4.7,
  },
  {
    id: '3',
    name: 'Bathroom Sanitization',
    description: 'Complete bathroom cleaning and sanitization',
    price: 499,
    duration: '1 hour',
    category: 'Cleaning',
    image: 'https://via.placeholder.com/100',
    active: false,
    bookings: 45,
    rating: 4.6,
  },
  {
    id: '4',
    name: 'Carpet Shampooing',
    description: 'Professional carpet cleaning and shampooing',
    price: 899,
    duration: '2 hours',
    category: 'Cleaning',
    image: 'https://via.placeholder.com/100',
    active: true,
    bookings: 34,
    rating: 4.9,
  },
];

const categories = ['All', 'Cleaning', 'Plumbing', 'Electrical', 'Appliance Repair'];

export default function ServiceManagementScreen() {
  const colors = useColors();
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'Cleaning',
  });

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const stats = {
    total: services.length,
    active: services.filter(s => s.active).length,
    totalBookings: services.reduce((sum, s) => sum + s.bookings, 0),
    avgRating: (services.reduce((sum, s) => sum + s.rating, 0) / services.length).toFixed(1),
  };

  const renderService = ({ item }: { item: ServiceItem }) => (
    <TouchableOpacity
      style={[styles.serviceCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedService(item);
        setShowDetailModal(true);
      }}
    >
      <Image source={{ uri: item.image }} style={styles.serviceImage} />
      <View style={styles.serviceInfo}>
        <View style={styles.serviceHeader}>
          <ThemedText style={styles.serviceName} numberOfLines={1}>
            {item.name}
          </ThemedText>
          <View style={[
            styles.statusDot,
            { backgroundColor: item.active ? colors.success : colors.textSecondary }
          ]} />
        </View>
        <ThemedText style={[styles.serviceDescription, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.description}
        </ThemedText>
        <View style={styles.serviceFooter}>
          <ThemedText style={[styles.servicePrice, { color: colors.primary }]}>
            ₹{item.price.toLocaleString()}
          </ThemedText>
          <View style={styles.serviceMeta}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.duration}
            </ThemedText>
          </View>
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
        <ThemedText style={styles.headerTitle}>My Services</ThemedText>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      <LinearGradient
        colors={[colors.primary, colors.primary + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statsCard}
      >
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{stats.total}</ThemedText>
            <ThemedText style={styles.statLabel}>Total</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{stats.active}</ThemedText>
            <ThemedText style={styles.statLabel}>Active</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{stats.totalBookings}</ThemedText>
            <ThemedText style={styles.statLabel}>Bookings</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <ThemedText style={styles.statValue}>{stats.avgRating}</ThemedText>
            </View>
            <ThemedText style={styles.statLabel}>Avg Rating</ThemedText>
          </View>
        </View>
      </LinearGradient>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search services..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              selectedCategory === category && { backgroundColor: colors.primary }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <ThemedText style={[
              styles.categoryText,
              { color: selectedCategory === category ? '#FFF' : colors.textSecondary }
            ]}>
              {category}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Services List */}
      <FlatList
        data={filteredServices}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="construct-outline" size={64} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Services</ThemedText>
            <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Add your first service to start receiving bookings
            </ThemedText>
          </View>
        }
      />

      {/* Service Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Service Details</ThemedText>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedService && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Service Image */}
                <View style={[styles.detailImageContainer, { backgroundColor: colors.background }]}>
                  <Image source={{ uri: selectedService.image }} style={styles.detailImage} />
                </View>

                {/* Status Toggle */}
                <View style={[styles.statusToggle, { backgroundColor: colors.background }]}>
                  <View style={styles.statusInfo}>
                    <ThemedText style={styles.statusLabel}>Service Status</ThemedText>
                    <ThemedText style={[styles.statusText, { color: selectedService.active ? colors.success : colors.error }]}>
                      {selectedService.active ? 'Active' : 'Inactive'}
                    </ThemedText>
                  </View>
                  <Switch
                    value={selectedService.active}
                    trackColor={{ false: colors.border, true: colors.success }}
                    thumbColor="#FFF"
                  />
                </View>

                {/* Details */}
                <View style={styles.detailSection}>
                  <ThemedText style={styles.detailName}>{selectedService.name}</ThemedText>
                  <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
                    <ThemedText style={[styles.categoryBadgeText, { color: colors.primary }]}>
                      {selectedService.category}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.detailDescription, { color: colors.textSecondary }]}>
                    {selectedService.description}
                  </ThemedText>
                </View>

                {/* Stats */}
                <View style={[styles.detailStats, { backgroundColor: colors.background }]}>
                  <View style={styles.detailStatItem}>
                    <ThemedText style={[styles.detailStatValue, { color: colors.primary }]}>
                      ₹{selectedService.price.toLocaleString()}
                    </ThemedText>
                    <ThemedText style={[styles.detailStatLabel, { color: colors.textSecondary }]}>
                      Price
                    </ThemedText>
                  </View>
                  <View style={styles.detailStatItem}>
                    <ThemedText style={styles.detailStatValue}>{selectedService.duration}</ThemedText>
                    <ThemedText style={[styles.detailStatLabel, { color: colors.textSecondary }]}>
                      Duration
                    </ThemedText>
                  </View>
                  <View style={styles.detailStatItem}>
                    <ThemedText style={styles.detailStatValue}>{selectedService.bookings}</ThemedText>
                    <ThemedText style={[styles.detailStatLabel, { color: colors.textSecondary }]}>
                      Bookings
                    </ThemedText>
                  </View>
                  <View style={styles.detailStatItem}>
                    <View style={styles.ratingDisplay}>
                      <Ionicons name="star" size={14} color="#FFB800" />
                      <ThemedText style={styles.detailStatValue}>{selectedService.rating}</ThemedText>
                    </View>
                    <ThemedText style={[styles.detailStatLabel, { color: colors.textSecondary }]}>
                      Rating
                    </ThemedText>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.detailActions}>
                  <TouchableOpacity style={[styles.detailAction, { backgroundColor: colors.primary }]}>
                    <Ionicons name="pencil" size={20} color="#FFF" />
                    <ThemedText style={styles.detailActionText}>Edit Service</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.detailAction, { backgroundColor: colors.error + '15' }]}>
                    <Ionicons name="trash" size={20} color={colors.error} />
                    <ThemedText style={[styles.detailActionText, { color: colors.error }]}>Delete</ThemedText>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Create Service Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Add New Service</ThemedText>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Upload Image */}
              <TouchableOpacity style={[styles.uploadImage, { borderColor: colors.border }]}>
                <Ionicons name="camera" size={32} color={colors.textSecondary} />
                <ThemedText style={[styles.uploadText, { color: colors.textSecondary }]}>
                  Upload Service Image
                </ThemedText>
              </TouchableOpacity>

              {/* Form Fields */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Service Name *
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="e.g., Deep Home Cleaning"
                  placeholderTextColor={colors.textSecondary}
                  value={newService.name}
                  onChangeText={(text) => setNewService({ ...newService, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Description *
                </ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="Describe your service..."
                  placeholderTextColor={colors.textSecondary}
                  value={newService.description}
                  onChangeText={(text) => setNewService({ ...newService, description: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Price (₹) *
                  </ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                    placeholder="1999"
                    placeholderTextColor={colors.textSecondary}
                    value={newService.price}
                    onChangeText={(text) => setNewService({ ...newService, price: text })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Duration *
                  </ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                    placeholder="2-3 hours"
                    placeholderTextColor={colors.textSecondary}
                    value={newService.duration}
                    onChangeText={(text) => setNewService({ ...newService, duration: text })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Category *
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.slice(1).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryOption,
                        { backgroundColor: colors.background },
                        newService.category === cat && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                      ]}
                      onPress={() => setNewService({ ...newService, category: cat })}
                    >
                      <ThemedText style={[
                        styles.categoryOptionText,
                        newService.category === cat && { color: colors.primary }
                      ]}>
                        {cat}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Submit */}
              <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.submitButtonText}>Add Service</ThemedText>
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
    margin: 16,
    padding: 20,
    borderRadius: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  serviceCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  serviceName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  serviceDescription: {
    fontSize: 13,
    marginBottom: 8,
  },
  serviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
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
    paddingHorizontal: 32,
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
  detailImageContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  detailImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 10,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  detailStatItem: {
    alignItems: 'center',
  },
  detailStatValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailStatLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  detailAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  detailActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  uploadImage: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  uploadText: {
    fontSize: 14,
    marginTop: 8,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 8,
  },
  categoryOptionText: {
    fontSize: 13,
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
