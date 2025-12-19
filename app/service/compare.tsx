import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Service {
  id: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  reviewCount: number;
  duration: string;
  description: string;
}

interface CompareItem {
  label: string;
  key: string;
  type: 'text' | 'price' | 'rating' | 'duration' | 'list';
}

const compareItems: CompareItem[] = [
  { label: 'Price', key: 'price', type: 'price' },
  { label: 'Rating', key: 'rating', type: 'rating' },
  { label: 'Duration', key: 'duration', type: 'duration' },
  { label: 'Reviews', key: 'reviewCount', type: 'text' },
];

const mockServices: Service[] = [
  {
    id: '1',
    name: 'CleanPro Services',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200',
    price: 1899,
    rating: 4.8,
    reviewCount: 245,
    duration: '3-4 hours',
    description: 'Professional deep cleaning with eco-friendly products',
  },
  {
    id: '2',
    name: 'SparkleClean',
    image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=200',
    price: 1699,
    rating: 4.6,
    reviewCount: 189,
    duration: '3-4 hours',
    description: 'Thorough cleaning service for your home',
  },
  {
    id: '3',
    name: 'HomeCare Plus',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=200',
    price: 2199,
    rating: 4.9,
    reviewCount: 312,
    duration: '4-5 hours',
    description: 'Premium cleaning with sanitization included',
  },
];

export default function CompareServicesScreen() {
  const colors = useColors();
  const [selectedServices, setSelectedServices] = useState<string[]>(
    mockServices.slice(0, 2).map((s) => s.id)
  );
  const [showAddModal, setShowAddModal] = useState(false);

  const selectedServiceObjects = mockServices.filter((s) =>
    selectedServices.includes(s.id)
  );

  const toggleService = (id: string) => {
    if (selectedServices.includes(id)) {
      if (selectedServices.length > 2) {
        setSelectedServices((prev) => prev.filter((sid) => sid !== id));
      }
    } else if (selectedServices.length < 4) {
      setSelectedServices((prev) => [...prev, id]);
    }
  };

  const getBestValue = (key: string): string | null => {
    if (selectedServiceObjects.length < 2) return null;

    let bestId = selectedServiceObjects[0].id;
    let bestValue = (selectedServiceObjects[0] as any)[key];

    selectedServiceObjects.forEach((service) => {
      const value = (service as any)[key];
      if (key === 'price') {
        if (value < bestValue) {
          bestValue = value;
          bestId = service.id;
        }
      } else if (key === 'rating' || key === 'reviewCount') {
        if (value > bestValue) {
          bestValue = value;
          bestId = service.id;
        }
      }
    });

    return bestId;
  };

  const renderValue = (service: Service, item: CompareItem) => {
    const value = (service as any)[item.key];
    const isBest = getBestValue(item.key) === service.id;

    switch (item.type) {
      case 'price':
        return (
          <View style={styles.valueContainer}>
            <ThemedText
              style={[
                styles.valueText,
                isBest && { color: colors.success, fontWeight: '700' },
              ]}
            >
              ₹{value}
            </ThemedText>
            {isBest && (
              <View style={[styles.bestBadge, { backgroundColor: colors.success + '15' }]}>
                <ThemedText style={[styles.bestText, { color: colors.success }]}>
                  Best Price
                </ThemedText>
              </View>
            )}
          </View>
        );
      case 'rating':
        return (
          <View style={styles.valueContainer}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FFC107" />
              <ThemedText
                style={[
                  styles.valueText,
                  isBest && { color: colors.success, fontWeight: '700' },
                ]}
              >
                {value}
              </ThemedText>
            </View>
            {isBest && (
              <View style={[styles.bestBadge, { backgroundColor: colors.success + '15' }]}>
                <ThemedText style={[styles.bestText, { color: colors.success }]}>
                  Top Rated
                </ThemedText>
              </View>
            )}
          </View>
        );
      case 'duration':
        return (
          <ThemedText style={styles.valueText}>{value}</ThemedText>
        );
      default:
        return (
          <ThemedText
            style={[
              styles.valueText,
              isBest && item.key === 'reviewCount' && { color: colors.success, fontWeight: '700' },
            ]}
          >
            {value}
          </ThemedText>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Compare Services</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      {/* Service Selector */}
      <View style={styles.selectorSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectorList}
        >
          {mockServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.selectorItem,
                {
                  backgroundColor: colors.card,
                  borderColor: selectedServices.includes(service.id)
                    ? colors.primary
                    : colors.border,
                  borderWidth: selectedServices.includes(service.id) ? 2 : 1,
                },
              ]}
              onPress={() => toggleService(service.id)}
            >
              <View
                style={[
                  styles.checkCircle,
                  {
                    backgroundColor: selectedServices.includes(service.id)
                      ? colors.primary
                      : 'transparent',
                    borderColor: selectedServices.includes(service.id)
                      ? colors.primary
                      : colors.border,
                  },
                ]}
              >
                {selectedServices.includes(service.id) && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <Image source={{ uri: service.image }} style={styles.selectorImage} />
              <ThemedText style={styles.selectorName} numberOfLines={1}>
                {service.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ThemedText style={[styles.selectHint, { color: colors.textSecondary }]}>
          Select 2-4 services to compare
        </ThemedText>
      </View>

      {/* Comparison Table */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Service Headers */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tableRow}
        >
          <View style={[styles.labelCell, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.labelText}>Service</ThemedText>
          </View>
          {selectedServiceObjects.map((service) => (
            <View
              key={service.id}
              style={[styles.headerCell, { backgroundColor: colors.card }]}
            >
              <Image source={{ uri: service.image }} style={styles.serviceImage} />
              <ThemedText style={styles.serviceName} numberOfLines={2}>
                {service.name}
              </ThemedText>
              <TouchableOpacity
                style={[styles.viewBtn, { backgroundColor: colors.primary + '15' }]}
                onPress={() =>
                  router.push({
                    pathname: '/service/[id]',
                    params: { id: service.id },
                  })
                }
              >
                <ThemedText style={[styles.viewBtnText, { color: colors.primary }]}>
                  View Details
                </ThemedText>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Comparison Rows */}
        {compareItems.map((item, index) => (
          <ScrollView
            key={item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.tableRow,
              index % 2 === 0 && { backgroundColor: colors.card + '50' },
            ]}
          >
            <View style={styles.labelCell}>
              <ThemedText style={styles.labelText}>{item.label}</ThemedText>
            </View>
            {selectedServiceObjects.map((service) => (
              <View key={service.id} style={styles.valueCell}>
                {renderValue(service, item)}
              </View>
            ))}
          </ScrollView>
        ))}

        {/* Description Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tableRow}
        >
          <View style={styles.labelCell}>
            <ThemedText style={styles.labelText}>Description</ThemedText>
          </View>
          {selectedServiceObjects.map((service) => (
            <View key={service.id} style={styles.valueCell}>
              <ThemedText
                style={[styles.descriptionText, { color: colors.textSecondary }]}
                numberOfLines={3}
              >
                {service.description}
              </ThemedText>
            </View>
          ))}
        </ScrollView>

        {/* Features Comparison */}
        <View style={[styles.featuresSection, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.featuresSectionTitle}>Features Comparison</ThemedText>

          <View style={styles.featureRow}>
            <View style={styles.featureLabelCell}>
              <ThemedText style={styles.featureLabel}>Eco-friendly Products</ThemedText>
            </View>
            {selectedServiceObjects.map((service, i) => (
              <View key={service.id} style={styles.featureValueCell}>
                <Ionicons
                  name={i % 2 === 0 ? 'checkmark-circle' : 'close-circle'}
                  size={22}
                  color={i % 2 === 0 ? colors.success : colors.error}
                />
              </View>
            ))}
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureLabelCell}>
              <ThemedText style={styles.featureLabel}>Equipment Included</ThemedText>
            </View>
            {selectedServiceObjects.map((service) => (
              <View key={service.id} style={styles.featureValueCell}>
                <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              </View>
            ))}
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureLabelCell}>
              <ThemedText style={styles.featureLabel}>Verified Professionals</ThemedText>
            </View>
            {selectedServiceObjects.map((service) => (
              <View key={service.id} style={styles.featureValueCell}>
                <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              </View>
            ))}
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureLabelCell}>
              <ThemedText style={styles.featureLabel}>Free Rescheduling</ThemedText>
            </View>
            {selectedServiceObjects.map((service, i) => (
              <View key={service.id} style={styles.featureValueCell}>
                <Ionicons
                  name={i !== 1 ? 'checkmark-circle' : 'close-circle'}
                  size={22}
                  color={i !== 1 ? colors.success : colors.error}
                />
              </View>
            ))}
          </View>

          <View style={[styles.featureRow, { borderBottomWidth: 0 }]}>
            <View style={styles.featureLabelCell}>
              <ThemedText style={styles.featureLabel}>Satisfaction Guarantee</ThemedText>
            </View>
            {selectedServiceObjects.map((service) => (
              <View key={service.id} style={styles.featureValueCell}>
                <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.summaryText}>
          <ThemedText style={styles.summaryLabel}>Best Value</ThemedText>
          <ThemedText style={[styles.summaryValue, { color: colors.primary }]}>
            {mockServices.find((s) => s.id === getBestValue('price'))?.name || '-'}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: colors.primary }]}
          onPress={() =>
            router.push({
              pathname: '/service/[id]',
              params: { id: getBestValue('price') || selectedServices[0] },
            })
          }
        >
          <ThemedText style={styles.bookText}>Book Best Option</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const CELL_WIDTH = (width - 120) / 2;

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
  selectorSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  selectorList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  selectorItem: {
    width: 100,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  selectorName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    minWidth: '100%',
  },
  labelCell: {
    width: 100,
    padding: 14,
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  headerCell: {
    width: CELL_WIDTH,
    padding: 14,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.06)',
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  viewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
  valueCell: {
    width: CELL_WIDTH,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.06)',
  },
  valueContainer: {
    alignItems: 'center',
    gap: 4,
  },
  valueText: {
    fontSize: 15,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bestBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bestText: {
    fontSize: 10,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  featuresSection: {
    margin: 16,
    padding: 16,
    borderRadius: 14,
  },
  featuresSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  featureLabelCell: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 14,
  },
  featureValueCell: {
    width: 60,
    alignItems: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
  },
  summaryText: {},
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  bookButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
