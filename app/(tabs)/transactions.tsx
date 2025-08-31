import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useBanking } from '../../providers/BankingProvider';
import { formatCurrency } from '../../lib/constants';
import { Ionicons } from '@expo/vector-icons';

export default function TransactionsScreen() {
  const { transactions, loading, fetchTransactions } = useBanking();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return '#10B981';
      case 'PENDING':
        return '#F59E0B';
      case 'FAILED':
      case 'REJECTED':
      case 'CANCELLED':
        return '#EF4444';
      default:
        return '#7B8794';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'add-circle-outline';
      case 'WITHDRAWAL':
        return 'remove-circle-outline';
      case 'EXCHANGE':
        return 'swap-horizontal-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionIconContainer}>
          <Ionicons 
            name={getTypeIcon(item.type)} 
            size={20} 
            color={item.type === 'DEPOSIT' ? '#10B981' : item.type === 'WITHDRAWAL' ? '#EF4444' : '#4A90E2'} 
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.type}</Text>
          <Text style={styles.transactionDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.transactionAmountContainer}>
          <Text style={[
            styles.transactionAmount,
            { color: item.type === 'DEPOSIT' ? '#10B981' : '#2E3A59' }
          ]}>
            {item.type === 'DEPOSIT' ? '+' : item.type === 'WITHDRAWAL' ? '-' : ''} 
            {formatCurrency(item.amount, item.currency)}
          </Text>
        </View>
      </View>
      <View style={styles.transactionFooter}>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
        {item.reference_number && (
          <Text style={styles.referenceText}>Ref: {item.reference_number}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {transactions.length === 0 ? (
        <View style={styles.placeholderContainer}>
          <Ionicons name="receipt-outline" size={48} color="#7B8794" />
          <Text style={styles.placeholderText}>No transactions yet</Text>
          <Text style={styles.placeholderSubtext}>Your transactions will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.transactionsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  transactionsList: {
    padding: 16,
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3A59',
  },
  transactionDate: {
    fontSize: 14,
    color: '#7B8794',
    marginTop: 2,
  },
  transactionAmountContainer: {},
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  referenceText: {
    fontSize: 12,
    color: '#7B8794',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderText: {
    fontSize: 18,
    color: '#7B8794',
    marginTop: 16,
    fontWeight: '500',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#7B8794',
    marginTop: 8,
    textAlign: 'center',
  },
});