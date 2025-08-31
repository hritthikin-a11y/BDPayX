import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useBanking } from '../../providers/BankingProvider';
import { formatCurrency } from '../../lib/constants';
import CustomButton from '../../components/CustomButton';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
    <ScrollView style={styles.container}>
      {/* Balance Summary */}
      <View style={styles.balanceSection}>
        <Text style={styles.sectionTitle}>Your Balance</Text>
        <View style={styles.balanceContainer}>
          <View style={styles.balanceItem}>
            <Text style={styles.currencyLabel}>BDT</Text>
            <Text style={styles.balanceAmount}>
              {loading ? 'Loading...' : balance ? formatCurrency(balance.bdt, 'BDT') : '৳0.00'}
            </Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.currencyLabel}>INR</Text>
            <Text style={styles.balanceAmount}>
              {loading ? 'Loading...' : balance ? formatCurrency(balance.inr, 'INR') : '₹0.00'}
            </Text>
          </View>
        </View>
      </View>

      {/* Bank Accounts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bank Accounts</Text>
          <View style={styles.headerButtons}>
            {bankAccounts.length > 0 && (
              <CustomButton
                title="View All"
                onPress={handleViewAllBankAccounts}
                variant="ghost"
                size="small"
                textStyle={styles.viewAllText}
              />
            )}
            <CustomButton
              title="Add Account"
              onPress={handleAddBankAccount}
              variant="outline"
              size="small"
              textStyle={styles.addAccountText}
            />
          </View>
        </View>

        {bankAccounts.length === 0 ? (
          <View style={styles.placeholderContainer}>
            <Ionicons name="card-outline" size={48} color="#7B8794" />
            <Text style={styles.placeholderText}>No bank accounts added</Text>
            <Text style={styles.placeholderSubtext}>Add your bank accounts to start transactions</Text>
            <CustomButton
              title="Add Bank Account"
              onPress={handleAddBankAccount}
              style={styles.addAccountButton}
              textStyle={styles.addAccountButtonText}
            />
          </View>
        ) : (
          <View style={styles.bankAccountsList}>
            {bankAccounts.map((account) => (
              <View key={account.id} style={styles.bankAccountCard}>
                <View style={styles.accountHeader}>
                  <View style={styles.accountIcon}>
                    <Ionicons name="card-outline" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>{account.account_name}</Text>
                    <Text style={styles.accountNumber}>
                      {account.account_number.replace(/(\d{4})/g, '$1 ').trim()}
                    </Text>
                  </View>
                </View>
                <View style={styles.accountFooter}>
                  <Text style={styles.bankName}>{account.bank_name}</Text>
                  <Text style={styles.accountType}>{account.bank_type}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  balanceSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  viewAllText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E3A59',
  },
  addAccountText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  balanceItem: {
    alignItems: 'center',
  },
  currencyLabel: {
    fontSize: 16,
    color: '#7B8794',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E3A59',
  },
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: 32,
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
  addAccountButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  addAccountButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bankAccountsList: {
    gap: 16,
  },
  bankAccountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    padding: 16,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3A59',
  },
  accountNumber: {
    fontSize: 14,
    color: '#7B8794',
    marginTop: 4,
  },
  accountFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  bankName: {
    fontSize: 14,
    color: '#7B8794',
  },
  accountType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
});