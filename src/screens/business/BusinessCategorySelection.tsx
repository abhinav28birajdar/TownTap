// FILE: src/screens/business/BusinessCategorySelection.tsx
// PURPOSE: Business category selection screen for business registration

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BUSINESS_CATEGORIES,
  BusinessCategory,
  BusinessSubcategory,
  getCategorySubcategories,
  searchCategories
} from '../../constants/businessCategories';
import { BusinessStackParamList } from '../../types';

interface Props {}

type BusinessCategorySelectionNavigationProp = NativeStackNavigationProp<
  BusinessStackParamList,
  'BusinessTabs'
>;

export const BusinessCategorySelection: React.FC<Props> = () => {
  const navigation = useNavigation<BusinessCategorySelectionNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<BusinessSubcategory | null>(null);
  const [showSubcategories, setShowSubcategories] = useState(false);

  const filteredCategories = searchQuery 
    ? searchCategories(searchQuery)
    : BUSINESS_CATEGORIES;

  const handleCategorySelect = (category: BusinessCategory) => {
    setSelectedCategory(category);
    setShowSubcategories(true);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategory: BusinessSubcategory) => {
    setSelectedSubcategory(subcategory);
  };

  const handleContinue = () => {
    if (!selectedCategory || !selectedSubcategory) {
      Alert.alert('Selection Required', 'Please select both a category and subcategory for your business.');
      return;
    }

    // Navigate to business details screen with selected category data
    navigation.navigate('BusinessDetails', {
      category: selectedCategory,
      subcategory: selectedSubcategory,
    });
  };

  const renderCategoryCard = (category: BusinessCategory) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryCard,
        selectedCategory?.id === category.id && styles.selectedCard
      ]}
      onPress={() => handleCategorySelect(category)}
    >
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.categoryDescription}>{category.description}</Text>
        {category.isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Popular</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSubcategoryCard = (subcategory: BusinessSubcategory) => (
    <TouchableOpacity
      key={subcategory.id}
      style={[
        styles.subcategoryCard,
        selectedSubcategory?.id === subcategory.id && styles.selectedSubcategoryCard
      ]}
      onPress={() => handleSubcategorySelect(subcategory)}
    >
      <Text style={styles.subcategoryIcon}>{subcategory.icon}</Text>
      <View style={styles.subcategoryContent}>
        <Text style={styles.subcategoryName}>{subcategory.name}</Text>
        <Text style={styles.subcategoryDescription}>{subcategory.description}</Text>
        {subcategory.averageDeliveryTime && (
          <Text style={styles.deliveryTime}>
            Avg. delivery: {subcategory.averageDeliveryTime}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {showSubcategories ? 'Select Business Type' : 'Choose Your Business Category'}
        </Text>
        <Text style={styles.subtitle}>
          {showSubcategories 
            ? `What type of ${selectedCategory?.name.toLowerCase()} business do you run?`
            : 'This helps us customize your experience and connect you with the right customers.'
          }
        </Text>
      </View>

      {!showSubcategories && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!showSubcategories ? (
          <View style={styles.categoriesContainer}>
            {filteredCategories.map(renderCategoryCard)}
          </View>
        ) : (
          <View style={styles.subcategoriesContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setShowSubcategories(false)}
            >
              <Text style={styles.backButtonText}>← Back to Categories</Text>
            </TouchableOpacity>
            
            <Text style={styles.selectedCategoryTitle}>
              {selectedCategory?.icon} {selectedCategory?.name}
            </Text>
            
            {getCategorySubcategories(selectedCategory?.id || '').map(renderSubcategoryCard)}
          </View>
        )}
      </ScrollView>

      {showSubcategories && selectedSubcategory && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue with {selectedSubcategory.name}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    lineHeight: 24,
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  scrollView: {
    flex: 1,
  },
  categoriesContainer: {
    padding: 20,
  },
  categoryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedCard: {
    borderColor: '#3498DB',
    backgroundColor: '#EBF4FD',
  },
  categoryIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 8,
  },
  popularBadge: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  subcategoriesContainer: {
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3498DB',
    fontWeight: '600',
  },
  selectedCategoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  subcategoryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  selectedSubcategoryCard: {
    borderColor: '#3498DB',
    backgroundColor: '#EBF4FD',
  },
  subcategoryIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  subcategoryContent: {
    flex: 1,
  },
  subcategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  subcategoryDescription: {
    fontSize: 13,
    color: '#7F8C8D',
    lineHeight: 18,
    marginBottom: 4,
  },
  deliveryTime: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '500',
  },
  bottomContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  continueButton: {
    backgroundColor: '#3498DB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});