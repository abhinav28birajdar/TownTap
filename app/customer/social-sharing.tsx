import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  followers: number;
  isConnected: boolean;
  icon: string;
  color: string;
  lastPost?: string;
}

interface ShareableContent {
  id: string;
  type: 'booking' | 'review' | 'reward' | 'referral' | 'badge';
  title: string;
  description: string;
  previewText: string;
  points?: number;
}

const mockAccounts: SocialAccount[] = [
  {
    id: '1',
    platform: 'Instagram',
    username: '@johndoe',
    followers: 1250,
    isConnected: true,
    icon: 'logo-instagram',
    color: '#E4405F',
    lastPost: '2 days ago',
  },
  {
    id: '2',
    platform: 'Facebook',
    username: 'John Doe',
    followers: 890,
    isConnected: true,
    icon: 'logo-facebook',
    color: '#1877F2',
    lastPost: '1 week ago',
  },
  {
    id: '3',
    platform: 'Twitter',
    username: '@johnd',
    followers: 450,
    isConnected: false,
    icon: 'logo-twitter',
    color: '#1DA1F2',
  },
  {
    id: '4',
    platform: 'WhatsApp',
    username: '+91 98765 43210',
    followers: 0,
    isConnected: true,
    icon: 'logo-whatsapp',
    color: '#25D366',
  },
  {
    id: '5',
    platform: 'LinkedIn',
    username: 'john-doe',
    followers: 320,
    isConnected: false,
    icon: 'logo-linkedin',
    color: '#0A66C2',
  },
];

const mockShareable: ShareableContent[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Share Booking',
    description: 'Let friends know about your service booking',
    previewText: 'Just booked a home cleaning service on TownTap! 🏠✨',
    points: 10,
  },
  {
    id: '2',
    type: 'review',
    title: 'Share Review',
    description: 'Share your service experience with others',
    previewText: 'Had an amazing experience with CleanPro! ⭐⭐⭐⭐⭐',
    points: 25,
  },
  {
    id: '3',
    type: 'reward',
    title: 'Share Achievement',
    description: 'Celebrate your rewards and badges',
    previewText: 'Just earned Gold member status on TownTap! 🏆',
    points: 15,
  },
  {
    id: '4',
    type: 'referral',
    title: 'Refer a Friend',
    description: 'Invite friends and earn rewards together',
    previewText: 'Join TownTap using my code and get ₹200 off! Use: JOHN200',
    points: 100,
  },
];

export default function SocialSharingScreen() {
  const colors = useColors();
  const [accounts, setAccounts] = useState<SocialAccount[]>(mockAccounts);
  const [selectedContent, setSelectedContent] = useState<ShareableContent | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialAccount | null>(null);
  const [shareText, setShareText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [totalShares, setTotalShares] = useState(45);
  const [totalPoints, setTotalPoints] = useState(850);

  const connectedAccounts = accounts.filter((a) => a.isConnected);
  const disconnectedAccounts = accounts.filter((a) => !a.isConnected);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleShare = async (content: ShareableContent) => {
    setSelectedContent(content);
    setShareText(content.previewText);
    setShowShareModal(true);
  };

  const performShare = async (platform?: string) => {
    if (!selectedContent) return;

    try {
      if (platform === 'native') {
        await Share.share({
          message: shareText,
          title: selectedContent.title,
        });
      } else {
        // Simulate platform-specific sharing
        console.log(`Sharing to ${platform}: ${shareText}`);
      }

      setTotalShares((prev) => prev + 1);
      if (selectedContent.points) {
        setTotalPoints((prev) => prev + selectedContent.points!);
      }
      setShowShareModal(false);
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleConnect = (account: SocialAccount) => {
    setSelectedPlatform(account);
    setShowConnectModal(true);
  };

  const confirmConnect = () => {
    if (!selectedPlatform) return;
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === selectedPlatform.id ? { ...a, isConnected: true } : a
      )
    );
    setShowConnectModal(false);
  };

  const handleDisconnect = (accountId: string) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId ? { ...a, isConnected: false } : a
      )
    );
  };

  const renderAccount = ({ item }: { item: SocialAccount }) => (
    <View style={[styles.accountCard, { backgroundColor: colors.card }]}>
      <View style={[styles.accountIcon, { backgroundColor: item.color + '15' }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <View style={styles.accountInfo}>
        <ThemedText style={styles.accountPlatform}>{item.platform}</ThemedText>
        <ThemedText style={[styles.accountUsername, { color: colors.textSecondary }]}>
          {item.username}
        </ThemedText>
        {item.followers > 0 && (
          <ThemedText style={[styles.accountFollowers, { color: colors.textSecondary }]}>
            {item.followers.toLocaleString()} followers
          </ThemedText>
        )}
      </View>
      {item.isConnected ? (
        <View style={styles.accountActions}>
          <View style={[styles.connectedBadge, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <ThemedText style={[styles.connectedText, { color: colors.success }]}>
              Connected
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.disconnectBtn}
            onPress={() => handleDisconnect(item.id)}
          >
            <Ionicons name="unlink" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.connectBtn, { backgroundColor: item.color }]}
          onPress={() => handleConnect(item)}
        >
          <ThemedText style={styles.connectBtnText}>Connect</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderShareable = ({ item }: { item: ShareableContent }) => {
    const getTypeIcon = () => {
      switch (item.type) {
        case 'booking':
          return 'calendar';
        case 'review':
          return 'star';
        case 'reward':
          return 'trophy';
        case 'referral':
          return 'people';
        default:
          return 'share';
      }
    };

    return (
      <TouchableOpacity
        style={[styles.shareableCard, { backgroundColor: colors.card }]}
        onPress={() => handleShare(item)}
      >
        <View style={[styles.shareableIcon, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name={getTypeIcon() as any} size={22} color={colors.primary} />
        </View>
        <View style={styles.shareableInfo}>
          <ThemedText style={styles.shareableTitle}>{item.title}</ThemedText>
          <ThemedText style={[styles.shareableDesc, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.description}
          </ThemedText>
        </View>
        {item.points && (
          <View style={[styles.pointsBadge, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="diamond" size={12} color={colors.success} />
            <ThemedText style={[styles.pointsText, { color: colors.success }]}>
              +{item.points}
            </ThemedText>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Social Sharing</ThemedText>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Stats Card */}
        <LinearGradient
          colors={[colors.primary, '#2D4A3E']}
          style={styles.statsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="share-social" size={20} color="#fff" />
              </View>
              <ThemedText style={styles.statValue}>{totalShares}</ThemedText>
              <ThemedText style={styles.statLabel}>Total Shares</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="diamond" size={20} color="#FFB800" />
              </View>
              <ThemedText style={styles.statValue}>{totalPoints}</ThemedText>
              <ThemedText style={styles.statLabel}>Points Earned</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="link" size={20} color="#fff" />
              </View>
              <ThemedText style={styles.statValue}>{connectedAccounts.length}</ThemedText>
              <ThemedText style={styles.statLabel}>Connected</ThemedText>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Share */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick Share</ThemedText>
          <View style={styles.quickShareRow}>
            {connectedAccounts.slice(0, 4).map((account) => (
              <TouchableOpacity
                key={account.id}
                style={[styles.quickShareBtn, { backgroundColor: account.color + '15' }]}
                onPress={() => {
                  setShareText('Check out TownTap for amazing local services! 🚀');
                  performShare(account.platform);
                }}
              >
                <Ionicons name={account.icon as any} size={24} color={account.color} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.quickShareBtn, { backgroundColor: colors.card }]}
              onPress={() => performShare('native')}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Share & Earn */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Share & Earn</ThemedText>
            <View style={[styles.earnBadge, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="diamond" size={12} color={colors.success} />
              <ThemedText style={[styles.earnText, { color: colors.success }]}>
                Earn Points
              </ThemedText>
            </View>
          </View>
          {mockShareable.map((item) => (
            <View key={item.id}>{renderShareable({ item })}</View>
          ))}
        </View>

        {/* Connected Accounts */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Connected Accounts</ThemedText>
          {connectedAccounts.length > 0 ? (
            connectedAccounts.map((account) => (
              <View key={account.id}>{renderAccount({ item: account })}</View>
            ))
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Ionicons name="link-outline" size={40} color={colors.textSecondary} />
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                No accounts connected yet
              </ThemedText>
            </View>
          )}
        </View>

        {/* Available Connections */}
        {disconnectedAccounts.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Connect More Accounts</ThemedText>
            {disconnectedAccounts.map((account) => (
              <View key={account.id}>{renderAccount({ item: account })}</View>
            ))}
          </View>
        )}

        {/* Benefits */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Why Share?</ThemedText>
          <View style={[styles.benefitsCard, { backgroundColor: colors.card }]}>
            {[
              { icon: 'diamond', title: 'Earn Points', desc: 'Get points for every share', color: '#FFB800' },
              { icon: 'people', title: 'Grow Network', desc: 'Help friends discover services', color: colors.primary },
              { icon: 'gift', title: 'Exclusive Rewards', desc: 'Unlock special offers', color: colors.success },
              { icon: 'trending-up', title: 'Level Up', desc: 'Boost your membership tier', color: colors.info },
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={[styles.benefitIcon, { backgroundColor: benefit.color + '15' }]}>
                  <Ionicons name={benefit.icon as any} size={18} color={benefit.color} />
                </View>
                <View style={styles.benefitInfo}>
                  <ThemedText style={styles.benefitTitle}>{benefit.title}</ThemedText>
                  <ThemedText style={[styles.benefitDesc, { color: colors.textSecondary }]}>
                    {benefit.desc}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Share Modal */}
      <Modal visible={showShareModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowShareModal(false)}
        >
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.modalTitle}>Share</ThemedText>

            {/* Preview */}
            <View style={[styles.previewCard, { backgroundColor: colors.background }]}>
              <TextInput
                style={[styles.shareInput, { color: colors.text }]}
                value={shareText}
                onChangeText={setShareText}
                multiline
                placeholder="Write something..."
                placeholderTextColor={colors.textSecondary}
              />
              <ThemedText style={[styles.charCount, { color: colors.textSecondary }]}>
                {shareText.length}/280
              </ThemedText>
            </View>

            {/* Platform Selection */}
            <ThemedText style={[styles.modalLabel, { color: colors.textSecondary }]}>
              Share to
            </ThemedText>
            <View style={styles.platformGrid}>
              {connectedAccounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={[styles.platformBtn, { borderColor: account.color }]}
                  onPress={() => performShare(account.platform)}
                >
                  <Ionicons name={account.icon as any} size={24} color={account.color} />
                  <ThemedText style={[styles.platformName, { fontSize: 11 }]}>
                    {account.platform}
                  </ThemedText>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.platformBtn, { borderColor: colors.border }]}
                onPress={() => performShare('native')}
              >
                <Ionicons name="share-outline" size={24} color={colors.text} />
                <ThemedText style={[styles.platformName, { fontSize: 11 }]}>More</ThemedText>
              </TouchableOpacity>
            </View>

            {selectedContent?.points && (
              <View style={[styles.earnInfo, { backgroundColor: colors.success + '10' }]}>
                <Ionicons name="diamond" size={16} color={colors.success} />
                <ThemedText style={[styles.earnInfoText, { color: colors.success }]}>
                  Earn {selectedContent.points} points for sharing!
                </ThemedText>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Connect Modal */}
      <Modal visible={showConnectModal} transparent animationType="fade">
        <View style={styles.connectOverlay}>
          <View style={[styles.connectModal, { backgroundColor: colors.card }]}>
            {selectedPlatform && (
              <>
                <View
                  style={[
                    styles.connectIconBg,
                    { backgroundColor: selectedPlatform.color + '15' },
                  ]}
                >
                  <Ionicons
                    name={selectedPlatform.icon as any}
                    size={40}
                    color={selectedPlatform.color}
                  />
                </View>
                <ThemedText style={styles.connectTitle}>
                  Connect {selectedPlatform.platform}
                </ThemedText>
                <ThemedText style={[styles.connectDesc, { color: colors.textSecondary }]}>
                  Allow TownTap to share content on your behalf. You can disconnect anytime.
                </ThemedText>

                <View style={[styles.permissionsList, { backgroundColor: colors.background }]}>
                  {[
                    'Post updates on your timeline',
                    'Access your profile info',
                    'Share achievements and rewards',
                  ].map((perm, idx) => (
                    <View key={idx} style={styles.permissionItem}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <ThemedText style={[styles.permissionText, { color: colors.textSecondary }]}>
                        {perm}
                      </ThemedText>
                    </View>
                  ))}
                </View>

                <View style={styles.connectButtons}>
                  <TouchableOpacity
                    style={[styles.connectCancelBtn, { borderColor: colors.border }]}
                    onPress={() => setShowConnectModal(false)}
                  >
                    <ThemedText>Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.connectConfirmBtn, { backgroundColor: selectedPlatform.color }]}
                    onPress={confirmConnect}
                  >
                    <ThemedText style={styles.connectConfirmText}>Connect</ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  statsCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  earnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  earnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  quickShareRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  quickShareBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  shareableIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shareableInfo: {
    flex: 1,
    marginRight: 8,
  },
  shareableTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  shareableDesc: {
    fontSize: 12,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
  },
  pointsText: {
    fontSize: 11,
    fontWeight: '600',
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountPlatform: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  accountUsername: {
    fontSize: 13,
    marginBottom: 2,
  },
  accountFollowers: {
    fontSize: 11,
  },
  accountActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  connectedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  disconnectBtn: {
    padding: 6,
  },
  connectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  connectBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    marginHorizontal: 16,
    padding: 30,
    borderRadius: 14,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10,
  },
  benefitsCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitInfo: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  previewCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  shareInput: {
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 8,
  },
  modalLabel: {
    fontSize: 13,
    marginBottom: 12,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  platformBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: (width - 72) / 4,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  platformName: {
    marginTop: 6,
    fontWeight: '500',
  },
  earnInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 12,
  },
  earnInfoText: {
    fontSize: 13,
    fontWeight: '600',
  },
  connectOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  connectModal: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  connectIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  connectTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  connectDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionsList: {
    width: '100%',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  permissionText: {
    fontSize: 13,
  },
  connectButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  connectCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  connectConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  connectConfirmText: {
    color: '#fff',
    fontWeight: '600',
  },
});
