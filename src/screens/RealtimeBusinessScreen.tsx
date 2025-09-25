import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocationBasedRealtime } from '../hooks/useLocationBasedRealtime';
import { Business } from '../types';

interface Props {
  navigation?: any;
}

export default function RealtimeBusinessScreen({ navigation }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeUpdates, setRealtimeUpdates] = useState(0);
  
  // Use the location-based real-time hook
  const { 
    businesses, 
    userLocation, 
    loading, 
    error,
    refetch 
  } = useLocationBasedRealtime(20); // 20km radius

  // Track real-time updates
  useEffect(() => {
    setRealtimeUpdates(prev => prev + 1);
  }, [businesses.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const renderBusinessItem = ({ item, index }: { item: Business; index: number }) => (
    <TouchableOpacity
      style={styles.businessCard}
      onPress={() => {
        if (navigation) {
          navigation.navigate('BusinessDetail', { businessId: item.id });
        }
      }}
    >
      <View style={styles.businessHeader}>
        <View style={styles.businessInfo}>
          <Text style={styles.businessName as TextStyle}>{item.business_name}</Text>
          <Text style={styles.businessCategory as TextStyle}>{item.category}</Text>
        </View>
        <View style={styles.businessStatus}>
          <View style={[styles.statusDot, { backgroundColor: item.is_open ? '#4CAF50' : '#F44336' }]} />
          <Text style={styles.statusText as TextStyle}>{item.is_open ? 'Open' : 'Closed'}</Text>
        </View>
      </View>
      
      <Text style={styles.businessDescription as TextStyle} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.businessMeta}>
        <Text style={styles.businessRating as TextStyle}>⭐ {item.rating || 4.0}</Text>
        <Text style={styles.businessReviews as TextStyle}>({item.total_reviews || 0} reviews)</Text>
        <Text style={styles.businessDistance as TextStyle}>
          {item.distance_km ? `${item.distance_km.toFixed(1)} km` : 'Distance unknown'}
        </Text>
      </View>
      
      <View style={styles.businessFooter}>
        <Text style={styles.businessAddress as TextStyle} numberOfLines={1}>
          📍 {item.address}
        </Text>
        <Text style={styles.businessPhone as TextStyle}>📞 {item.phone}</Text>
      </View>
      
      <Text style={styles.timestamp as TextStyle}>
        Added: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Date unknown'}
      </Text>
    </TouchableOpacity>
  );

  const handleAddBusiness = () => {
    if (navigation) {
      navigation.navigate('BusinessRegistration');
    } else {
      Alert.alert(
        'Add Business', 
        'This would navigate to business registration.\n\nFor testing, businesses are automatically added to demonstrate real-time updates.',
        [{ text: 'OK' }]
      );
    }
  };

  if (loading && businesses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText as TextStyle}>🔍 Finding nearby businesses...</Text>
          {userLocation && (
            <Text style={styles.locationText as TextStyle}>
              📍 Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText as TextStyle}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText as TextStyle}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title as TextStyle}>Local Businesses</Text>
        <View style={styles.headerRight}>
          <View style={styles.updatesBadge}>
            <Text style={styles.updatesText as TextStyle}>{realtimeUpdates}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddBusiness}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Bar */}
      {userLocation && (
        <View style={styles.statusBar}>
          <Text style={styles.statusText as TextStyle}>
            📡 Real-time updates enabled • {businesses.length} businesses found
          </Text>
          <Text style={styles.locationInfo as TextStyle}>
            📍 Searching within 20km of your location
          </Text>
        </View>
      )}

      {/* Business List */}
      <FlatList
        data={businesses}
        renderItem={renderBusinessItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText as TextStyle}>No businesses found</Text>
            <Text style={styles.emptySubtext as TextStyle}>Be the first to register your business!</Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={handleAddBusiness}
            >
              <Text style={styles.addFirstButtonText as TextStyle}>Add Business</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updatesBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 10,
  },
  updatesText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#E8F5E8',
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E7D32',
    marginBottom: 4,
  },
  locationInfo: {
    fontSize: 12,
    color: '#4CAF50',
  },
  listContainer: {
    padding: 15,
  },
  businessCard: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
    color: '#666',
  },
  businessStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  businessDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  businessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  businessRating: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 10,
  },
  businessReviews: {
    fontSize: 12,
    color: '#888',
    marginRight: 10,
  },
  businessDistance: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  businessFooter: {
    marginBottom: 8,
  },
  businessAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  businessPhone: {
    fontSize: 12,
    color: '#666',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    textAlign: 'right',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
