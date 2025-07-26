import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS } from '../../config/constants';
import { BusinessService } from '../../services/businessService';
import { useLocationStore } from '../../stores/locationStoreNew';
import type { Business } from '../../types/index_location';

const { width } = Dimensions.get('window');

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
          <Text style={styles.businessCategory}>{business.category?.name}</Text>
          <Text style={styles.businessAddress}>{business.address}</Text>
          {business.distance_km && (
            <Text style={styles.distance}>{business.distance_km} km away</Text>
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

const LocationBasedHomeScreen: React.FC = () => {
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
    // Navigate to business detail screen
    Alert.alert('Business Detail', `Opening ${business.business_name} details...`);
  };

  const handleCallPress = (business: Business) => {
    Alert.alert(
      'Call Business',
      `Call ${business.business_name}?\\nPhone: ${business.phone_number}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {/* Make phone call */} }
      ]
    );
  };

  const handleMessagePress = (business: Business) => {
    setSelectedBusinessForMessage(business);
    setShowMessageModal(true);
  };

  const sendMessage = async () => {
    if (!selectedBusinessForMessage || !messageText.trim()) return;

    try {
      const messageData = {
        business_id: selectedBusinessForMessage.id,
        message_text: messageText.trim(),
        message_type: 'inquiry' as const,
      };

      const result = await BusinessService.sendMessage(messageData);
      
      if (result) {
        Alert.alert('Success', 'Message sent successfully!');
        setShowMessageModal(false);
        setMessageText('');
        setSelectedBusinessForMessage(null);
      } else {
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const filteredBusinesses = nearbyBusinesses.filter(business =>
    business.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!permissionGranted) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="location-outline" size={64} color={COLORS.gray[400]} />
          <Text style={styles.emptyTitle}>Location Permission Required</Text>
          <Text style={styles.emptySubtitle}>
            We need your location to show nearby businesses
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={initializeLocation}
          >
            <Text style={styles.permissionButtonText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Businesses</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses..."
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
        <TouchableOpacity
          style={[
            styles.categoryButton,
            !selectedCategory && styles.categoryButtonActive
          ]}
          onPress={() => setSelectedCategory(null)}
        >
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
            <Text style={styles.categoryIcon}>{category.icon}</Text>
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
            <Ionicons name="business-outline" size={64} color={COLORS.gray[400]} />
            <Text style={styles.emptyTitle}>No businesses found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or category filter
            </Text>
          </View>
        }
        contentContainerStyle={filteredBusinesses.length === 0 ? styles.emptyList : undefined}
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
                Send Message to {selectedBusinessForMessage?.business_name}
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
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowMessageModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sendButton}
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
    backgroundColor: COLORS.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray[800],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.gray[800],
  },
  categoriesContainer: {
    marginBottom: 12,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryButtonText: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  businessCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray[800],
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 4,
  },
  businessAddress: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  distance: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  businessRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gray[800],
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginLeft: 2,
  },
  businessActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  callButton: {
    backgroundColor: COLORS.success,
  },
  messageButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray[600],
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyList: {
    flex: 1,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: width - 32,
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray[800],
    flex: 1,
    marginRight: 16,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.gray[800],
    minHeight: 100,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  cancelButtonText: {
    color: COLORS.gray[600],
    fontSize: 16,
    fontWeight: '500',
  },
  sendButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LocationBasedHomeScreen;
