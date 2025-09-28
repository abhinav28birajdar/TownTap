import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  Image,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
  logo_url?: string;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  operating_hours: any;
}

export default function UnifiedBusinessDetailScreen() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();
  const { businessId } = useLocalSearchParams();

  useEffect(() => {
    if (businessId) {
      loadBusiness();
      checkIfFavorite();
    }
  }, [businessId]);

  const loadBusiness = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      setBusiness(data);
    } catch (error) {
      console.error('Error loading business:', error);
      Alert.alert('Error', 'Failed to load business details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .single();

      if (data) {
        setIsFavorite(true);
      }
    } catch (error) {
      // Ignore error - means not a favorite
    }
  };

  const toggleFavorite = async () => {
    if (!user || !business) return;

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('business_id', business.id);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            business_id: business.id,
          });

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const handleCall = () => {
    if (business?.phone) {
      Linking.openURL(`tel:${business.phone}`);
    }
  };

  const handleEmail = () => {
    if (business?.email) {
      Linking.openURL(`mailto:${business.email}`);
    }
  };

  const handleWebsite = () => {
    if (business?.website) {
      Linking.openURL(business.website);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!business) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text>Business not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          {business.logo_url ? (
            <Image source={{ uri: business.logo_url }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>{business.name.charAt(0)}</Text>
            </View>
          )}
          <Text style={styles.businessName}>{business.name}</Text>
          <Text style={styles.category}>{business.category}</Text>
          {business.is_verified && (
            <Text style={styles.verified}>✓ Verified Business</Text>
          )}
        </View>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>★ {business.rating.toFixed(1)}</Text>
          <Text style={styles.reviews}>({business.total_reviews} reviews)</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{business.description}</Text>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
            <Text style={styles.contactLabel}>Phone:</Text>
            <Text style={styles.contactValue}>{business.phone}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
            <Text style={styles.contactLabel}>Email:</Text>
            <Text style={styles.contactValue}>{business.email}</Text>
          </TouchableOpacity>

          <View style={styles.contactItem}>
            <Text style={styles.contactLabel}>Address:</Text>
            <Text style={styles.contactValue}>{business.address}</Text>
          </View>

          {business.website && (
            <TouchableOpacity style={styles.contactItem} onPress={handleWebsite}>
              <Text style={styles.contactLabel}>Website:</Text>
              <Text style={[styles.contactValue, styles.link]}>{business.website}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.favoriteButton]}
            onPress={toggleFavorite}
          >
            <Text style={styles.actionButtonText}>
              {isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.bookButton]}
            onPress={() => {
              // Navigate to booking screen
              router.push(`/booking/${business.id}` as any);
            }}
          >
            <Text style={styles.actionButtonText}>Book Service</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  category: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  verified: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  rating: {
    fontSize: 18,
    color: '#FF9500',
    fontWeight: 'bold',
  },
  reviews: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  contactItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    width: 80,
  },
  contactValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  actions: {
    marginTop: 20,
  },
  actionButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  favoriteButton: {
    backgroundColor: '#FF9500',
  },
  bookButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});