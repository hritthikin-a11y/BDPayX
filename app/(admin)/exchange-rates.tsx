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

interface ExchangeRate {
  id: string;
  from_currency: 'BDT' | 'INR';
  to_currency: 'BDT' | 'INR';
  rate: number;
  is_active: boolean;
  created_at: string;
}

export default function ExchangeRates() {
  const router = useRouter();
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRates = async () => {
    try {
      const data = await ApiService.getExchangeRates();
      setRates(data);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      Alert.alert('Error', 'Failed to fetch exchange rates');
    }
  };

  useEffect(() => {
    const loadRates = async () => {
      setLoading(true);
      await fetchRates();
      setLoading(false);
    };

    loadRates();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRates();
    setRefreshing(false);
  };

  const toggleRateStatus = async (rateId: string, currentStatus: boolean) => {
    try {
      const success = await ApiService.updateExchangeRate(rateId, {
        is_active: !currentStatus,
      });
      if (success) {
        Alert.alert('Success', `Exchange rate ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        await fetchRates();
      } else {
        Alert.alert('Error', 'Failed to update exchange rate status');
      }
    } catch (error) {
      console.error('Error updating rate status:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const deleteRate = async (rateId: string, fromCurrency: string, toCurrency: string) => {
    Alert.alert(
      'Delete Exchange Rate',
      `Are you sure you want to delete ${fromCurrency} to ${toCurrency} rate?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await ApiService.deleteExchangeRate(rateId);
              if (success) {
                Alert.alert('Success', 'Exchange rate deleted successfully');
                await fetchRates();
              } else {
                Alert.alert('Error', 'Failed to delete exchange rate');
              }
            } catch (error) {
              console.error('Error deleting rate:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  const getCurrencyIcon = (currency: string) => {
    return currency === 'BDT' ? '🇧🇩' : '🇮🇳';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Exchange Rates</Text>
            <Text style={styles.subtitle}>Manage currency exchange rates</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(admin)/add-exchange-rate')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Rates List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading exchange rates...</Text>
          </View>
        ) : rates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="trending-up-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No exchange rates found</Text>
            <Text style={styles.emptySubtitle}>Add your first exchange rate</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(admin)/add-exchange-rate')}
            >
              <Ionicons name="add-circle" size={20} color="#8B5CF6" />
              <Text style={styles.emptyButtonText}>Add Exchange Rate</Text>
            </TouchableOpacity>
          </View>
        ) : (
          rates.map((rate) => (
            <View key={rate.id} style={styles.rateCard}>
              <View style={styles.rateHeader}>
                <View style={styles.currencyPair}>
                  <View style={styles.fromCurrency}>
                    <Text style={styles.currencyFlag}>{getCurrencyIcon(rate.from_currency)}</Text>
                    <Text style={styles.currencyCode}>{rate.from_currency}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#6B7280" />
                  <View style={styles.toCurrency}>
                    <Text style={styles.currencyFlag}>{getCurrencyIcon(rate.to_currency)}</Text>
                    <Text style={styles.currencyCode}>{rate.to_currency}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: rate.is_active ? '#10B981' : '#EF4444' }]}>
                  <Text style={styles.statusText}>{rate.is_active ? 'Active' : 'Inactive'}</Text>
                </View>
              </View>

              <View style={styles.rateDetails}>
                <Text style={styles.rateLabel}>Exchange Rate</Text>
                <Text style={styles.rateValue}>
                  1 {rate.from_currency} = {rate.rate} {rate.to_currency}
                </Text>
              </View>

              <View style={styles.rateFooter}>
                <Text style={styles.dateText}>
                  Created {new Date(rate.created_at).toLocaleDateString()}
                </Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => router.push(`/(admin)/edit-exchange-rate?id=${rate.id}`)}
                  >
                    <Ionicons name="pencil" size={16} color="#8B5CF6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.toggleButton]}
                    onPress={() => toggleRateStatus(rate.id, rate.is_active)}
                  >
                    <Ionicons
                      name={rate.is_active ? 'pause' : 'play'}
                      size={16}
                      color={rate.is_active ? '#F59E0B' : '#10B981'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => deleteRate(rate.id, rate.from_currency, rate.to_currency)}
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
    backgroundColor: '#8B5CF6',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  rateCard: {
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
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currencyPair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fromCurrency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toCurrency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyFlag: {
    fontSize: 20,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
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
  rateDetails: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  rateLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  rateValue: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '700',
  },
  rateFooter: {
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
    backgroundColor: '#F3E8FF',
  },
  toggleButton: {
    backgroundColor: '#F0FDF4',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
});