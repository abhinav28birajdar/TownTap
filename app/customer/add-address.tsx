import { ThemedButton, ThemedInput, ThemedText } from '@/components/ui';
import { Spacing } from '@/constants/spacing';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface Location {
  latitude: number;
  longitude: number;
}

export default function AddAddressScreen() {
  const colors = useColors();
  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>('home');
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [landmark, setLandmark] = useState('');
  const [instructions, setInstructions] = useState('');
  const [location, setLocation] = useState<Location>({
    latitude: 37.78825,
    longitude: -122.4324,
  });
  const [loading, setLoading] = useState(false);

  const addressTypes = [
    { id: 'home' as const, label: 'Home', icon: 'home' as keyof typeof Ionicons.glyphMap },
    { id: 'work' as const, label: 'Work', icon: 'briefcase' as keyof typeof Ionicons.glyphMap },
    { id: 'other' as const, label: 'Other', icon: 'location' as keyof typeof Ionicons.glyphMap },
  ];

  const handleGetCurrentLocation = async () => {
    try {
      // TODO: Implement actual geolocation
      Alert.alert('Info', 'Getting your current location...');
    } catch (error) {
      console.error('Geolocation error:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
  };

  const handleSaveAddress = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter a complete address');
      return;
    }

    try {
      setLoading(true);

      // TODO: Implement actual address save with Supabase
      // const { data: { user } } = await supabase.auth.getUser();
      // 
      // const { error } = await supabase
      //   .from('addresses')
      //   .insert({
      //     user_id: user?.id,
      //     type: addressType,
      //     label: label || addressTypes.find(t => t.id === addressType)?.label,
      //     address,
      //     apartment,
      //     landmark,
      //     instructions,
      //     latitude: location.latitude,
      //     longitude: location.longitude,
      //   });
      //
      // if (error) throw error;

      Alert.alert(
        'Success',
        'Address saved successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Save address error:', error);
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="h2" weight="bold">
            Add New Address
          </ThemedText>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={handleMapPress}
          >
            <Marker coordinate={location} />
          </MapView>
          
          {/* Current Location Button */}
          <TouchableOpacity
            style={[styles.locationButton, { backgroundColor: colors.card }]}
            onPress={handleGetCurrentLocation}
          >
            <Ionicons name="navigate" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Address Type Selection */}
        <View style={styles.section}>
          <ThemedText weight="bold" style={styles.sectionTitle}>
            Address Type
          </ThemedText>
          <View style={styles.typeButtons}>
            {addressTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: addressType === type.id ? colors.primary : colors.card,
                    borderColor: addressType === type.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setAddressType(type.id)}
              >
                <Ionicons
                  name={type.icon}
                  size={24}
                  color={addressType === type.id ? '#fff' : colors.text}
                />
                <ThemedText
                  style={[
                    styles.typeButtonText,
                    { color: addressType === type.id ? '#fff' : colors.text },
                  ]}
                >
                  {type.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Label (for 'other' type) */}
        {addressType === 'other' && (
          <View style={styles.section}>
            <ThemedText weight="bold" style={styles.label}>
              Custom Label
            </ThemedText>
            <ThemedInput
              placeholder="e.g., Friend's House, Gym"
              value={label}
              onChangeText={setLabel}
            />
          </View>
        )}

        {/* Address Details */}
        <View style={styles.section}>
          <ThemedText weight="bold" style={styles.label}>
            Complete Address *
          </ThemedText>
          <ThemedInput
            placeholder="House/Building number, Street name"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <ThemedText weight="bold" style={styles.label}>
            Apartment / Floor (Optional)
          </ThemedText>
          <ThemedInput
            placeholder="e.g., Apt 4B, 3rd Floor"
            value={apartment}
            onChangeText={setApartment}
          />
        </View>

        <View style={styles.section}>
          <ThemedText weight="bold" style={styles.label}>
            Nearby Landmark (Optional)
          </ThemedText>
          <ThemedInput
            placeholder="e.g., Near Central Park, Behind Starbucks"
            value={landmark}
            onChangeText={setLandmark}
          />
        </View>

        <View style={styles.section}>
          <ThemedText weight="bold" style={styles.label}>
            Delivery Instructions (Optional)
          </ThemedText>
          <ThemedInput
            placeholder="e.g., Ring the bell twice, Call when you arrive"
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Save Button */}
        <ThemedButton
          title={loading ? 'Saving...' : 'Save Address'}
          onPress={handleSaveAddress}
          disabled={loading || !address.trim()}
          style={styles.saveButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  mapContainer: {
    height: 250,
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  map: {
    flex: 1,
  },
  locationButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    gap: Spacing.xs,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    marginBottom: Spacing.sm,
  },
  saveButton: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
});
