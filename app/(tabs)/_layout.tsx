import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Home, ShoppingBag, Plus, User, ShoppingCart, Users } from 'lucide-react-native';
import { useCart } from '@/providers/cart-provider';
import PostModal from '@/components/PostModal';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const GREEN = '#2E7D32';
const ORANGE = '#F57C00';
const WHITE = '#FFFFFF';

export default function TabLayout() {
  const { cartSummary } = useCart();
  const [postModalVisible, setPostModalVisible] = useState<boolean>(false);
  
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: GREEN,
          tabBarInactiveTintColor: '#666',
          tabBarStyle: {
            backgroundColor: WHITE,
            borderTopWidth: 1,
            borderTopColor: '#E5E5E5',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="marketplace"
          options={{
            title: 'Marketplace',
            tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
          }}
        />

        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.cartContainer}>
                <ShoppingCart size={size} color={color} />
                {cartSummary.itemCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>
                      {cartSummary.itemCount}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Community',
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
        
        {/* Hidden tabs - accessible via side menu */}
        <Tabs.Screen
          name="wallet"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="requests"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="product"
          options={{
            href: null,
          }}
        />
      </Tabs>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setPostModalVisible(true)}
        testID="post-fab-button"
      >
        <Plus size={24} color={WHITE} />
      </TouchableOpacity>
      
      <PostModal
        visible={postModalVisible}
        onClose={() => setPostModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: ORANGE,
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 1000,
  },
  cartContainer: {
    position: 'relative',
  },
  cartIconWrapper: {
    backgroundColor: ORANGE,
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cartGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: GREEN,
    opacity: 0.6,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: WHITE,
    fontSize: 10,
    fontWeight: '700',
  },
});
