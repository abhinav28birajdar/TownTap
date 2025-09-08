import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../context/ModernThemeContext';
import { useAuthStore } from '../../stores/authStore';

const ExploreScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, userProfile } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const isBusinessUser = userProfile?.user_type === 'business_owner';

  // Mock data for demonstration
  const exploreData = isBusinessUser 
    ? [
        { id: '1', name: 'John Doe', type: 'New Customer', time: '2 hours ago', icon: 'person-add' },
        { id: '2', name: 'Jane Smith', type: 'Repeat Customer', time: '4 hours ago', icon: 'person' },
        { id: '3', name: 'Mike Johnson', type: 'VIP Customer', time: '1 day ago', icon: 'star' },
      ]
    : [
        { id: '1', name: 'Tech Store', category: 'Electronics', rating: 4.5, icon: 'hardware-chip' },
        { id: '2', name: 'Local Café', category: 'Food & Beverage', rating: 4.8, icon: 'cafe' },
        { id: '3', name: 'Fashion Hub', category: 'Clothing', rating: 4.2, icon: 'shirt' },
      ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.primary,
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: 'bold',
      color: '#ffffff',
      letterSpacing: 0.5,
    },
    themeButton: {
      padding: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 12,
    },
    searchContainer: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: theme.colors.surface,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchInput: {
      flex: 1,
      marginLeft: 10,
      fontSize: 16,
      color: theme.colors.text,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    itemCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    itemContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    itemIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    itemInfo: {
      flex: 1,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    itemSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    itemMeta: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
  });

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.itemCard}>
      <View style={styles.itemContent}>
        <View style={styles.itemIcon}>
          <Ionicons name={item.icon as any} size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>
            {isBusinessUser ? item.type : item.category}
          </Text>
          {isBusinessUser && (
            <Text style={styles.itemMeta}>{item.time}</Text>
          )}
          {!isBusinessUser && (
            <Text style={styles.itemMeta}>Rating: {item.rating} ⭐</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isBusinessUser ? 'Customer Insights' : 'Explore Businesses'}
        </Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
          <Ionicons name={isDark ? "sunny" : "moon"} size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={isBusinessUser ? "Search customers..." : "Search businesses..."}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={exploreData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default ExploreScreen;
