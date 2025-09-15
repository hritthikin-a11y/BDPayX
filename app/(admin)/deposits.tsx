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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../providers/AuthProvider';
import { ApiService } from '../../lib/api';
import { formatCurrency } from '../../lib/constants';
import CustomButton from '../../components/CustomButton';

interface DepositRequest {
  id: string;
  user_id: string;
  amount: number;
  currency: 'BDT' | 'INR';
  sender_name: string;
  transaction_ref: string;
  status: 'PENDING' | 'SUCCESS' | 'REJECTED';
  screenshot_url?: string;
  created_at: string;
  admin_notes?: string;
  admin_bank_account?: any;
}

export default function AdminDeposits() {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PENDING' | 'SUCCESS' | 'REJECTED'>('PENDING');
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchDeposits = async () => {
    try {
      const status = selectedFilter === 'ALL' ? undefined : selectedFilter;
      const data = await ApiService.getAllDepositRequests(status as any);
      setDeposits(data);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    }
  };

  useEffect(() => {
    const loadDeposits = async () => {
      setLoading(true);
      await fetchDeposits();
      setLoading(false);
    };

    loadDeposits();
  }, [selectedFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDeposits();
    setRefreshing(false);
  };

  const handleDepositAction = (deposit: DepositRequest) => {
    setSelectedDeposit(deposit);
    setAdminNotes('');
    setRejectionReason('');
    setShowModal(true);
  };

  const processDeposit = async (action: 'SUCCESS' | 'REJECTED') => {
    if (!selectedDeposit || !user) return;

    setProcessing(true);
    try {
      const success = await ApiService.processDepositRequest(
        selectedDeposit.id,
        user.id,
        action,
        adminNotes,
        action === 'REJECTED' ? rejectionReason : undefined
      );

      if (success) {
        Alert.alert(
          'Success',
          `Deposit ${action === 'SUCCESS' ? 'approved' : 'rejected'} successfully`,
          [{ text: 'OK', onPress: () => {
            setShowModal(false);
            fetchDeposits();
          }}]
        );
      } else {
        Alert.alert('Error', 'Failed to process deposit. Please try again.');
      }
    } catch (error) {
      console.error('Error processing deposit:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
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

  const filterOptions = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'SUCCESS' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'All', value: 'ALL' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Deposit Management</Text>
        <Text style={styles.subtitle}>Review and process deposit requests</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterTab,
                selectedFilter === filter.value && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter(filter.value as any)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === filter.value && styles.activeFilterTabText,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Deposits List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading deposits...</Text>
          </View>
        ) : deposits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Deposits Found</Text>
            <Text style={styles.emptyText}>
              No deposit requests match the selected filter.
            </Text>
          </View>
        ) : (
          deposits.map((deposit) => (
            <TouchableOpacity
              key={deposit.id}
              style={styles.depositCard}
              onPress={() => handleDepositAction(deposit)}
            >
              <View style={styles.depositHeader}>
                <View style={styles.amountContainer}>
                  <Text style={styles.amountText}>
                    {formatCurrency(deposit.amount, deposit.currency)}
                  </Text>
                  <Text style={styles.currencyText}>{deposit.currency}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(deposit.status) }]}>
                  <Ionicons
                    name={getStatusIcon(deposit.status) as any}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.statusText}>{deposit.status}</Text>
                </View>
              </View>

              <View style={styles.depositContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Sender:</Text>
                  <Text style={styles.detailValue}>{deposit.sender_name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Reference:</Text>
                  <Text style={styles.detailValue}>{deposit.transaction_ref}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bank:</Text>
                  <Text style={styles.detailValue}>
                    {deposit.admin_bank_account?.bank_name || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(deposit.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {deposit.status === 'PENDING' && (
                <View style={styles.actionButtons}>
                  <CustomButton
                    title="Review"
                    onPress={() => handleDepositAction(deposit)}
                    style={styles.reviewButton}
                    textStyle={styles.reviewButtonText}
                    leftIcon={<Ionicons name="eye" size={16} color="#3B82F6" />}
                    variant="outline"
                  />
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Review Deposit</Text>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedDeposit && (
              <>
                {/* Deposit Details */}
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Deposit Details</Text>
                  <View style={styles.detailCard}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Amount:</Text>
                      <Text style={[styles.detailValue, styles.amountText]}>
                        {formatCurrency(selectedDeposit.amount, selectedDeposit.currency)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Sender:</Text>
                      <Text style={styles.detailValue}>{selectedDeposit.sender_name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Reference:</Text>
                      <Text style={styles.detailValue}>{selectedDeposit.transaction_ref}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedDeposit.created_at).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Screenshot */}
                {selectedDeposit.screenshot_url && (
                  <View style={styles.screenshotSection}>
                    <Text style={styles.sectionTitle}>Transaction Screenshot</Text>
                    <Image
                      source={{ uri: selectedDeposit.screenshot_url }}
                      style={styles.screenshot}
                      resizeMode="contain"
                    />
                  </View>
                )}

                {/* Admin Notes */}
                <View style={styles.notesSection}>
                  <Text style={styles.sectionTitle}>Admin Notes</Text>
                  <TextInput
                    style={styles.notesInput}
                    value={adminNotes}
                    onChangeText={setAdminNotes}
                    placeholder="Add notes about this deposit..."
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Rejection Reason (if rejecting) */}
                <View style={styles.rejectionSection}>
                  <Text style={styles.sectionTitle}>Rejection Reason (if rejecting)</Text>
                  <TextInput
                    style={styles.notesInput}
                    value={rejectionReason}
                    onChangeText={setRejectionReason}
                    placeholder="Reason for rejection..."
                    multiline
                    numberOfLines={2}
                  />
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <CustomButton
                    title="Reject"
                    onPress={() => processDeposit('REJECTED')}
                    loading={processing}
                    style={styles.rejectButton}
                    textStyle={styles.rejectButtonText}
                    leftIcon={<Ionicons name="close-circle" size={20} color="#FFFFFF" />}
                  />
                  <CustomButton
                    title="Approve"
                    onPress={() => processDeposit('SUCCESS')}
                    loading={processing}
                    style={styles.approveButton}
                    textStyle={styles.approveButtonText}
                    leftIcon={<Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />}
                  />
                </View>
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
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
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  depositCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  depositHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginRight: 4,
  },
  currencyText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
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
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  depositContent: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewButton: {
    flex: 1,
    borderColor: '#3B82F6',
  },
  reviewButtonText: {
    color: '#3B82F6',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  detailCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
  },
  screenshotSection: {
    marginBottom: 20,
  },
  screenshot: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  notesSection: {
    marginBottom: 20,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  rejectionSection: {
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#EF4444',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#10B981',
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});