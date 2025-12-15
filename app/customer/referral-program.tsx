/**
 * Referral Program Page - Phase 11
 * Refer friends and earn rewards
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { BorderRadius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Clipboard,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ReferralProgramPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthStore();

  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({
    total_referrals: 0,
    successful_referrals: 0,
    earnings: 0,
  });

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('code, total_referrals, successful_referrals, earnings')
        .eq('user_id', user?.id || '')
        .single();

      if (error) throw error;
      
      if (data) {
        setReferralCode((data as any).code);
        setReferralStats({
          total_referrals: (data as any).total_referrals,
          successful_referrals: (data as any).successful_referrals,
          earnings: (data as any).earnings,
        });
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join TownTap using my referral code ${referralCode} and get ₹100 off on your first booking! Download now: https://towntap.app/download`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyCode = () => {
    Clipboard.setString(referralCode);
    alert('Referral code copied!');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Refer & Earn</Text>
        </View>

        {/* Hero Card */}
        <Card style={([styles.heroCard, { backgroundColor: colors.primary }] as any)}>
          <Text style={styles.heroTitle}>Refer Friends, Earn Rewards!</Text>
          <Text style={styles.heroSubtitle}>
            Give ₹100, Get ₹100 for each successful referral
          </Text>
          <View style={styles.heroIllustration}>
            <Ionicons name="gift" size={32} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Ionicons name="cash" size={32} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Ionicons name="people" size={32} color="#FFFFFF" />
          </View>
        </Card>

        {/* Referral Code Card */}
        <Card style={styles.codeCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Referral Code
          </Text>
          <View style={styles.codeBox}>
            <Text style={[styles.code, { color: colors.primary }]}>
              {referralCode || 'Loading...'}
            </Text>
          </View>
          <View style={styles.codeActions}>
            <Button
              title="Copy Code"
              onPress={handleCopyCode}
              style={styles.copyButton}
            />
            <Button
              title="Share"
              onPress={handleShare}
              style={styles.shareButton}
            />
          </View>
        </Card>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Referral Stats
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {referralStats.total_referrals}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Referrals
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {referralStats.successful_referrals}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Successful
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                ₹{referralStats.earnings}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Earned
              </Text>
            </View>
          </View>
        </Card>

        {/* How it Works */}
        <Card style={styles.howItWorksCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            How It Works
          </Text>
          <View style={styles.stepsList}>
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  Share Your Code
                </Text>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                  Share your unique referral code with friends and family
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  They Sign Up
                </Text>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                  Your friend signs up using your referral code
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  They Book Service
                </Text>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                  When they complete their first booking, you both get rewarded
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  Earn Rewards
                </Text>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                  You get ₹100 in wallet, they get ₹100 discount
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Terms */}
        <Card style={styles.termsCard}>
          <Text style={[styles.termsTitle, { color: colors.text }]}>
            Terms & Conditions
          </Text>
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            • Referral reward credited only after referee completes first booking
            {'\n'}• Maximum 50 referrals per month
            {'\n'}• Rewards cannot be combined with other offers
            {'\n'}• TownTap reserves the right to modify the program
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  backIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  heroCard: {
    margin: spacing.md,
    padding: spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  heroIllustration: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  codeBox: {
    padding: spacing.xl,
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  code: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 4,
  },
  codeActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  copyButton: {
    flex: 1,
  },
  shareButton: {
    flex: 1,
  },
  statsCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  howItWorksCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  stepsList: {
    gap: spacing.xl,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    // backgroundColor applied inline for theme support
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  stepDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  termsCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
    backgroundColor: '#F5F5F5',
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
