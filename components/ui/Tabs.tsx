import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { Spacing } from '../../constants/spacing';
import { BorderRadius, Shadows } from '../../constants/theme';
import { getThemeColors, useTheme } from '../../hooks/use-theme';
import { Text } from './Text';

interface TabItem {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: number;
  disabled?: boolean;
  content?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underlined' | 'buttons';
  size?: 'sm' | 'md' | 'lg';
  scrollable?: boolean;
  showContent?: boolean;
  style?: ViewStyle;
  tabStyle?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  scrollable = false,
  showContent = true,
  style,
  tabStyle,
  contentStyle,
}) => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  const [internalActiveTab, setInternalActiveTab] = useState(
    activeTab || tabs[0]?.id || ''
  );
  
  const currentActiveTab = activeTab || internalActiveTab;
  
  const handleTabPress = (tabId: string) => {
    if (tabs.find(tab => tab.id === tabId)?.disabled) return;
    
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  };
  
  const getTabSizeStyles = () => {
    const sizes = {
      sm: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        fontSize: 14,
        iconSize: 16,
      },
      md: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: 16,
        iconSize: 20,
      },
      lg: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        fontSize: 18,
        iconSize: 24,
      },
    };
    
    return sizes[size];
  };
  
  const sizeStyles = getTabSizeStyles();
  
  const renderTab = (tab: TabItem) => {
    const isActive = currentActiveTab === tab.id;
    const isDisabled = tab.disabled;
    
    let tabContainerStyle: ViewStyle = {
      paddingHorizontal: sizeStyles.paddingHorizontal,
      paddingVertical: sizeStyles.paddingVertical,
    };
    
    let tabTextColor = isDisabled
      ? colors.textDisabled
      : isActive
        ? colors.primary
        : colors.textSecondary;
    
    switch (variant) {
      case 'pills':
        tabContainerStyle = {
          ...tabContainerStyle,
          backgroundColor: isActive ? colors.primary : 'transparent',
          borderRadius: BorderRadius.full,
          marginHorizontal: 2,
        };
        tabTextColor = isActive ? colors.primaryForeground : colors.textSecondary;
        break;
        
      case 'buttons':
        tabContainerStyle = {
          ...tabContainerStyle,
          backgroundColor: isActive ? colors.primary : colors.muted,
          borderRadius: BorderRadius.md,
          marginHorizontal: 2,
          ...Shadows.small,
        };
        tabTextColor = isActive ? colors.primaryForeground : colors.textSecondary;
        break;
        
      case 'underlined':
        tabContainerStyle = {
          ...tabContainerStyle,
          borderBottomWidth: 2,
          borderBottomColor: isActive ? colors.primary : 'transparent',
        };
        break;
        
      default:
        tabContainerStyle = {
          ...tabContainerStyle,
          backgroundColor: isActive ? colors.accent : 'transparent',
          borderRadius: BorderRadius.md,
        };
        break;
    }
    
    return (
      <TouchableOpacity
        key={tab.id}
        onPress={() => handleTabPress(tab.id)}
        disabled={isDisabled}
        style={[styles.tab, tabContainerStyle, tabStyle]}
        activeOpacity={0.7}
      >
        <MotiView
          animate={{
            scale: isActive ? 1.02 : 1,
          }}
          transition={{ type: 'timing', duration: 200 }}
          style={styles.tabContent}
        >
          {tab.icon && (
            <Ionicons
              name={tab.icon}
              size={sizeStyles.iconSize}
              color={tabTextColor}
              style={styles.tabIcon}
            />
          )}
          
          <Text
            style={[
              styles.tabText,
              {
                fontSize: sizeStyles.fontSize,
                color: tabTextColor,
                fontWeight: isActive ? '600' : '500',
              },
            ]}
            numberOfLines={1}
          >
            {tab.label}
          </Text>
          
          {tab.badge !== undefined && tab.badge > 0 && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isActive ? colors.primaryForeground : colors.destructive,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: isActive ? colors.primary : colors.destructiveForeground,
                  },
                ]}
              >
                {tab.badge > 99 ? '99+' : tab.badge.toString()}
              </Text>
            </View>
          )}
        </MotiView>
      </TouchableOpacity>
    );
  };
  
  const renderTabList = () => {
    if (scrollable) {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollableContainer}
          style={styles.scrollableTabs}
        >
          {tabs.map(renderTab)}
        </ScrollView>
      );
    }
    
    return (
      <View style={styles.tabsContainer}>
        {tabs.map(renderTab)}
      </View>
    );
  };
  
  const renderContent = () => {
    if (!showContent) return null;
    
    const activeTabData = tabs.find(tab => tab.id === currentActiveTab);
    if (!activeTabData?.content) return null;
    
    return (
      <MotiView
        key={currentActiveTab}
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 200 }}
        style={[styles.content, contentStyle]}
      >
        {activeTabData.content}
      </MotiView>
    );
  };
  
  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.tabsWrapper,
          {
            borderBottomWidth: variant === 'underlined' ? 1 : 0,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {renderTabList()}
      </View>
      
      {renderContent()}
    </View>
  );
};

// Convenience component for simple tab navigation
export const SimpleTabs: React.FC<{
  items: string[];
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
  variant?: TabsProps['variant'];
  size?: TabsProps['size'];
  style?: ViewStyle;
}> = ({
  items,
  activeIndex = 0,
  onIndexChange,
  variant,
  size,
  style,
}) => {
  const tabs = items.map((item, index) => ({
    id: index.toString(),
    label: item,
  }));
  
  return (
    <Tabs
      tabs={tabs}
      activeTab={activeIndex.toString()}
      onTabChange={(tabId) => onIndexChange?.(parseInt(tabId))}
      variant={variant}
      size={size}
      showContent={false}
      style={style}
    />
  );
};

// Tab Panel component for custom content management
export const TabPanel: React.FC<{
  value: string;
  activeTab: string;
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ value, activeTab, children, style }) => {
  if (value !== activeTab) return null;
  
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 200 }}
      style={style}
    >
      {children}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsWrapper: {},
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollableTabs: {
    flexGrow: 0,
  },
  scrollableContainer: {
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    flex: 1,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    marginRight: Spacing.xs,
  },
  tabText: {
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
});

export default Tabs;