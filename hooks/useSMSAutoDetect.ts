import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

interface SMSAutoDetectHook {
  detectedOTP: string | null;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  clearDetectedOTP: () => void;
}

export const useSMSAutoDetect = (): SMSAutoDetectHook => {
  const [detectedOTP, setDetectedOTP] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [clipboardCheckInterval, setClipboardCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Extract OTP from text using regex
  const extractOTP = useCallback((text: string): string | null => {
    // Common OTP patterns: 6 digits, sometimes with spaces or dashes
    const otpPatterns = [
      /\b(\d{6})\b/g,                    // 6 consecutive digits
      /\b(\d{3}[\s-]?\d{3})\b/g,        // 3-3 digits with optional space/dash
      /\b(\d{2}[\s-]?\d{2}[\s-]?\d{2})\b/g, // 2-2-2 digits
      /verification[\s\w]*?:?[\s]*(\d{6})/gi, // "verification code: 123456"
      /code[\s\w]*?:?[\s]*(\d{6})/gi,        // "code: 123456"
      /otp[\s\w]*?:?[\s]*(\d{6})/gi,         // "OTP: 123456"
    ];

    for (const pattern of otpPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        // Extract only digits from the match
        const digits = matches[0].replace(/\D/g, '');
        if (digits.length === 6) {
          return digits;
        }
      }
    }
    return null;
  }, []);

  // Android SMS Retriever API simulation (would need native module in real app)
  const startAndroidSMSListener = useCallback(() => {
    if (Platform.OS !== 'android') return;
    
    console.log('📱 Starting Android SMS auto-detection...');
    // In a real app, this would use SMS Retriever API
    // For demo, we'll simulate with a timeout
    setTimeout(() => {
      const demoOTP = '123456';
      console.log('📨 Demo SMS received with OTP:', demoOTP);
      setDetectedOTP(demoOTP);
    }, 3000); // Simulate SMS arrival after 3 seconds
  }, []);

  // iOS SMS auto-fill detection (works with proper SMS format)
  const startIOSSMSListener = useCallback(() => {
    if (Platform.OS !== 'ios') return;
    
    console.log('📱 iOS SMS auto-fill ready (requires proper SMS format)');
    // iOS handles this automatically with TextInput when SMS has proper format
    // Format: "Your verification code is 123456" or similar
  }, []);

  // Clipboard monitoring for WhatsApp/Email OTPs
  const startClipboardMonitoring = useCallback(() => {
    console.log('📋 Starting clipboard monitoring...');
    
    const checkClipboard = async () => {
      try {
        const clipboardText = await Clipboard.getStringAsync();
        if (clipboardText) {
          const otp = extractOTP(clipboardText);
          if (otp && otp !== detectedOTP) {
            console.log('📋 OTP detected from clipboard:', otp);
            setDetectedOTP(otp);
          }
        }
      } catch {
        // Silently handle clipboard permission errors
        console.log('📋 Clipboard access not available or denied');
      }
    };

    // Check clipboard every 2 seconds
    const interval = setInterval(checkClipboard, 2000);
    setClipboardCheckInterval(interval as any);
    
    // Initial check
    checkClipboard();
  }, [extractOTP, detectedOTP]);

  const startListening = useCallback(() => {
    if (isListening) return;
    
    setIsListening(true);
    setDetectedOTP(null);
    
    // Start platform-specific SMS detection
    if (Platform.OS === 'android') {
      startAndroidSMSListener();
    } else if (Platform.OS === 'ios') {
      startIOSSMSListener();
    }
    
    // Always start clipboard monitoring for WhatsApp/Email OTPs
    startClipboardMonitoring();
  }, [isListening, startAndroidSMSListener, startIOSSMSListener, startClipboardMonitoring]);

  const stopListening = useCallback(() => {
    console.log('🛑 Stopping OTP auto-detection...');
    setIsListening(false);
    
    if (clipboardCheckInterval) {
      clearInterval(clipboardCheckInterval);
      setClipboardCheckInterval(null);
    }
  }, [clipboardCheckInterval]);

  const clearDetectedOTP = useCallback(() => {
    setDetectedOTP(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    detectedOTP,
    isListening,
    startListening,
    stopListening,
    clearDetectedOTP,
  };
};

export default useSMSAutoDetect;