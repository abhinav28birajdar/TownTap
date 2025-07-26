import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface SavedAddress {
  id: string;
  name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

const SavedAddressesScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<SavedAddress>>({
    name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    is_default: false,
  });

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    if (!user?.id) return;

    try {
      const { data } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', user.id)
        .order('is_default', { ascending: false });

      setAddresses(data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async () => {
    if (!user?.id) return;
    
    if (!newAddress.name || !newAddress.address_line_1 || !newAddress.city) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('customer_addresses')
          .update(newAddress)
          .eq('id', editingAddress.id);

        if (error) throw error;
      } else {
        // Add new address
        const { error } = await supabase
          .from('customer_addresses')
          .insert({
            ...newAddress,
            customer_id: user.id,
          });

        if (error) throw error;
      }

      await loadAddresses();
      resetForm();
      Alert.alert('Success', 'Address saved successfully');
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address');
    }
  };

  const deleteAddress = async (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('customer_addresses')
                .delete()
                .eq('id', addressId);

              if (error) throw error;
              
              await loadAddresses();
              Alert.alert('Success', 'Address deleted successfully');
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  const setDefaultAddress = async (addressId: string) => {
    try {
      // First, unset all default addresses
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('customer_id', user?.id);

      // Then set the selected address as default
      const { error } = await supabase
        .from('customer_addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;
      
      await loadAddresses();
      Alert.alert('Success', 'Default address updated');
    } catch (error) {
      console.error('Error setting default address:', error);
      Alert.alert('Error', 'Failed to update default address');
    }
  };

  const editAddress = (address: SavedAddress) => {
    setEditingAddress(address);
    setNewAddress(address);
    setShowAddModal(true);
  };

  const resetForm = () => {
    setNewAddress({
      name: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      is_default: false,
    });
    setEditingAddress(null);
    setShowAddModal(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      flex: 1,
    },
    addButton: {
      padding: 8,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    addressCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    defaultAddressCard: {
      borderColor: theme.primary,
      borderWidth: 2,
    },
    addressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    addressName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
    },
    defaultBadge: {
      backgroundColor: theme.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    defaultBadgeText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    addressText: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 20,
      marginBottom: 12,
    },
    addressActions: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
    },
    setDefaultButton: {
      borderColor: theme.primary,
      backgroundColor: 'transparent',
    },
    editButton: {
      borderColor: theme.textSecondary,
      backgroundColor: 'transparent',
    },
    deleteButton: {
      borderColor: '#EF4444',
      backgroundColor: 'transparent',
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
    setDefaultText: {
      color: theme.primary,
    },
    editText: {
      color: theme.textSecondary,
    },
    deleteText: {
      color: '#EF4444',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
    },
    emptyStateIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      width: '90%',
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
    },
    closeButton: {
      padding: 8,
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    textInput: {
      fontSize: 16,
      color: theme.text,
      padding: 12,
      backgroundColor: theme.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.textSecondary,
    },
    saveButton: {
      backgroundColor: theme.primary,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffffff',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <View
              key={address.id}
              style={[
                styles.addressCard,
                address.is_default && styles.defaultAddressCard,
              ]}
            >
              <View style={styles.addressHeader}>
                <Text style={styles.addressName}>{address.name}</Text>
                {address.is_default && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                  </View>
                )}
              </View>

              <Text style={styles.addressText}>
                {address.address_line_1}
                {address.address_line_2 && `\n${address.address_line_2}`}
                {`\n${address.city}, ${address.state} ${address.postal_code}`}
              </Text>

              <View style={styles.addressActions}>
                {!address.is_default && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.setDefaultButton]}
                    onPress={() => setDefaultAddress(address.id)}
                  >
                    <Ionicons name="star-outline" size={16} color={theme.primary} />
                    <Text style={[styles.actionButtonText, styles.setDefaultText]}>
                      Set Default
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => editAddress(address)}
                >
                  <Ionicons name="pencil-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.actionButtonText, styles.editText]}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteAddress(address.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text style={[styles.actionButtonText, styles.deleteText]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📍</Text>
            <Text style={styles.emptyStateText}>
              No saved addresses yet.{'\n'}Add your first address to get started!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Address Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={resetForm}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={resetForm}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Address Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAddress.name}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, name: text }))}
                  placeholder="Home, Work, etc."
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Address Line 1 *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAddress.address_line_1}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, address_line_1: text }))}
                  placeholder="Street address"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Address Line 2</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAddress.address_line_2}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, address_line_2: text }))}
                  placeholder="Apartment, suite, etc."
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>City *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAddress.city}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, city: text }))}
                  placeholder="City"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAddress.state}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, state: text }))}
                  placeholder="State"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Postal Code</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAddress.postal_code}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, postal_code: text }))}
                  placeholder="Postal code"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={resetForm}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveAddress}
              >
                <Text style={styles.modalButtonText}>
                  {editingAddress ? 'Update' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SavedAddressesScreen;
