import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const aboutItems = [
  {
    icon: 'information-circle',
    title: 'Version',
    value: '1.0.0',
  },
  {
    icon: 'code-slash',
    title: 'Build Number',
    value: '100',
  },
  {
    icon: 'globe',
    title: 'Website',
    value: 'www.towntap.com',
    link: 'https://www.towntap.com',
  },
  {
    icon: 'mail',
    title: 'Support Email',
    value: 'support@towntap.com',
    link: 'mailto:support@towntap.com',
  },
  {
    icon: 'call',
    title: 'Support Phone',
    value: '+91 1800-XXX-XXXX',
    link: 'tel:+911800XXXXXXX',
  },
];

const legalItems = [
  { icon: 'shield-checkmark', title: 'Privacy Policy', route: '/settings/privacy' },
  { icon: 'document-text', title: 'Terms of Service', route: '/settings/terms' },
  { icon: 'key', title: 'Open Source Licenses', route: '/settings/licenses' },
];

export default function AboutScreen() {
  const colors = useColors();

  const handleLinkPress = (link?: string) => {
    if (link) {
      Linking.openURL(link);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>About</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* App Logo & Name */}
        <View style={styles.appInfo}>
          <View style={[styles.appIcon, { backgroundColor: '#415D43' }]}>
            <Ionicons name="business" size={48} color="#FFFFFF" />
          </View>
          <ThemedText style={styles.appName}>TownTap</ThemedText>
          <ThemedText style={styles.appTagline}>
            Connecting Local Services
          </ThemedText>
        </View>

        {/* App Details */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>App Information</ThemedText>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {aboutItems.map((item, index) => (
              <React.Fragment key={item.title}>
                <TouchableOpacity
                  style={styles.infoItem}
                  onPress={() => handleLinkPress(item.link)}
                  disabled={!item.link}
                >
                  <View style={styles.infoLeft}>
                    <Ionicons name={item.icon as any} size={20} color={colors.text} />
                    <ThemedText style={styles.infoTitle}>{item.title}</ThemedText>
                  </View>
                  <View style={styles.infoRight}>
                    <ThemedText style={styles.infoValue}>{item.value}</ThemedText>
                    {item.link && (
                      <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
                    )}
                  </View>
                </TouchableOpacity>
                {index < aboutItems.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Legal</ThemedText>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {legalItems.map((item, index) => (
              <React.Fragment key={item.title}>
                <TouchableOpacity
                  style={styles.infoItem}
                  onPress={() => router.push(item.route as any)}
                >
                  <View style={styles.infoLeft}>
                    <Ionicons name={item.icon as any} size={20} color={colors.text} />
                    <ThemedText style={styles.infoTitle}>{item.title}</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {index < legalItems.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.description}>
          <ThemedText style={styles.descriptionText}>
            TownTap connects you with trusted local service providers in your area. 
            From plumbing to electrical work, we've got you covered.
          </ThemedText>
        </View>

        {/* Copyright */}
        <View style={styles.copyright}>
          <ThemedText style={styles.copyrightText}>
            © 2025 TownTap. All rights reserved.
          </ThemedText>
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 14,
    opacity: 0.6,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoValue: {
    fontSize: 14,
    opacity: 0.6,
  },
  divider: {
    height: 1,
    marginLeft: 48,
  },
  description: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 20,
  },
  copyright: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 12,
    opacity: 0.4,
  },
});
