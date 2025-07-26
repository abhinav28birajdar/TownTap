import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Linking,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
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
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    businessCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      marginHorizontal: 4,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: 1,
      borderColor: theme.border,
    },
    businessHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    businessInfo: {
      flex: 1,
    },
    businessName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 6,
    },
    businessCategory: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 4,
    },
    businessAddress: {
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 4,
      lineHeight: 18,
    },
    distance: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: '600',
      backgroundColor: `${theme.primary}15`,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    businessRating: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.warning}15`,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    ratingText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.text,
      marginLeft: 4,
    },
    reviewsText: {
      fontSize: 11,
      color: theme.textSecondary,
      marginLeft: 4,
    },
    businessActions: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      gap: 6,
    },
    callButton: {
      backgroundColor: theme.success,
    },
    messageButton: {
      backgroundColor: theme.primary,
    },
    actionButtonText: {
      color: '#ffffff',
      fontWeight: '600',
      fontSize: 14,
    },
  });

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
          <Ionicons name="star" size={14} color={theme.warning} />
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

const ThemedHomeScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.primary,
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    logoContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      padding: 12,
      borderRadius: 16,
      marginRight: 15,
    },
    titleContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: 'bold',
      color: '#ffffff',
      letterSpacing: 0.5,
    },
    headerSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.85)',
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    refreshButton: {
      padding: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 12,
    },
    themeButton: {
      padding: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 12,
    },
    searchContainer: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: theme.surface,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderRadius: 16,
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    searchInput: {
      flex: 1,
      marginLeft: 10,
      fontSize: 16,
      color: theme.text,
    },
    categoriesContainer: {
      backgroundColor: theme.surface,
      paddingBottom: 15,
    },
    categoriesContent: {
      paddingHorizontal: 20,
    },
    categoryButton: {
      alignItems: 'center',
      marginRight: 15,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor: theme.background,
      minWidth: 85,
      borderWidth: 1,
      borderColor: theme.border,
    },
    categoryButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    categoryIconContainer: {
      marginBottom: 6,
    },
    categoryIcon: {
      fontSize: 22,
      textAlign: 'center',
    },
    categoryButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
      textAlign: 'center',
    },
    categoryButtonTextActive: {
      color: '#ffffff',
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 15,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    iconContainer: {
      marginBottom: 20,
      padding: 20,
      backgroundColor: theme.surface,
      borderRadius: 50,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 10,
    },
    emptySubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 30,
    },
    emptyList: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    permissionButton: {
      backgroundColor: theme.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 16,
    },
    permissionButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 24,
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
      color: theme.text,
      flex: 1,
    },
    messageInput: {
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 15,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.background,
      minHeight: 100,
      marginBottom: 20,
      textAlignVertical: 'top',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    cancelButtonText: {
      color: theme.textSecondary,
      fontSize: 16,
      fontWeight: '600',
    },
    sendButton: {
      flex: 1,
      backgroundColor: theme.primary,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: theme.textSecondary,
    },
    sendButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  if (!permissionGranted && !currentLocation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="location-outline" size={80} color={theme.primary} />
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with theme toggle */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="storefront" size={40} color="#ffffff" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>TownTap</Text>
            <Text style={styles.headerSubtitle}>Discover Local Businesses</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
            <Ionicons name={isDark ? "sunny" : "moon"} size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search businesses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
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
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="business-outline" size={64} color={theme.textSecondary} />
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
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.messageInput}
              placeholder="Type your message here..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
              numberOfLines={4}
              placeholderTextColor={theme.textSecondary}
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
    </SafeAreaView>
  );
};

export default ThemedHomeScreen;
