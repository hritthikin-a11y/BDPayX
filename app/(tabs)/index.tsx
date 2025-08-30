import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { useBanking } from '../../providers/BankingProvider';
import { formatCurrency } from '../../lib/constants';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { balance, transactions, loading, fetchAllData } = useBanking();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const quickActions = [
    {
      title: 'Deposit Money',
      description: 'Add funds via bKash, Nagad, Bank',
      icon: 'add-circle',
      color: '#28A745',
      onPress: () => router.push('/(modals)/deposit'),
    },
    {
      title: 'Withdraw Funds',
      description: 'Transfer to your bank account',
      icon: 'remove-circle',
      color: '#DC3545',
      onPress: () => router.push('/(modals)/withdraw'),
    },
    {
      title: 'Exchange Currency',
      description: 'Convert BDT ↔ INR instantly',
      icon: 'swap-horizontal',
      color: '#6F42C1',
      onPress: () => router.push('/exchange'),
    },
    {
      title: 'Send Money',
      description: 'Transfer to other users',
      icon: 'send',
      color: '#FD7E14',
      onPress: () => router.push('/(modals)/send'),
    },
  ];

  const recentTransactions = transactions.slice(0, 3);

  if (loading && !balance) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['#4A90E2', '#357ABD']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.push('/(modals)/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Total Balance</Text>
          <View style={styles.balanceRow}>
            <View style={styles.currencyBalance}>
              <Text style={styles.currencyLabel}>BDT</Text>
              <Text style={styles.currencyAmount}>
                {formatCurrency(balance?.bdt || 0, 'BDT')}
              </Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.currencyBalance}>
              <Text style={styles.currencyLabel}>INR</Text>
              <Text style={styles.currencyAmount}>
                {formatCurrency(balance?.inr || 0, 'INR')}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={action.onPress}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#7B8794" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/transactions')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentTransactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#7B8794" />
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Text style={styles.emptyStateSubtext}>Start by making a deposit or exchange</Text>
            </View>
          )}
        </View>

        {/* Exchange Rates Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Rates</Text>
            <TouchableOpacity onPress={() => router.push('/exchange')}>
              <Text style={styles.seeAllText}>Exchange</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ratesContainer}>
            <View style={styles.rateCard}>
              <Text style={styles.rateLabel}>BDT → INR</Text>
              <Text style={styles.rateValue}>₹0.68</Text>
            </View>
            <View style={styles.rateCard}>
              <Text style={styles.rateLabel}>INR → BDT</Text>
              <Text style={styles.rateValue}>৳1.47</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const TransactionItem = ({ transaction }: { transaction: any }) => {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'add-circle';
      case 'WITHDRAWAL':
        return 'remove-circle';
      case 'EXCHANGE':
        return 'swap-horizontal';
      default:
        return 'receipt';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return '#28A745';
      case 'WITHDRAWAL':
        return '#DC3545';
      case 'EXCHANGE':
        return '#6F42C1';
      default:
        return '#7B8794';
    }
  };

  return (
    <View style={styles.transactionItem}>
      <View style={[styles.transactionIcon, { backgroundColor: `${getTransactionColor(transaction.type)}15` }]}>
        <Ionicons 
          name={getTransactionIcon(transaction.type) as any} 
          size={20} 
          color={getTransactionColor(transaction.type)} 
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{transaction.type}</Text>
        <Text style={styles.transactionDate}>
          {new Date(transaction.created_at).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[styles.amountText, { color: getTransactionColor(transaction.type) }]}>
          {formatCurrency(transaction.amount, transaction.currency)}
        </Text>
        <Text style={styles.transactionStatus}>{transaction.status}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: -20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
    textAlign: 'center',
    marginBottom: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyBalance: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E9ECEF',
    marginHorizontal: 20,
  },
  currencyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7B8794',
    marginBottom: 4,
  },
  currencyAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E3A59',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E3A59',
  },
  seeAllText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#7B8794',
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#7B8794',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: 12,
    color: '#7B8794',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#7B8794',
    textAlign: 'center',
  },
  ratesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  rateCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rateLabel: {
    fontSize: 14,
    color: '#7B8794',
    marginBottom: 8,
  },
  rateValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E3A59',
  },
});