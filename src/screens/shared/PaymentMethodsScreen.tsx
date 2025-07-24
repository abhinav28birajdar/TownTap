import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet';
  title: string;
  subtitle: string;
  isDefault: boolean;
  icon: string;
}

interface NewCardForm {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export default function PaymentMethodsScreen() {
  const { t } = useTranslation();
  const [showAddCard, setShowAddCard] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      title: '**** **** **** 4532',
      subtitle: 'Visa • Expires 12/26',
      isDefault: true,
      icon: '💳',
    },
    {
      id: '2',
      type: 'upi',
      title: 'Google Pay',
      subtitle: 'john.doe@okaxis',
      isDefault: false,
      icon: '📱',
    },
    {
      id: '3',
      type: 'wallet',
      title: 'Paytm Wallet',
      subtitle: 'Balance: ₹1,250',
      isDefault: false,
      icon: '💰',
    },
  ]);

  const [newCard, setNewCard] = useState<NewCardForm>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const setDefaultPayment = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
    Alert.alert('Success', 'Default payment method updated');
  };

  const removePaymentMethod = (id: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(prev => prev.filter(method => method.id !== id));
          },
        },
      ]
    );
  };

  const handleAddCard = () => {
    if (!newCard.cardNumber || !newCard.expiryDate || !newCard.cvv || !newCard.cardholderName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const maskedCardNumber = `**** **** **** ${newCard.cardNumber.slice(-4)}`;
    const newPaymentMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      title: maskedCardNumber,
      subtitle: `${getCardType(newCard.cardNumber)} • Expires ${newCard.expiryDate}`,
      isDefault: false,
      icon: '💳',
    };

    setPaymentMethods(prev => [...prev, newPaymentMethod]);
    setNewCard({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' });
    setShowAddCard(false);
    Alert.alert('Success', 'Card added successfully');
  };

  const getCardType = (cardNumber: string) => {
    const firstDigit = cardNumber.charAt(0);
    switch (firstDigit) {
      case '4':
        return 'Visa';
      case '5':
        return 'Mastercard';
      case '3':
        return 'American Express';
      default:
        return 'Card';
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ');
    return formatted.trim().slice(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <View key={method.id} style={styles.paymentMethodCard}>
      <View style={styles.paymentMethodHeader}>
        <View style={styles.paymentMethodInfo}>
          <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
          <View style={styles.paymentMethodText}>
            <Text style={styles.paymentMethodTitle}>{method.title}</Text>
            <Text style={styles.paymentMethodSubtitle}>{method.subtitle}</Text>
          </View>
        </View>
        {method.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>
      
      <View style={styles.paymentMethodActions}>
        {!method.isDefault && (
          <TouchableOpacity
            style={styles.setDefaultButton}
            onPress={() => setDefaultPayment(method.id)}
          >
            <Text style={styles.setDefaultButtonText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removePaymentMethod(method.id)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payment Methods List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
          {paymentMethods.map(renderPaymentMethod)}
        </View>

        {/* Add New Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Payment Method</Text>
          
          <TouchableOpacity
            style={styles.addMethodButton}
            onPress={() => setShowAddCard(true)}
          >
            <Text style={styles.addMethodIcon}>💳</Text>
            <Text style={styles.addMethodText}>Add Credit/Debit Card</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.addMethodButton}>
            <Text style={styles.addMethodIcon}>📱</Text>
            <Text style={styles.addMethodText}>Add UPI ID</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.addMethodButton}>
            <Text style={styles.addMethodIcon}>💰</Text>
            <Text style={styles.addMethodText}>Link Wallet</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Security Info */}
        <View style={styles.securitySection}>
          <Text style={styles.securityTitle}>🔒 Your payments are secure</Text>
          <Text style={styles.securityText}>
            We use industry-standard encryption to protect your payment information. 
            Your card details are never stored on our servers.
          </Text>
        </View>
      </ScrollView>

      {/* Add Card Modal */}
      <Modal
        visible={showAddCard}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddCard(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Card</Text>
            <TouchableOpacity onPress={handleAddCard}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Card Number</Text>
              <TextInput
                style={styles.formInput}
                value={newCard.cardNumber}
                onChangeText={(text) => setNewCard({ ...newCard, cardNumber: formatCardNumber(text) })}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formSectionHalf}>
                <Text style={styles.formLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.formInput}
                  value={newCard.expiryDate}
                  onChangeText={(text) => setNewCard({ ...newCard, expiryDate: formatExpiryDate(text) })}
                  placeholder="MM/YY"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              <View style={styles.formSectionHalf}>
                <Text style={styles.formLabel}>CVV</Text>
                <TextInput
                  style={styles.formInput}
                  value={newCard.cvv}
                  onChangeText={(text) => setNewCard({ ...newCard, cvv: text })}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.formInput}
                value={newCard.cardholderName}
                onChangeText={(text) => setNewCard({ ...newCard, cardholderName: text })}
                placeholder="John Doe"
                autoCapitalize="words"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    marginHorizontal: 20,
  },
  paymentMethodCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentMethodText: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  paymentMethodSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  paymentMethodActions: {
    flexDirection: 'row',
    gap: 12,
  },
  setDefaultButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  setDefaultButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#DC3545',
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  addMethodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  addMethodText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    flex: 1,
  },
  chevron: {
    fontSize: 20,
    color: '#CED4DA',
    fontWeight: 'bold',
  },
  securitySection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  formSectionHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
  },
});
