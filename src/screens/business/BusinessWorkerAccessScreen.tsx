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

interface BusinessRegistration {
  businessName: string;
  businessType: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  pincode: string;
  gstNumber: string;
  description: string;
}

interface WorkerInvite {
  email: string;
  role: 'manager' | 'staff' | 'delivery';
  permissions: string[];
}

export default function BusinessWorkerAccessScreen() {
  const { t } = useTranslation();
  const [isBusinessOwner, setIsBusinessOwner] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showWorkerInvite, setShowWorkerInvite] = useState(false);
  
  const [registration, setRegistration] = useState<BusinessRegistration>({
    businessName: '',
    businessType: 'restaurant',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    pincode: '',
    gstNumber: '',
    description: '',
  });

  const [workerInvite, setWorkerInvite] = useState<WorkerInvite>({
    email: '',
    role: 'staff',
    permissions: [],
  });

  const businessTypes = [
    { key: 'restaurant', label: 'Restaurant/Cafe' },
    { key: 'grocery', label: 'Grocery Store' },
    { key: 'pharmacy', label: 'Pharmacy' },
    { key: 'electronics', label: 'Electronics' },
    { key: 'clothing', label: 'Clothing Store' },
    { key: 'salon', label: 'Beauty Salon' },
    { key: 'repair', label: 'Repair Service' },
    { key: 'other', label: 'Other' },
  ];

  const workerRoles = [
    { key: 'manager', label: 'Manager', description: 'Full access to business operations' },
    { key: 'staff', label: 'Staff', description: 'Limited access to orders and inventory' },
    { key: 'delivery', label: 'Delivery Partner', description: 'Access to delivery management only' },
  ];

  const availablePermissions = [
    { key: 'orders', label: 'Manage Orders' },
    { key: 'inventory', label: 'Manage Inventory' },
    { key: 'customers', label: 'View Customers' },
    { key: 'analytics', label: 'View Analytics' },
    { key: 'settings', label: 'Business Settings' },
    { key: 'workers', label: 'Manage Workers' },
  ];

  const handleBusinessRegistration = () => {
    if (!registration.businessName || !registration.ownerName || !registration.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Here you would submit the registration to your backend
    Alert.alert(
      'Registration Submitted',
      'Your business registration has been submitted for review. You will receive a confirmation email within 24 hours.',
      [
        {
          text: 'OK',
          onPress: () => {
            setShowRegistration(false);
            setIsBusinessOwner(true);
          },
        },
      ]
    );
  };

  const handleWorkerInvite = () => {
    if (!workerInvite.email) {
      Alert.alert('Error', 'Please enter worker email address');
      return;
    }

    // Here you would send the invitation to your backend
    Alert.alert(
      'Invitation Sent',
      `Worker invitation has been sent to ${workerInvite.email}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowWorkerInvite(false);
            setWorkerInvite({ email: '', role: 'staff', permissions: [] });
          },
        },
      ]
    );
  };

  const renderBusinessDashboard = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Dashboard</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>25</Text>
            <Text style={styles.statLabel}>Orders Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>₹1,250</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>View Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📦</Text>
            <Text style={styles.actionText}>Manage Inventory</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowWorkerInvite(true)}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>Invite Worker</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Workers</Text>
        <View style={styles.workersList}>
          <View style={styles.workerCard}>
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>John Doe</Text>
              <Text style={styles.workerRole}>Manager</Text>
              <Text style={styles.workerStatus}>Active</Text>
            </View>
            <TouchableOpacity style={styles.workerActions}>
              <Text style={styles.actionsText}>⚙️</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.workerCard}>
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>Sarah Smith</Text>
              <Text style={styles.workerRole}>Staff</Text>
              <Text style={styles.workerStatus}>Active</Text>
            </View>
            <TouchableOpacity style={styles.workerActions}>
              <Text style={styles.actionsText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderCustomerView = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Join as Business Partner</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🏪 Become a Business Partner</Text>
          <Text style={styles.infoText}>
            Register your business on TownTap and reach thousands of local customers. 
            Increase your sales and grow your business with our platform.
          </Text>
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => setShowRegistration(true)}
          >
            <Text style={styles.registerButtonText}>Register Your Business</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Benefits for Businesses</Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>📈</Text>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Increase Sales</Text>
              <Text style={styles.benefitDescription}>
                Reach more customers in your local area
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>📱</Text>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Easy Management</Text>
              <Text style={styles.benefitDescription}>
                Manage orders, inventory, and workers from one app
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>💰</Text>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Low Commission</Text>
              <Text style={styles.benefitDescription}>
                Competitive rates with transparent pricing
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🚀</Text>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Marketing Support</Text>
              <Text style={styles.benefitDescription}>
                Promotional campaigns and featured listings
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Success Stories</Text>
        <View style={styles.testimonial}>
          <Text style={styles.testimonialText}>
            "TownTap helped us increase our delivery orders by 300%. The platform is easy to use and customer support is excellent!"
          </Text>
          <Text style={styles.testimonialAuthor}>- Raj, Pizza Corner</Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isBusinessOwner ? 'Business Dashboard' : 'Business Partnership'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {isBusinessOwner ? renderBusinessDashboard() : renderCustomerView()}

      {/* Business Registration Modal */}
      <Modal
        visible={showRegistration}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowRegistration(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Register Business</Text>
            <TouchableOpacity onPress={handleBusinessRegistration}>
              <Text style={styles.saveButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Business Information */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Business Information</Text>
              
              <Text style={styles.formLabel}>Business Name *</Text>
              <TextInput
                style={styles.formInput}
                value={registration.businessName}
                onChangeText={(text) => setRegistration({ ...registration, businessName: text })}
                placeholder="Enter business name"
              />

              <Text style={styles.formLabel}>Business Type *</Text>
              <View style={styles.businessTypeGrid}>
                {businessTypes.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.businessTypeOption,
                      registration.businessType === type.key && styles.selectedBusinessType,
                    ]}
                    onPress={() => setRegistration({ ...registration, businessType: type.key })}
                  >
                    <Text style={[
                      styles.businessTypeText,
                      registration.businessType === type.key && styles.selectedBusinessTypeText,
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.multilineInput]}
                value={registration.description}
                onChangeText={(text) => setRegistration({ ...registration, description: text })}
                placeholder="Describe your business"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Owner Information */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Owner Information</Text>
              
              <Text style={styles.formLabel}>Owner Name *</Text>
              <TextInput
                style={styles.formInput}
                value={registration.ownerName}
                onChangeText={(text) => setRegistration({ ...registration, ownerName: text })}
                placeholder="Enter owner name"
              />

              <Text style={styles.formLabel}>Email *</Text>
              <TextInput
                style={styles.formInput}
                value={registration.email}
                onChangeText={(text) => setRegistration({ ...registration, email: text })}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.formLabel}>Phone Number *</Text>
              <TextInput
                style={styles.formInput}
                value={registration.phone}
                onChangeText={(text) => setRegistration({ ...registration, phone: text })}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            {/* Business Address */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Business Address</Text>
              
              <Text style={styles.formLabel}>Complete Address *</Text>
              <TextInput
                style={[styles.formInput, styles.multilineInput]}
                value={registration.address}
                onChangeText={(text) => setRegistration({ ...registration, address: text })}
                placeholder="Enter complete business address"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.formLabel}>Pincode *</Text>
              <TextInput
                style={styles.formInput}
                value={registration.pincode}
                onChangeText={(text) => setRegistration({ ...registration, pincode: text })}
                placeholder="Enter pincode"
                keyboardType="numeric"
                maxLength={6}
              />

              <Text style={styles.formLabel}>GST Number (Optional)</Text>
              <TextInput
                style={styles.formInput}
                value={registration.gstNumber}
                onChangeText={(text) => setRegistration({ ...registration, gstNumber: text })}
                placeholder="Enter GST number"
                autoCapitalize="characters"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Worker Invite Modal */}
      <Modal
        visible={showWorkerInvite}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowWorkerInvite(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Invite Worker</Text>
            <TouchableOpacity onPress={handleWorkerInvite}>
              <Text style={styles.saveButtonText}>Send Invite</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Email Address *</Text>
              <TextInput
                style={styles.formInput}
                value={workerInvite.email}
                onChangeText={(text) => setWorkerInvite({ ...workerInvite, email: text })}
                placeholder="Enter worker's email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.formLabel}>Role *</Text>
              {workerRoles.map((role) => (
                <TouchableOpacity
                  key={role.key}
                  style={[
                    styles.roleOption,
                    workerInvite.role === role.key && styles.selectedRole,
                  ]}
                  onPress={() => setWorkerInvite({ ...workerInvite, role: role.key as any })}
                >
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleTitle}>{role.label}</Text>
                    <Text style={styles.roleDescription}>{role.description}</Text>
                  </View>
                  <View style={[
                    styles.radioButton,
                    workerInvite.role === role.key && styles.radioButtonSelected,
                  ]} />
                </TouchableOpacity>
              ))}

              <Text style={styles.formLabel}>Permissions</Text>
              <View style={styles.permissionsGrid}>
                {availablePermissions.map((permission) => (
                  <TouchableOpacity
                    key={permission.key}
                    style={[
                      styles.permissionOption,
                      workerInvite.permissions.includes(permission.key) && styles.selectedPermission,
                    ]}
                    onPress={() => {
                      const permissions = workerInvite.permissions.includes(permission.key)
                        ? workerInvite.permissions.filter(p => p !== permission.key)
                        : [...workerInvite.permissions, permission.key];
                      setWorkerInvite({ ...workerInvite, permissions });
                    }}
                  >
                    <Text style={[
                      styles.permissionText,
                      workerInvite.permissions.includes(permission.key) && styles.selectedPermissionText,
                    ]}>
                      {permission.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    marginHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  workersList: {
    paddingHorizontal: 20,
  },
  workerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  workerRole: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 2,
  },
  workerStatus: {
    fontSize: 12,
    color: '#28A745',
    marginTop: 2,
  },
  workerActions: {
    padding: 8,
  },
  actionsText: {
    fontSize: 16,
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  benefitsList: {
    paddingHorizontal: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 4,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  testimonial: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  testimonialText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  testimonialAuthor: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
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
    marginBottom: 24,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
    marginTop: 12,
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
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  businessTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  businessTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  selectedBusinessType: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  businessTypeText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedBusinessTypeText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  roleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  selectedRole: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  radioButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  permissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  permissionOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  selectedPermission: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  permissionText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedPermissionText: {
    color: '#007AFF',
    fontWeight: '500',
  },
});
