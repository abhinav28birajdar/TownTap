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
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface QuickAction {
  id: string;
  name: string;
  icon: string;
  color: string;
  route: string;
  isPopular?: boolean;
}

interface RecentService {
  id: string;
  name: string;
  provider: string;
  image: string;
  lastBooked: string;
}

interface FavoriteCategory {
  id: string;
  name: string;
  icon: string;
  servicesCount: number;
}

const quickActions: QuickAction[] = [
  { id: '1', name: 'Cleaning', icon: 'sparkles', color: '#3B82F6', route: '/category/cleaning', isPopular: true },
  { id: '2', name: 'Plumbing', icon: 'water', color: '#06B6D4', route: '/category/plumbing' },
  { id: '3', name: 'Electrical', icon: 'flash', color: '#F59E0B', route: '/category/electrical' },
  { id: '4', name: 'AC Repair', icon: 'snow', color: '#8B5CF6', route: '/category/ac-repair', isPopular: true },
  { id: '5', name: 'Painting', icon: 'color-palette', color: '#EC4899', route: '/category/painting' },
  { id: '6', name: 'Carpentry', icon: 'hammer', color: '#F97316', route: '/category/carpentry' },
  { id: '7', name: 'Pest Control', icon: 'bug', color: '#10B981', route: '/category/pest-control' },
  { id: '8', name: 'Appliance', icon: 'tv', color: '#6366F1', route: '/category/appliance', isPopular: true },
  { id: '9', name: 'Beauty', icon: 'sparkles', color: '#F472B6', route: '/category/beauty' },
  { id: '10', name: 'Car Wash', icon: 'car', color: '#14B8A6', route: '/category/car-wash' },
  { id: '11', name: 'Massage', icon: 'hand-left', color: '#8B5CF6', route: '/category/massage' },
  { id: '12', name: 'More', icon: 'grid', color: '#6B7280', route: '/discover/explore' },
];

const recentServices: RecentService[] = [
  {
    id: '1',
    name: 'Deep House Cleaning',
    provider: 'CleanPro Services',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    lastBooked: '2 days ago',
  },
  {
    id: '2',
    name: 'AC Service',
    provider: 'CoolTech Solutions',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    lastBooked: '1 week ago',
  },
  {
    id: '3',
    name: 'Plumbing Repair',
    provider: 'QuickFix Plumbing',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400',
    lastBooked: '2 weeks ago',
  },
];

const favoriteCategories: FavoriteCategory[] = [
  { id: '1', name: 'Home Cleaning', icon: 'home', servicesCount: 15 },
  { id: '2', name: 'Appliance Repair', icon: 'construct', servicesCount: 8 },
  { id: '3', name: 'Personal Care', icon: 'person', servicesCount: 12 },
];

export default function QuickBookScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const renderQuickAction = ({ item }: { item: QuickAction }) => (
    <TouchableOpacity
      style={[styles.actionCard]}
      onPress={() => router.push(item.route as any)}
    >
      <View style={[styles.actionIcon, { backgroundColor: item.color + '15' }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
        {item.isPopular && (
          <View style={[styles.popularBadge, { backgroundColor: colors.success }]}>
            <Ionicons name="flame" size={10} color="#fff" />
          </View>
        )}
      </View>
      <ThemedText style={styles.actionName} numberOfLines={1}>
        {item.name}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderRecentService = ({ item }: { item: RecentService }) => (
    <TouchableOpacity
      style={[styles.recentCard, { backgroundColor: colors.card }]}
      onPress={() => router.push('/booking/form')}
    >
      <Image source={{ uri: item.image }} style={styles.recentImage} />
      <View style={styles.recentInfo}>
        <ThemedText style={styles.recentName} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <ThemedText style={[styles.recentProvider, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.provider}
        </ThemedText>
        <ThemedText style={[styles.recentDate, { color: colors.textSecondary }]}>
          {item.lastBooked}
        </ThemedText>
      </View>
      <TouchableOpacity style={[styles.rebookBtn, { backgroundColor: colors.primary }]}>
        <ThemedText style={styles.rebookText}>Rebook</ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Quick Book</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.card }]}
          onPress={() => setShowSearchModal(true)}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <ThemedText style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
            What service do you need?
          </ThemedText>
          <View style={[styles.voiceBtn, { backgroundColor: colors.primary }]}>
            <Ionicons name="mic" size={18} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Services</ThemedText>
          <View style={styles.actionsGrid}>
            {quickActions.map((item) => (
              <View key={item.id} style={styles.actionWrapper}>
                {renderQuickAction({ item })}
              </View>
            ))}
          </View>
        </View>

        {/* Recent Services */}
        {recentServices.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Recent Services</ThemedText>
              <TouchableOpacity onPress={() => router.push('/customer/bookings')}>
                <ThemedText style={[styles.seeAllText, { color: colors.primary }]}>
                  See All
                </ThemedText>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentServices}
              keyExtractor={(item) => item.id}
              renderItem={renderRecentService}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            />
          </View>
        )}

        {/* Favorite Categories */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Your Favorites</ThemedText>
          <View style={styles.favoritesRow}>
            {favoriteCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.favoriteCard, { backgroundColor: colors.card }]}
                onPress={() => router.push('/category/detail')}
              >
                <View style={[styles.favoriteIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={category.icon as any} size={22} color={colors.primary} />
                </View>
                <ThemedText style={styles.favoriteName}>{category.name}</ThemedText>
                <ThemedText style={[styles.favoriteCount, { color: colors.textSecondary }]}>
                  {category.servicesCount} services
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emergency Services */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.emergencyCard}
            onPress={() => router.push('/customer/emergency-contacts' as any)}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.emergencyGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.emergencyContent}>
                <View style={styles.emergencyLeft}>
                  <Ionicons name="warning" size={28} color="#fff" />
                  <View style={styles.emergencyText}>
                    <ThemedText style={styles.emergencyTitle}>Emergency Services</ThemedText>
                    <ThemedText style={styles.emergencyDesc}>
                      24/7 urgent repairs & services
                    </ThemedText>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Schedule Later */}
        <View style={styles.section}>
          <View style={[styles.scheduleCard, { backgroundColor: colors.card }]}>
            <View style={styles.scheduleHeader}>
              <View style={[styles.scheduleIcon, { backgroundColor: colors.info + '15' }]}>
                <Ionicons name="calendar" size={24} color={colors.info} />
              </View>
              <View style={styles.scheduleText}>
                <ThemedText style={styles.scheduleTitle}>Schedule for Later</ThemedText>
                <ThemedText style={[styles.scheduleDesc, { color: colors.textSecondary }]}>
                  Book a service for a future date
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.scheduleBtn, { backgroundColor: colors.info }]}
              onPress={() => router.push('/booking/schedule')}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <ThemedText style={styles.scheduleBtnText}>Schedule</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Search Modal */}
      <Modal visible={showSearchModal} animationType="slide">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSearchModal(false)}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={[styles.modalSearchBar, { backgroundColor: colors.card }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.modalSearchInput, { color: colors.text }]}
                placeholder="Search for a service..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView style={styles.modalContent}>
            <ThemedText style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
              Popular Searches
            </ThemedText>
            {['House Cleaning', 'AC Service', 'Plumber', 'Electrician', 'Car Wash', 'Salon at Home'].map(
              (term, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchItem}
                  onPress={() => {
                    setSearchQuery(term);
                    router.push('/search/results');
                    setShowSearchModal(false);
                  }}
                >
                  <Ionicons name="trending-up" size={18} color={colors.textSecondary} />
                  <ThemedText style={styles.searchItemText}>{term}</ThemedText>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </SafeAreaView>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
  },
  voiceBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  actionWrapper: {
    width: '25%',
    paddingHorizontal: 6,
    marginBottom: 16,
  },
  actionCard: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  recentImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  recentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recentName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  recentProvider: {
    fontSize: 13,
    marginBottom: 2,
  },
  recentDate: {
    fontSize: 11,
  },
  rebookBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rebookText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  favoritesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  favoriteCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
  },
  favoriteIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  favoriteName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  favoriteCount: {
    fontSize: 11,
  },
  emergencyCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emergencyGradient: {
    padding: 16,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emergencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emergencyText: {},
  emergencyTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emergencyDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 2,
  },
  scheduleCard: {
    padding: 16,
    borderRadius: 16,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  scheduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleText: {
    flex: 1,
    marginLeft: 12,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  scheduleBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  modalSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 15,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  searchItemText: {
    fontSize: 15,
  },
});
