import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/ui/Button';
import { COLORS, DIMENSIONS } from '../config/constants';

interface PlaceholderScreenProps {
  title: string;
  description?: string;
  icon?: string;
  onBack?: () => void;
}

const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({
  title,
  description,
  icon = '🚧',
  onBack
}) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
        <Text style={styles.message}>
          {t('common.comingSoon')}
        </Text>
        {onBack && (
          <Button
            title={t('common.back')}
            onPress={onBack}
            variant="primary"
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DIMENSIONS.PADDING.lg,
  },
  icon: {
    fontSize: 64,
    marginBottom: DIMENSIONS.PADDING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: DIMENSIONS.PADDING.md,
  },
  description: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: DIMENSIONS.PADDING.lg,
  },
  message: {
    fontSize: 18,
    color: COLORS.primary[500],
    textAlign: 'center',
    marginBottom: DIMENSIONS.PADDING.xl,
  },
});

export default PlaceholderScreen;
