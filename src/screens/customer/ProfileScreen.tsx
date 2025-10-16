import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../context/ModernThemeContext';
import {useAuthStore} from '../../stores/authStore';

const ProfileScreen = () => {
  const {theme} = useTheme();
  const {user, signOut} = useAuthStore();
  const navigation = useNavigation();

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      onPress: () => {},
    },
    {
      icon: 'notifications-outline',
      title: 'Notification Settings',
      onPress: () => navigation.navigate('NotificationSettings' as never),
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      onPress: () => {},
    },
    {
      icon: 'information-circle-outline',
      title: 'About',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView>
        {/* Header */}
        <View style={[styles.header, {backgroundColor: theme.colors.primary}]}>
          <View style={styles.profileInfo}>
            <View style={[styles.avatar, {backgroundColor: theme.colors.surface}]}>
              <Icon name="person" size={40} color={theme.colors.primary} />
            </View>
            <Text style={styles.userName}>{user?.email || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, {backgroundColor: theme.colors.surface}]}
              onPress={item.onPress}>
              <Icon name={item.icon} size={24} color={theme.colors.text} />
              <Text style={[styles.menuText, {color: theme.colors.text}]}>
                {item.title}
              </Text>
              <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.signOutButton, {backgroundColor: '#FF6B6B'}]}
          onPress={handleSignOut}>
          <Icon name="log-out-outline" size={24} color="white" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menu: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;