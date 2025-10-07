import { LinearGradient } from 'expo-linear-gradient';
import { 
  Wallet, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  ArrowDownLeft,
  Shield,
  CreditCard,
  History,
  Eye,
  EyeOff,
  Star,
  ArrowRightLeft,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/providers/auth-provider';
import { useAgriPay } from '@/providers/agripay-provider';
import { router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'reserve_hold' | 'reserve_release';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
}



export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const agriPayContext = useAgriPay();
  
  const [showBalance, setShowBalance] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'credit' | 'debit' | 'reserve'>('all');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinAction, setPinAction] = useState<'view' | 'withdraw' | 'transfer' | null>(null);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showSendMoneyModal, setShowSendMoneyModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  if (!agriPayContext) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2D5016" />
        <Text style={{ marginTop: 16, color: '#666' }}>Initializing wallet...</Text>
      </View>
    );
  }
  
  const { wallet, fundWallet, verifyPin, refreshWallet, isLoading: walletLoading } = agriPayContext;

  const transactionsQuery = trpc.agripay.getTransactions.useQuery(
    { walletId: wallet?.id || '' },
    { enabled: !!wallet?.id, refetchInterval: 30000 }
  );

  const tradingBalance = wallet?.balance || 0;
  const reserveBalance = wallet?.reserve_balance || 0;
  const availableBalance = tradingBalance - reserveBalance;
  const totalBalance = tradingBalance;
  const hasPIN = !!wallet?.pin_hash;

  const transactions = transactionsQuery.data?.transactions || [];
  
  if (walletLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2D5016" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading wallet...</Text>
      </View>
    );
  }
  
  const filteredTransactions = transactions.filter(transaction => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'reserve') return transaction.type.includes('reserve');
    if (selectedTab === 'credit') return ['deposit', 'reserve_release', 'transfer_in', 'refund'].includes(transaction.type);
    if (selectedTab === 'debit') return ['withdrawal', 'payment', 'reserve_hold', 'transfer_out', 'fee'].includes(transaction.type);
    return false;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
      case 'reserve_release':
        return <ArrowDownLeft size={20} color="#10B981" />;
      case 'debit':
        return <ArrowUpRight size={20} color="#EF4444" />;
      case 'reserve_hold':
        return <Shield size={20} color="#F59E0B" />;
      default:
        return <Wallet size={20} color="#666" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
      case 'reserve_release':
        return '#10B981';
      case 'debit':
        return '#EF4444';
      case 'reserve_hold':
        return '#F59E0B';
      default:
        return '#666';
    }
  };

  const TransactionItem = ({ transaction }: { transaction: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        {getTransactionIcon(transaction.type)}
      </View>
      <View style={styles.transactionContent}>
        <Text style={styles.transactionDescription}>{transaction.description}</Text>
        <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
        {transaction.reference && (
          <Text style={styles.transactionReference}>Ref: {transaction.reference}</Text>
        )}
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.transactionAmountText,
          { color: getTransactionColor(transaction.type) }
        ]}>
          {transaction.type === 'debit' || transaction.type === 'reserve_hold' ? '-' : '+'}
          KSh {transaction.amount.toLocaleString()}
        </Text>
        <View style={[
          styles.transactionStatus,
          { backgroundColor: transaction.status === 'completed' ? '#10B981' : 
                            transaction.status === 'pending' ? '#F59E0B' : '#EF4444' }
        ]}>
          <Text style={styles.transactionStatusText}>
            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );
  
  function handlePinAction(action: 'view' | 'withdraw' | 'transfer') {
    if (!hasPIN) {
      Alert.alert(
        'Create Wallet PIN',
        'You need to create a wallet PIN first. This will be used for security.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create PIN', onPress: () => router.push('/wallet/create-pin' as any) }
        ]
      );
      return;
    }
    
    setPinAction(action);
    setShowPinModal(true);
  }
  
  async function handlePinConfirm() {
    if (!wallet?.id) return;
    
    try {
      const result = await verifyPin(pin);
      
      if (!result.success) {
        Alert.alert('Invalid PIN', 'Please enter the correct PIN');
        return;
      }
      
      setShowPinModal(false);
      setPin('');
      
      switch (pinAction) {
        case 'view':
          setShowBalance(!showBalance);
          break;
        case 'withdraw':
          setShowSendMoneyModal(true);
          break;
        case 'transfer':
          Alert.alert('Transfer', 'Transfer between accounts feature coming soon');
          break;
      }
      
      setPinAction(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to verify PIN');
    }
  }
  
  async function handleAddMoney() {
    if (!amount || !wallet?.id) return;
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const result = await fundWallet(
        amountNum,
        { type: 'mpesa', details: { phone: user?.phone || '' } },
        `TOPUP-${Date.now()}`,
        'mpesa'
      );
      
      if (result.success) {
        refreshWallet();
        Alert.alert(
          'Deposit Initiated',
          `KSh ${amount} deposit request has been sent. You will receive an M-Pesa prompt shortly.`,
          [{ text: 'OK', onPress: () => {
            setShowAddMoneyModal(false);
            setAmount('');
          }}]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to initiate deposit');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to initiate deposit. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }
  
  async function handleSendMoney() {
    if (!amount || !recipient) return;
    
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Money Sent',
        `KSh ${amount} has been sent to ${recipient}`,
        [{ text: 'OK', onPress: () => {
          setShowSendMoneyModal(false);
          setAmount('');
          setRecipient('');
        }}]
      );
    } catch {
      Alert.alert('Error', 'Failed to send money. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AgriPay Wallet</Text>
            <Text style={styles.headerSubtitle}>Secure payments for agriculture</Text>
          </View>

          <View style={styles.balanceCard}>
            <LinearGradient
              colors={['#2D5016', '#4A7C59']}
              style={styles.balanceGradient}
            >
              <View style={styles.balanceHeader}>
                <View style={styles.balanceTitle}>
                  <View style={styles.userBadge}>
                    <Star size={16} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                  </View>
                  <Text style={styles.balanceLabel}>AgriPay Wallet</Text>
                </View>
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => handlePinAction('view')}
                >
                  {showBalance ? (
                    <Eye size={20} color="white" />
                  ) : (
                    <EyeOff size={20} color="white" />
                  )}
                </TouchableOpacity>
              </View>
              
              <Text style={styles.balanceAmount}>
                {showBalance ? `KSh ${totalBalance.toLocaleString()}` : 'KSh ••••••'}
              </Text>
              
              <View style={styles.balanceBreakdown}>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceItemLabel}>Available</Text>
                  <Text style={styles.balanceItemAmount}>
                    {showBalance ? `KSh ${availableBalance.toLocaleString()}` : 'KSh ••••••'}
                  </Text>
                </View>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceItemLabel}>Reserved</Text>
                  <Text style={styles.balanceItemAmount}>
                    {showBalance ? `KSh ${reserveBalance.toLocaleString()}` : 'KSh ••••••'}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.transferButton}
                onPress={() => handlePinAction('transfer')}
              >
                <ArrowRightLeft size={16} color="white" />
                <Text style={styles.transferText}>Transfer Between Accounts</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowAddMoneyModal(true)}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.actionGradient}
              >
                <Plus size={24} color="white" />
                <Text style={styles.actionText}>Add Money</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handlePinAction('withdraw')}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.actionGradient}
              >
                <Minus size={24} color="white" />
                <Text style={styles.actionText}>Send Money</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.actionGradient}
              >
                <CreditCard size={24} color="white" />
                <Text style={styles.actionText}>Pay Bills</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.reserveInfo}>
            <View style={styles.reserveHeader}>
              <Shield size={20} color="#F59E0B" />
              <Text style={styles.reserveTitle}>TradeGuard Protection</Text>
            </View>
            <Text style={styles.reserveDescription}>
              Your payments are protected with Reserve until delivery is confirmed. 
              Funds are held securely and released only when both parties are satisfied.
            </Text>
          </View>

          <View style={styles.transactionSection}>
            <View style={styles.transactionHeader}>
              <View style={styles.transactionTitleContainer}>
                <History size={20} color="#2D5016" />
                <Text style={styles.transactionTitle}>Transaction History</Text>
              </View>
            </View>

            <View style={styles.transactionFilters}>
              {[
                { key: 'all', label: 'All' },
                { key: 'credit', label: 'Received' },
                { key: 'debit', label: 'Sent' },
                { key: 'reserve', label: 'Reserve' }
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    selectedTab === filter.key && styles.filterButtonActive
                  ]}
                  onPress={() => setSelectedTab(filter.key as any)}
                >
                  <Text style={[
                    styles.filterText,
                    selectedTab === filter.key && styles.filterTextActive
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.transactionList}>
              {filteredTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </View>
          </View>
        </ScrollView>
        
        <Modal visible={showPinModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.pinModal}>
              <Text style={styles.pinTitle}>Enter Wallet PIN</Text>
              <Text style={styles.pinSubtitle}>
                {pinAction === 'view' ? 'Unhide balance' : 
                 pinAction === 'withdraw' ? 'Authorize withdrawal' : 
                 'Authorize transfer'}
              </Text>
              
              <TextInput
                style={styles.pinInput}
                value={pin}
                onChangeText={setPin}
                placeholder="Enter 4-digit PIN"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
              
              <View style={styles.pinButtons}>
                <TouchableOpacity 
                  style={styles.pinCancelBtn}
                  onPress={() => {
                    setShowPinModal(false);
                    setPin('');
                    setPinAction(null);
                  }}
                >
                  <Text style={styles.pinCancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.pinConfirmBtn}
                  onPress={handlePinConfirm}
                  disabled={pin.length !== 4}
                >
                  <Text style={styles.pinConfirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        <Modal visible={showAddMoneyModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.actionModal}>
              <Text style={styles.modalTitle}>Add Money</Text>
              <Text style={styles.modalSubtitle}>Deposit funds to your wallet</Text>
              
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount (KSh)"
                keyboardType="numeric"
              />
              
              <View style={styles.paymentMethods}>
                <TouchableOpacity style={styles.paymentMethod}>
                  <Text style={styles.paymentMethodText}>M-Pesa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.paymentMethod}>
                  <Text style={styles.paymentMethodText}>Bank Transfer</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelBtn}
                  onPress={() => {
                    setShowAddMoneyModal(false);
                    setAmount('');
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalConfirmBtn}
                  onPress={handleAddMoney}
                  disabled={!amount || isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Add Money</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        <Modal visible={showSendMoneyModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.actionModal}>
              <Text style={styles.modalTitle}>Send Money</Text>
              <Text style={styles.modalSubtitle}>Transfer funds to another user</Text>
              
              <TextInput
                style={styles.recipientInput}
                value={recipient}
                onChangeText={setRecipient}
                placeholder="Phone number or email"
              />
              
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount (KSh)"
                keyboardType="numeric"
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelBtn}
                  onPress={() => {
                    setShowSendMoneyModal(false);
                    setAmount('');
                    setRecipient('');
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalConfirmBtn}
                  onPress={handleSendMoney}
                  disabled={!amount || !recipient || isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Send Money</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  balanceCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  balanceGradient: {
    padding: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  transferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    gap: 6,
  },
  transferText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  eyeButton: {
    padding: 4,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  balanceBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
  },
  balanceItemLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  balanceItemAmount: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  reserveInfo: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  reserveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reserveTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
  },
  reserveDescription: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  transactionSection: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D5016',
  },
  transactionFilters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterButtonActive: {
    backgroundColor: '#2D5016',
    borderColor: '#2D5016',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: 'white',
  },
  transactionList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  transactionReference: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  transactionStatusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  pinTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 8,
  },
  pinSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
    width: 120,
    marginBottom: 20,
  },
  pinButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  pinCancelBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  pinCancelText: {
    color: '#666',
    fontWeight: '600',
  },
  pinConfirmBtn: {
    backgroundColor: '#2D5016',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  pinConfirmText: {
    color: 'white',
    fontWeight: '600',
  },
  actionModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  recipientInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  paymentMethod: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#2D5016',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: 'white',
    fontWeight: '600',
  },
});
