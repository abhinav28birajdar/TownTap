// Modern UI Component Library for TownTap
// Comprehensive, accessible, animated components with theme support

// Core Components
export { Button, FloatingActionButton, IconButton } from './button';
export { Card, CardActions, CardContent, CardFooter, CardHeader } from './Card';
export { Input, SearchInput, TextArea } from './input';
export { default as LoadingScreen } from './loading-screen';
export { Text } from './Text';

// Enhanced Business Components
export { BusinessCard } from './business-card';
export { OptimizedBusinessList } from './optimized-business-list';

// Search Components
export { SearchBar } from './search-bar';

// Navigation & Layout
export { AlertModal, ConfirmationModal, Modal } from './Modal';
export { SimpleTabs, TabPanel, Tabs } from './Tabs';

// Media & User
export { Avatar, AvatarGroup } from './Avatar';
export { Badge, BadgeGroup, NotificationBadge, StatusBadge } from './Badge';

// Modern Themed Components (New)
export { ThemedButton } from './themed-button';
export { ThemedCard } from './themed-card';
export { ThemedInput } from './themed-input';
export { ThemedText } from './themed-text-enhanced';

// Utility Components
export { ErrorBoundary } from './error-boundary-enhanced';
export { OfflineIndicator } from './offline-indicator';
export { SkeletonLoader } from './skeleton-loader';

// Legacy components (to be migrated)
export { Collapsible, CollapsibleProps } from './collapsible';

// Icon Symbol exports (iOS specific)
export { IconSymbol } from './icon-symbol';

// Type exports for convenience
// Note: Component props are exported with components

/* 
 * Component Usage Examples:
 * 
 * import { Text, Button, Card, Modal } from '@/components/ui';
 * 
 * // Text with variants
 * <Text variant="headline-large">Welcome to TownTap</Text>
 * <Text variant="body-medium" color="textSecondary">Find local services</Text>
 * 
 * // Buttons with animations
 * <Button variant="primary" size="lg" onPress={handlePress}>Book Now</Button>
 * <IconButton icon="heart" variant="ghost" onPress={toggleFavorite} />
 * 
 * // Cards with flexible content
 * <Card variant="elevated" size="lg">
 *   <CardHeader>
 *     <Text variant="title-large">Service Details</Text>
 *   </CardHeader>
 *   <CardContent>
 *     <Text variant="body-medium">Service description here...</Text>
 *   </CardContent>
 *   <CardActions>
 *     <Button variant="outline">Cancel</Button>
 *     <Button variant="primary">Confirm</Button>
 *   </CardActions>
 * </Card>
 * 
 * // Modals with different variants
 * <Modal visible={isOpen} onClose={handleClose} title="Booking Confirmation">
 *   <Text>Are you sure you want to book this service?</Text>
 * </Modal>
 * 
 * // Business Cards with enhanced features
 * <BusinessCard 
 *   business={businessData}
 *   variant="featured"
 *   showBookButton
 *   onPress={handleBusinessPress}
 *   onBook={handleBookPress}
 * />
 */