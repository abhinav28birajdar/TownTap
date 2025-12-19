import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface ReportCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
}

const reportCategories: ReportCategory[] = [
  {
    id: 'service',
    title: 'Service Issue',
    icon: 'construct',
    description: 'Problems with service quality or delivery',
    color: '#415D43',
  },
  {
    id: 'provider',
    title: 'Provider Behavior',
    icon: 'person',
    description: 'Unprofessional or inappropriate conduct',
    color: '#E53935',
  },
  {
    id: 'safety',
    title: 'Safety Concern',
    icon: 'shield-checkmark',
    description: 'Report safety or security issues',
    color: '#FF9800',
  },
  {
    id: 'fraud',
    title: 'Fraud / Scam',
    icon: 'warning',
    description: 'Suspicious or fraudulent activity',
    color: '#D32F2F',
  },
  {
    id: 'billing',
    title: 'Billing Issue',
    icon: 'card',
    description: 'Incorrect charges or payment problems',
    color: '#2196F3',
  },
  {
    id: 'app',
    title: 'App Problem',
    icon: 'bug',
    description: 'Bugs, crashes, or technical issues',
    color: '#9C27B0',
  },
  {
    id: 'other',
    title: 'Other',
    icon: 'ellipsis-horizontal',
    description: 'Something not listed above',
    color: '#607D8B',
  },
];

const urgencyLevels = [
  { id: 'low', label: 'Low', description: 'Can wait a few days', icon: 'time', color: '#4CAF50' },
  { id: 'medium', label: 'Medium', description: 'Needs attention soon', icon: 'alert-circle', color: '#FF9800' },
  { id: 'high', label: 'High', description: 'Urgent issue', icon: 'warning', color: '#F44336' },
];

export default function ReportIssueScreen() {
  const colors = useColors();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedUrgency, setSelectedUrgency] = useState('medium');
  const [description, setDescription] = useState('');
  const [relatedBookingId, setRelatedBookingId] = useState('');
  const [contactPreference, setContactPreference] = useState('email');
  const [showSuccess, setShowSuccess] = useState(false);

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedCategory !== null;
      case 2:
        return description.length >= 20;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    // In real app, submit the report
    setShowSuccess(true);
  };

  const getCategoryById = (id: string) =>
    reportCategories.find((cat) => cat.id === id);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (step > 1 ? setStep(step - 1) : router.back())} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Report an Issue</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressSteps}>
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <View
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: step >= s ? colors.primary : colors.border,
                  },
                ]}
              >
                {step > s && <Ionicons name="checkmark" size={12} color="#fff" />}
                {step === s && <ThemedText style={styles.progressDotText}>{s}</ThemedText>}
                {step < s && <ThemedText style={[styles.progressDotText, { color: colors.textSecondary }]}>{s}</ThemedText>}
              </View>
              {s < 3 && (
                <View
                  style={[
                    styles.progressLine,
                    { backgroundColor: step > s ? colors.primary : colors.border },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>
        <View style={styles.progressLabels}>
          <ThemedText style={[styles.progressLabel, step === 1 && { color: colors.primary }]}>
            Category
          </ThemedText>
          <ThemedText style={[styles.progressLabel, step === 2 && { color: colors.primary }]}>
            Details
          </ThemedText>
          <ThemedText style={[styles.progressLabel, step === 3 && { color: colors.primary }]}>
            Review
          </ThemedText>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Step 1: Select Category */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <ThemedText style={styles.stepTitle}>What's the issue about?</ThemedText>
            <ThemedText style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
              Select the category that best describes your issue
            </ThemedText>

            <View style={styles.categoriesGrid}>
              {reportCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor:
                        selectedCategory === category.id
                          ? category.color + '15'
                          : colors.card,
                      borderColor:
                        selectedCategory === category.id ? category.color : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: category.color + '20' },
                    ]}
                  >
                    <Ionicons name={category.icon as any} size={24} color={category.color} />
                  </View>
                  <ThemedText style={styles.categoryTitle}>{category.title}</ThemedText>
                  <ThemedText
                    style={[styles.categoryDesc, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {category.description}
                  </ThemedText>
                  {selectedCategory === category.id && (
                    <View style={[styles.selectedCheck, { backgroundColor: category.color }]}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Describe Issue */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <View style={styles.selectedCategoryBadge}>
              {selectedCategory && (
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: getCategoryById(selectedCategory)?.color + '15' },
                  ]}
                >
                  <Ionicons
                    name={getCategoryById(selectedCategory)?.icon as any}
                    size={16}
                    color={getCategoryById(selectedCategory)?.color}
                  />
                  <ThemedText
                    style={[
                      styles.categoryBadgeText,
                      { color: getCategoryById(selectedCategory)?.color },
                    ]}
                  >
                    {getCategoryById(selectedCategory)?.title}
                  </ThemedText>
                </View>
              )}
            </View>

            <ThemedText style={styles.stepTitle}>Tell us more</ThemedText>
            <ThemedText style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
              Please describe the issue in detail so we can help you better
            </ThemedText>

            {/* Description */}
            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>Description *</ThemedText>
              <TextInput
                style={[
                  styles.textArea,
                  { backgroundColor: colors.card, color: colors.text },
                ]}
                placeholder="Describe your issue in detail..."
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={1000}
              />
              <View style={styles.charCount}>
                <ThemedText
                  style={[
                    styles.charCountText,
                    { color: description.length < 20 ? colors.error : colors.textSecondary },
                  ]}
                >
                  {description.length}/1000 (min 20 characters)
                </ThemedText>
              </View>
            </View>

            {/* Related Booking */}
            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>Related Booking ID (Optional)</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.card, color: colors.text }]}
                placeholder="e.g., BKG-2024-1234"
                placeholderTextColor={colors.textSecondary}
                value={relatedBookingId}
                onChangeText={setRelatedBookingId}
              />
            </View>

            {/* Urgency */}
            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>Urgency Level</ThemedText>
              <View style={styles.urgencyOptions}>
                {urgencyLevels.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.urgencyOption,
                      {
                        backgroundColor:
                          selectedUrgency === level.id ? level.color + '15' : colors.card,
                        borderColor:
                          selectedUrgency === level.id ? level.color : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedUrgency(level.id)}
                  >
                    <Ionicons
                      name={level.icon as any}
                      size={20}
                      color={selectedUrgency === level.id ? level.color : colors.textSecondary}
                    />
                    <ThemedText
                      style={[
                        styles.urgencyLabel,
                        { color: selectedUrgency === level.id ? level.color : colors.text },
                      ]}
                    >
                      {level.label}
                    </ThemedText>
                    <ThemedText
                      style={[styles.urgencyDesc, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {level.description}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Attachments */}
            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>Attachments (Optional)</ThemedText>
              <TouchableOpacity
                style={[styles.attachButton, { borderColor: colors.border }]}
              >
                <Ionicons name="camera" size={24} color={colors.primary} />
                <ThemedText style={[styles.attachText, { color: colors.primary }]}>
                  Add Photos or Screenshots
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <ThemedText style={styles.stepTitle}>Review Your Report</ThemedText>
            <ThemedText style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
              Please review the details before submitting
            </ThemedText>

            <View style={[styles.reviewCard, { backgroundColor: colors.card }]}>
              {/* Category */}
              <View style={styles.reviewRow}>
                <ThemedText style={[styles.reviewLabel, { color: colors.textSecondary }]}>
                  Category
                </ThemedText>
                {selectedCategory && (
                  <View style={styles.reviewValueRow}>
                    <Ionicons
                      name={getCategoryById(selectedCategory)?.icon as any}
                      size={18}
                      color={getCategoryById(selectedCategory)?.color}
                    />
                    <ThemedText style={styles.reviewValue}>
                      {getCategoryById(selectedCategory)?.title}
                    </ThemedText>
                  </View>
                )}
              </View>

              <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />

              {/* Urgency */}
              <View style={styles.reviewRow}>
                <ThemedText style={[styles.reviewLabel, { color: colors.textSecondary }]}>
                  Urgency
                </ThemedText>
                <View
                  style={[
                    styles.urgencyBadge,
                    {
                      backgroundColor:
                        urgencyLevels.find((u) => u.id === selectedUrgency)?.color + '15',
                    },
                  ]}
                >
                  <ThemedText
                    style={{
                      color: urgencyLevels.find((u) => u.id === selectedUrgency)?.color,
                      fontSize: 13,
                      fontWeight: '600',
                    }}
                  >
                    {urgencyLevels.find((u) => u.id === selectedUrgency)?.label}
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />

              {/* Description */}
              <View style={styles.reviewRow}>
                <ThemedText style={[styles.reviewLabel, { color: colors.textSecondary }]}>
                  Description
                </ThemedText>
                <ThemedText style={styles.reviewValue} numberOfLines={4}>
                  {description}
                </ThemedText>
              </View>

              {relatedBookingId && (
                <>
                  <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.reviewRow}>
                    <ThemedText style={[styles.reviewLabel, { color: colors.textSecondary }]}>
                      Booking ID
                    </ThemedText>
                    <ThemedText style={[styles.reviewValue, { color: colors.primary }]}>
                      {relatedBookingId}
                    </ThemedText>
                  </View>
                </>
              )}
            </View>

            {/* Contact Preference */}
            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>How should we contact you?</ThemedText>
              <View style={styles.contactOptions}>
                {[
                  { id: 'email', label: 'Email', icon: 'mail' },
                  { id: 'phone', label: 'Phone', icon: 'call' },
                  { id: 'app', label: 'In-App', icon: 'notifications' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.contactOption,
                      {
                        backgroundColor:
                          contactPreference === option.id ? colors.primary + '15' : colors.card,
                        borderColor:
                          contactPreference === option.id ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setContactPreference(option.id)}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={contactPreference === option.id ? colors.primary : colors.textSecondary}
                    />
                    <ThemedText
                      style={[
                        styles.contactOptionText,
                        { color: contactPreference === option.id ? colors.primary : colors.text },
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Info */}
            <View style={[styles.infoCard, { backgroundColor: colors.info + '10' }]}>
              <Ionicons name="information-circle" size={20} color={colors.info} />
              <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
                Our team will review your report and get back to you within 24-48 hours.
              </ThemedText>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {step < 3 ? (
          <TouchableOpacity
            style={[
              styles.continueButton,
              { backgroundColor: canProceed() ? colors.primary : colors.border },
            ]}
            onPress={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
            <ThemedText
              style={[
                styles.continueText,
                { color: canProceed() ? '#fff' : colors.textSecondary },
              ]}
            >
              Continue
            </ThemedText>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={canProceed() ? '#fff' : colors.textSecondary}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
          >
            <Ionicons name="send" size={20} color="#fff" />
            <ThemedText style={styles.submitText}>Submit Report</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccess} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.successModal, { backgroundColor: colors.card }]}>
            <View style={[styles.successIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            </View>
            <ThemedText style={styles.successTitle}>Report Submitted!</ThemedText>
            <ThemedText style={[styles.successText, { color: colors.textSecondary }]}>
              Your report has been submitted successfully. We'll review it and get back to you soon.
            </ThemedText>
            <View style={[styles.ticketInfo, { backgroundColor: colors.primary + '10' }]}>
              <ThemedText style={[styles.ticketLabel, { color: colors.primary }]}>
                Reference Number
              </ThemedText>
              <ThemedText style={styles.ticketNumber}>RPT-2024-{Math.floor(Math.random() * 10000)}</ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setShowSuccess(false);
                router.back();
              }}
            >
              <ThemedText style={styles.doneText}>Done</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressLine: {
    width: 60,
    height: 3,
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 10,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  stepContent: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    position: 'relative',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  selectedCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCategoryBadge: {
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  textArea: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    height: 140,
  },
  charCount: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  charCountText: {
    fontSize: 12,
  },
  urgencyOptions: {
    gap: 10,
  },
  urgencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  urgencyLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  urgencyDesc: {
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 10,
  },
  attachText: {
    fontSize: 15,
    fontWeight: '500',
  },
  reviewCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  reviewRow: {
    paddingVertical: 10,
  },
  reviewLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  reviewValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewValue: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  reviewDivider: {
    height: 1,
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  contactOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  contactOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  contactOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    marginHorizontal: 30,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: width - 60,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  ticketInfo: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  ticketLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  ticketNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  doneButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
