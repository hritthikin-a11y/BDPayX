import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../providers/AuthProvider';
import { ApiService } from '../../lib/api';
import { formatCurrency } from '../../lib/constants';
import CustomButton from '../../components/CustomButton';

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  currency: 'BDT' | 'INR';
  bank_account_name: string;
  bank_account_number: string;
  bank_name: string;
  status: 'PENDING' | 'SUCCESS' | 'REJECTED';
  created_at: string;
  admin_notes?: string;
  user_profile?: {
    full_name: string;
    phone: string;
  };
}

export default function AdminWithdrawals() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PENDING' | 'SUCCESS' | 'REJECTED'>('PENDING');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchWithdrawals = async () => {
    try {
      const status = selectedFilter === 'ALL' ? undefined : selectedFilter;
      const data = await ApiService.getAllWithdrawalRequests(status as any);
      setWithdrawals(data);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      Alert.alert('Error', 'Failed to fetch withdrawal requests');
    }
  };

  useEffect(() => {
    const loadWithdrawals = async () => {
      setLoading(true);
      await fetchWithdrawals();
      setLoading(false);
    };

    loadWithdrawals();
  }, [selectedFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWithdrawals();
    setRefreshing(false);
  };

  const openModal = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setAdminNotes(withdrawal.admin_notes || '');
    setRejectionReason('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedWithdrawal(null);
    setAdminNotes('');
    setRejectionReason('');
  };

  const processWithdrawal = async (action: 'SUCCESS' | 'REJECTED') => {
    if (!selectedWithdrawal || !user) return;

    if (action === 'REJECTED' && !rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      return;
    }

    setProcessing(true);

    try {
      const success = await ApiService.processWithdrawalRequest(
        selectedWithdrawal.id,
        user.id,
        action,
        adminNotes.trim() || undefined,
        action === 'REJECTED' ? rejectionReason.trim() : undefined
      );

      if (success) {
        Alert.alert(
          'Success',
          `Withdrawal request ${action === 'SUCCESS' ? 'approved' : 'rejected'} successfully`
        );
        closeModal();
        await fetchWithdrawals();
      } else {
        Alert.alert('Error', `Failed to ${action === 'SUCCESS' ? 'approve' : 'reject'} withdrawal request`);
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#F59E0B';
      case 'SUCCESS': return '#10B981';
      case 'REJECTED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return 'hourglass-outline';
      case 'SUCCESS': return 'checkmark-circle';
      case 'REJECTED': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const filterTabs = [
    { key: 'PENDING', label: 'Pending', count: withdrawals.filter(w => w.status === 'PENDING').length },
    { key: 'SUCCESS', label: 'Approved', count: withdrawals.filter(w => w.status === 'SUCCESS').length },
    { key: 'REJECTED', label: 'Rejected', count: withdrawals.filter(w => w.status === 'REJECTED').length },
    { key: 'ALL', label: 'All', count: withdrawals.length },
  ];

  const filteredWithdrawals = selectedFilter === 'ALL'
    ? withdrawals
    : withdrawals.filter(w => w.status === selectedFilter);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Withdrawal Management</Text>
        <Text style={styles.subtitle}>Review and process withdrawal requests</Text>
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

      {/* Withdrawals List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading withdrawals...</Text>
          </View>
        ) : filteredWithdrawals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No withdrawals found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'PENDING' ? 'No pending withdrawals to review' : `No ${selectedFilter.toLowerCase()} withdrawals`}
            </Text>
          </View>
        ) : (
          filteredWithdrawals.map((withdrawal) => (
            <TouchableOpacity
              key={withdrawal.id}
              style={styles.withdrawalCard}
              onPress={() => openModal(withdrawal)}
            >
              <View style={styles.withdrawalHeader}>
                <View style={styles.withdrawalInfo}>
                  <Text style={styles.withdrawalAmount}>
                    {formatCurrency(withdrawal.amount, withdrawal.currency)}
                  </Text>
                  <Text style={styles.withdrawalUser}>
                    {withdrawal.user_profile?.full_name || 'Unknown User'}
                  </Text>
                  <Text style={styles.withdrawalPhone}>
                    {withdrawal.user_profile?.phone || 'No phone'}
                  </Text>
                </View>
                <View style={styles.withdrawalStatus}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(withdrawal.status) }]}>
                    <Ionicons
                      name={getStatusIcon(withdrawal.status) as any}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.statusText}>{withdrawal.status}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.withdrawalDetails}>
                <Text style={styles.detailLabel}>Bank Account:</Text>
                <Text style={styles.detailValue}>
                  {withdrawal.bank_name} - {withdrawal.bank_account_number}
                </Text>
                <Text style={styles.detailValue}>
                  A/C Name: {withdrawal.bank_account_name}
                </Text>
              </View>

              <View style={styles.withdrawalFooter}>
                <Text style={styles.dateText}>
                  {new Date(withdrawal.created_at).toLocaleDateString()} at{' '}
                  {new Date(withdrawal.created_at).toLocaleTimeString()}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Review Withdrawal</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedWithdrawal && (
              <>
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Request Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount:</Text>
                    <Text style={styles.detailValue}>
                      {formatCurrency(selectedWithdrawal.amount, selectedWithdrawal.currency)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>User:</Text>
                    <Text style={styles.detailValue}>
                      {selectedWithdrawal.user_profile?.full_name || 'Unknown User'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone:</Text>
                    <Text style={styles.detailValue}>
                      {selectedWithdrawal.user_profile?.phone || 'No phone'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Bank:</Text>
                    <Text style={styles.detailValue}>{selectedWithdrawal.bank_name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Account Number:</Text>
                    <Text style={styles.detailValue}>{selectedWithdrawal.bank_account_number}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Account Name:</Text>
                    <Text style={styles.detailValue}>{selectedWithdrawal.bank_account_name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedWithdrawal.status) }]}>
                      <Text style={styles.statusText}>{selectedWithdrawal.status}</Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Requested:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedWithdrawal.created_at).toLocaleDateString()} at{' '}
                      {new Date(selectedWithdrawal.created_at).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>

                {selectedWithdrawal.status === 'PENDING' && (
                  <>
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>Admin Notes (Optional)</Text>
                      <TextInput
                        style={styles.textArea}
                        value={adminNotes}
                        onChangeText={setAdminNotes}
                        placeholder="Add notes about this withdrawal..."
                        multiline
                        numberOfLines={3}
                      />
                    </View>

                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>Rejection Reason (Required for rejection)</Text>
                      <TextInput
                        style={styles.textArea}
                        value={rejectionReason}
                        onChangeText={setRejectionReason}
                        placeholder="Provide reason for rejection..."
                        multiline
                        numberOfLines={3}
                      />
                    </View>

                    <View style={styles.modalActions}>
                      <CustomButton
                        title="Approve"
                        onPress={() => processWithdrawal('SUCCESS')}
                        loading={processing}
                        style={[styles.actionButton, styles.approveButton]}
                        textStyle={styles.actionButtonText}
                      />
                      <CustomButton
                        title="Reject"
                        onPress={() => processWithdrawal('REJECTED')}
                        loading={processing}
                        style={[styles.actionButton, styles.rejectButton]}
                        textStyle={styles.actionButtonText}
                      />
                    </View>
                  </>
                )}

                {selectedWithdrawal.admin_notes && (
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Admin Notes</Text>
                    <Text style={styles.notesText}>{selectedWithdrawal.admin_notes}</Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
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
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    backgroundColor: '#F59E0B',
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
  },
  withdrawalCard: {
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
  withdrawalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  withdrawalInfo: {
    flex: 1,
  },
  withdrawalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  withdrawalUser: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  withdrawalPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  withdrawalStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  withdrawalDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 4,
  },
  withdrawalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
});