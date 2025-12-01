import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React, { useCallback, useEffect } from 'react';
import {
    BackHandler,
    Dimensions,
    Modal as RNModal,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { Spacing } from '../../constants/spacing';
import { BorderRadius, Shadows } from '../../constants/theme';
import { getThemeColors, useTheme } from '../../hooks/use-theme';
import { Text } from './Text';
import { Button } from './button';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ModalAction {
  text: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  disabled?: boolean;
}

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  variant?: 'default' | 'alert' | 'confirmation' | 'form' | 'bottom-sheet';
  closeable?: boolean;
  closeOnBackdrop?: boolean;
  actions?: ModalAction[];
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  animationPreset?: 'slide' | 'fade' | 'scale' | 'bottom';
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  closeable = true,
  closeOnBackdrop = true,
  actions,
  style,
  contentStyle,
  animationPreset = 'fade',
}) => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  
  const handleBackPress = useCallback(() => {
    if (visible && closeable) {
      onClose();
      return true;
    }
    return false;
  }, [visible, closeable, onClose]);
  
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => subscription.remove();
  }, [handleBackPress]);
  
  const getModalSize = () => {
    if (variant === 'fullscreen') return { width: screenWidth, height: screenHeight };
    if (variant === 'bottom-sheet') return { width: screenWidth };
    
    const sizes = {
      sm: { width: screenWidth * 0.8, maxHeight: screenHeight * 0.6 },
      md: { width: screenWidth * 0.9, maxHeight: screenHeight * 0.7 },
      lg: { width: screenWidth * 0.95, maxHeight: screenHeight * 0.8 },
      xl: { width: screenWidth * 0.98, maxHeight: screenHeight * 0.9 },
    };
    
    return sizes[size];
  };
  
  const getAnimationConfig = () => {
    const configs = {
      slide: {
        from: { translateX: screenWidth },
        animate: { translateX: visible ? 0 : screenWidth },
      },
      fade: {
        from: { opacity: 0 },
        animate: { opacity: visible ? 1 : 0 },
      },
      scale: {
        from: { scale: 0.8, opacity: 0 },
        animate: { scale: visible ? 1 : 0.8, opacity: visible ? 1 : 0 },
      },
      bottom: {
        from: { translateY: screenHeight },
        animate: { translateY: visible ? 0 : screenHeight },
      },
    };
    
    return configs[animationPreset];
  };
  
  const handleBackdropPress = () => {
    if (closeOnBackdrop && closeable) {
      onClose();
    }
  };
  
  const renderActions = () => {
    if (!actions?.length) return null;
    
    return (
      <View style={styles.actions}>
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'secondary'}
            size="sm"
            onPress={action.onPress}
            disabled={action.disabled}
            style={[
              styles.actionButton,
              index < actions.length - 1 && styles.actionButtonSpacing,
            ]}
          >
            {action.text}
          </Button>
        ))}
      </View>
    );
  };
  
  const modalSize = getModalSize();
  const animationConfig = getAnimationConfig();
  
  if (variant === 'bottom-sheet') {
    return (
      <RNModal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={handleBackPress}
      >
        <View style={styles.bottomSheetOverlay}>
          <TouchableOpacity
            style={styles.bottomSheetBackdrop}
            activeOpacity={1}
            onPress={handleBackdropPress}
          />
          
          <MotiView
            from={{ translateY: 400 }}
            animate={{ translateY: visible ? 0 : 400 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            style={[
              styles.bottomSheetContainer,
              { backgroundColor: colors.background },
              style,
            ]}
          >
            {/* Handle bar */}
            <View style={styles.handleBar}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>
            
            {/* Header */}
            {(title || closeable) && (
              <View style={styles.bottomSheetHeader}>
                {title && (
                  <Text variant="title-large" style={styles.bottomSheetTitle}>
                    {title}
                  </Text>
                )}
                {closeable && (
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {/* Content */}
            <View style={[styles.bottomSheetContent, contentStyle]}>
              {children}
            </View>
            
            {/* Actions */}
            {renderActions()}
          </MotiView>
        </View>
      </RNModal>
    );
  }
  
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleBackPress}
    >
      {/* Backdrop */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 200 }}
        style={[
          styles.backdrop,
          variant === 'fullscreen' && styles.fullscreenBackdrop,
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />
      </MotiView>
      
      {/* Modal Container */}
      <View style={styles.centeredView}>
        <MotiView
          {...animationConfig}
          transition={{
            type: animationPreset === 'scale' ? 'spring' : 'timing',
            duration: animationPreset === 'scale' ? undefined : 250,
            damping: 15,
            stiffness: 200,
          }}
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              ...modalSize,
            },
            variant === 'fullscreen' && styles.fullscreenModal,
            style,
          ]}
        >
          {/* Header */}
          {(title || closeable) && (
            <View style={styles.header}>
              {title && (
                <Text variant="title-large" style={styles.title} numberOfLines={2}>
                  {title}
                </Text>
              )}
              {closeable && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {/* Content */}
          <View style={[styles.content, contentStyle]}>
            {children}
          </View>
          
          {/* Actions */}
          {renderActions()}
        </MotiView>
      </View>
    </RNModal>
  );
};

// Convenience components for specific use cases
export const AlertModal: React.FC<Omit<ModalProps, 'variant'> & {
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
}> = ({ message, confirmText = 'OK', onConfirm, onClose, ...props }) => (
  <Modal
    {...props}
    variant="alert"
    size="sm"
    onClose={onClose}
    actions={[
      {
        text: confirmText,
        onPress: onConfirm || onClose,
        variant: 'primary',
      },
    ]}
  >
    <Text variant="body-large" style={styles.alertMessage}>
      {message}
    </Text>
  </Modal>
);

export const ConfirmationModal: React.FC<Omit<ModalProps, 'variant'> & {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  destructive?: boolean;
}> = ({
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  destructive = false,
  ...props
}) => (
  <Modal
    {...props}
    variant="confirmation"
    size="sm"
    onClose={onClose}
    actions={[
      {
        text: cancelText,
        onPress: onClose,
        variant: 'ghost',
      },
      {
        text: confirmText,
        onPress: onConfirm,
        variant: destructive ? 'destructive' : 'primary',
      },
    ]}
  >
    <Text variant="body-large" style={styles.alertMessage}>
      {message}
    </Text>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fullscreenBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalContainer: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    ...Shadows.lg,
    overflow: 'hidden',
  },
  fullscreenModal: {
    borderRadius: 0,
    borderWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    flex: 1,
    marginRight: Spacing.md,
  },
  closeButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },
  actionButton: {
    minWidth: 80,
  },
  actionButtonSpacing: {
    marginRight: Spacing.sm,
  },
  
  // Bottom Sheet Styles
  bottomSheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetContainer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: screenHeight * 0.9,
    ...Shadows.xl,
  },
  handleBar: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  bottomSheetTitle: {
    flex: 1,
    marginRight: Spacing.md,
  },
  bottomSheetContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    maxHeight: screenHeight * 0.7,
  },
  
  // Alert styles
  alertMessage: {
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
});

export default Modal;