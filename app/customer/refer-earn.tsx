import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Clipboard,
    Dimensions,
    ScrollView,
    Share,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Referral {
  id: string;
  name: string;
  status: 'pending' | 'completed' | 'expired';
  date: string;
  reward?: number;
}

const mockReferrals: Referral[] = [
  { id: '1', name: 'Rahul Sharma', status: 'completed', date: '2024-01-15', reward: 200 },
  { id: '2', name: 'Priya Patel', status: 'completed', date: '2024-01-10', reward: 200 },
  { id: '3', name: 'Amit Kumar', status: 'pending', date: '2024-01-18' },
  { id: '4', name: 'Neha Singh', status: 'expired', date: '2024-01-01' },
];

export default function ReferEarnScreen() {
  const colors = useColors();
  const referralCode = 'TOWN2850';
  const [activeTab, setActiveTab] = useState<'invite' | 'referrals'>('invite');

  const totalEarned = mockReferrals
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + (r.reward || 0), 0);

  const pendingCount = mockReferrals.filter((r) => r.status === 'pending').length;

  const handleCopyCode = () => {
    Clipboard.setString(referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Use my referral code ${referralCode} to get ₹100 off on your first booking at TownTap! Download now: https://towntap.app/invite/${referralCode}`,
        title: 'Join TownTap',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusColor = (status: Referral['status']) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return '#FFC107';
      case 'expired':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: Referral['status']) => {
    switch (status) {
      case 'completed':
        return 'Reward Credited';
      case 'pending':
        return 'Signup Pending';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Refer & Earn</ThemedText>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={[colors.primary, colors.primary + 'CC']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroContent}>
              <View style={styles.giftIcon}>
                <Ionicons name="gift" size={40} color="#fff" />
              </View>
              <ThemedText style={styles.heroTitle}>Give ₹100, Get ₹200</ThemedText>
              <ThemedText style={styles.heroSubtitle}>
                Invite friends to TownTap. They get ₹100 off, you get ₹200 when they complete their first booking!
              </ThemedText>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>₹{totalEarned}</ThemedText>
                <ThemedText style={styles.statLabel}>Total Earned</ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {mockReferrals.filter((r) => r.status === 'completed').length}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Successful</ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{pendingCount}</ThemedText>
                <ThemedText style={styles.statLabel}>Pending</ThemedText>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Referral Code Section */}
        <View style={styles.codeSection}>
          <ThemedText style={styles.sectionTitle}>Your Referral Code</ThemedText>
          <View style={[styles.codeCard, { backgroundColor: colors.card }]}>
            <View style={styles.codeBox}>
              <View
                style={[styles.codeContainer, { backgroundColor: colors.background }]}
              >
                <ThemedText style={[styles.codeText, { color: colors.primary }]}>
                  {referralCode}
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[styles.copyButton, { backgroundColor: colors.primary + '15' }]}
                onPress={handleCopyCode}
              >
                <Ionicons name="copy-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: colors.primary }]}
              onPress={handleShare}
            >
              <Ionicons name="share-social" size={20} color="#fff" />
              <ThemedText style={styles.shareText}>Share Invite Link</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share Options */}
        <View style={styles.shareOptions}>
          <ThemedText style={styles.shareOptionsTitle}>Share via</ThemedText>
          <View style={styles.shareGrid}>
            <TouchableOpacity
              style={[styles.shareOption, { backgroundColor: '#25D366' }]}
              onPress={handleShare}
            >
              <Ionicons name="logo-whatsapp" size={28} color="#fff" />
              <ThemedText style={styles.shareOptionText}>WhatsApp</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.shareOption, { backgroundColor: '#0088cc' }]}
              onPress={handleShare}
            >
              <Ionicons name="send" size={28} color="#fff" />
              <ThemedText style={styles.shareOptionText}>Telegram</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.shareOption, { backgroundColor: '#E4405F' }]}
              onPress={handleShare}
            >
              <Ionicons name="logo-instagram" size={28} color="#fff" />
              <ThemedText style={styles.shareOptionText}>Instagram</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.shareOption, { backgroundColor: colors.text }]}
              onPress={handleShare}
            >
              <Ionicons name="ellipsis-horizontal" size={28} color="#fff" />
              <ThemedText style={styles.shareOptionText}>More</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabSection}>
          <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'invite' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab('invite')}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: activeTab === 'invite' ? '#fff' : colors.textSecondary },
                ]}
              >
                How it Works
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'referrals' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab('referrals')}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: activeTab === 'referrals' ? '#fff' : colors.textSecondary },
                ]}
              >
                My Referrals
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === 'invite' ? (
          /* How it Works */
          <View style={styles.howItWorks}>
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.stepNumberText}>1</ThemedText>
              </View>
              <View style={[styles.stepLine, { backgroundColor: colors.primary }]} />
              <View style={styles.stepContent}>
                <View
                  style={[styles.stepIcon, { backgroundColor: colors.primary + '15' }]}
                >
                  <Ionicons name="share-social-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.stepInfo}>
                  <ThemedText style={styles.stepTitle}>Share Your Code</ThemedText>
                  <ThemedText style={[styles.stepDesc, { color: colors.textSecondary }]}>
                    Share your unique referral code with friends and family
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.stepNumberText}>2</ThemedText>
              </View>
              <View style={[styles.stepLine, { backgroundColor: colors.primary }]} />
              <View style={styles.stepContent}>
                <View
                  style={[styles.stepIcon, { backgroundColor: colors.success + '15' }]}
                >
                  <Ionicons name="person-add-outline" size={24} color={colors.success} />
                </View>
                <View style={styles.stepInfo}>
                  <ThemedText style={styles.stepTitle}>Friend Signs Up</ThemedText>
                  <ThemedText style={[styles.stepDesc, { color: colors.textSecondary }]}>
                    Your friend downloads TownTap and uses your code
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.stepNumberText}>3</ThemedText>
              </View>
              <View style={[styles.stepLine, { backgroundColor: colors.primary }]} />
              <View style={styles.stepContent}>
                <View
                  style={[styles.stepIcon, { backgroundColor: '#FFC107' + '25' }]}
                >
                  <Ionicons name="calendar-outline" size={24} color="#FFC107" />
                </View>
                <View style={styles.stepInfo}>
                  <ThemedText style={styles.stepTitle}>First Booking</ThemedText>
                  <ThemedText style={[styles.stepDesc, { color: colors.textSecondary }]}>
                    They get ₹100 off on their first service booking
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={[styles.step, { marginBottom: 0 }]}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.stepNumberText}>4</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <View
                  style={[styles.stepIcon, { backgroundColor: colors.primary + '15' }]}
                >
                  <Ionicons name="gift-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.stepInfo}>
                  <ThemedText style={styles.stepTitle}>You Earn ₹200</ThemedText>
                  <ThemedText style={[styles.stepDesc, { color: colors.textSecondary }]}>
                    Once they complete the booking, you get ₹200 in your wallet!
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* My Referrals */
          <View style={styles.referralsList}>
            {mockReferrals.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={60} color={colors.textSecondary} />
                <ThemedText style={styles.emptyTitle}>No Referrals Yet</ThemedText>
                <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                  Start sharing your code to earn rewards
                </ThemedText>
              </View>
            ) : (
              mockReferrals.map((referral) => (
                <View
                  key={referral.id}
                  style={[styles.referralCard, { backgroundColor: colors.card }]}
                >
                  <View style={styles.referralAvatar}>
                    <ThemedText style={styles.avatarText}>
                      {referral.name.charAt(0)}
                    </ThemedText>
                  </View>
                  <View style={styles.referralInfo}>
                    <ThemedText style={styles.referralName}>{referral.name}</ThemedText>
                    <ThemedText
                      style={[styles.referralDate, { color: colors.textSecondary }]}
                    >
                      Invited on {new Date(referral.date).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <View style={styles.referralStatus}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(referral.status) + '15' },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.statusText,
                          { color: getStatusColor(referral.status) },
                        ]}
                      >
                        {getStatusText(referral.status)}
                      </ThemedText>
                    </View>
                    {referral.reward && (
                      <ThemedText style={[styles.rewardText, { color: colors.success }]}>
                        +₹{referral.reward}
                      </ThemedText>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Terms */}
        <View style={[styles.termsCard, { backgroundColor: colors.card }]}>
          <View style={styles.termsHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <ThemedText style={styles.termsTitle}>Terms & Conditions</ThemedText>
          </View>
          <View style={styles.termsList}>
            <ThemedText style={[styles.termItem, { color: colors.textSecondary }]}>
              • Referral reward is credited after friend's first booking is completed
            </ThemedText>
            <ThemedText style={[styles.termItem, { color: colors.textSecondary }]}>
              • Friend must sign up within 30 days of receiving the code
            </ThemedText>
            <ThemedText style={[styles.termItem, { color: colors.textSecondary }]}>
              • No limit on number of referrals
            </ThemedText>
            <ThemedText style={[styles.termItem, { color: colors.textSecondary }]}>
              • TownTap reserves the right to modify program terms
            </ThemedText>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  heroCard: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 24,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  giftIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  codeSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  codeCard: {
    padding: 16,
    borderRadius: 14,
  },
  codeBox: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  codeContainer: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.1)',
  },
  codeText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  copyButton: {
    width: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  shareText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  shareOptions: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  shareOptionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  shareGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  shareOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  shareOptionText: {
    color: '#fff',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  tabSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  howItWorks: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  step: {
    marginBottom: 20,
    position: 'relative',
  },
  stepNumber: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  stepLine: {
    position: 'absolute',
    left: 13,
    top: 28,
    width: 2,
    height: 60,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 44,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepInfo: {
    flex: 1,
    marginLeft: 12,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  referralsList: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 14,
  },
  referralCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  referralAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1976D2',
  },
  referralInfo: {
    flex: 1,
    marginLeft: 12,
  },
  referralName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  referralDate: {
    fontSize: 12,
  },
  referralStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  termsCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
  },
  termsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  termsList: {
    gap: 6,
  },
  termItem: {
    fontSize: 12,
    lineHeight: 18,
  },
});
