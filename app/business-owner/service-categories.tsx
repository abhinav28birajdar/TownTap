/**
 * Service Categories Management - Phase 9
 * Manage service categories for business
 */

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { BorderRadius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  services_count: number;
  active: boolean;
  display_order: number;
}

export default function ServiceCategoriesPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthStore();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(
    null
  );
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('🔧');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data: businessData, error: businessError } = await (supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user?.id || '')
        .single() as any);

      if (businessError) throw businessError;

      const { data, error } = await supabase
        .from('service_categories')
        .select(`
          *,
          services (count)
        `)
        .eq('business_id', (businessData as any).id)
        .order('display_order');

      if (error) throw error;

      if (data) {
        setCategories(
          data.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            icon: cat.icon || '🔧',
            services_count: cat.services?.[0]?.count || 0,
            active: cat.active,
            display_order: cat.display_order,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDescription('');
    setCategoryIcon('🔧');
    setShowAddModal(true);
  };

  const handleEditCategory = (category: ServiceCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description);
    setCategoryIcon(category.icon);
    setShowAddModal(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user?.id || '')
        .single();

      if (businessError) throw businessError;

      if (editingCategory) {
        const { error } = await (supabase
          .from('service_categories') as any)
          .update({
            name: categoryName,
            description: categoryDescription,
            icon: categoryIcon,
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        alert('Category updated successfully!');
      } else {
        const { error } = await (supabase.from('service_categories') as any).insert([
          {
            business_id: (businessData as any).id,
            name: categoryName,
            description: categoryDescription,
            icon: categoryIcon,
            active: true,
            display_order: categories.length,
          },
        ]);

        if (error) throw error;
        alert('Category added successfully!');
      }

      setShowAddModal(false);
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  const handleToggleActive = async (categoryId: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase
        .from('service_categories') as any)
        .update({ active: !currentStatus })
        .eq('id', categoryId);

      if (error) throw error;
      loadCategories();
    } catch (error) {
      console.error('Error toggling category:', error);
    }
  };

  const handleDeleteCategory = (categoryId: string, servicesCount: number) => {
    if (servicesCount > 0) {
      alert('Cannot delete category with services. Please remove all services first.');
      return;
    }

    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('service_categories')
                .delete()
                .eq('id', categoryId);

              if (error) throw error;
              loadCategories();
            } catch (error) {
              console.error('Error deleting category:', error);
              alert('Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const iconOptions = [
    '🔧',
    '🔨',
    '⚡',
    '💧',
    '🎨',
    '🪴',
    '🧹',
    '🍳',
    '✂️',
    '💼',
    '🚗',
    '🏠',
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Service Categories
          </Text>
        </View>

        {/* Add Button */}
        <Card style={styles.addCard}>
          <Button
            title="+ Add New Category"
            onPress={handleAddCategory}
            style={([styles.addButton, { backgroundColor: colors.primary }] as any)}
          />
        </Card>

        {/* Categories List */}
        {categories.map((category) => (
          <Card key={category.id} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryLeft}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryTitleRow}>
                    <Text style={[styles.categoryName, { color: colors.text }]}>
                      {category.name}
                    </Text>
                    {!category.active && <Badge text="Inactive" variant="error" />}
                  </View>
                  {category.description && (
                    <Text
                      style={[
                        styles.categoryDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {category.description}
                    </Text>
                  )}
                  <Text style={[styles.servicesCount, { color: colors.primary }]}>
                    {category.services_count} service(s)
                  </Text>
                </View>
              </View>
              <View style={styles.categoryActions}>
                <TouchableOpacity onPress={() => handleEditCategory(category)}>
                  <Text style={styles.actionIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    handleToggleActive(category.id, category.active)
                  }
                >
                  <Text style={styles.actionIcon}>
                    {category.active ? '👁️' : '🚫'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    handleDeleteCategory(category.id, category.services_count)
                  }
                >
                  <Text style={styles.actionIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title="View Services"
              onPress={() =>
                router.push(`/business-owner/category-services/${category.id}` as any)
              }
              style={styles.viewServicesButton}
            />
          </Card>
        ))}

        {categories.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No categories yet. Add your first category!
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </Text>

            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Category Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.muted,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g., Plumbing Services"
              placeholderTextColor={colors.textSecondary}
              value={categoryName}
              onChangeText={setCategoryName}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  color: colors.text,
                  backgroundColor: colors.muted,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Category description..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              value={categoryDescription}
              onChangeText={setCategoryDescription}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Select Icon
            </Text>
            <View style={styles.iconGrid}>
              {iconOptions.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    categoryIcon === icon && styles.iconOptionSelected,
                    categoryIcon === icon && { borderColor: colors.primary },
                  ] as any}
                  onPress={() => setCategoryIcon(icon)}
                >
                  <Text style={styles.iconOptionText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowAddModal(false)}
                style={([styles.modalButton, styles.cancelButton] as any)}
              />
              <Button
                title="Save"
                onPress={handleSaveCategory}
                style={([styles.modalButton, styles.confirmButton, { backgroundColor: colors.primary }] as any)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  backIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  addCard: {
    margin: spacing.md,
    padding: spacing.md,
  },
  addButton: {},

  categoryCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  categoryLeft: {
    flexDirection: 'row',
    gap: spacing.md,
    flex: 1,
  },
  categoryIcon: {
    fontSize: 40,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
  },
  categoryDescription: {
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  servicesCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionIcon: {
    fontSize: 20,
  },
  viewServicesButton: {
    backgroundColor: '#999',
  },
  emptyCard: {
    margin: spacing.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  iconOptionText: {
    fontSize: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  confirmButton: {},

});
