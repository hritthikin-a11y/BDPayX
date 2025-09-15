import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ApiService } from '../../lib/api';

interface AdminBankAccount {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_type: string;
  currency: 'BDT' | 'INR';
  is_active: boolean;
  branch_name?: string;
  routing_number?: string;
  ifsc_code?: string;
  swift_code?: string;
  mobile_number?: string;
  daily_limit: number;
  monthly_limit: number;
  created_at: string;
}

export default function AdminBanks() {
  const router = useRouter();
  const [banks, setBanks] = useState<AdminBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'BDT' | 'INR' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const fetchBanks = async () => {
    try {
      const data = await ApiService.getAdminBankAccounts();
      setBanks(data);
    } catch (error) {
      console.error('Error fetching admin banks:', error);
      Alert.alert('Error', 'Failed to fetch admin bank accounts');
    }
  };

  useEffect(() => {
    const loadBanks = async () => {
      setLoading(true);
      await fetchBanks();
      setLoading(false);
    };

    loadBanks();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBanks();
    setRefreshing(false);
  };

  const handleDeleteBank = async (bankId: string, bankName: string) => {
    Alert.alert(
      'Delete Bank Account',
      `Are you sure you want to delete ${bankName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await ApiService.deleteAdminBankAccount(bankId);
              if (success) {
                Alert.alert('Success', 'Bank account deleted successfully');
                await fetchBanks();
              } else {
                Alert.alert('Error', 'Failed to delete bank account');
              }
            } catch (error) {
              console.error('Error deleting bank:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  const toggleBankStatus = async (bankId: string, currentStatus: boolean) => {
    try {
      const success = await ApiService.updateAdminBankAccount(bankId, {
        is_active: !currentStatus,
      });
      if (success) {
        Alert.alert('Success', `Bank account ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        await fetchBanks();
      } else {
        Alert.alert('Error', 'Failed to update bank account status');
      }
    } catch (error) {
      console.error('Error updating bank status:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const getFilteredBanks = () => {
    switch (selectedFilter) {
      case 'BDT':
        return banks.filter(bank => bank.currency === 'BDT');
      case 'INR':
        return banks.filter(bank => bank.currency === 'INR');
      case 'ACTIVE':
        return banks.filter(bank => bank.is_active);
      case 'INACTIVE':
        return banks.filter(bank => !bank.is_active);
      default:
        return banks;
    }
  };

  const filteredBanks = getFilteredBanks();

  const filterTabs = [
    { key: 'ALL', label: 'All', count: banks.length },
    { key: 'ACTIVE', label: 'Active', count: banks.filter(b => b.is_active).length },
    { key: 'INACTIVE', label: 'Inactive', count: banks.filter(b => !b.is_active).length },
    { key: 'BDT', label: 'BDT', count: banks.filter(b => b.currency === 'BDT').length },
    { key: 'INR', label: 'INR', count: banks.filter(b => b.currency === 'INR').length },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Admin Bank Accounts</Text>
            <Text style={styles.subtitle}>Manage deposit bank accounts</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(admin)/add-admin-bank')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {filterTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              selectedFilter === tab.key && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedFilter(tab.key as any)}
          >
            <Text style={[
              styles.filterTabText,
              selectedFilter === tab.key && styles.activeFilterTabText,
            ]}>
              {tab.label}
            </Text>
            <View style={[
              styles.filterBadge,
              selectedFilter === tab.key && styles.activeFilterBadge,
            ]}>
              <Text style={[
                styles.filterBadgeText,
                selectedFilter === tab.key && styles.activeFilterBadgeText,
              ]}>
                {tab.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Banks List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading bank accounts...</Text>
          </View>
        ) : filteredBanks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No bank accounts found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'ALL' ? 'Add your first admin bank account' : `No ${selectedFilter.toLowerCase()} bank accounts`}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(admin)/add-admin-bank')}
            >
              <Ionicons name="add-circle" size={20} color="#3B82F6" />
              <Text style={styles.emptyButtonText}>Add Bank Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredBanks.map((bank) => (
            <View key={bank.id} style={styles.bankCard}>
              <View style={styles.bankHeader}>
                <View style={styles.bankInfo}>
                  <View style={styles.bankNameRow}>
                    <Text style={styles.bankName}>{bank.bank_name}</Text>
                    <View style={[styles.currencyBadge, { backgroundColor: bank.currency === 'BDT' ? '#10B981' : '#F59E0B' }]}>
                      <Text style={styles.currencyText}>{bank.currency}</Text>
                    </View>
                  </View>
                  <Text style={styles.accountName}>{bank.account_name}</Text>
                  <Text style={styles.accountNumber}>A/C: {bank.account_number}</Text>
                  {bank.branch_name && (
                    <Text style={styles.branchName}>Branch: {bank.branch_name}</Text>
                  )}
                </View>
                <View style={styles.bankActions}>
                  <View style={[styles.statusBadge, { backgroundColor: bank.is_active ? '#10B981' : '#EF4444' }]}>
                    <Text style={styles.statusText}>{bank.is_active ? 'Active' : 'Inactive'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.bankDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type:</Text>
                  <Text style={styles.detailValue}>{bank.bank_type}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Daily Limit:</Text>
                  <Text style={styles.detailValue}>৳{bank.daily_limit.toLocaleString()}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Monthly Limit:</Text>
                  <Text style={styles.detailValue}>৳{bank.monthly_limit.toLocaleString()}</Text>
                </View>
                {bank.ifsc_code && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>IFSC:</Text>
                    <Text style={styles.detailValue}>{bank.ifsc_code}</Text>
                  </View>
                )}
                {bank.routing_number && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Routing:</Text>
                    <Text style={styles.detailValue}>{bank.routing_number}</Text>
                  </View>
                )}
                {bank.mobile_number && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Mobile:</Text>
                    <Text style={styles.detailValue}>{bank.mobile_number}</Text>
                  </View>
                )}
              </View>

              <View style={styles.bankFooter}>
                <Text style={styles.dateText}>
                  Added {new Date(bank.created_at).toLocaleDateString()}
                </Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => router.push(`/(admin)/edit-admin-bank?id=${bank.id}`)}
                  >
                    <Ionicons name="pencil" size={16} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.toggleButton]}
                    onPress={() => toggleBankStatus(bank.id, bank.is_active)}
                  >
                    <Ionicons
                      name={bank.is_active ? 'pause' : 'play'}
                      size={16}
                      color={bank.is_active ? '#F59E0B' : '#10B981'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteBank(bank.id, bank.bank_name)}
                  >
                    <Ionicons name="trash" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  activeFilterTab: {
    backgroundColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeFilterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  activeFilterBadgeText: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  bankCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bankInfo: {
    flex: 1,
  },
  bankNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bankName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginRight: 12,
  },
  currencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currencyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  branchName: {
    fontSize: 14,
    color: '#6B7280',
  },
  bankActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bankDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  bankFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  editButton: {
    backgroundColor: '#EFF6FF',
  },
  toggleButton: {
    backgroundColor: '#F0FDF4',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
});