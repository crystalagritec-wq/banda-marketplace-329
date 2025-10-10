import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  ShoppingBag,
  Search,
  Package,
  Heart,
  AlertCircle,
  Inbox,
  FileX,
} from 'lucide-react-native';

type EmptyStateType =
  | 'products'
  | 'search'
  | 'orders'
  | 'favorites'
  | 'cart'
  | 'notifications'
  | 'error'
  | 'generic';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({
  type = 'generic',
  title,
  message,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  const getDefaultContent = () => {
    switch (type) {
      case 'products':
        return {
          icon: <Package size={64} color="#9CA3AF" />,
          title: 'No Products Found',
          message: 'Try adjusting your filters or search terms',
        };
      case 'search':
        return {
          icon: <Search size={64} color="#9CA3AF" />,
          title: 'No Results',
          message: 'We couldn\'t find what you\'re looking for',
        };
      case 'orders':
        return {
          icon: <ShoppingBag size={64} color="#9CA3AF" />,
          title: 'No Orders Yet',
          message: 'Start shopping to see your orders here',
        };
      case 'favorites':
        return {
          icon: <Heart size={64} color="#9CA3AF" />,
          title: 'No Favorites',
          message: 'Save items you love to find them easily later',
        };
      case 'cart':
        return {
          icon: <ShoppingBag size={64} color="#9CA3AF" />,
          title: 'Your Cart is Empty',
          message: 'Add products to your cart to get started',
        };
      case 'notifications':
        return {
          icon: <Inbox size={64} color="#9CA3AF" />,
          title: 'No Notifications',
          message: 'You\'re all caught up!',
        };
      case 'error':
        return {
          icon: <AlertCircle size={64} color="#EF4444" />,
          title: 'Something Went Wrong',
          message: 'Please try again later',
        };
      default:
        return {
          icon: <FileX size={64} color="#9CA3AF" />,
          title: 'Nothing Here',
          message: 'There\'s nothing to show right now',
        };
    }
  };

  const defaultContent = getDefaultContent();
  const displayIcon = icon || defaultContent.icon;
  const displayTitle = title || defaultContent.title;
  const displayMessage = message || defaultContent.message;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {displayIcon as React.ReactElement}
      </View>
      <Text style={styles.title}>{displayTitle}</Text>
      <Text style={styles.message}>{displayMessage}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  iconContainer: {
    marginBottom: 24,
    opacity: 0.6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#2D5016',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
