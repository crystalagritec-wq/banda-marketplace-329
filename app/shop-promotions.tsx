import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tag, Plus, Calendar, Percent, DollarSign, X } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/auth-provider';

type PromotionStatus = 'all' | 'active' | 'scheduled' | 'expired';

export default function ShopPromotionsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [status, setStatus] = useState<PromotionStatus>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minPurchase: '',
  });

  const promotionsQuery = trpc.shop.getPromotions.useQuery(
    { vendorId: user?.id || '', status },
    { enabled: !!user?.id }
  );

  const createPromotionMutation = trpc.shop.createPromotion.useMutation({
    onSuccess: () => {
      promotionsQuery.refetch();
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchase: '',
      });
      Alert.alert('Success', 'Promotion created successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to create promotion');
    },
  });

  const handleCreatePromotion = () => {
    if (!formData.name || !formData.discountValue) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    createPromotionMutation.mutate({
      vendorId: user?.id || '',
      name: formData.name,
      description: formData.description,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : undefined,
    });
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Promotions',
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowCreateModal(true)}>
              <Plus size={24} color="#10B981" />
            </TouchableOpacity>
          ),
        }} 
      />
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterButtons}>
              {(['all', 'active', 'scheduled', 'expired'] as PromotionStatus[]).map((filterStatus) => (
                <TouchableOpacity
                  key={filterStatus}
                  style={[
                    styles.filterButton,
                    status === filterStatus && styles.filterButtonActive,
                  ]}
                  onPress={() => setStatus(filterStatus)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      status === filterStatus && styles.filterButtonTextActive,
                    ]}
                  >
                    {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {promotionsQuery.isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Loading promotions...</Text>
          </View>
        ) : promotionsQuery.data?.promotions.length === 0 ? (
          <View style={styles.centerContent}>
            <Tag size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No promotions found</Text>
            <Text style={styles.emptyText}>
              Create promotions to boost your sales
            </Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={20} color="white" />
              <Text style={styles.createButtonText}>Create Promotion</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            <View style={styles.promotionsList}>
              {promotionsQuery.data?.promotions.map((promotion: any) => (
                <View key={promotion.id} style={styles.promotionCard}>
                  <View style={styles.promotionHeader}>
                    <View style={styles.promotionIcon}>
                      <Tag size={24} color="#EF4444" />
                    </View>
                    <View style={styles.promotionInfo}>
                      <Text style={styles.promotionName}>{promotion.name}</Text>
                      {promotion.description && (
                        <Text style={styles.promotionDescription}>
                          {promotion.description}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.promotionDetails}>
                    <View style={styles.promotionDetail}>
                      <Percent size={16} color="#6B7280" />
                      <Text style={styles.promotionDetailText}>
                        {promotion.discount_type === 'percentage' 
                          ? `${promotion.discount_value}% off`
                          : `KSh ${promotion.discount_value} off`}
                      </Text>
                    </View>
                    {promotion.min_purchase && (
                      <View style={styles.promotionDetail}>
                        <DollarSign size={16} color="#6B7280" />
                        <Text style={styles.promotionDetailText}>
                          Min: KSh {promotion.min_purchase}
                        </Text>
                      </View>
                    )}
                    <View style={styles.promotionDetail}>
                      <Calendar size={16} color="#6B7280" />
                      <Text style={styles.promotionDetailText}>
                        Until {new Date(promotion.end_date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.promotionFooter}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: promotion.is_active ? '#D1FAE5' : '#FEE2E2' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: promotion.is_active ? '#10B981' : '#EF4444' }
                      ]}>
                        {promotion.is_active ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                    <Text style={styles.usageText}>
                      Used: {promotion.usage_count || 0}
                      {promotion.usage_limit ? ` / ${promotion.usage_limit}` : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        <Modal
          visible={showCreateModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Promotion</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Promotion Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Summer Sale"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe your promotion"
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Discount Type *</Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity
                      style={[
                        styles.radioButton,
                        formData.discountType === 'percentage' && styles.radioButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, discountType: 'percentage' })}
                    >
                      <Text style={[
                        styles.radioButtonText,
                        formData.discountType === 'percentage' && styles.radioButtonTextActive,
                      ]}>
                        Percentage
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.radioButton,
                        formData.discountType === 'fixed' && styles.radioButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, discountType: 'fixed' })}
                    >
                      <Text style={[
                        styles.radioButtonText,
                        formData.discountType === 'fixed' && styles.radioButtonTextActive,
                      ]}>
                        Fixed Amount
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Discount Value * ({formData.discountType === 'percentage' ? '%' : 'KSh'})
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={formData.discountType === 'percentage' ? '10' : '100'}
                    value={formData.discountValue}
                    onChangeText={(text) => setFormData({ ...formData, discountValue: text })}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Minimum Purchase (KSh)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Optional"
                    value={formData.minPurchase}
                    onChangeText={(text) => setFormData({ ...formData, minPurchase: text })}
                    keyboardType="numeric"
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleCreatePromotion}
                  disabled={createPromotionMutation.isPending}
                >
                  {createPromotionMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>Create</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  filterContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  promotionsList: {
    padding: 16,
    gap: 16,
  },
  promotionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  promotionHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  promotionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promotionInfo: {
    flex: 1,
  },
  promotionName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  promotionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  promotionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  promotionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promotionDetailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  promotionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  usageText: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  radioButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  radioButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  radioButtonTextActive: {
    color: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: 'white',
  },
});
