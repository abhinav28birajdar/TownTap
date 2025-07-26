import { MotiView } from 'moti';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { COLORS, DIMENSIONS } from '../../config/constants';
import { useAuthStore } from '../../stores/authStore';

const SimpleHomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    console.log('Search for:', searchQuery);
  };

  const handleLogout = async () => {
    await logout();
  };

  const mockBusinesses = [
    {
      id: '1',
      name: 'Local Coffee Shop',
      category: 'Food & Beverage',
      description: 'Fresh coffee and pastries daily',
      distance: 0.5,
      rating: 4.5,
      isOpen: true,
      type: 'order'
    },
    {
      id: '2',
      name: 'Tech Repair Services',
      category: 'Electronics',
      description: 'Mobile and laptop repair services',
      distance: 1.2,
      rating: 4.8,
      isOpen: true,
      type: 'service'
    },
    {
      id: '3',
      name: 'Financial Consultant',
      category: 'Finance',
      description: 'Investment and tax planning advice',
      distance: 2.1,
      rating: 4.3,
      isOpen: false,
      type: 'consult'
    }
  ];

  const getBusinessTypeIcon = (type: string): string => {
    switch (type) {
      case 'order': return '🛒';
      case 'service': return '📅';
      case 'consult': return '💬';
      default: return '🏪';
    }
  };

  const getBusinessTypeColor = (type: string): string => {
    switch (type) {
      case 'order': return COLORS.success;
      case 'service': return COLORS.info;
      case 'consult': return COLORS.warning;
      default: return COLORS.gray[500];
    }
  };

  const renderBusinessCard = (business: any, index: number) => (
    <MotiView
      key={business.id}
      from={{ opacity: 0, translateX: 50 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ 
        type: 'timing',
        duration: 300,
        delay: index * 100
      }}
      style={styles.businessCard}
    >
      <TouchableOpacity
        onPress={() => console.log('Navigate to business:', business.name)}
        style={styles.businessCardContent}
      >
        <View style={styles.businessHeader}>
          <View style={[styles.businessTypeIcon, { backgroundColor: getBusinessTypeColor(business.type) }]}>
            <Text style={styles.businessIcon}>{getBusinessTypeIcon(business.type)}</Text>
          </View>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{business.name}</Text>
            <Text style={styles.businessCategory}>{business.category}</Text>
            <Text style={styles.businessDistance}>
              {business.distance} km away
            </Text>
          </View>
        </View>
        
        <Text style={styles.businessDescription} numberOfLines={2}>
          {business.description}
        </Text>
        
        <View style={styles.businessFooter}>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {business.rating}</Text>
          </View>
          {business.isOpen && (
            <View style={styles.openBadge}>
              <Text style={styles.openText}>Open</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </MotiView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
        >
          <View style={styles.header}>
            <Text style={styles.greeting}>
              Hello, {user?.profile?.full_name?.split(' ')[0] || 'User'}!
            </Text>
            <Text style={styles.subtitle}>Discover local businesses near you</Text>
          </View>
        </MotiView>

        {/* Search Bar */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 200 }}
        >
          <Card>
            <View style={styles.searchContainer}>
              <Input
                placeholder="Search for shops, services, or products..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <Button
                title="Search"
                onPress={handleSearch}
                variant="primary"
                size="sm"
                icon="🔍"
              />
            </View>
          </Card>
        </MotiView>

        {/* Quick Categories */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 400 }}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesGrid}>
              <TouchableOpacity style={styles.categoryItem}>
                <Text style={styles.categoryIcon}>🛒</Text>
                <Text style={styles.categoryText}>Order & Buy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.categoryItem}>
                <Text style={styles.categoryIcon}>📅</Text>
                <Text style={styles.categoryText}>Book Service</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.categoryItem}>
                <Text style={styles.categoryIcon}>💬</Text>
                <Text style={styles.categoryText}>Consult</Text>
              </TouchableOpacity>
            </View>
          </View>
        </MotiView>

        {/* Nearby Businesses */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 600 }}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nearby Businesses</Text>
            <View style={styles.businessesList}>
              {mockBusinesses.map((business, index) => 
                renderBusinessCard(business, index)
              )}
            </View>
          </View>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: DIMENSIONS.PADDING.md,
  },
  header: {
    marginBottom: DIMENSIONS.PADDING.lg,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: DIMENSIONS.PADDING.xs,
    lineHeight: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: DIMENSIONS.PADDING.sm,
  },
  section: {
    marginBottom: DIMENSIONS.PADDING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: DIMENSIONS.PADDING.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: DIMENSIONS.PADDING.sm,
  },
  categoryItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: DIMENSIONS.PADDING.md,
    borderRadius: DIMENSIONS.BORDER_RADIUS.lg,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: DIMENSIONS.PADDING.sm,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  businessesList: {
    gap: DIMENSIONS.PADDING.md,
  },
  businessCard: {
    backgroundColor: COLORS.white,
    borderRadius: DIMENSIONS.BORDER_RADIUS.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessCardContent: {
    padding: DIMENSIONS.PADDING.md,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DIMENSIONS.PADDING.sm,
  },
  businessTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DIMENSIONS.PADDING.md,
  },
  businessIcon: {
    fontSize: 20,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  businessCategory: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: DIMENSIONS.PADDING.xs,
  },
  businessDistance: {
    fontSize: 12,
    color: COLORS.info,
    marginTop: DIMENSIONS.PADDING.xs,
  },
  businessDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: DIMENSIONS.PADDING.sm,
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  openBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: DIMENSIONS.PADDING.sm,
    paddingVertical: DIMENSIONS.PADDING.xs,
    borderRadius: DIMENSIONS.BORDER_RADIUS.sm,
  },
  openText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default SimpleHomeScreen;
