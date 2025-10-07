import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/providers/onboarding-provider';
import { Package, Plus, X } from 'lucide-react-native';

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: string;
  description: string;
}

export default function ShopProductsScreen() {
  const insets = useSafeAreaInsets();
  const { updateShopData, setCurrentStep } = useOnboarding();
  
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: '', category: '', price: '', stock: '', description: '' },
  ]);

  const addProduct = () => {
    setProducts([...products, { id: Date.now().toString(), name: '', category: '', price: '', stock: '', description: '' }]);
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const updateProduct = (id: string, field: keyof Product, value: string) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const progress = useMemo(() => {
    const baseProgress = 25;
    const stepWeight = 25;
    
    const validProducts = products.filter(p => 
      p.name.trim() && 
      p.category.trim() && 
      p.price.trim() && 
      p.description.trim()
    );
    const maxProducts = 3;
    const productRatio = Math.min(validProducts.length / maxProducts, 1);
    
    const stepProgress = productRatio * stepWeight;
    return Math.round(baseProgress + stepProgress);
  }, [products]);

  const handleNext = () => {
    const validProducts = products.filter(p => 
      p.name.trim() && 
      p.category.trim() && 
      p.price.trim() && 
      p.description.trim()
    );
    
    if (validProducts.length === 0) {
      Alert.alert(
        'Product Requirements', 
        'Please add at least one complete product with:\n• Product name\n• Category\n• Price\n• Description'
      );
      return;
    }

    updateShopData({
      products: validProducts.length,
    });
    
    setCurrentStep('shop_wallet');
    router.push('/onboarding/shop/wallet' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Package size={32} color="#10B981" />
          </View>
          <Text style={styles.title}>Add Products</Text>
          <Text style={styles.subtitle}>List your first products</Text>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>Step 2 of 4 • {progress}%</Text>
        </View>

        <View style={styles.productsContainer}>
          {products.map((product, index) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <Text style={styles.productNumber}>Product {index + 1}</Text>
                {products.length > 1 && (
                  <TouchableOpacity onPress={() => removeProduct(product.id)}>
                    <X size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Product Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Fresh Tomatoes"
                  value={product.name}
                  onChangeText={(value) => updateProduct(product.id, 'name', value)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Vegetables"
                  value={product.category}
                  onChangeText={(value) => updateProduct(product.id, 'category', value)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Price (KSh) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="100"
                    value={product.price}
                    onChangeText={(value) => updateProduct(product.id, 'price', value)}
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Stock</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="50"
                    value={product.stock}
                    onChangeText={(value) => updateProduct(product.id, 'stock', value)}
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your product..."
                  value={product.description}
                  onChangeText={(value) => updateProduct(product.id, 'description', value)}
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={addProduct}>
            <Plus size={20} color="#10B981" />
            <Text style={styles.addButtonText}>Add Another Product</Text>
          </TouchableOpacity>

          <View style={styles.hint}>
            <Text style={styles.hintText}>
              💡 Complete product details help buyers make decisions faster
            </Text>
          </View>

          <View style={styles.requirementsCard}>
            <Text style={styles.requirementsTitle}>Product Listing Requirements:</Text>
            <Text style={styles.requirementItem}>✓ Product name</Text>
            <Text style={styles.requirementItem}>✓ Category</Text>
            <Text style={styles.requirementItem}>✓ Price</Text>
            <Text style={styles.requirementItem}>✓ Description</Text>
            <Text style={styles.requirementItem}>• Stock (optional)</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B98120',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  productsContainer: {
    gap: 16,
  },
  productCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10B981',
    borderStyle: 'dashed',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  hint: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  hintText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  requirementsCard: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 13,
    color: '#1E40AF',
    marginBottom: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
