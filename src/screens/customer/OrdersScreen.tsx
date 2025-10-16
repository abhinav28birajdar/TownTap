import React from 'react';
import {View, Text, StyleSheet, SafeAreaView} from 'react-native';
import {useTheme} from '../../context/ModernThemeContext';

const OrdersScreen = () => {
  const {theme} = useTheme();

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Text style={[styles.title, {color: theme.colors.text}]}>Orders</Text>
      <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
        Your order history will appear here
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default OrdersScreen;