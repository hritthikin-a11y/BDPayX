import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBanking } from '../../providers/BankingProvider';
import { formatCurrency } from '../../lib/constants';
import { Transaction } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/CustomButton';

export default function TransactionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { transactions } = useBanking();

  const transaction = transactions.find((t) => t.id === id) as
    | Transaction
    | undefined;

  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Transaction not found</Text>
      </View>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'checkmark-circle';
      case 'PENDING':
        return 'hourglass-outline';
      case 'FAILED':
        return 'close-circle';
      case 'CANCELLED':
        return 'remove-circle-outline';
      case 'REJECTED':
        return 'thumbs-down-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return '#27ae60';
      case 'PENDING':
        return '#f39c12';
      case 'FAILED':
        return '#e74c3c';
      case 'CANCELLED':
        return '#95a5a6';
      case 'REJECTED':
        return '#e74c3c';
      default:
        return '#3498db';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction Details</Text>
      </View>

      <View style={styles.statusCard}>
        <Ionicons
          name={getStatusIcon(transaction.status)}
          size={48}
          color={getStatusColor(transaction.status)}
        />
        <Text
          style={[
            styles.statusText,
            { color: getStatusColor(transaction.status) },
          ]}
        >
          {transaction.status}
        </Text>
        <Text style={styles.dateText}>
          {new Date(transaction.created_at).toLocaleString()}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <DetailRow label="Type" value={transaction.type} />
        <DetailRow
          label="Amount"
          value={formatCurrency(transaction.amount, transaction.currency)}
        />
        {transaction.type === 'EXCHANGE' && (
          <>
            <DetailRow
              label="From"
              value={formatCurrency(
                transaction.amount,
                transaction.from_currency!
              )}
            />
            <DetailRow
              label="To"
              value={formatCurrency(
                transaction.converted_amount!,
                transaction.to_currency!
              )}
            />
            <DetailRow
              label="Rate"
              value={`1 ${transaction.from_currency} = ${transaction.exchange_rate} ${transaction.to_currency}`}
            />
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Details</Text>
        <DetailRow label="Transaction ID" value={transaction.id} />
        {transaction.reference_number && (
          <DetailRow
            label="Reference No."
            value={transaction.reference_number}
          />
        )}
        {transaction.processed_at && (
          <DetailRow
            label="Processed At"
            value={new Date(transaction.processed_at).toLocaleString()}
          />
        )}
      </View>

      {transaction.screenshot_url && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Screenshot</Text>
          <Image
            source={{ uri: transaction.screenshot_url }}
            style={styles.screenshot}
          />
        </View>
      )}

      {transaction.admin_notes && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Admin Notes</Text>
          <Text style={styles.notesText}>{transaction.admin_notes}</Text>
        </View>
      )}

      {transaction.type === 'DEPOSIT' && (
        <CustomButton
          title="Repeat Deposit"
          onPress={() => router.push('/(tabs)/deposit')}
          style={{ marginTop: 16 }}
        />
      )}
    </ScrollView>
  );
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
    flex: 1,
  },
  notesText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  screenshot: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 18,
    color: '#e74c3c',
  },
});
