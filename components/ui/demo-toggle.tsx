import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, Spacing } from '@/constants/spacing';
import { useDemo } from '@/contexts/demo-context';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const DemoModeToggle = () => {
  const { isDemo, setDemo } = useDemo();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Demo Mode</Text>
      <TouchableOpacity
        style={[styles.toggle, isDemo && styles.toggleActive]}
        onPress={() => setDemo(!isDemo)}
      >
        <View style={[styles.toggleCircle, isDemo && styles.toggleCircleActive]}>
          <Ionicons 
            name={isDemo ? 'checkmark' : 'close'} 
            size={16} 
            color={isDemo ? Colors.card : Colors.textSecondary} 
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.card,
  },
  toggle: {
    width: 60,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: Colors.secondary,
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
  },
});