import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingCart, User, Plus } from 'lucide-react-native';

const GREEN = '#2E7D32';
const WHITE = '#FFFFFF';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Banda</Text>
        <Text style={styles.subtitle}>Your agricultural marketplace</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/(tabs)/marketplace')}
        >
          <ShoppingCart size={32} color={GREEN} />
          <Text style={styles.cardTitle}>Marketplace</Text>
          <Text style={styles.cardDescription}>Browse products and services</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/(tabs)/account')}
        >
          <User size={32} color={GREEN} />
          <Text style={styles.cardTitle}>My Account</Text>
          <Text style={styles.cardDescription}>Manage your profile and settings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.primaryCard]}
          onPress={() => router.push('/(tabs)/marketplace')}
        >
          <Plus size={32} color={WHITE} />
          <Text style={[styles.cardTitle, { color: WHITE }]}>Start Selling</Text>
          <Text style={[styles.cardDescription, { color: WHITE }]}>Post your products and services</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: GREEN,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  primaryCard: {
    backgroundColor: GREEN,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
