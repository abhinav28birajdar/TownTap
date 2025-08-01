import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useModernTheme } from '../../context/ModernThemeContext';

const ProductDetailScreen: React.FC = () => {
  const { colors } = useModernTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.colors.text }]}>Product Details</Text>
        <Text style={[styles.subtitle, { color: colors.colors.textSecondary }]}>
          Product information will be displayed here
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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

export default ProductDetailScreen;
