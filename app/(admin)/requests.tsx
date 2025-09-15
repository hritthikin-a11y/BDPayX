import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../lib/api';
import { formatCurrency } from '../../lib/constants';

export default function AdminRequests() {
  const router = useRouter();
  const [stats, setStats] = useState({
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    pendingExchanges: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalExchanges: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequestStats = async () => {
    try {
      const [deposits, withdrawals, exchanges] = await Promise.all([
        ApiService.getAllDepositRequests(),
        ApiService.getAllWithdrawalRequests(),
        ApiService.getAllExchangeRequests(),
      ]);

      const pendingDeposits = deposits.filter(req => req.status === 'PENDING').length;
      const pendingWithdrawals = withdrawals.filter(req => req.status === 'PENDING').length;
      const pendingExchanges = exchanges.filter(req => req.status === 'PENDING').length;

      setStats({
        pendingDeposits,
        pendingWithdrawals,
        pendingExchanges,
        totalDeposits: deposits.length,
        totalWithdrawals: withdrawals.length,
        totalExchanges: exchanges.length,
      });
    } catch (error) {
      console.error('Error fetching request stats:', error);
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      await fetchRequestStats();
      setLoading(false);
    };

    loadStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequestStats();
    setRefreshing(false);
  };

  const requestTypes = [
    {
      title: 'Deposit Requests',
      subtitle: `${stats.pendingDeposits} pending / ${stats.totalDeposits} total`,
      icon: 'arrow-down-circle',
      color: '#10B981',
      route: '/(admin)/deposits',
      pending: stats.pendingDeposits,
    },
    {
      title: 'Withdrawal Requests',
      subtitle: `${stats.pendingWithdrawals} pending / ${stats.totalWithdrawals} total`,
      icon: 'arrow-up-circle',
      color: '#F59E0B',
      route: '/(admin)/withdrawals',
      pending: stats.pendingWithdrawals,
    },
    {
      title: 'Exchange Requests',
      subtitle: `${stats.pendingExchanges} pending / ${stats.totalExchanges} total`,
      icon: 'refresh-circle',
      color: '#8B5CF6',
      route: '/(admin)/exchanges',
      pending: stats.pendingExchanges,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Request Management</Text>
        <Text style={styles.subtitle}>Review and process user requests</Text>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
            <View style={styles.statHeader}>
              <Ionicons name="hourglass-outline" size={24} color="#3B82F6" />
              <Text style={[styles.statNumber, { color: '#3B82F6' }]}>
                {stats.pendingDeposits + stats.pendingWithdrawals + stats.pendingExchanges}
              </Text>
            </View>
            <Text style={styles.statLabel}>Pending Requests</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
            <View style={styles.statHeader}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
              <Text style={[styles.statNumber, { color: '#10B981' }]}>
                {stats.totalDeposits + stats.totalWithdrawals + stats.totalExchanges}
              </Text>
            </View>
            <Text style={styles.statLabel}>Total Requests</Text>
          </View>
        </View>
      </View>

      {/* Request Types */}
      <View style={styles.requestsContainer}>
        <Text style={styles.sectionTitle}>Request Types</Text>
        {requestTypes.map((type, index) => (
          <TouchableOpacity
            key={index}
            style={styles.requestCard}
            onPress={() => router.push(type.route as any)}
          >
            <View style={styles.requestHeader}>
              <View style={[styles.requestIcon, { backgroundColor: type.color }]}>
                <Ionicons name={type.icon as any} size={28} color="#FFFFFF" />
              </View>
              <View style={styles.requestContent}>
                <Text style={styles.requestTitle}>{type.title}</Text>
                <Text style={styles.requestSubtitle}>{type.subtitle}</Text>
              </View>
              {type.pending > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>{type.pending}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(admin)/deposits')}
        >
          <Ionicons name="flash" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Process Pending Deposits</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
          onPress={() => router.push('/(admin)/withdrawals')}
        >
          <Ionicons name="flash" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Process Withdrawals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
          onPress={() => router.push('/(admin)/exchanges')}
        >
          <Ionicons name="flash" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Review Exchanges</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  requestsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  requestContent: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  requestSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  pendingBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  pendingBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});