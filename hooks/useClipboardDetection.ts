import { useEffect, useState, useCallback } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Platform } from 'react-native';

interface ClipboardDetectionHook {
  clipboardText: string | null;
  detectedOTP: string | null;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearDetected: () => void;
  checkClipboardNow: () => Promise<void>;
}

export const useClipboardDetection = (): ClipboardDetectionHook => {
  const [clipboardText, setClipboardText] = useState<string | null>(null);
  const [detectedOTP, setDetectedOTP] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [monitorInterval, setMonitorInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastClipboardText, setLastClipboardText] = useState<string>('');

  // Enhanced OTP extraction with multiple patterns
  const extractOTP = useCallback((text: string): string | null => {
    if (!text || typeof text !== 'string') return null;
    
    // Clean text for processing
    text.toLowerCase().replace(/[\n\r\t]/g, ' ');
    
    // Multiple OTP patterns for different services
    const patterns = [
      // Standard 6-digit codes
      /\b(\d{6})\b/g,
      
      // With separators
      /\b(\d{3}[\s\-_]?\d{3})\b/g,
      /\b(\d{2}[\s\-_]?\d{2}[\s\-_]?\d{2})\b/g,
      
      // Context-aware patterns
      /(?:verification|verify|code|otp|pin)\s*:?\s*(\d{6})/gi,
      /(?:your|the)\s+(?:verification|code|otp)\s+(?:is|code)?\s*:?\s*(\d{6})/gi,
      
      // WhatsApp specific
      /whatsapp\s+(?:verification|code)\s*:?\s*(\d{6})/gi,
      
      // Email specific
      /(?:email|e-mail)\s+(?:verification|code)\s*:?\s*(\d{6})/gi,
      
      // SMS specific
      /(?:sms|text)\s+(?:verification|code)\s*:?\s*(\d{6})/gi,
      
      // Generic patterns with common words
      /(?:enter|use|type)\s+(?:this|the)?\s*(?:code|otp)?\s*:?\s*(\d{6})/gi,
    ];

    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const captured = match[1];
        if (captured) {
          // Extract only digits
          const digits = captured.replace(/\D/g, '');
          if (digits.length === 6 && /^\d{6}$/.test(digits)) {
            return digits;
          }
        }
      }
    }
    
    // Fallback: look for any 6-digit sequence
    const digitMatch = text.match(/\d{6}/);
    if (digitMatch) {
      return digitMatch[0];
    }
    
    return null;
  }, []);

  const checkClipboardNow = useCallback(async (): Promise<void> => {
    try {
      // Check if clipboard access is available
      if (Platform.OS === 'web') {
        // Web clipboard requires user permission
        if (!navigator.clipboard) {
          console.log('📋 Clipboard API not available on this browser');
          return;
        }
        
        try {
          const currentClipboard = await navigator.clipboard.readText();
          
          if (currentClipboard && currentClipboard !== lastClipboardText) {
            console.log('📋 New clipboard content detected');
            setClipboardText(currentClipboard);
            setLastClipboardText(currentClipboard);
            
            const otp = extractOTP(currentClipboard);
            if (otp) {
              console.log('🎯 OTP extracted from clipboard:', otp);
              setDetectedOTP(otp);
            }
          }
        } catch {
          // User denied permission or clipboard access failed - silently ignore
          return;
        }
      } else {
        // Native platforms
        const currentClipboard = await Clipboard.getStringAsync();
        
        if (currentClipboard && currentClipboard !== lastClipboardText) {
          console.log('📋 New clipboard content detected');
          setClipboardText(currentClipboard);
          setLastClipboardText(currentClipboard);
          
          const otp = extractOTP(currentClipboard);
          if (otp) {
            console.log('🎯 OTP extracted from clipboard:', otp);
            setDetectedOTP(otp);
          }
        }
      }
    } catch {
      // Silently ignore clipboard errors
    }
  }, [extractOTP, lastClipboardText]);

  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    console.log('📋 Starting clipboard monitoring...');
    setIsMonitoring(true);
    setDetectedOTP(null);
    
    // Initial check
    checkClipboardNow();
    
    // Set up interval monitoring
    const interval = setInterval(checkClipboardNow, 1500); // Check every 1.5 seconds
    setMonitorInterval(interval as any);
  }, [isMonitoring, checkClipboardNow]);

  const stopMonitoring = useCallback(() => {
    console.log('🛑 Stopping clipboard monitoring...');
    setIsMonitoring(false);
    
    if (monitorInterval) {
      clearInterval(monitorInterval);
      setMonitorInterval(null);
    }
  }, [monitorInterval]);

  const clearDetected = useCallback(() => {
    setDetectedOTP(null);
    setClipboardText(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    clipboardText,
    detectedOTP,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearDetected,
    checkClipboardNow,
  };
};

export default useClipboardDetection;