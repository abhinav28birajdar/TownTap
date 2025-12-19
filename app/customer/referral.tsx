import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Clipboard,
    Image,
    ScrollView,
    Share,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalEarnings: number;
}

interface ReferredFriend {
  id: string;
  name: string;
  avatar?: string;
  status: 'pending' | 'joined' | 'booked' | 'earned';
  joinedDate?: string;
  earnedAmount?: number;
}

export default function ReferralProgramScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<'invite' | 'history'>('invite');
  
  // Sample data
  const referralCode = 'TOWNUSER2024';
  const referralLink = `https://towntap.app/ref/${referralCode}`;
  const earnPerReferral = 100;
  const friendGetsAmount = 50;
  
  const stats: ReferralStats = {
    totalReferrals: 12,
    pendingReferrals: 3,
    completedReferrals: 9,
    totalEarnings: 900,
  };

  const referredFriends: ReferredFriend[] = [
    {
      id: '1',
      name: 'Rahul Sharma',
      status: 'earned',
      joinedDate: 'Dec 15, 2024',
      earnedAmount: 100,
    },
    {
      id: '2',
      name: 'Priya Patel',
      status: 'booked',
      joinedDate: 'Dec 18, 2024',
    },
    {
      id: '3',
      name: 'Amit Kumar',
      status: 'joined',
      joinedDate: 'Dec 20, 2024',
    },
    {
      id: '4',
      name: 'Sneha Gupta',
      status: 'pending',
    },
  ];

  const copyReferralCode = async () => {
    Clipboard.setString(referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const copyReferralLink = async () => {
    Clipboard.setString(referralLink);
    Alert.alert('Copied!', 'Referral link copied to clipboard');
  };

  const shareReferral = async () => {
    try {
      await Share.share({
        message: `Join TownTap and get ₹${friendGetsAmount} off on your first booking! Use my referral code: ${referralCode}\n\nDownload now: ${referralLink}`,
        title: 'Join TownTap',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const getStatusColor = (status: ReferredFriend['status']) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'joined': return colors.info;
      case 'booked': return colors.primary;
      case 'earned': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: ReferredFriend['status']) => {
    switch (status) {
      case 'pending': return 'Invite Sent';
      case 'joined': return 'Joined';
      case 'booked': return 'First Booking';
      case 'earned': return 'Reward Earned';
      default: return status;
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
        <TouchableOpacity onPress={() => router.push('/customer/help-support')}>
          <Ionicons name="help-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <LinearGradient
          colors={[colors.primary, '#2D4A3E']}
          style={styles.heroBanner}
        >
          <Image
            source={{ uri: 'https://via.placeholder.com/120' }}
            style={styles.heroImage}
          />
          <ThemedText style={styles.heroTitle}>
            Invite Friends & Earn ₹{earnPerReferral}
          </ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Your friends get ₹{friendGetsAmount} off on their first booking
          </ThemedText>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="people" size={20} color={colors.primary} />
            </View>
            <ThemedText style={styles.statValue}>{stats.totalReferrals}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Referrals
            </ThemedText>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="wallet" size={20} color={colors.success} />
            </View>
            <ThemedText style={styles.statValue}>₹{stats.totalEarnings}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Earnings
            </ThemedText>
          </View>
        </View>

        {/* Tab Selection */}
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
                { color: activeTab === 'invite' ? '#FFF' : colors.textSecondary },
              ]}
            >
              Invite Friends
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'history' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setActiveTab('history')}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: activeTab === 'history' ? '#FFF' : colors.textSecondary },
              ]}
            >
              Referral History
            </ThemedText>
          </TouchableOpacity>
        </View>

        {activeTab === 'invite' ? (
          <>
            {/* Referral Code Section */}
            <View style={[styles.codeSection, { backgroundColor: colors.card }]}>
              <ThemedText style={styles.codeSectionTitle}>Your Referral Code</ThemedText>
              
              <View style={[styles.codeBox, { borderColor: colors.primary }]}>
                <ThemedText style={[styles.codeText, { color: colors.primary }]}>
                  {referralCode}
                </ThemedText>
                <TouchableOpacity onPress={copyReferralCode} style={styles.copyButton}>
                  <Ionicons name="copy" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.linkBox}>
                <View style={styles.linkContent}>
                  <Ionicons name="link" size={18} color={colors.textSecondary} />
                  <ThemedText 
                    style={[styles.linkText, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {referralLink}
                  </ThemedText>
                </View>
                <TouchableOpacity onPress={copyReferralLink}>
                  <ThemedText style={[styles.copyLinkText, { color: colors.primary }]}>
                    Copy
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Share Options */}
            <View style={styles.shareSection}>
              <ThemedText style={styles.shareTitle}>Share Via</ThemedText>
              
              <View style={styles.shareButtons}>
                <TouchableOpacity 
                  style={[styles.shareButton, { backgroundColor: '#25D366' }]}
                  onPress={shareReferral}
                >
                  <Ionicons name="logo-whatsapp" size={28} color="#FFF" />
                  <ThemedText style={styles.shareButtonText}>WhatsApp</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.shareButton, { backgroundColor: '#0088cc' }]}
                  onPress={shareReferral}
                >
                  <Ionicons name="paper-plane" size={28} color="#FFF" />
                  <ThemedText style={styles.shareButtonText}>Telegram</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.shareButton, { backgroundColor: '#3b5998' }]}
                  onPress={shareReferral}
                >
                  <Ionicons name="logo-facebook" size={28} color="#FFF" />
                  <ThemedText style={styles.shareButtonText}>Facebook</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.shareButton, { backgroundColor: colors.textSecondary }]}
                  onPress={shareReferral}
                >
                  <Ionicons name="share-social" size={28} color="#FFF" />
                  <ThemedText style={styles.shareButtonText}>More</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* How It Works */}
            <View style={[styles.howItWorksSection, { backgroundColor: colors.card }]}>
              <ThemedText style={styles.sectionTitle}>How It Works</ThemedText>
              
              <View style={styles.stepContainer}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <ThemedText style={styles.stepNumberText}>1</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={styles.stepTitle}>Share Your Code</ThemedText>
                  <ThemedText style={[styles.stepDescription, { color: colors.textSecondary }]}>
                    Share your unique referral code with friends via WhatsApp, SMS, or social media
                  </ThemedText>
                </View>
              </View>
              
              <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
              
              <View style={styles.stepContainer}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <ThemedText style={styles.stepNumberText}>2</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={styles.stepTitle}>Friend Signs Up</ThemedText>
                  <ThemedText style={[styles.stepDescription, { color: colors.textSecondary }]}>
                    Your friend creates an account using your referral code and gets ₹{friendGetsAmount} off
                  </ThemedText>
                </View>
              </View>
              
              <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
              
              <View style={styles.stepContainer}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <ThemedText style={styles.stepNumberText}>3</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={styles.stepTitle}>You Earn ₹{earnPerReferral}</ThemedText>
                  <ThemedText style={[styles.stepDescription, { color: colors.textSecondary }]}>
                    Once your friend completes their first booking, you receive ₹{earnPerReferral} in your wallet
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Terms */}
            <View style={styles.termsSection}>
              <ThemedText style={[styles.termsTitle, { color: colors.textSecondary }]}>
                Terms & Conditions
              </ThemedText>
              <ThemedText style={[styles.termsText, { color: colors.textSecondary }]}>
                • Referral reward is credited after friend's first booking{'\n'}
                • Both referrer and referee must have verified accounts{'\n'}
                • Rewards expire 90 days after being credited{'\n'}
                • Maximum 50 referrals per month
              </ThemedText>
            </View>
          </>
        ) : (
          /* Referral History Tab */
          <View style={styles.historySection}>
            {/* Pending vs Completed Stats */}
            <View style={styles.historyStats}>
              <View style={[styles.historyStatCard, { backgroundColor: colors.warning + '10' }]}>
                <Ionicons name="hourglass" size={20} color={colors.warning} />
                <ThemedText style={styles.historyStatValue}>{stats.pendingReferrals}</ThemedText>
                <ThemedText style={[styles.historyStatLabel, { color: colors.textSecondary }]}>
                  Pending
                </ThemedText>
              </View>
              
              <View style={[styles.historyStatCard, { backgroundColor: colors.success + '10' }]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <ThemedText style={styles.historyStatValue}>{stats.completedReferrals}</ThemedText>
                <ThemedText style={[styles.historyStatLabel, { color: colors.textSecondary }]}>
                  Completed
                </ThemedText>
              </View>
            </View>

            {/* Referred Friends List */}
            <View style={styles.friendsList}>
              {referredFriends.map((friend) => (
                <View
                  key={friend.id}
                  style={[styles.friendCard, { backgroundColor: colors.card }]}
                >
                  <View style={[styles.friendAvatar, { backgroundColor: colors.primary + '20' }]}>
                    <ThemedText style={[styles.friendInitial, { color: colors.primary }]}>
                      {friend.name.charAt(0)}
                    </ThemedText>
                  </View>
                  
                  <View style={styles.friendInfo}>
                    <ThemedText style={styles.friendName}>{friend.name}</ThemedText>
                    {friend.joinedDate && (
                      <ThemedText style={[styles.friendDate, { color: colors.textSecondary }]}>
                        {friend.joinedDate}
                      </ThemedText>
                    )}
                  </View>
                  
                  <View style={styles.friendStatus}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(friend.status) + '15' }
                    ]}>
                      <ThemedText style={[
                        styles.statusText,
                        { color: getStatusColor(friend.status) }
                      ]}>
                        {getStatusLabel(friend.status)}
                      </ThemedText>
                    </View>
                    {friend.earnedAmount && (
                      <ThemedText style={[styles.earnedAmount, { color: colors.success }]}>
                        +₹{friend.earnedAmount}
                      </ThemedText>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {referredFriends.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
                <ThemedText style={styles.emptyTitle}>No Referrals Yet</ThemedText>
                <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                  Share your referral code with friends and start earning rewards
                </ThemedText>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomAction, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.shareMainButton, { backgroundColor: colors.primary }]}
          onPress={shareReferral}
        >
          <Ionicons name="share-social" size={22} color="#FFF" />
          <ThemedText style={styles.shareMainButtonText}>
            Invite Friends
          </ThemedText>
        </TouchableOpacity>
      </View>
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
  heroBanner: {
    margin: 16,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  heroImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  codeSection: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  codeSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  codeText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  copyButton: {
    marginLeft: 12,
    padding: 8,
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  linkText: {
    fontSize: 13,
    flex: 1,
  },
  copyLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  shareSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  shareButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareButton: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shareButtonText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '500',
  },
  howItWorksSection: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
    marginLeft: 12,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  stepLine: {
    width: 2,
    height: 24,
    marginLeft: 15,
    marginVertical: 8,
  },
  termsSection: {
    paddingHorizontal: 16,
    marginBottom: 100,
  },
  termsTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 20,
  },
  historySection: {
    paddingHorizontal: 16,
    marginBottom: 100,
  },
  historyStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  historyStatCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  historyStatValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  historyStatLabel: {
    fontSize: 12,
  },
  friendsList: {
    gap: 12,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendInitial: {
    fontSize: 20,
    fontWeight: '600',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  friendDate: {
    fontSize: 12,
  },
  friendStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  earnedAmount: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  shareMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  shareMainButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
