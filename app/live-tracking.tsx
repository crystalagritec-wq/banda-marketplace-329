import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Phone, Maximize2, Shield, ChevronDown, Mic } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LiveTrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState('');

  const tipOptions = [
    { emoji: '😊', amount: 20, label: '₹20' },
    { emoji: '😄', amount: 30, label: '₹30' },
    { emoji: '😁', amount: 50, label: '₹50' },
    { emoji: '🙏', amount: 0, label: 'Other' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Packing your order</Text>
      </View>

      <View style={styles.etaBanner}>
        <Text style={styles.etaText}>Arriving in 5 minutes</Text>
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <View style={styles.routeLine} />
          <View style={styles.storeMarker}>
            <Text style={styles.markerIcon}>🏪</Text>
          </View>
          <View style={styles.driverMarker}>
            <Text style={styles.markerIcon}>🚗</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.expandButton}>
          <Maximize2 size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.driverCard}>
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>👤</Text>
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>I&apos;m Ajay, your delivery partner</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Phone size={20} color="#2e7d32" />
          </TouchableOpacity>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusMessage}>
            I&apos;ve reached the store and will pick up your order soon
          </Text>
        </View>

        <View style={styles.tipSection}>
          <View style={styles.tipHeader}>
            <Text style={styles.tipTitle}>Delivering happiness at your doorstep!</Text>
            <View style={styles.deliveryIllustration}>
              <Text style={styles.illustrationEmoji}>🛵</Text>
              <Text style={styles.illustrationEmoji}>👨</Text>
            </View>
          </View>
          <Text style={styles.tipSubtitle}>Thank them by leaving a tip</Text>
          
          <View style={styles.tipOptions}>
            {tipOptions.map((option) => (
              <TouchableOpacity
                key={option.amount}
                style={[
                  styles.tipOption,
                  selectedTip === option.amount && styles.tipOptionSelected,
                ]}
                onPress={() => setSelectedTip(option.amount)}
              >
                <Text style={styles.tipEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.tipLabel,
                  selectedTip === option.amount && styles.tipLabelSelected,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.safetyCard}>
          <View style={styles.safetyHeader}>
            <Shield size={20} color="#2e7d32" />
            <Text style={styles.safetyTitle}>Your Blinkit store is 1 km away.</Text>
          </View>
          <TouchableOpacity style={styles.safetyLink}>
            <Text style={styles.safetyLinkText}>Learn about delivery partner safety</Text>
            <ChevronLeft size={16} color="#2e7d32" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.instructionsCard}
          onPress={() => setShowInstructions(!showInstructions)}
        >
          <View style={styles.instructionsHeader}>
            <Mic size={20} color="#666" />
            <Text style={styles.instructionsTitle}>Add delivery instructions</Text>
          </View>
          <Text style={styles.instructionsSubtitle}>Help your delivery partner reach you</Text>
          <ChevronDown 
            size={20} 
            color="#666" 
            style={[
              styles.instructionsChevron,
              showInstructions && { transform: [{ rotate: '180deg' }] }
            ]} 
          />
        </TouchableOpacity>

        {showInstructions && (
          <View style={styles.instructionsInput}>
            <TextInput
              style={styles.textInput}
              placeholder="E.g., Ring the doorbell, Leave at door..."
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#2e7d32',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
  },
  etaBanner: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  etaText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  mapContainer: {
    height: 300,
    backgroundColor: '#e8f4f8',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeLine: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: '#666',
    borderStyle: 'dashed' as const,
  },
  storeMarker: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  driverMarker: {
    position: 'absolute',
    top: '25%',
    right: '15%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 28,
  },
  expandButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverAvatarText: {
    fontSize: 24,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f9f4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  statusCard: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  statusMessage: {
    fontSize: 14,
    color: '#1b5e20',
    lineHeight: 20,
  },
  tipSection: {
    backgroundColor: '#fffbf0',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
    flex: 1,
  },
  deliveryIllustration: {
    flexDirection: 'row',
    gap: 8,
  },
  illustrationEmoji: {
    fontSize: 32,
  },
  tipSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  tipOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  tipOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tipOptionSelected: {
    borderColor: '#FFD700',
    backgroundColor: '#fffef0',
  },
  tipEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#666',
  },
  tipLabelSelected: {
    color: '#000',
  },
  safetyCard: {
    backgroundColor: '#f0f9f4',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1b5e20',
    flex: 1,
  },
  safetyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  safetyLinkText: {
    fontSize: 13,
    color: '#2e7d32',
    textDecorationLine: 'underline' as const,
  },
  instructionsCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
  },
  instructionsSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  instructionsChevron: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  instructionsInput: {
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
  },
  textInput: {
    fontSize: 14,
    color: '#000',
    minHeight: 80,
    textAlignVertical: 'top' as const,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
