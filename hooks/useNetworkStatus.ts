import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
}

export function useNetworkStatus() {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: null,
    type: null,
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web-specific network detection
      const updateOnlineStatus = () => {
        setNetworkState({
          isConnected: navigator.onLine,
          isInternetReachable: navigator.onLine,
          type: 'wifi', // Assume wifi for web
        });
      };

      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      
      // Initial check
      updateOnlineStatus();

      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    } else {
      // For native platforms, we'll use a simple approach
      // In a real app, you'd use @react-native-netinfo/netinfo
      setNetworkState({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      });
    }
  }, []);

  return networkState;
}

export function useOfflineQueue() {
  const [queue, setQueue] = useState<any[]>([]);
  const networkState = useNetworkStatus();

  const addToQueue = (action: any) => {
    if (!networkState.isConnected) {
      setQueue(prev => [...prev, action]);
      return true; // Added to queue
    }
    return false; // Not added, network available
  };

  const processQueue = async () => {
    if (networkState.isConnected && queue.length > 0) {
      console.log(`Processing ${queue.length} queued actions...`);
      // Process queued actions here
      setQueue([]);
    }
  };

  useEffect(() => {
    if (networkState.isConnected) {
      processQueue();
    }
  }, [networkState.isConnected, processQueue]);

  return {
    addToQueue,
    queueLength: queue.length,
    isOnline: networkState.isConnected,
  };
}