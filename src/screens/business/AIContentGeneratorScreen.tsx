import React, { useState } from 'react';
import {
    Alert,
    Clipboard,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';

interface ContentForm {
  prompt: string;
  contentType: 'promotional_caption' | 'product_description' | 'service_description' | 'social_media_post';
  platform: 'instagram' | 'facebook' | 'whatsapp' | 'general';
  tone: 'festive' | 'professional' | 'casual' | 'urgent' | 'friendly';
  language: 'en' | 'hi';
}

const contentTypes = [
  { value: 'promotional_caption', label: 'Promotional Caption' },
  { value: 'product_description', label: 'Product Description' },
  { value: 'service_description', label: 'Service Description' },
  { value: 'social_media_post', label: 'Social Media Post' },
];

const platforms = [
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'facebook', label: 'Facebook', icon: '👥' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'general', label: 'General', icon: '📝' },
];

const tones = [
  { value: 'festive', label: 'Festive', icon: '🎉' },
  { value: 'professional', label: 'Professional', icon: '💼' },
  { value: 'casual', label: 'Casual', icon: '😊' },
  { value: 'urgent', label: 'Urgent', icon: '⚡' },
  { value: 'friendly', label: 'Friendly', icon: '🤝' },
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी' },
];

export default function AIContentGeneratorScreen() {
  const user = useAuthStore((state) => state.user);
  const [form, setForm] = useState<ContentForm>({
    prompt: '',
    contentType: 'promotional_caption',
    platform: 'instagram',
    tone: 'friendly',
    language: 'en',
  });
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showToneModal, setShowToneModal] = useState(false);

  const generateContent = async () => {
    if (!form.prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt to generate content.');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI content generation
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockContent = generateMockContent(form);
      setGeneratedContent(mockContent);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockContent = (form: ContentForm): string => {
    const { prompt, contentType, platform, tone, language } = form;
    
    if (language === 'hi') {
      return generateHindiContent(prompt, contentType, tone);
    }
    
    switch (contentType) {
      case 'promotional_caption':
        return `🎉 Special Offer Alert! 🎉

${prompt} - Now available with exclusive discounts!

✨ Limited time offer
🚚 Free delivery available
💯 100% satisfaction guaranteed

${platform === 'instagram' ? '#SpecialOffer #LocalBusiness #TownTap' : ''}

Visit us today or order online! 📞 Call now for more details.`;

      case 'product_description':
        return `Discover the amazing ${prompt}!

🌟 Key Features:
• Premium quality materials
• Excellent value for money
• Customer satisfaction guaranteed
• Quick delivery available

${tone === 'professional' ? 'Our commitment to quality ensures you receive only the best products.' : 'Perfect for your daily needs and special occasions!'}

Order now and experience the difference! 🛍️`;

      case 'service_description':
        return `Professional ${prompt} Services

🔧 What we offer:
• Expert technicians
• Affordable pricing
• Quick response time
• Quality workmanship guaranteed

${tone === 'urgent' ? '⚡ Emergency services available 24/7!' : '📅 Book your appointment today!'}

Contact us for a free quote and consultation.`;

      case 'social_media_post':
        return `Hey everyone! 👋

${prompt} is what we're excited about today!

${tone === 'casual' ? '😊 Come check us out and see what makes us special!' : '🏆 We\'re committed to providing you with the best experience.'}

${platform === 'facebook' ? 'Tag a friend who might be interested! 👥' : ''}
${platform === 'instagram' ? '📸 Share your experience with us!' : ''}

#LocalBusiness #CommunityFirst #TownTap`;

      default:
        return `Here's your generated content about ${prompt}. This content is optimized for ${platform} with a ${tone} tone.`;
    }
  };

  const generateHindiContent = (prompt: string, contentType: string, tone: string): string => {
    switch (contentType) {
      case 'promotional_caption':
        return `🎉 विशेष ऑफर अलर्ट! 🎉

${prompt} - अब विशेष छूट के साथ उपलब्ध!

✨ सीमित समय का ऑफर
🚚 मुफ्त डिलीवरी उपलब्ध
💯 100% संतुष्टि की गारंटी

आज ही हमसे मिलें या ऑनलाइन ऑर्डर करें! 📞 अधिक जानकारी के लिए अभी कॉल करें।`;

      case 'product_description':
        return `अद्भुत ${prompt} की खोज करें!

🌟 मुख्य विशेषताएं:
• प्रीमियम गुणवत्ता की सामग्री
• पैसे की बेहतरीन वैल्यू
• ग्राहक संतुष्टि की गारंटी
• त्वरित डिलीवरी उपलब्ध

अभी ऑर्डर करें और अंतर का अनुभव करें! 🛍️`;

      default:
        return `आपका ${prompt} के बारे में जेनरेट किया गया कंटेंट। यह कंटेंट ${tone} टोन के साथ अनुकूलित है।`;
    }
  };

  const copyToClipboard = async () => {
    if (generatedContent) {
      await Clipboard.setString(generatedContent);
      Alert.alert('Success', 'Content copied to clipboard!');
    }
  };

  const shareContent = async () => {
    if (generatedContent) {
      try {
        await Share.share({
          message: generatedContent,
          title: 'Generated Content from TownTap',
        });
      } catch (error) {
        console.error('Error sharing content:', error);
      }
    }
  };

  const renderSelector = (
    title: string,
    value: string,
    options: Array<{ value: string; label: string; icon?: string }>,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.selectorOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.selectorOption,
                value === option.value && styles.selectorOptionActive
              ]}
              onPress={() => onSelect(option.value)}
            >
              {option.icon && (
                <Text style={styles.selectorOptionIcon}>{option.icon}</Text>
              )}
              <Text style={[
                styles.selectorOptionText,
                value === option.value && styles.selectorOptionTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🤖 AI Content Generator</Text>
          <Text style={styles.headerSubtitle}>
            Create engaging content for your business
          </Text>
        </View>

        {/* Content Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.contentTypeOptions}>
              {contentTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.contentTypeOption,
                    form.contentType === type.value && styles.contentTypeOptionActive
                  ]}
                  onPress={() => setForm({ ...form, contentType: type.value as any })}
                >
                  <Text style={[
                    styles.contentTypeText,
                    form.contentType === type.value && styles.contentTypeTextActive
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Platform Selector */}
        {renderSelector(
          'Platform',
          form.platform,
          platforms,
          (value) => setForm({ ...form, platform: value as any })
        )}

        {/* Tone Selector */}
        {renderSelector(
          'Tone',
          form.tone,
          tones,
          (value) => setForm({ ...form, tone: value as any })
        )}

        {/* Language Selector */}
        {renderSelector(
          'Language',
          form.language,
          languages,
          (value) => setForm({ ...form, language: value as any })
        )}

        {/* Prompt Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Prompt</Text>
          <TextInput
            style={styles.promptInput}
            value={form.prompt}
            onChangeText={(text) => setForm({ ...form, prompt: text })}
            placeholder="Describe what you want to promote (e.g., '50% off on fresh vegetables', 'expert laptop repair service', etc.)"
            placeholderTextColor="#999"
            multiline
            maxLength={300}
          />
          <Text style={styles.characterCount}>
            {form.prompt.length}/300 characters
          </Text>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
          onPress={generateContent}
          disabled={isGenerating}
        >
          <Text style={styles.generateButtonText}>
            {isGenerating ? 'Generating...' : 'Generate Content'}
          </Text>
        </TouchableOpacity>

        {/* Generated Content */}
        {generatedContent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Generated Content</Text>
            <View style={styles.contentContainer}>
              <Text style={styles.generatedContent}>{generatedContent}</Text>
              <View style={styles.contentActions}>
                <TouchableOpacity style={styles.actionButton} onPress={copyToClipboard}>
                  <Text style={styles.actionButtonText}>📋 Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={shareContent}>
                  <Text style={styles.actionButtonText}>📤 Share</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => setForm({ ...form, prompt: '' })}
                >
                  <Text style={styles.actionButtonText}>🔄 New</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  contentTypeOptions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  contentTypeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contentTypeOptionActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  contentTypeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  contentTypeTextActive: {
    color: '#fff',
  },
  selectorContainer: {
    marginBottom: 16,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  selectorOptions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  selectorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectorOptionActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  selectorOptionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  selectorOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectorOptionTextActive: {
    color: '#fff',
  },
  promptInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    paddingHorizontal: 20,
    marginTop: 4,
  },
  generateButton: {
    backgroundColor: '#2196F3',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  generatedContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  contentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});
