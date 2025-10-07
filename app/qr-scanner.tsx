import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  QrCode,
  Flashlight,
  FlashlightOff,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Package,
  User,
  FileText,
  AlertCircle,
} from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { trpc } from '@/lib/trpc';

const QRScannerView = ({ 
  onScan, 
  flashEnabled 
}: { 
  onScan: (data: string) => void; 
  flashEnabled: boolean;
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState<boolean>(false);

  if (!permission) {
    return (
      <View style={styles.scannerContainer}>
        <Text style={styles.scannerText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.scannerContainer}>
        <View style={styles.permissionContainer}>
          <Camera size={48} color="white" />
          <Text style={styles.permissionText}>Camera permission required</Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.scannerContainer}>
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerFrame}>
            <View style={styles.scannerCorner} />
            <View style={[styles.scannerCorner, styles.topRight]} />
            <View style={[styles.scannerCorner, styles.bottomLeft]} />
            <View style={[styles.scannerCorner, styles.bottomRight]} />
          </View>
          <Text style={styles.scannerText}>
            QR scanning not available on web
          </Text>
          <TouchableOpacity 
            style={styles.mockScanButton}
            onPress={() => onScan('{"type":"order","id":"qr_123","order_id":"ORDER123","signature":"BANDA_123_456"}')}
          >
            <Text style={styles.mockScanText}>Simulate QR Scan (Demo)</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.scannerContainer}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={flashEnabled}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={(result) => {
          if (!hasScanned && result.data) {
            setHasScanned(true);
            onScan(result.data);
            setTimeout(() => setHasScanned(false), 2000);
          }
        }}
      />
      <View style={styles.scannerOverlay}>
        <View style={styles.scannerFrame}>
          <View style={styles.scannerCorner} />
          <View style={[styles.scannerCorner, styles.topRight]} />
          <View style={[styles.scannerCorner, styles.bottomLeft]} />
          <View style={[styles.scannerCorner, styles.bottomRight]} />
        </View>
        <Text style={styles.scannerText}>
          Position QR code within the frame
        </Text>
      </View>
    </View>
  );
};

const QRTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'order':
      return <Package size={24} color="#2D5016" />;
    case 'user':
      return <User size={24} color="#1976D2" />;
    case 'receipt':
      return <FileText size={24} color="#F59E0B" />;
    case 'dispute':
      return <AlertTriangle size={24} color="#EF4444" />;
    default:
      return <QrCode size={24} color="#6B7280" />;
  }
};

export default function QRScannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ type?: string; orderId?: string }>();
  
  const [flashEnabled, setFlashEnabled] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(true);
  const [manualEntry, setManualEntry] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');
  const [scanResult, setScanResult] = useState<any>(null);
  
  const scanQR = trpc.qr.scan.useMutation();

  const handleQRScan = useCallback(async (qrData: string) => {
    if (!scanning) return;
    
    setScanning(false);
    
    try {
      const result = await scanQR.mutateAsync({
        qr_value: qrData,
        user_id: 'current-user-id', // In real app, get from auth
        gps_location: {
          latitude: -1.2921, // Mock Nairobi coordinates
          longitude: 36.8219,
        },
        device_info: Platform.OS,
      });

      setScanResult(result);
      
      if (result.success) {
        handleScanSuccess(result);
      } else {
        handleScanError(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('QR scan error:', error);
      handleScanError('Failed to process QR code');
    }
  }, [scanning, scanQR]);

  const handleScanSuccess = useCallback((result: any) => {
    const { action_result } = result;
    
    console.log('✅ QR Code Verified:', result.message);
    
    if (action_result?.type === 'order_action') {
      console.log(`Order ${action_result.order_id} has been ${action_result.action === 'pickup' ? 'picked up' : 'delivered'} successfully.`);
      router.push(`/order-details?orderId=${action_result.order_id}`);
    } else if (action_result?.type === 'receipt_verification') {
      console.log(`Receipt for Order ${action_result.order_id} is valid. Reserve status: ${action_result.reserve_status}`);
      router.back();
    } else {
      console.log('QR code scanned successfully!');
      router.back();
    }
  }, [router]);

  const handleScanError = useCallback((error: string) => {
    console.log('❌ Scan Failed:', error);
    setManualEntry(true);
  }, []);

  const handleManualEntry = useCallback(async () => {
    if (!manualCode.trim()) {
      console.log('Error: Please enter a verification code');
      return;
    }

    await handleQRScan(manualCode.trim());
    setManualEntry(false);
    setManualCode('');
  }, [manualCode, handleQRScan]);

  const toggleFlash = useCallback(() => {
    setFlashEnabled(prev => !prev);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#000000', '#1F2937']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <TouchableOpacity onPress={toggleFlash} style={styles.flashButton}>
            {flashEnabled ? (
              <Flashlight size={24} color="#F59E0B" />
            ) : (
              <FlashlightOff size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Scanner View */}
        <QRScannerView onScan={handleQRScan} flashEnabled={flashEnabled} />

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <View style={styles.controlsRow}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => setManualEntry(true)}
            >
              <Text style={styles.controlButtonText}>Manual Entry</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, styles.primaryButton]}
              onPress={() => setScanning(true)}
              disabled={!scanning}
            >
              <Camera size={20} color="white" />
              <Text style={styles.primaryButtonText}>
                {scanning ? 'Scanning...' : 'Scan Again'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Supported QR Types:</Text>
            <View style={styles.qrTypes}>
              <View style={styles.qrType}>
                <QRTypeIcon type="order" />
                <Text style={styles.qrTypeText}>Orders</Text>
              </View>
              <View style={styles.qrType}>
                <QRTypeIcon type="user" />
                <Text style={styles.qrTypeText}>Users</Text>
              </View>
              <View style={styles.qrType}>
                <QRTypeIcon type="receipt" />
                <Text style={styles.qrTypeText}>Receipts</Text>
              </View>
              <View style={styles.qrType}>
                <QRTypeIcon type="dispute" />
                <Text style={styles.qrTypeText}>Disputes</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Manual Entry Modal */}
        <Modal
          visible={manualEntry}
          transparent
          animationType="slide"
          onRequestClose={() => setManualEntry(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Manual Entry</Text>
                <TouchableOpacity 
                  onPress={() => setManualEntry(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalDescription}>
                Enter the verification code manually if QR scanning fails:
              </Text>
              
              <TextInput
                style={styles.manualInput}
                placeholder="Enter verification code"
                value={manualCode}
                onChangeText={setManualCode}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => setManualEntry(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalSubmitButton}
                  onPress={handleManualEntry}
                >
                  <Text style={styles.modalSubmitText}>Verify</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Scan Result Display */}
        {scanResult && (
          <View style={styles.resultOverlay}>
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                {scanResult.success ? (
                  <CheckCircle2 size={32} color="#10B981" />
                ) : (
                  <AlertCircle size={32} color="#EF4444" />
                )}
                <Text style={styles.resultTitle}>
                  {scanResult.success ? 'Scan Successful' : 'Scan Failed'}
                </Text>
              </View>
              
              <Text style={styles.resultMessage}>
                {scanResult.message}
              </Text>
              
              {scanResult.action_result && (
                <View style={styles.resultDetails}>
                  <Text style={styles.resultDetailsTitle}>Details:</Text>
                  <Text style={styles.resultDetailsText}>
                    Type: {scanResult.action_result.type}
                  </Text>
                  {scanResult.action_result.order_id && (
                    <Text style={styles.resultDetailsText}>
                      Order: {scanResult.action_result.order_id}
                    </Text>
                  )}
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.resultButton}
                onPress={() => setScanResult(null)}
              >
                <Text style={styles.resultButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  flashButton: {
    padding: 4,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    marginBottom: 40,
  },
  scannerCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#10B981',
    borderWidth: 3,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 0,
  },
  topRight: {
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    right: 0,
    left: 'auto',
  },
  bottomLeft: {
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
    bottom: 0,
    left: 0,
    top: 'auto',
  },
  bottomRight: {
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
  },
  scannerText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  mockScanButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  mockScanText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  controlButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryButton: {
    backgroundColor: '#2D5016',
    flexDirection: 'row',
    gap: 8,
    borderColor: '#2D5016',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
  },
  instructionsTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  qrTypes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  qrType: {
    alignItems: 'center',
    gap: 4,
  },
  qrTypeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#6B7280',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  manualInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: '#2D5016',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSubmitText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  resultOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  resultMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  resultDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  resultDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  resultDetailsText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  resultButton: {
    backgroundColor: '#2D5016',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resultButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});