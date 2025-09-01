import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useBanking } from '../../providers/BankingProvider';
import { formatCurrency } from '../../lib/constants';
import CustomButton from '../../components/CustomButton';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function WalletScreen() {
  const { balance, bankAccounts, loading, fetchBankAccounts } = useBanking();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBankAccounts();
    setRefreshing(false);
  };

  const handleAddBankAccount = () => {
    router.push('/(tabs)/add-bank-account');
  };

  const handleViewAllBankAccounts = () => {
    router.push('/(tabs)/bank-accounts');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <Text style={styles.headerSubtitle}>
          Manage your accounts and balances
        </Text>
      </View>

      {/* Balance Cards */}
      <View style={styles.balanceSection}>
        <View style={styles.balanceCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>BDT Balance</Text>
              <Text style={styles.cardSubtitle}>Bangladeshi Taka</Text>
            </View>
            <View style={styles.currencyIcon}>
              <Text style={styles.currencySymbol}>৳</Text>
            </View>
          </View>
          <Text style={styles.balanceAmount}>
            {loading
              ? '•••••'
              : balance
              ? formatCurrency(balance.bdt, 'BDT')
              : '৳0.00'}
          </Text>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>INR Balance</Text>
              <Text style={styles.cardSubtitle}>Indian Rupee</Text>
            </View>
            <View style={styles.currencyIcon}>
              <Text style={styles.currencySymbol}>₹</Text>
            </View>
          </View>
          <Text style={styles.balanceAmount}>
            {loading
              ? '•••••'
              : balance
              ? formatCurrency(balance.inr, 'INR')
              : '₹0.00'}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/deposit')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>Deposit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/withdraw')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#EF4444' }]}>
            <Ionicons name="remove" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>Withdraw</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/exchange')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#F59E0B' }]}>
            <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>Exchange</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/transfer')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#8B5CF6' }]}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>Transfer</Text>
        </TouchableOpacity>
      </View>

      {/* Bank Accounts Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bank Accounts</Text>
          <TouchableOpacity onPress={handleAddBankAccount}>
            <View style={styles.addButton}>
              <Ionicons name="add" size={16} color="#3B82F6" />
              <Text style={styles.addButtonText}>Add</Text>
            </View>
          </TouchableOpacity>
        </View>

        {bankAccounts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="card-outline" size={32} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No accounts added</Text>
            <Text style={styles.emptySubtitle}>
              Add your bank accounts to start transacting
            </Text>
            <TouchableOpacity
              style={styles.emptyAction}
              onPress={handleAddBankAccount}
            >
              <Text style={styles.emptyActionText}>Add Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.accountsList}>
            {bankAccounts.map((account: any) => (
              <View key={account.id} style={styles.accountCard}>
                <View style={styles.accountInfo}>
                  <View style={styles.accountIconContainer}>
                    <Ionicons
                      name={
                        account.bank_type === 'BANK'
                          ? 'business'
                          : account.bank_type === 'UPI'
                          ? 'at'
                          : 'phone-portrait'
                      }
                      size={20}
                      color="#3B82F6"
                    />
                  </View>
                  <View style={styles.accountDetails}>
                    <Text style={styles.accountName}>
                      {account.account_name}
                    </Text>
                    <Text style={styles.accountNumber}>
                      {account.account_number
                        ? `•••• ${account.account_number.slice(-4)}`
                        : account.upi_id || account.mobile_number || 'N/A'}
                    </Text>
                    <Text style={styles.bankName}>
                      {account.bank_name || account.bank_type} •{' '}
                      {account.bank_type} • {account.currency}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.accountAction}>
                  <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            ))}

            {bankAccounts.length > 0 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={handleViewAllBankAccounts}
              >
                <Text style={styles.viewAllText}>View All Accounts</Text>
                <Ionicons name="arrow-forward" size={16} color="#3B82F6" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
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
  balanceSection: {
    padding: 16,
    gap: 12,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  currencyIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyAction: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  accountsList: {
    gap: 12,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  bankName: {
    fontSize: 12,
    color: '#94A3B8',
  },
  accountAction: {
    padding: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
});
