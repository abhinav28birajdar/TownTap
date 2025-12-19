import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CustomerDetails {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  joinDate: string;
  rating: number;
}

export default function CustomerDetailsScreen() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);

  useEffect(() => {
    loadCustomerDetails();
  }, [id]);

  const loadCustomerDetails = async () => {
    try {
      // Simulate API call - Replace with actual Supabase query
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setCustomer({
        id: id as string,
        name: 'John Doe',
        phone: '+91 98765 43210',
        email: 'john.doe@example.com',
        address: '123 Main Street, City, State 12345',
        orders: 12,
        totalSpent: 15000,
        lastOrder: '2 days ago',
        joinDate: 'Jan 2024',
        rating: 4.8,
      });
    } catch (error) {
      console.error('Error loading customer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!customer) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Customer not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Customer Details</Text>
        <TouchableOpacity onPress={() => console.log('More options')}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Customer Profile */}
        <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{customer.name.charAt(0)}</Text>
          </View>
          <Text style={[styles.customerName, { color: colors.text }]}>{customer.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#FFA500" />
            <Text style={[styles.ratingText, { color: colors.text }]}>{customer.rating}</Text>
          </View>
          <Text style={[styles.joinDate, { color: colors.textSecondary }]}>
            Customer since {customer.joinDate}
          </Text>
        </View>

        {/* Contact Info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
          
          <TouchableOpacity style={styles.infoRow}>
            <Ionicons name="call" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>{customer.phone}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoRow}>
            <Ionicons name="mail" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>{customer.email}</Text>
          </TouchableOpacity>

          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>{customer.address}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{customer.orders}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Orders</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.primary }]}>₹{customer.totalSpent.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Spent</Text>
            </View>
          </View>

          <Text style={[styles.lastOrderText, { color: colors.textSecondary }]}>
            Last order: {customer.lastOrder}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push(`/messages/chat/${customer.id}` as any)}
          >
            <Ionicons name="chatbubbles" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Send Message</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
            onPress={() => router.push(`/business-owner/orders?customerId=${customer.id}` as any)}
          >
            <Ionicons name="receipt" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonTextSecondary, { color: colors.primary }]}>View Orders</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  customerName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  joinDate: {
    fontSize: 14,
  },
  section: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 16,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  lastOrderText: {
    fontSize: 14,
    textAlign: 'center',
  },
  actionsSection: {
    padding: 20,
    gap: 12,
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
