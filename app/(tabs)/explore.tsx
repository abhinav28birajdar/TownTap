import { Spacing } from '@/constants/spacing';
import { useAuth } from '@/contexts/auth-context';
import { useColors } from '@/contexts/theme-context';
import { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Category = Database['public']['Tables']['categories']['Row'];

const SERVICE_DATA = [
  { id: 'food', name: 'Food', subtitle: 'Meals, Snacks, Food Hub', icon: '🍔', color: '#A8D5AB' },
  { id: 'doctor', name: 'Doctor', subtitle: 'Health, Medic Care', icon: '👨‍⚕️', color: '#A8D5AB' },
  { id: 'shopkeeper', name: 'Shopkeeper', subtitle: 'General Store, Local Shop', icon: '👔', color: '#A8D5AB' },
  { id: 'gardener', name: 'Gardener', subtitle: 'Garden Care, Green Work', icon: '👨‍🌾', color: '#A8D5AB' },
  { id: 'carpenter', name: 'Carpenter', subtitle: 'Wood Work, Carpentry', icon: '👷', color: '#A8D5AB' },
  { id: 'painter', name: 'Painter', subtitle: 'Wall Paint, Paint Pro', icon: '🎨', color: '#A8D5AB' },
  { id: 'plumber', name: 'Plumber', subtitle: 'Water Fix, Pipe Care', icon: '🔧', color: '#A8D5AB' },
  { id: 'house maid', name: 'House Maid', subtitle: 'Home Help, Maid Care', icon: '🧹', color: '#A8D5AB' },
  { id: 'electronics', name: 'Electronics', subtitle: 'Tech Fix, Gadget Care', icon: '🔌', color: '#A8D5AB' },
  { id: 'clothes shop', name: 'Clothes Shop', subtitle: 'Fashion, Apparel', icon: '👕', color: '#A8D5AB' },
  { id: 'water supply', name: 'Water Supply', subtitle: 'Water Tank, Water Service', icon: '💧', color: '#A8D5AB' },
  { id: 'stationery', name: 'Stationery', subtitle: 'Office Needs, Study Shop', icon: '📝', color: '#A8D5AB' },
];

export default function ExploreScreen() {
  const { profile } = useAuth();
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServicePress = (serviceId: string) => {
    router.push(`/category/${serviceId}`);
  };

  const filteredServices = SERVICE_DATA.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/customer/profile')}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primaryDark }]}>
            <Ionicons name="person" size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/messages')}
          >
            <Ionicons name="chatbubbles" size={22} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/customer/notifications')}
          >
            <Ionicons name="notifications" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Title */}
        <Text style={[styles.pageTitle, { color: colors.text }]}>Our Services</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="search.."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="search" size={20} color={colors.textSecondary} />
          </View>
        </View>

        {/* Services Grid */}
        <View style={styles.servicesGrid}>
          {filteredServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceCard, { backgroundColor: colors.primary }]}
              onPress={() => handleServicePress(service.id)}
            >
              <View style={styles.serviceIconContainer}>
                <Text style={styles.serviceIcon}>{service.icon}</Text>
              </View>
              <View style={styles.serviceInfo}>
                <Text style={[styles.serviceName, { color: colors.surface }]}>{service.name}</Text>
                <Text style={[styles.serviceSubtitle, { color: colors.surface }]}>{service.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Ionicons name="home" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/customer/search')}
        >
          <Ionicons name="location" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(tabs)/explore')}
        >
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/customer/bookings')}
        >
          <Ionicons name="receipt" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.md,
  },
  profileButton: {},
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  servicesGrid: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 20,
    marginBottom: Spacing.md,
    minHeight: 100,
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  serviceIcon: {
    fontSize: 32,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 13,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    flexDirection: 'row',
    borderRadius: 30,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});