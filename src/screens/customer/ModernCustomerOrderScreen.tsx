import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModernButton } from '../../components/modern/ModernButton';
import { ModernCard } from '../../components/modern/ModernCard';
import { ModernInput } from '../../components/modern/ModernInput';
import { useTheme } from '../../context/ModernThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { Product } from '../../types';

const { width } = Dimensions.get('window');

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  is_available: boolean;
  preparation_time: number;
}

interface Category {
  id: string;
  name: string;
  items_count: number;
}

const ModernCustomerOrderScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();
  const { items: cartItems, addItem, removeItem, getTotalPrice, getTotalItems } = useCartStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMenuData();
  }, []);

  useEffect(() => {
    filterMenuItems();
  }, [menuItems, selectedCategory, searchQuery]);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      
      // Mock menu data - replace with real Supabase query
      const mockCategories: Category[] = [
        { id: 'all', name: 'All Items', items_count: 12 },
        { id: 'starters', name: 'Starters', items_count: 4 },
        { id: 'mains', name: 'Main Course', items_count: 6 },
        { id: 'desserts', name: 'Desserts', items_count: 2 },
      ];
      
      const mockMenuItems: MenuItem[] = [
        {
          id: '1',
          name: 'Butter Chicken',
          description: 'Creamy tomato-based curry with tender chicken pieces',
          price: 180,
          category: 'mains',
          is_available: true,
          preparation_time: 20,
          image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop',
        },
        {
          id: '2',
          name: 'Chicken Tikka',
          description: 'Marinated chicken grilled to perfection',
          price: 150,
          category: 'starters',
          is_available: true,
          preparation_time: 15,
          image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=200&fit=crop',
        },
        {
          id: '3',
          name: 'Biryani',
          description: 'Fragrant basmati rice with spiced meat',
          price: 220,
          category: 'mains',
          is_available: true,
          preparation_time: 25,
          image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=300&h=200&fit=crop',
        },
        {
          id: '4',
          name: 'Naan',
          description: 'Soft, fluffy Indian bread',
          price: 40,
          category: 'starters',
          is_available: true,
          preparation_time: 5,
          image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300&h=200&fit=crop',
        },
        {
          id: '5',
          name: 'Gulab Jamun',
          description: 'Sweet, syrupy dessert balls',
          price: 80,
          category: 'desserts',
          is_available: false,
          preparation_time: 10,
          image_url: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=300&h=200&fit=crop',
        },
      ];
      
      setCategories(mockCategories);
      setMenuItems(mockMenuItems);
    } catch (error) {
      console.error('Error loading menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMenuItems = () => {
    let filtered = menuItems;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredItems(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMenuData();
    setRefreshing(false);
  };

  const getItemQuantity = (itemId: string) => {
    const cartItem = cartItems.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (item: MenuItem) => {
    // Convert MenuItem to Product format expected by cart
    const productItem: Product = {
      id: item.id,
      business_id: 'demo-business-id', // In a real app, this would come from the selected business
      name: item.name,
      description: item.description,
      image_urls: item.image_url ? [item.image_url] : [],
      price: item.price,
      discount_price: null,
      stock_quantity: 100, // Default stock
      unit: 'piece',
      is_available: item.is_available,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addItem(productItem, 1);
  };

  const handleRemoveFromCart = (itemId: string) => {
    removeItem(itemId);
  };

  const renderCategoryItem = ({ item: category }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        {
          backgroundColor: selectedCategory === category.id
            ? theme.colors.primary + '20'
            : theme.colors.surface,
          borderColor: selectedCategory === category.id
            ? theme.colors.primary
            : theme.colors.border,
        }
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Text
        style={[
          styles.categoryText,
          {
            color: selectedCategory === category.id
              ? theme.colors.primary
              : theme.colors.textSecondary,
          }
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const renderMenuItem = ({ item: menuItem }: { item: MenuItem }) => {
    const quantity = getItemQuantity(menuItem.id);
    
    return (
      <ModernCard style={styles.menuCard} variant="elevated">
        <View style={styles.menuItemContent}>
          <View style={styles.menuItemInfo}>
            <Text style={styles.menuItemName}>{menuItem.name}</Text>
            <Text style={styles.menuItemDescription}>{menuItem.description}</Text>
            
            <View style={styles.menuItemMeta}>
              <Text style={styles.menuItemPrice}>₹{menuItem.price}</Text>
              <View style={styles.preparationTime}>
                <Ionicons name="time" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.preparationTimeText}>
                  {menuItem.preparation_time} min
                </Text>
              </View>
            </View>
          </View>
          
          {menuItem.image_url && (
            <Image source={{ uri: menuItem.image_url }} style={styles.menuItemImage} />
          )}
        </View>
        
        <View style={styles.menuItemActions}>
          {!menuItem.is_available ? (
            <View style={styles.unavailableContainer}>
              <Text style={styles.unavailableText}>Currently Unavailable</Text>
            </View>
          ) : quantity === 0 ? (
            <ModernButton
              title="Add to Cart"
              onPress={() => handleAddToCart(menuItem)}
              variant="outline"
              size="small"
              style={styles.addButton}
            />
          ) : (
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleRemoveFromCart(menuItem.id)}
              >
                <Ionicons name="remove" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleAddToCart(menuItem)}
              >
                <Ionicons name="add" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ModernCard>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    headerTitle: {
      ...theme.typography.h2,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
    },
    searchContainer: {
      marginBottom: theme.spacing.md,
    },
    categoriesContainer: {
      marginBottom: theme.spacing.md,
    },
    categoriesScroll: {
      paddingHorizontal: theme.spacing.lg,
    },
    categoryChip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      marginRight: theme.spacing.sm,
      borderWidth: 1,
    },
    categoryText: {
      ...theme.typography.body2,
      fontWeight: '500',
    },
    menuList: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    menuCard: {
      marginBottom: theme.spacing.md,
    },
    menuItemContent: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
    },
    menuItemInfo: {
      flex: 1,
      paddingRight: theme.spacing.md,
    },
    menuItemName: {
      ...theme.typography.h4,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    menuItemDescription: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: theme.spacing.sm,
    },
    menuItemMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    menuItemPrice: {
      ...theme.typography.h4,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    preparationTime: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    preparationTimeText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.xs,
    },
    menuItemImage: {
      width: 80,
      height: 80,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceSecondary,
    },
    menuItemActions: {
      alignItems: 'flex-end',
    },
    unavailableContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.error + '20',
    },
    unavailableText: {
      ...theme.typography.caption,
      color: theme.colors.error,
      fontWeight: '500',
    },
    addButton: {
      minWidth: 100,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '10',
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
    },
    quantityButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      margin: theme.spacing.xs,
    },
    quantityText: {
      ...theme.typography.body1,
      color: theme.colors.primary,
      fontWeight: '600',
      marginHorizontal: theme.spacing.md,
      minWidth: 20,
      textAlign: 'center',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    emptyText: {
      ...theme.typography.body1,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    cartSummary: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    cartSummaryContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cartInfo: {
      flex: 1,
    },
    cartItemsText: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
    },
    cartTotalText: {
      ...theme.typography.h4,
      color: theme.colors.text,
      fontWeight: '700',
    },
    viewCartButton: {
      minWidth: 120,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
        
        {/* Search */}
        <View style={styles.searchContainer}>
          <ModernInput
            placeholder="Search for dishes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon="search"
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
        />
      </View>

      {/* Menu Items */}
      <FlatList
        style={styles.menuList}
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderMenuItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'No dishes found for your search' : 'No dishes available'}
            </Text>
          </View>
        }
      />

      {/* Cart Summary */}
      {getTotalItems() > 0 && (
        <View style={styles.cartSummary}>
          <View style={styles.cartSummaryContent}>
            <View style={styles.cartInfo}>
              <Text style={styles.cartItemsText}>
                {getTotalItems()} item{getTotalItems() > 1 ? 's' : ''} in cart
              </Text>
              <Text style={styles.cartTotalText}>₹{getTotalPrice()}</Text>
            </View>
            <ModernButton
              title="View Cart"
              onPress={() => console.log('Navigate to cart')}
              variant="primary"
              size="small"
              style={styles.viewCartButton}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ModernCustomerOrderScreen;
