import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
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
import { useTheme } from '../../context/ModernThemeContext';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface PersonalInfo {
  full_name: string;
  email: string;
  phone: string;
  user_type: string;
  created_at: string;
}

const PersonalInformationScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    full_name: '',
    email: '',
    phone: '',
    user_type: '',
    created_at: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPersonalInfo();
  }, [user]);

  const loadPersonalInfo = async () => {
    if (!user?.id) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setPersonalInfo({
          full_name: profile.full_name || '',
          email: user.email || '',
          phone: profile.phone || '',
          user_type: profile.user_type || '',
          created_at: profile.created_at || '',
        });
      }
    } catch (error) {
      console.error('Error loading personal info:', error);
    }
  };

  const savePersonalInfo = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: personalInfo.full_name,
          phone: personalInfo.phone,
        })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert('Success', 'Personal information updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating personal info:', error);
      Alert.alert('Error', 'Failed to update personal information');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      flex: 1,
    },
    editButton: {
      padding: 8,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
    },
    fieldContainer: {
      marginBottom: 16,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    fieldValue: {
      fontSize: 16,
      color: theme.colors.text,
      padding: 12,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    textInput: {
      fontSize: 16,
      color: theme.colors.text,
      padding: 12,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    readOnlyField: {
      backgroundColor: theme.colors.background,
      opacity: 0.7,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    button: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    secondaryButton: {
      backgroundColor: theme.colors.textSecondary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    accountTypeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    accountTypeIcon: {
      marginRight: 12,
    },
    accountTypeText: {
      fontSize: 16,
      color: theme.colors.text,
      textTransform: 'capitalize',
    },
    joinedDateText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => isEditing ? savePersonalInfo() : setIsEditing(true)}
          disabled={loading}
        >
          <Ionicons 
            name={isEditing ? "checkmark" : "pencil"} 
            size={24} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={personalInfo.full_name}
                onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, full_name: text }))}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            ) : (
              <Text style={styles.fieldValue}>
                {personalInfo.full_name || 'Not provided'}
              </Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <Text style={[styles.fieldValue, styles.readOnlyField]}>
              {personalInfo.email || 'Not provided'}
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={personalInfo.phone}
                onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, phone: text }))}
                placeholder="Enter your phone number"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>
                {personalInfo.phone || 'Not provided'}
              </Text>
            )}
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Account Type</Text>
            <View style={styles.accountTypeContainer}>
              <Ionicons 
                name={personalInfo.user_type === 'business_owner' ? 'business' : 'person'} 
                size={20} 
                color={theme.colors.primary}
                style={styles.accountTypeIcon}
              />
              <Text style={styles.accountTypeText}>
                {personalInfo.user_type.replace('_', ' ') || 'Not specified'}
              </Text>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Member Since</Text>
            <Text style={styles.joinedDateText}>
              {formatDate(personalInfo.created_at)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => {
                setIsEditing(false);
                loadPersonalInfo(); // Reset changes
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={savePersonalInfo}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalInformationScreen;
