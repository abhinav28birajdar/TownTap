import React, { useEffect } from 'react';
import { Modal, StyleSheet, View, TouchableWithoutFeedback } from 'react-native';
import { NotificationService } from '../../services/notificationService';
import { useAuthStore } from '../../stores/authStore';
import NotificationCenter from '../../components/NotificationCenter';

interface NotificationModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isVisible,
  onClose,
}) => {
  const user = useAuthStore((state: any) => state.user);
  const profile = useAuthStore((state: any) => state.profile);
  
  useEffect(() => {
    if (isVisible && user) {
      // Refresh notifications when modal opens
      NotificationService.fetchUnreadNotifications(user.id);
    }
  }, [isVisible, user]);

  if (!user || !profile) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <View style={styles.notificationContainer}>
          <NotificationCenter userId={user.id} onClose={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  notificationContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    marginTop: 0, // Adjust based on your design
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
  },
});

export default NotificationModal;