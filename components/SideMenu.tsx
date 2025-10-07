import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import {
  X,
  User,
  Wallet,
  MessageCircle,
  ShoppingCart,
  Package,
  Settings,
  HelpCircle,
  Bell,
  Heart,
  TrendingUp,
  Shield,
  LogOut,
  LayoutDashboard,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import { useWishlist } from '@/providers/wishlist-provider';
import { useCart } from '@/providers/cart-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWalletCheck } from '@/hooks/useWalletCheck';

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
}

const MENU_WIDTH = 280;

interface MenuItem {
  id: string;
  title: string;
  icon: any;
  route?: string;
  action?: () => void;
  badge?: number;
  divider?: boolean;
}

export default function SideMenu({ visible, onClose }: SideMenuProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { cartSummary } = useCart();
  const insets = useSafeAreaInsets();
  const { checkWalletAndNavigate } = useWalletCheck();
  const slideAnim = React.useRef(new Animated.Value(-MENU_WIDTH)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -MENU_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  const handleNavigation = (route: string) => {
    const trimmed = typeof route === 'string' ? route.trim() : '';
    if (!trimmed || trimmed.length > 128) {
      onClose();
      return;
    }
    onClose();
    
    if (trimmed === '/(tabs)/wallet') {
      checkWalletAndNavigate();
      return;
    }
    
    const validRoutes = [
      '/dashboard',
      '/(tabs)/chat', 
      '/(tabs)/cart',
      '/(tabs)/orders',
      '/favorites',
      '/notifications',
      '/insights',
      '/settings',
      '/settings/help',
      '/settings/legal'
    ];
    
    if (validRoutes.includes(trimmed)) {
      router.push(trimmed as any);
    } else {
      console.warn('Invalid route:', trimmed);
    }
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      route: '/dashboard',
    },
    {
      id: 'wallet',
      title: 'AgriPay Wallet',
      icon: Wallet,
      route: '/(tabs)/wallet',
    },
    {
      id: 'chat',
      title: 'Banda AI',
      icon: MessageCircle,
      route: '/(tabs)/chat',
    },
    {
      id: 'cart',
      title: 'Shopping Cart',
      icon: ShoppingCart,
      route: '/(tabs)/cart',
      badge: cartSummary?.itemCount ?? 0,
    },
    {
      id: 'orders',
      title: 'My Orders',
      icon: Package,
      route: '/(tabs)/orders',
    },
    {
      id: 'divider1',
      title: '',
      icon: null,
      divider: true,
    },
    {
      id: 'favorites',
      title: 'My Wishlist',
      icon: Heart,
      route: '/favorites',
      badge: wishlistCount > 0 ? wishlistCount : undefined,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      route: '/notifications',
      badge: 5,
    },

    {
      id: 'insights',
      title: 'Market Insights',
      icon: TrendingUp,
      route: '/insights',
    },


    {
      id: 'divider2',
      title: '',
      icon: null,
      divider: true,
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      route: '/settings',
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: HelpCircle,
      route: '/settings/help',
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: Shield,
      route: '/settings/legal',
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: LogOut,
      action: handleLogout,
    },
  ];

  const renderMenuItem = (item: MenuItem) => {
    if (item.divider) {
      return <View key={item.id} style={styles.divider} />;
    }

    const IconComponent = item.icon;
    const handlePress = () => {
      if (item.action) {
        item.action();
      } else if (item.route) {
        handleNavigation(item.route);
      }
    };

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.menuItem,
          item.id === 'logout' && styles.menuItemDanger,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
        testID={`menu-item-${item.id}`}
      >
        <View style={styles.menuItemLeft}>
          <View
            style={[
              styles.menuItemIcon,
              item.id === 'logout' && styles.menuItemIconDanger,
            ]}
          >
            <IconComponent
              size={20}
              color={item.id === 'logout' ? '#EF4444' : '#666'}
            />
          </View>
          <Text
            style={[
              styles.menuItemText,
              item.id === 'logout' && styles.menuItemTextDanger,
            ]}
          >
            {item.title}
          </Text>
        </View>
        {item.badge && item.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
      testID="side-menu-modal"
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.backdrop, 
            { opacity: opacityAnim }
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View 
          style={[
            styles.menuContainer, 
            { 
              paddingTop: insets.top,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <LinearGradient colors={['#2D5016', '#4A7C59']} style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <User size={32} color="white" />
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                testID="close-menu"
              >
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView
            style={styles.menuContent}
            contentContainerStyle={styles.menuScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {menuItems.map(renderMenuItem)}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Banda v1.0.0</Text>
            <Text style={styles.footerSubtext}>
              Made with ❤️ for East African farmers
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'relative',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: 'white',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    zIndex: 1000,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },

  closeButton: {
    padding: 4,
  },
  menuContent: {
    flex: 1,
  },
  menuScrollContent: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  menuItemDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemIconDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  menuItemTextDanger: {
    color: '#EF4444',
  },
  badge: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
    marginHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});