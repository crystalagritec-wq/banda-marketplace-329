import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ShoppingBag, Plus, Users, FileText, Menu as MenuIcon, LogIn } from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';
import PostModal from '@/components/PostModal';
import SideMenu from '@/components/SideMenu';
import { TouchableOpacity, StyleSheet } from 'react-native';

const GREEN = '#2E7D32';
const ORANGE = '#F57C00';
const WHITE = '#FFFFFF';

export default function TabLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const [postModalVisible, setPostModalVisible] = useState<boolean>(false);
  const [sideMenuVisible, setSideMenuVisible] = useState<boolean>(false);
  
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
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
            paddingBottom: 8,
            paddingTop: 8,
            height: 65,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="marketplace"
          options={{
            title: 'Marketplace',
            tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Connect',
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="requests"
          options={{
            title: 'Request',
            tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="sell"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              if (user) {
                setPostModalVisible(true);
              } else {
                router.push('/(auth)/signin');
              }
            },
          }}
          options={{
            title: user ? 'Sell' : 'Login',
            tabBarIcon: ({ color, size }) => user ? <Plus size={size} color={color} /> : <LogIn size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="more"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setSideMenuVisible(true);
            },
          }}
          options={{
            title: 'More',
            tabBarIcon: ({ color, size }) => <MenuIcon size={size} color={color} />,
          }}
        />
        
        {/* Hidden tabs */}
        <Tabs.Screen
          name="home"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            href: null,
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
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
          }}
        />
      </Tabs>
      
      {/* Floating Action Button - Visible only for logged-in users */}
      {user && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setPostModalVisible(true)}
          testID="post-fab-button"
        >
          <Plus size={24} color={WHITE} />
        </TouchableOpacity>
      )}
      
      <PostModal
        visible={postModalVisible}
        onClose={() => setPostModalVisible(false)}
      />
      
      <SideMenu
        visible={sideMenuVisible}
        onClose={() => setSideMenuVisible(false)}
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

});
