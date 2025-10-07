import { useCallback } from 'react';
import { Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import type { AiAction, ValidatedAiResponse } from '@/utils/validateAiResponse';

export function useCustomerCare() {
  const router = useRouter();

  const handleAction = useCallback((action: AiAction) => {
    try {
      console.log('🤖 Customer Care Action:', action);
      
      switch (action.type) {
        case 'navigation':
          if (action.screen) {
            // Map screen names to actual routes
            const routeMap: Record<string, string> = {
              'MarketplaceScreen': '/(tabs)/marketplace',
              'CartScreen': '/(tabs)/cart',
              'OrdersScreen': '/(tabs)/orders',
              'PaymentsScreen': '/(tabs)/wallet',
              'ProfileScreen': '/(tabs)/account',
              'SupportScreen': '/contact',
              'NotificationsScreen': '/notifications',
              'LocationScreen': '/address',
              'DisputeScreen': '/disputes',
            };
            
            const route = routeMap[action.screen] || action.screen;
            router.push(route as any);
          }
          break;
          
        case 'deeplink':
          if (action.screen && action.params) {
            const routeMap: Record<string, string> = {
              'MarketplaceScreen': '/(tabs)/marketplace',
              'CartScreen': '/(tabs)/cart',
              'OrdersScreen': '/(tabs)/orders',
              'PaymentsScreen': '/(tabs)/wallet',
              'ProfileScreen': '/(tabs)/account',
            };
            
            const route = routeMap[action.screen] || action.screen;
            router.push({ pathname: route as any, params: action.params });
          }
          break;
          
        case 'modal':
          Alert.alert('Info', `${action.label}`);
          break;
          
        case 'link':
          if (action.url) {
            Linking.openURL(action.url);
          }
          break;
          
        default:
          console.warn('Unknown action type:', action);
      }
    } catch (err) {
      console.warn('Action failed:', action, err);
      Alert.alert('Error', 'Unable to complete this action. Please try again.');
    }
  }, [router]);

  return { handleAction };
}