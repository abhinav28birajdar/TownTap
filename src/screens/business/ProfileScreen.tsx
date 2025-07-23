import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useAuthStore } from '../../stores/authStore';

interface BusinessProfileScreenProps {
  navigation: any;
}

const BusinessProfileScreen: React.FC<BusinessProfileScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, signOut } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);
  const [businessData, setBusinessData] = useState({
    businessName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone_number || '',
    address: '123 Business Street, Pune',
    description: 'Your trusted local business providing quality products and services.',
    website: 'https://mybusiness.com',
  });

  const handleSave = async () => {
    try {
      // Save business profile data
      console.log('Saving business profile:', businessData);
      setIsEditing(false);
      Alert.alert(t('profile.success'), t('profile.updateSuccess'));
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert(t('errors.error'), t('errors.updateFailed'));
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('profile.logout'), 
          style: 'destructive',
          onPress: () => signOut()
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'storefront-outline',
      title: t('business.businessInfo'),
      onPress: () => setIsEditing(true),
    },
    {
      icon: 'analytics-outline',
      title: t('business.analytics'),
      onPress: () => navigation.navigate('Analytics'),
    },
    {
      icon: 'receipt-outline',
      title: t('business.orderManagement'),
      onPress: () => navigation.navigate('OrderManagement'),
    },
    {
      icon: 'create-outline',
      title: t('business.aiContentGenerator'),
      onPress: () => navigation.navigate('AIContentGenerator'),
    },
    {
      icon: 'notifications-outline',
      title: t('profile.notifications'),
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      icon: 'settings-outline',
      title: t('profile.settings'),
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'help-circle-outline',
      title: t('profile.help'),
      onPress: () => console.log('Help pressed'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.businessProfile')}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons name={isEditing ? "close" : "pencil"} size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="storefront" size={40} color="#007AFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.businessName}>{businessData.businessName}</Text>
              <Text style={styles.businessEmail}>{businessData.email}</Text>
            </View>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <Input
                placeholder={t('profile.businessName')}
                value={businessData.businessName}
                onChangeText={(text) => setBusinessData({...businessData, businessName: text})}
                style={styles.input}
              />
              <Input
                placeholder={t('profile.email')}
                value={businessData.email}
                onChangeText={(text) => setBusinessData({...businessData, email: text})}
                keyboardType="email-address"
                style={styles.input}
              />
              <Input
                placeholder={t('profile.phone')}
                value={businessData.phone}
                onChangeText={(text) => setBusinessData({...businessData, phone: text})}
                keyboardType="phone-pad"
                style={styles.input}
              />
              <Input
                placeholder={t('profile.address')}
                value={businessData.address}
                onChangeText={(text) => setBusinessData({...businessData, address: text})}
                multiline
                style={styles.input}
              />
              <Input
                placeholder={t('profile.description')}
                value={businessData.description}
                onChangeText={(text) => setBusinessData({...businessData, description: text})}
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              <Input
                placeholder={t('profile.website')}
                value={businessData.website}
                onChangeText={(text) => setBusinessData({...businessData, website: text})}
                keyboardType="url"
                style={styles.input}
              />
              
              <View style={styles.editActions}>
                <Button
                  title={t('common.cancel')}
                  onPress={() => setIsEditing(false)}
                  variant="outline"
                  style={styles.cancelButton}
                />
                <Button
                  title={t('common.save')}
                  onPress={handleSave}
                  style={styles.saveButton}
                />
              </View>
            </View>
          ) : (
            <View style={styles.profileDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="call-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{businessData.phone}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{businessData.address}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="globe-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{businessData.website}</Text>
              </View>
            </View>
          )}
        </Card>

        {/* Business Settings */}
        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>{t('business.settings')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color="#007AFF" />
              <Text style={styles.settingText}>{t('profile.notifications')}</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E5E5E7', true: '#007AFF' }}
              thumbColor={'#fff'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.settingText}>{t('business.autoAcceptOrders')}</Text>
            </View>
            <Switch
              value={autoAcceptOrders}
              onValueChange={setAutoAcceptOrders}
              trackColor={{ false: '#E5E5E7', true: '#007AFF' }}
              thumbColor={'#fff'}
            />
          </View>
        </Card>

        {/* Menu Items */}
        <Card style={styles.menuCard}>
          <Text style={styles.sectionTitle}>{t('profile.menu')}</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon as any} size={20} color="#007AFF" />
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title={t('profile.logout')}
            onPress={handleLogout}
            variant="danger"
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  businessEmail: {
    fontSize: 14,
    color: '#666',
  },
  profileDetails: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  editForm: {
    gap: 12,
  },
  input: {
    marginBottom: 0,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  settingsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  menuCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  logoutContainer: {
    padding: 16,
  },
  logoutButton: {
    marginTop: 8,
  },
});

export default BusinessProfileScreen;
