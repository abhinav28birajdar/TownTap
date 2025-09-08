import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { COLORS, CONTENT_TEMPLATES, DIMENSIONS } from '../../config/constants';
import { getCurrentLanguage } from '../../i18n';
import { generateAIContent } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

const AIContentGeneratorScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user, userProfile } = useAuthStore();
  
  // Form state
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState(CONTENT_TEMPLATES.CONTENT_TYPES[0]);
  const [platform, setPlatform] = useState(CONTENT_TEMPLATES.PLATFORMS[0]);
  const [tone, setTone] = useState(CONTENT_TEMPLATES.TONES[0]);
  
  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert(t('common.error'), t('ai.contentGenerator.error'));
      return;
    }

    if (!userProfile?.user_type || userProfile.user_type !== 'business_owner') {
      Alert.alert(t('common.error'), 'Only business users can generate content');
      return;
    }

    setIsGenerating(true);
    setShowResult(false);

    try {
      const { data, error } = await generateAIContent({
        businessId: user.id,
        promptText: prompt,
        contentType,
        platform,
        tone,
        language: getCurrentLanguage(),
      });

      if (error) {
        throw new Error(error.message || t('ai.contentGenerator.error'));
      }

      setGeneratedContent(data?.content || '');
      setShowResult(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (generatedContent) {
      await Clipboard.setStringAsync(generatedContent);
      Alert.alert(t('common.success'), t('common.copied'));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleShare = async () => {
    if (generatedContent) {
      try {
        await Share.share({
          message: generatedContent,
          title: t('ai.contentGenerator.generatedContent'),
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    }
  };

  const handleRefine = () => {
    setShowResult(false);
    setGeneratedContent('');
  };

  const renderDropdown = (
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.optionsScroll}
        contentContainerStyle={styles.optionsContainer}
      >
        {options.map((option, index) => (
          <View key={option} style={styles.optionButton}>
            <Button
              title={option}
              onPress={() => onSelect(option)}
              variant={selectedValue === option ? 'primary' : 'outline'}
              size="sm"
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('ai.contentGenerator.title')}</Text>
          <Text style={styles.subtitle}>{t('ai.contentGenerator.subtitle')}</Text>
        </View>

        {/* Input Form */}
        <Card>
          <Input
            label={t('ai.contentGenerator.prompt')}
            placeholder={t('ai.contentGenerator.prompt')}
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={4}
          />

          {renderDropdown(
            t('ai.contentGenerator.contentType'),
            CONTENT_TEMPLATES.CONTENT_TYPES,
            contentType,
            setContentType
          )}

          {renderDropdown(
            t('ai.contentGenerator.platform'),
            CONTENT_TEMPLATES.PLATFORMS,
            platform,
            setPlatform
          )}

          {renderDropdown(
            t('ai.contentGenerator.tone'),
            CONTENT_TEMPLATES.TONES,
            tone,
            setTone
          )}

          <Button
            title={isGenerating ? t('ai.contentGenerator.generating') : t('ai.contentGenerator.generate')}
            onPress={handleGenerate}
            loading={isGenerating}
            disabled={!prompt.trim() || isGenerating}
          />
        </Card>

        {/* Generated Content */}
        {showResult && generatedContent && (
          <MotiView
            from={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ 
              opacity: { type: 'spring', damping: 20, stiffness: 200, delay: 300 },
              translateY: { type: 'spring', damping: 20, stiffness: 200, delay: 300 }
            }}
            style={styles.resultContainer}
          >
            <Card>
              <Text style={styles.resultTitle}>
                {t('ai.contentGenerator.generatedContent')}
              </Text>
              <Text style={styles.resultContent}>{generatedContent}</Text>
              
              <View style={styles.actionButtons}>
                <Button
                  title={t('ai.contentGenerator.copy')}
                  onPress={handleCopy}
                  variant="outline"
                  size="sm"
                  icon="📋"
                />
                <Button
                  title={t('ai.contentGenerator.share')}
                  onPress={handleShare}
                  variant="outline"
                  size="sm"
                  icon="📤"
                />
                <Button
                  title={t('ai.contentGenerator.refine')}
                  onPress={handleRefine}
                  variant="secondary"
                  size="sm"
                  icon="✨"
                />
              </View>
            </Card>
          </MotiView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: DIMENSIONS.PADDING.md,
  },
  header: {
    marginBottom: DIMENSIONS.PADDING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: DIMENSIONS.PADDING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dropdownContainer: {
    marginBottom: DIMENSIONS.PADDING.lg,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: DIMENSIONS.PADDING.sm,
  },
  optionsScroll: {
    flexDirection: 'row',
  },
  optionsContainer: {
    gap: DIMENSIONS.PADDING.sm,
  },
  optionButton: {
    marginRight: DIMENSIONS.PADDING.sm,
  },
  resultContainer: {
    marginTop: DIMENSIONS.PADDING.md,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: DIMENSIONS.PADDING.md,
  },
  resultContent: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 24,
    marginBottom: DIMENSIONS.PADDING.lg,
    padding: DIMENSIONS.PADDING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: DIMENSIONS.BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: DIMENSIONS.PADDING.sm,
  },
});

export default AIContentGeneratorScreen;
