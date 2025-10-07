import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Package, Plus, Edit, Trash2, AlertCircle, Search } from 'lucide-react-native';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'low_stock' | 'out_of_stock';
}

export default function ShopProductsScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Fresh Tomatoes', category: 'Vegetables', price: 150, stock: 45, status: 'active' },
    { id: '2', name: 'Organic Carrots', category: 'Vegetables', price: 120, stock: 8, status: 'low_stock' },
    { id: '3', name: 'Sweet Potatoes', category: 'Vegetables', price: 100, stock: 0, status: 'out_of_stock' },
    { id: '4', name: 'Fresh Milk', category: 'Dairy', price: 80, stock: 30, status: 'active' },
    { id: '5', name: 'Farm Eggs', category: 'Poultry', price: 200, stock: 15, status: 'active' },
  ]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditProduct = (productId: string) => {
    Alert.alert('Edit Product', `Edit product ${productId}`);
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setProducts(products.filter(p => p.id !== productId));
          },
        },
      ]
    );
  };

  const handleUpdateStock = (productId: string) => {
    Alert.prompt(
      'Update Stock',
      'Enter new stock quantity',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: (value) => {
            const newStock = parseInt(value || '0', 10);
            setProducts(products.map(p => {
              if (p.id === productId) {
                return {
                  ...p,
                  stock: newStock,
                  status: newStock === 0 ? 'out_of_stock' : newStock < 10 ? 'low_stock' : 'active',
                };
              }
              return p;
            }));
          },
        },
      ],
      'plain-text'
    );
  };

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'low_stock':
        return '#F59E0B';
      case 'out_of_stock':
        return '#EF4444';
    }
  };

  const getStatusText = (status: Product['status']) => {
    switch (status) {
      case 'active':
        return 'In Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Manage Products',
        }} 
      />
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/post-product' as any)}
          >
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.stats}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{products.length}</Text>
              <Text style={styles.statLabel}>Total Products</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#10B981' }]}>
                {products.filter(p => p.status === 'active').length}
              </Text>
              <Text style={styles.statLabel}>In Stock</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#EF4444' }]}>
                {products.filter(p => p.status === 'out_of_stock').length}
              </Text>
              <Text style={styles.statLabel}>Out of Stock</Text>
            </View>
          </View>

          <View style={styles.productsList}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productHeader}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productCategory}>{product.category}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(product.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(product.status) }]}>
                      {getStatusText(product.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.productDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Price</Text>
                    <Text style={styles.detailValue}>KSh {product.price.toLocaleString()}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Stock</Text>
                    <Text style={styles.detailValue}>{product.stock} units</Text>
                  </View>
                </View>

                {product.status === 'low_stock' && (
                  <View style={styles.warningBanner}>
                    <AlertCircle size={16} color="#F59E0B" />
                    <Text style={styles.warningText}>Stock running low!</Text>
                  </View>
                )}

                <View style={styles.productActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleUpdateStock(product.id)}
                  >
                    <Package size={18} color="#3B82F6" />
                    <Text style={styles.actionButtonText}>Update Stock</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditProduct(product.id)}
                  >
                    <Edit size={18} color="#10B981" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  productsList: {
    padding: 16,
    gap: 16,
  },
  productCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productDetails: {
    flexDirection: 'row',
    gap: 24,
  },
  detailItem: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});
