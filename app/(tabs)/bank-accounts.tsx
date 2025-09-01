import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useBanking } from '../../providers/BankingProvider';
import { UserBankAccount } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function BankAccountsScreen() {
  const router = useRouter();
  const { bankAccounts, loading, fetchBankAccounts, deleteUserBankAccount } =
    useBanking();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBankAccounts();
    setRefreshing(false);
  };

  const handleDeleteAccount = (accountId: string) => {
    Alert.alert(
      'Delete Bank Account',
      'Are you sure you want to delete this bank account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteUserBankAccount(accountId);
            if (success) {
              Alert.alert('Success', 'Bank account deleted successfully');
            } else {
              Alert.alert('Error', 'Failed to delete bank account');
            }
          },
        },
      ]
    );
  };

  const renderBankAccount = ({ item }: { item: UserBankAccount }) => (
    <View style={styles.accountItem}>
      <View style={styles.accountHeader}>
        <View style={styles.accountTypeContainer}>
          <Ionicons name="card-outline" size={24} color="#4A90E2" />
          <Text style={styles.accountType}>{item.bank_type}</Text>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteAccount(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.accountName}>{item.account_name}</Text>
      <Text style={styles.accountNumber}>{item.account_number}</Text>

      <View style={styles.accountFooter}>
        <Text style={styles.currencyText}>{item.currency}</Text>
        <Text
          style={[
            styles.statusText,
            item.is_active ? styles.activeStatus : styles.inactiveStatus,
          ]}
        >
          {item.is_active ? 'Active' : 'Inactive'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bank Accounts</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/add-bank-account')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={bankAccounts}
        renderItem={renderBankAccount}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {loading ? 'Loading bank accounts...' : 'No bank accounts yet'}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/add-bank-account')}
            >
              <Text style={styles.emptyButtonText}>Add Your First Account</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1,
  },
  addButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  accountItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  accountTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 12,
  },
  accountName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  accountFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 12,
  },
  currencyText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeStatus: {
    color: '#27ae60',
  },
  inactiveStatus: {
    color: '#e74c3c',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
