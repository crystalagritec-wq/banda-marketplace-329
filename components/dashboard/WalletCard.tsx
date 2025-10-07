import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Wallet, TrendingUp, TrendingDown, Plus, Send, Download, ArrowRight } from 'lucide-react-native';

interface WalletCardProps {
  wallet: {
    trading_balance: number;
    savings_balance: number;
    reserve_balance: number;
    total_earned: number;
    total_spent: number;
    recent_transactions: Array<{
      id: string;
      type: string;
      amount: number;
      status: string;
      description: string;
      created_at: string;
    }>;
  };
  onAddMoney: () => void;
  onSendMoney: () => void;
  onWithdraw: () => void;
  onViewTransactions: () => void;
}

export default function WalletCard({ wallet, onAddMoney, onSendMoney, onWithdraw, onViewTransactions }: WalletCardProps) {
  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString()}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return Plus;
      case 'withdrawal': return Download;
      case 'transfer': return Send;
      default: return Wallet;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': return '#10B981';
      case 'withdrawal': return '#EF4444';
      case 'transfer': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const totalBalance = wallet.trading_balance + wallet.savings_balance;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Wallet size={24} color="#2D5016" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Wallet Overview</Text>
            <Text style={styles.totalBalance}>
              {formatCurrency(totalBalance)}
            </Text>
          </View>
        </View>
      </View>

      {/* Balance Breakdown */}
      <View style={styles.balanceSection}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Trading</Text>
          <Text style={styles.balanceValue}>
            {formatCurrency(wallet.trading_balance)}
          </Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Savings</Text>
          <Text style={styles.balanceValue}>
            {formatCurrency(wallet.savings_balance)}
          </Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Reserve</Text>
          <Text style={[styles.balanceValue, { color: '#F59E0B' }]}>
            {formatCurrency(wallet.reserve_balance)}
          </Text>
        </View>
      </View>

      {/* Summary Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <TrendingUp size={16} color="#10B981" />
          </View>
          <View style={styles.statText}>
            <Text style={styles.statLabel}>Total Earned</Text>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {formatCurrency(wallet.total_earned)}
            </Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <TrendingDown size={16} color="#EF4444" />
          </View>
          <View style={styles.statText}>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {formatCurrency(wallet.total_spent)}
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.transactionsSection}>
        <View style={styles.transactionsHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={onViewTransactions} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <ArrowRight size={14} color="#2D5016" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.transactionsList} showsVerticalScrollIndicator={false}>
          {wallet.recent_transactions.length > 0 ? (
            wallet.recent_transactions.slice(0, 3).map((transaction) => {
              const TransactionIcon = getTransactionIcon(transaction.type);
              const transactionColor = getTransactionColor(transaction.type);
              
              return (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={[styles.transactionIcon, { backgroundColor: `${transactionColor}20` }]}>
                    <TransactionIcon size={16} color={transactionColor} />
                  </View>
                  <View style={styles.transactionContent}>
                    <Text style={styles.transactionDescription}>
                      {transaction.description || transaction.type.replace('_', ' ').toUpperCase()}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.transactionAmount}>
                    <Text style={[
                      styles.transactionAmountText,
                      { 
                        color: transaction.type === 'deposit' ? '#10B981' : 
                               transaction.type === 'withdrawal' ? '#EF4444' : '#333'
                      }
                    ]}>
                      {transaction.type === 'deposit' ? '+' : transaction.type === 'withdrawal' ? '-' : ''}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </Text>
                    <View style={[
                      styles.transactionStatus,
                      { 
                        backgroundColor: transaction.status === 'completed' ? '#10B981' : 
                                       transaction.status === 'failed' ? '#EF4444' : '#F59E0B'
                      }
                    ]}>
                      <Text style={styles.transactionStatusText}>
                        {transaction.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.noTransactions}>No recent transactions</Text>
          )}
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onAddMoney}
          activeOpacity={0.8}
        >
          <Plus size={16} color="white" />
          <Text style={styles.actionButtonText}>Add Money</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]} 
          onPress={onSendMoney}
          activeOpacity={0.8}
        >
          <Send size={16} color="#2D5016" />
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]} 
          onPress={onWithdraw}
          activeOpacity={0.8}
        >
          <Download size={16} color="#2D5016" />
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Withdraw</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  totalBalance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5016',
  },
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  balanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statsSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statText: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionsSection: {
    marginBottom: 20,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    color: '#2D5016',
    fontWeight: '600',
  },
  transactionsList: {
    maxHeight: 200,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  transactionStatusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  noTransactions: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2D5016',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonText: {
    color: '#2D5016',
  },
});