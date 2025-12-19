import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  type: 'car' | 'bike' | 'truck' | 'suv';
  isDefault: boolean;
  image?: string;
  fuelType: string;
  lastService?: string;
}

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    make: 'Maruti Suzuki',
    model: 'Swift',
    year: '2021',
    color: 'Pearl White',
    licensePlate: 'MH 12 AB 1234',
    type: 'car',
    isDefault: true,
    fuelType: 'Petrol',
    lastService: 'Nov 15, 2024',
  },
  {
    id: '2',
    make: 'Honda',
    model: 'City',
    year: '2020',
    color: 'Metallic Grey',
    licensePlate: 'MH 14 CD 5678',
    type: 'car',
    isDefault: false,
    fuelType: 'Diesel',
    lastService: 'Sep 20, 2024',
  },
  {
    id: '3',
    make: 'Royal Enfield',
    model: 'Classic 350',
    year: '2022',
    color: 'Stealth Black',
    licensePlate: 'MH 12 EF 9012',
    type: 'bike',
    isDefault: false,
    fuelType: 'Petrol',
  },
];

const vehicleTypes = [
  { id: 'car', name: 'Car', icon: 'car' },
  { id: 'suv', name: 'SUV', icon: 'car-sport' },
  { id: 'bike', name: 'Bike', icon: 'bicycle' },
  { id: 'truck', name: 'Truck', icon: 'bus' },
];

const fuelTypes = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];

export default function MyVehiclesScreen() {
  const colors = useColors();
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    type: 'car' as Vehicle['type'],
    fuelType: 'Petrol',
  });

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car':
        return 'car';
      case 'suv':
        return 'car-sport';
      case 'bike':
        return 'bicycle';
      case 'truck':
        return 'bus';
      default:
        return 'car';
    }
  };

  const getVehicleColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'Pearl White': '#F5F5F5',
      'Metallic Grey': '#6B7280',
      'Stealth Black': '#1F2937',
      'Red': '#EF4444',
      'Blue': '#3B82F6',
      'Silver': '#9CA3AF',
    };
    return colorMap[color] || '#6B7280';
  };

  const handleSetDefault = (id: string) => {
    setVehicles((prev) =>
      prev.map((vehicle) => ({
        ...vehicle,
        isDefault: vehicle.id === id,
      }))
    );
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
  };

  const handleAddVehicle = () => {
    const vehicle: Vehicle = {
      id: Date.now().toString(),
      ...newVehicle,
      isDefault: vehicles.length === 0,
    };
    setVehicles((prev) => [...prev, vehicle]);
    setNewVehicle({
      make: '',
      model: '',
      year: '',
      color: '',
      licensePlate: '',
      type: 'car',
      fuelType: 'Petrol',
    });
    setShowAddModal(false);
  };

  const renderVehicle = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity
      style={[styles.vehicleCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedVehicle(item);
        setShowDetailsModal(true);
      }}
    >
      <View style={styles.vehicleHeader}>
        <View style={[styles.vehicleIconWrap, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name={getVehicleIcon(item.type) as any} size={28} color={colors.primary} />
        </View>
        {item.isDefault && (
          <View style={[styles.defaultBadge, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="star" size={12} color={colors.success} />
            <ThemedText style={[styles.defaultText, { color: colors.success }]}>Default</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.vehicleInfo}>
        <ThemedText style={styles.vehicleName}>
          {item.make} {item.model}
        </ThemedText>
        <ThemedText style={[styles.vehicleYear, { color: colors.textSecondary }]}>
          {item.year} • {item.color}
        </ThemedText>
      </View>

      <View style={[styles.licensePlate, { backgroundColor: colors.background }]}>
        <ThemedText style={styles.licensePlateText}>{item.licensePlate}</ThemedText>
      </View>

      <View style={styles.vehicleFooter}>
        <View style={styles.fuelBadge}>
          <Ionicons
            name={item.fuelType === 'Electric' ? 'flash' : 'water'}
            size={14}
            color={colors.textSecondary}
          />
          <ThemedText style={[styles.fuelText, { color: colors.textSecondary }]}>
            {item.fuelType}
          </ThemedText>
        </View>
        {item.lastService && (
          <ThemedText style={[styles.serviceDate, { color: colors.textSecondary }]}>
            Last service: {item.lastService}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>My Vehicles</ThemedText>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Vehicle Count */}
        <View style={styles.countSection}>
          <ThemedText style={[styles.countText, { color: colors.textSecondary }]}>
            {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered
          </ThemedText>
        </View>

        {/* Vehicles List */}
        {vehicles.length > 0 ? (
          <View style={styles.vehiclesList}>
            {vehicles.map((item) => (
              <View key={item.id}>{renderVehicle({ item })}</View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="car-outline" size={60} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Vehicles Added</ThemedText>
            <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Add your vehicles to book automotive services easily
            </ThemedText>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <ThemedText style={styles.emptyBtnText}>Add Vehicle</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Services Info */}
        <View style={[styles.servicesInfo, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.servicesTitle}>Available Services</ThemedText>
          <View style={styles.servicesList}>
            {[
              { icon: 'construct', name: 'General Service', desc: 'Regular maintenance' },
              { icon: 'water', name: 'Washing', desc: 'Interior & exterior' },
              { icon: 'car', name: 'Repair', desc: 'Mechanical repairs' },
              { icon: 'brush', name: 'Detailing', desc: 'Premium cleaning' },
            ].map((service, index) => (
              <TouchableOpacity
                key={index}
                style={styles.serviceItem}
                onPress={() => router.push('/discover/explore' as any)}
              >
                <View style={[styles.serviceIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={service.icon as any} size={20} color={colors.primary} />
                </View>
                <ThemedText style={styles.serviceName}>{service.name}</ThemedText>
                <ThemedText style={[styles.serviceDesc, { color: colors.textSecondary }]}>
                  {service.desc}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Vehicle Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddModal(false)}
        >
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.modalTitle}>Add New Vehicle</ThemedText>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Vehicle Type */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Vehicle Type</ThemedText>
                <View style={styles.typeGrid}>
                  {vehicleTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeBtn,
                        {
                          backgroundColor:
                            newVehicle.type === type.id ? colors.primary : colors.background,
                          borderColor:
                            newVehicle.type === type.id ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() =>
                        setNewVehicle((prev) => ({ ...prev, type: type.id as Vehicle['type'] }))
                      }
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={20}
                        color={newVehicle.type === type.id ? '#fff' : colors.text}
                      />
                      <ThemedText
                        style={[
                          styles.typeText,
                          { color: newVehicle.type === type.id ? '#fff' : colors.text },
                        ]}
                      >
                        {type.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText style={styles.inputLabel}>Make</ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                    placeholder="e.g., Maruti"
                    placeholderTextColor={colors.textSecondary}
                    value={newVehicle.make}
                    onChangeText={(text) => setNewVehicle((prev) => ({ ...prev, make: text }))}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText style={styles.inputLabel}>Model</ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                    placeholder="e.g., Swift"
                    placeholderTextColor={colors.textSecondary}
                    value={newVehicle.model}
                    onChangeText={(text) => setNewVehicle((prev) => ({ ...prev, model: text }))}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText style={styles.inputLabel}>Year</ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                    placeholder="e.g., 2021"
                    placeholderTextColor={colors.textSecondary}
                    value={newVehicle.year}
                    onChangeText={(text) => setNewVehicle((prev) => ({ ...prev, year: text }))}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText style={styles.inputLabel}>Color</ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                    placeholder="e.g., White"
                    placeholderTextColor={colors.textSecondary}
                    value={newVehicle.color}
                    onChangeText={(text) => setNewVehicle((prev) => ({ ...prev, color: text }))}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>License Plate</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="MH 12 AB 1234"
                  placeholderTextColor={colors.textSecondary}
                  value={newVehicle.licensePlate}
                  onChangeText={(text) => setNewVehicle((prev) => ({ ...prev, licensePlate: text }))}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Fuel Type</ThemedText>
                <View style={styles.fuelGrid}>
                  {fuelTypes.map((fuel) => (
                    <TouchableOpacity
                      key={fuel}
                      style={[
                        styles.fuelBtn,
                        {
                          backgroundColor:
                            newVehicle.fuelType === fuel ? colors.primary : colors.background,
                          borderColor:
                            newVehicle.fuelType === fuel ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setNewVehicle((prev) => ({ ...prev, fuelType: fuel }))}
                    >
                      <ThemedText
                        style={[
                          styles.fuelBtnText,
                          { color: newVehicle.fuelType === fuel ? '#fff' : colors.text },
                        ]}
                      >
                        {fuel}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleAddVehicle}
              >
                <ThemedText style={styles.saveBtnText}>Add Vehicle</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Vehicle Details Modal */}
      <Modal visible={showDetailsModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDetailsModal(false)}
        >
          <View style={[styles.detailsModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />

            {selectedVehicle && (
              <>
                <View style={styles.detailsHeader}>
                  <View style={[styles.detailsIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons
                      name={getVehicleIcon(selectedVehicle.type) as any}
                      size={36}
                      color={colors.primary}
                    />
                  </View>
                  <ThemedText style={styles.detailsTitle}>
                    {selectedVehicle.make} {selectedVehicle.model}
                  </ThemedText>
                  <ThemedText style={[styles.detailsSubtitle, { color: colors.textSecondary }]}>
                    {selectedVehicle.year} • {selectedVehicle.color}
                  </ThemedText>
                </View>

                <View style={[styles.detailsPlate, { backgroundColor: colors.background }]}>
                  <ThemedText style={styles.detailsPlateText}>
                    {selectedVehicle.licensePlate}
                  </ThemedText>
                </View>

                <View style={styles.detailsInfo}>
                  <View style={styles.infoRow}>
                    <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Type
                    </ThemedText>
                    <ThemedText style={styles.infoValue}>
                      {selectedVehicle.type.charAt(0).toUpperCase() + selectedVehicle.type.slice(1)}
                    </ThemedText>
                  </View>
                  <View style={styles.infoRow}>
                    <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Fuel Type
                    </ThemedText>
                    <ThemedText style={styles.infoValue}>{selectedVehicle.fuelType}</ThemedText>
                  </View>
                  {selectedVehicle.lastService && (
                    <View style={styles.infoRow}>
                      <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Last Service
                      </ThemedText>
                      <ThemedText style={styles.infoValue}>{selectedVehicle.lastService}</ThemedText>
                    </View>
                  )}
                </View>

                <View style={styles.detailsActions}>
                  {!selectedVehicle.isDefault && (
                    <TouchableOpacity
                      style={[styles.detailsBtn, { backgroundColor: colors.primary + '15' }]}
                      onPress={() => {
                        handleSetDefault(selectedVehicle.id);
                        setShowDetailsModal(false);
                      }}
                    >
                      <Ionicons name="star" size={18} color={colors.primary} />
                      <ThemedText style={[styles.detailsBtnText, { color: colors.primary }]}>
                        Set Default
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.detailsBtn, { backgroundColor: colors.info + '15' }]}
                    onPress={() => router.push('/discover/explore' as any)}
                  >
                    <Ionicons name="construct" size={18} color={colors.info} />
                    <ThemedText style={[styles.detailsBtnText, { color: colors.info }]}>
                      Book Service
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.detailsBtn, { backgroundColor: colors.error + '15' }]}
                    onPress={() => {
                      handleDeleteVehicle(selectedVehicle.id);
                      setShowDetailsModal(false);
                    }}
                  >
                    <Ionicons name="trash" size={18} color={colors.error} />
                    <ThemedText style={[styles.detailsBtnText, { color: colors.error }]}>
                      Remove
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
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
  countSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  countText: {
    fontSize: 14,
  },
  vehiclesList: {
    paddingHorizontal: 16,
  },
  vehicleCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vehicleIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '600',
  },
  vehicleInfo: {
    marginBottom: 12,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  vehicleYear: {
    fontSize: 13,
  },
  licensePlate: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  licensePlateText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  vehicleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fuelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fuelText: {
    fontSize: 12,
  },
  serviceDate: {
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 40,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  servicesInfo: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceItem: {
    width: '47%',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceDesc: {
    fontSize: 11,
    textAlign: 'center',
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
    paddingBottom: 40,
    maxHeight: '80%',
  },
  detailsModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  fuelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fuelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  fuelBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  detailsSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  detailsPlate: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  detailsPlateText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  detailsInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    minWidth: '45%',
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
