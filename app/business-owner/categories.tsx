import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  servicesCount: number;
  isActive: boolean;
}

const mockCategories: ServiceCategory[] = [
  { id: '1', name: 'Cleaning', icon: 'sparkles', color: '#4CAF50', servicesCount: 8, isActive: true },
  { id: '2', name: 'Repairs', icon: 'construct', color: '#FF9800', servicesCount: 12, isActive: true },
  { id: '3', name: 'Plumbing', icon: 'water', color: '#2196F3', servicesCount: 6, isActive: true },
  { id: '4', name: 'Electrical', icon: 'flash', color: '#FFC107', servicesCount: 5, isActive: true },
  { id: '5', name: 'Pest Control', icon: 'bug', color: '#9C27B0', servicesCount: 4, isActive: true },
  { id: '6', name: 'Painting', icon: 'color-palette', color: '#E91E63', servicesCount: 3, isActive: false },
  { id: '7', name: 'Gardening', icon: 'leaf', color: '#8BC34A', servicesCount: 2, isActive: false },
  { id: '8', name: 'AC Service', icon: 'snow', color: '#00BCD4', servicesCount: 7, isActive: true },
];

const iconOptions = [
  'sparkles', 'construct', 'water', 'flash', 'bug', 'color-palette',
  'leaf', 'snow', 'car', 'home', 'fitness', 'cut', 'camera',
  'laptop', 'brush', 'hammer', 'bandage', 'paw', 'musical-notes',
];

const colorOptions = [
  '#4CAF50', '#FF9800', '#2196F3', '#FFC107', '#9C27B0',
  '#E91E63', '#8BC34A', '#00BCD4', '#F44336', '#3F51B5',
  '#607D8B', '#795548',
];

export default function ServiceCategoriesScreen() {
  const colors = useColors();
  const [categories, setCategories] = useState(mockCategories);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    icon: 'sparkles',
    color: '#4CAF50',
  });

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = categories.filter((c) => c.isActive).length;

  const toggleCategoryStatus = (id: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isActive: !c.isActive } : c
      )
    );
  };

  const handleCreateCategory = () => {
    if (formData.name.trim()) {
      const newCategory: ServiceCategory = {
        id: Date.now().toString(),
        name: formData.name,
        icon: formData.icon,
        color: formData.color,
        servicesCount: 0,
        isActive: true,
      };
      setCategories((prev) => [...prev, newCategory]);
      setFormData({ name: '', icon: 'sparkles', color: '#4CAF50' });
      setShowCreateModal(false);
    }
  };

  const handleEditCategory = () => {
    if (selectedCategory && formData.name.trim()) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === selectedCategory.id
            ? { ...c, name: formData.name, icon: formData.icon, color: formData.color }
            : c
        )
      );
      setShowEditModal(false);
      setSelectedCategory(null);
    }
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const openEditModal = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
    });
    setShowEditModal(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Service Categories</ThemedText>
        <TouchableOpacity
          onPress={() => {
            setFormData({ name: '', icon: 'sparkles', color: '#4CAF50' });
            setShowCreateModal(true);
          }}
        >
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="grid" size={20} color={colors.primary} />
          </View>
          <View>
            <ThemedText style={styles.statValue}>{categories.length}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Categories
            </ThemedText>
          </View>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          </View>
          <View>
            <ThemedText style={styles.statValue}>{activeCount}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Active
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search categories..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories List */}
      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="grid-outline" size={48} color={colors.border} />
            <ThemedText style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              No categories found
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              Create your first service category
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.categoryCard, { backgroundColor: colors.card }]}>
            <View style={styles.categoryMain}>
              <View
                style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}
              >
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <View style={styles.categoryInfo}>
                <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
                <View style={styles.categoryMeta}>
                  <Ionicons name="layers" size={14} color={colors.textSecondary} />
                  <ThemedText style={[styles.servicesCount, { color: colors.textSecondary }]}>
                    {item.servicesCount} services
                  </ThemedText>
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: item.isActive ? colors.success : colors.border },
                    ]}
                  />
                  <ThemedText
                    style={[
                      styles.statusLabel,
                      { color: item.isActive ? colors.success : colors.textSecondary },
                    ]}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </ThemedText>
                </View>
              </View>
            </View>
            <View style={styles.categoryActions}>
              <Switch
                value={item.isActive}
                onValueChange={() => toggleCategoryStatus(item.id)}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={item.isActive ? colors.primary : colors.textSecondary}
              />
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openEditModal(item)}
              >
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteCategory(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Create Category Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.formModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Create Category</ThemedText>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Preview */}
              <View style={styles.previewSection}>
                <ThemedText style={styles.formLabel}>Preview</ThemedText>
                <View style={[styles.previewCard, { backgroundColor: colors.background }]}>
                  <View style={[styles.previewIcon, { backgroundColor: formData.color + '20' }]}>
                    <Ionicons name={formData.icon as any} size={32} color={formData.color} />
                  </View>
                  <ThemedText style={styles.previewName}>
                    {formData.name || 'Category Name'}
                  </ThemedText>
                </View>
              </View>

              {/* Category Name */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Category Name</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="e.g., Home Cleaning"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              {/* Icon Selection */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Icon</ThemedText>
                <View style={styles.iconGrid}>
                  {iconOptions.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconOption,
                        {
                          backgroundColor:
                            formData.icon === icon ? formData.color + '20' : colors.background,
                          borderColor:
                            formData.icon === icon ? formData.color : colors.border,
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, icon })}
                    >
                      <Ionicons
                        name={icon as any}
                        size={22}
                        color={formData.icon === icon ? formData.color : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Color Selection */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Color</ThemedText>
                <View style={styles.colorGrid}>
                  {colorOptions.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        formData.color === color && styles.colorOptionSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, color })}
                    >
                      {formData.color === color && (
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: formData.name.trim() ? colors.primary : colors.border },
              ]}
              onPress={handleCreateCategory}
              disabled={!formData.name.trim()}
            >
              <ThemedText
                style={[
                  styles.submitText,
                  { color: formData.name.trim() ? '#fff' : colors.textSecondary },
                ]}
              >
                Create Category
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Category Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.formModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Edit Category</ThemedText>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Preview */}
              <View style={styles.previewSection}>
                <ThemedText style={styles.formLabel}>Preview</ThemedText>
                <View style={[styles.previewCard, { backgroundColor: colors.background }]}>
                  <View style={[styles.previewIcon, { backgroundColor: formData.color + '20' }]}>
                    <Ionicons name={formData.icon as any} size={32} color={formData.color} />
                  </View>
                  <ThemedText style={styles.previewName}>
                    {formData.name || 'Category Name'}
                  </ThemedText>
                </View>
              </View>

              {/* Category Name */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Category Name</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="e.g., Home Cleaning"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              {/* Icon Selection */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Icon</ThemedText>
                <View style={styles.iconGrid}>
                  {iconOptions.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconOption,
                        {
                          backgroundColor:
                            formData.icon === icon ? formData.color + '20' : colors.background,
                          borderColor:
                            formData.icon === icon ? formData.color : colors.border,
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, icon })}
                    >
                      <Ionicons
                        name={icon as any}
                        size={22}
                        color={formData.icon === icon ? formData.color : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Color Selection */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Color</ThemedText>
                <View style={styles.colorGrid}>
                  {colorOptions.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        formData.color === color && styles.colorOptionSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, color })}
                    >
                      {formData.color === color && (
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: formData.name.trim() ? colors.primary : colors.border },
              ]}
              onPress={handleEditCategory}
              disabled={!formData.name.trim()}
            >
              <ThemedText
                style={[
                  styles.submitText,
                  { color: formData.name.trim() ? '#fff' : colors.textSecondary },
                ]}
              >
                Save Changes
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  categoryCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  categoryMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  servicesCount: {
    fontSize: 13,
    marginRight: 10,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 13,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  formModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  previewSection: {
    marginBottom: 20,
  },
  previewCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
  },
  previewIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '600',
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  textInput: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconOption: {
    width: (width - 80) / 6,
    height: (width - 80) / 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
