import { Colors } from '@/constants/colors';
import { FontSize } from '@/constants/spacing';
import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function Modal() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Modal' }} />
      <Text style={styles.text}>This is a modal screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  text: {
    fontSize: FontSize.lg,
    color: Colors.text,
  },
});