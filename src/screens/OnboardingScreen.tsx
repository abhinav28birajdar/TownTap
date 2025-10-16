import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import OnboardingTabs from '../components/OnboardingTabs';

const OnboardingScreen = () => {
  return (
    <View style={styles.container}>
      <OnboardingTabs />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default OnboardingScreen;