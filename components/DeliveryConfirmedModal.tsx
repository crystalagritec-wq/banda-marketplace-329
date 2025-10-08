import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { X } from 'lucide-react-native';

interface DeliveryConfirmedModalProps {
  visible: boolean;
  onClose: () => void;
  estimatedTime: string;
  estimatedDate: string;
  onTrackOrder: () => void;
}

export default function DeliveryConfirmedModal({
  visible,
  onClose,
  estimatedTime,
  estimatedDate,
  onTrackOrder,
}: DeliveryConfirmedModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#000" />
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>DELIVERY CONFIRMED</Text>
            <Text style={styles.date}>{estimatedDate}</Text>
            <View style={styles.timeContainer}>
              <Text style={styles.time}>{estimatedTime}</Text>
              <Text style={styles.timePeriod}>PM</Text>
            </View>
            <Text style={styles.subtitle}>Estimated Arrival</Text>

            <View style={styles.mapPlaceholder}>
              <View style={styles.mapOverlay}>
                <View style={styles.driverIcon}>
                  <Text style={styles.driverIconText}>🚗</Text>
                </View>
                <Text style={styles.locationText}>Home</Text>
              </View>
            </View>

            <View style={styles.statusSection}>
              <Text style={styles.statusTitle}>DELIVERY STATUS</Text>
              <Text style={styles.statusText}>Looking for a driver...</Text>

              <View style={styles.progressBar}>
                <View style={styles.progressStep}>
                  <View style={[styles.progressDot, styles.progressDotActive]} />
                  <Text style={styles.progressLabel}>Order{'\n'}Received</Text>
                </View>
                <View style={styles.progressLine} />
                <View style={styles.progressStep}>
                  <View style={styles.progressDot} />
                  <Text style={styles.progressLabel}>Headed{'\n'}to Pickup</Text>
                </View>
                <View style={styles.progressLine} />
                <View style={styles.progressStep}>
                  <View style={styles.progressDot} />
                  <Text style={styles.progressLabel}>Food&apos;s on{'\n'}the Way</Text>
                </View>
                <View style={styles.progressLine} />
                <View style={styles.progressStep}>
                  <View style={styles.progressDot} />
                  <Text style={styles.progressLabel}>Arriving{'\n'}Soon</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.trackButton} onPress={onTrackOrder}>
                <Text style={styles.trackButtonText}>TRACK YOUR ORDER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#000',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 8,
  },
  time: {
    fontSize: 64,
    fontWeight: '700' as const,
    color: '#000',
    lineHeight: 72,
  },
  timePeriod: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: '#000',
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#e8f4f8',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  mapOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B4513',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  driverIconText: {
    fontSize: 32,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
  },
  statusSection: {
    backgroundColor: '#fff',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  progressDotActive: {
    backgroundColor: '#4CAF50',
  },
  progressLine: {
    height: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
    marginBottom: 32,
  },
  progressLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    lineHeight: 14,
  },
  trackButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#000',
    letterSpacing: 1,
  },
});
