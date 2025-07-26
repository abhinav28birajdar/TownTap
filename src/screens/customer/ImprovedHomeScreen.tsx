import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Linking,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useLocationStore } from '../../stores/locationStoreNew';
import type { Business } from '../../types/index_location';

const { width } = Dimensions.get('window');

// Colors definition
const COLORS = {
  primary: '#2563eb',
  secondary: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  gray: {
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    600: '#6b7280',
    800: '#1f2937',
  },
  white: '#ffffff',
  black: '#000000',
};

interface BusinessCardProps {
  business: Business;
  onPress: () => void;
  onCallPress: () => void;
  onMessagePress: () => void;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ 
  business, 
  onPress, 
  onCallPress, 
  onMessagePress 
}) => {
  return (
    <TouchableOpacity style={styles.businessCard} onPress={onPress}>
      <View style={styles.businessHeader}>
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{business.business_name}</Text>
          <Text style={styles.businessCategory}>
            {business.category?.icon} {business.category?.name}
          </Text>
          <Text style={styles.businessAddress}>{business.address}</Text>
          {business.distance_km && (
            <Text style={styles.distance}>📍 {business.distance_km} km away</Text>
          )}
        </View>
        <View style={styles.businessRating}>
          <Ionicons name="star" size={16} color={COLORS.warning} />
          <Text style={styles.ratingText}>{business.rating.toFixed(1)}</Text>
          <Text style={styles.reviewsText}>({business.total_reviews})</Text>
        </View>
      </View>
      
      <View style={styles.businessActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.callButton]} 
          onPress={onCallPress}
        >
          <Ionicons name="call" size={16} color="white" />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.messageButton]} 
          onPress={onMessagePress}
        >
          <Ionicons name="chatbubble" size={16} color="white" />
          <Text style={styles.actionButtonText}>Message</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const ImprovedHomeScreen: React.FC = () => {
  const {
    currentLocation,
    permissionGranted,
    loading,
    error,
    nearbyBusinesses,
    businessCategories,
    requestLocationPermission,
    getCurrentLocation,
    getNearbyBusinesses,
    getBusinessCategories,
    setSelectedBusiness,
  } = useLocationStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedBusinessForMessage, setSelectedBusinessForMessage] = useState<Business | null>(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    initializeLocation();
    loadBusinessCategories();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      loadNearbyBusinesses();
    }
  }, [currentLocation, selectedCategory]);

  const initializeLocation = async () => {
    if (!permissionGranted) {
      const granted = await requestLocationPermission();
      if (!granted) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permission to find nearby businesses',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {/* Open settings */} }
          ]
        );
        return;
      }
    }

    if (!currentLocation) {
      await getCurrentLocation();
    }
  };

  const loadBusinessCategories = async () => {
    await getBusinessCategories();
  };

  const loadNearbyBusinesses = async () => {
    if (!currentLocation) return;

    const params = {
      location: currentLocation,
      filters: {
        category_id: selectedCategory || undefined,
        radius_km: 5,
      },
      limit: 20,
    };

    await getNearbyBusinesses(params);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await getCurrentLocation();
    await loadNearbyBusinesses();
    setRefreshing(false);
  };

  const handleBusinessPress = (business: Business) => {
    setSelectedBusiness(business);
    Alert.alert(
      business.business_name,
      `${business.description || 'No description available'}\n\nAddress: ${business.address}\nPhone: ${business.phone_number}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Call', onPress: () => handleCallPress(business) },
        { text: 'Message', onPress: () => handleMessagePress(business) }
      ]
    );
  };

  const handleCallPress = async (business: Business) => {
    try {
      const phoneUrl = `tel:${business.phone_number}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Unable to make phone call');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to make phone call');
    }
  };

  const handleMessagePress = (business: Business) => {
    setSelectedBusinessForMessage(business);
    setShowMessageModal(true);
  };

  const sendMessage = async () => {
    if (!selectedBusinessForMessage || !messageText.trim()) return;

    try {
      Alert.alert(
        'Message Sent',
        `Your message has been sent to ${selectedBusinessForMessage.business_name}. They will contact you soon!`
      );
      
      setShowMessageModal(false);
      setMessageText('');
      setSelectedBusinessForMessage(null);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const filteredBusinesses = nearbyBusinesses.filter(business =>
    business.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!permissionGranted && !currentLocation) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="location-outline" size={80} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>Find Nearby Businesses</Text>
          <Text style={styles.emptySubtitle}>
            Enable location to discover local shops and services around you
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={initializeLocation}
          >
            <Ionicons name="location" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.permissionButtonText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with centered logo and title */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="storefront" size={40} color={COLORS.white} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>TownTap</Text>
            <Text style={styles.headerSubtitle}>Discover Local Businesses</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search businesses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.gray[400]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            !selectedCategory && styles.categoryButtonActive
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <View style={styles.categoryIconContainer}>
            <Text style={styles.categoryIcon}>🏪</Text>
          </View>
          <Text style={[
            styles.categoryButtonText,
            !selectedCategory && styles.categoryButtonTextActive
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        {businessCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <View style={styles.categoryIconContainer}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
            </View>
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category.id && styles.categoryButtonTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Business List */}
      <FlatList
        data={filteredBusinesses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BusinessCard
            business={item}
            onPress={() => handleBusinessPress(item)}
            onCallPress={() => handleCallPress(item)}
            onMessagePress={() => handleMessagePress(item)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="business-outline" size={64} color={COLORS.gray[400]} />
            </View>
            <Text style={styles.emptyTitle}>No businesses found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedCategory 
                ? 'Try selecting a different category or clear the search'
                : 'Try adjusting your search or check your location'
              }
            </Text>
          </View>
        }
        contentContainerStyle={filteredBusinesses.length === 0 ? styles.emptyList : styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Message Modal */}
      <Modal
        visible={showMessageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMessageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Message {selectedBusinessForMessage?.business_name}
              </Text>
              <TouchableOpacity onPress={() => setShowMessageModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray[400]} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.messageInput}
              placeholder="Type your message here..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={COLORS.gray[400]}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowMessageModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.sendButton, 
                  !messageText.trim() && styles.sendButtonDisabled
                ]}
                onPress={sendMessage}
                disabled={!messageText.trim()}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 50,
    marginRight: 15,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.gray[800],
  },
  categoriesContainer: {
    backgroundColor: COLORS.white,
    paddingBottom: 15,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    minWidth: 80,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryIconContainer: {
    marginBottom: 5,
  },
  categoryIcon: {
    fontSize: 24,
    textAlign: 'center',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  categoryButtonTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  businessCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray[800],
    marginBottom: 5,
  },
  businessCategory: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 5,
  },
  businessAddress: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 5,
  },
  distance: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  businessRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gray[800],
    marginLeft: 5,
  },
  reviewsText: {
    fontSize: 12,
    color: COLORS.gray[600],
    marginLeft: 5,
  },
  businessActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 25,
    gap: 5,
  },
  callButton: {
    backgroundColor: COLORS.secondary,
  },
  messageButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray[800],
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray[800],
    flex: 1,
  },
  messageInput: {
    borderColor: COLORS.gray[200],
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: COLORS.gray[800],
    minHeight: 100,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.gray[600],
    fontSize: 16,
    fontWeight: '600',
  },
  sendButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray[300],
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ImprovedHomeScreen;
