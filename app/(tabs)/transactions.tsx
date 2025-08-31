import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useBanking } from '../../providers/BankingProvider';
import { formatCurrency } from '../../lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function TransactionsScreen() {
  const { transactions, loading, fetchTransactions } = useBanking();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const router = useRouter();

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
        return '#64748B';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'arrow-down';
      case 'WITHDRAWAL':
        return 'arrow-up';
      case 'EXCHANGE':
        return 'swap-horizontal';
      case 'TRANSFER':
        return 'send';
      default:
        return 'help';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return '#10B981';
      case 'WITHDRAWAL':
        return '#EF4444';
      case 'EXCHANGE':
        return '#F59E0B';
      case 'TRANSFER':
        return '#8B5CF6';
      default:
        return '#64748B';
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === 'ALL') return true;
    return transaction.type === filter;
  });

  const filters = [
    { key: 'ALL', label: 'All' },
    { key: 'DEPOSIT', label: 'Deposits' },
    { key: 'WITHDRAWAL', label: 'Withdrawals' },
    { key: 'EXCHANGE', label: 'Exchange' },
    { key: 'TRANSFER', label: 'Transfers' },
  ];

  const renderTransaction = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => router.push(`/(tabs)/transaction-details/${item.id}`)}
    >
      <View style={styles.transactionContent}>
        <View
          style={[
            styles.transactionIcon,
            { backgroundColor: `${getTypeColor(item.type)}15` },
          ]}
        >
          <Ionicons
            name={getTypeIcon(item.type)}
            size={20}
            color={getTypeColor(item.type)}
          />
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.transactionType}>{item.type}</Text>
          <Text style={styles.transactionDate}>
            {new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {item.reference_number && (
            <Text style={styles.referenceNumber}>
              Ref: {item.reference_number}
            </Text>
          )}
        </View>

        <View style={styles.transactionRight}>
          <Text
            style={[
              styles.transactionAmount,
              {
                color:
                  item.type === 'DEPOSIT'
                    ? '#10B981'
                    : item.type === 'WITHDRAWAL'
                    ? '#EF4444'
                    : '#1E293B',
              },
            ]}
          >
            {item.type === 'DEPOSIT'
              ? '+'
              : item.type === 'WITHDRAWAL'
              ? '-'
              : ''}
            {formatCurrency(item.amount, item.currency)}
          </Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item.status)}20` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <Text style={styles.headerSubtitle}>
          Track all your transaction history
        </Text>
      </View>

      {/* Filter Pills */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {filters.map((filterItem) => (
            <TouchableOpacity
              key={filterItem.key}
              style={[
                styles.filterPill,
                filter === filterItem.key && styles.activeFilterPill,
              ]}
              onPress={() => setFilter(filterItem.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === filterItem.key && styles.activeFilterText,
                ]}
              >
                {filterItem.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="receipt-outline" size={32} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>
            {filter === 'ALL'
              ? 'No transactions yet'
              : `No ${filter.toLowerCase()} transactions`}
          </Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'ALL'
              ? 'Your transaction history will appear here'
              : `Your ${filter.toLowerCase()} transactions will appear here`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.transactionsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  filtersScrollContent: {
    paddingHorizontal: 0,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  activeFilterPill: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  transactionsList: {
    padding: 16,
    paddingTop: 0,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  transactionDate: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  referenceNumber: {
    fontSize: 12,
    color: '#94A3B8',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#F8FAFC',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
