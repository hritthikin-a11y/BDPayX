import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../providers/AuthProvider';
import { ApiService } from '../../lib/api';
import { formatCurrency } from '../../lib/constants';
import { testSupabaseConnection, testBasicQuery } from '../../lib/testConnection';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalPendingDeposits: number;
  totalPendingWithdrawals: number;
  totalPendingExchanges: number;
  totalDepositAmount: number;
  totalWithdrawalAmount: number;
  totalExchangeAmount: number;
  todayDeposits: number;
  todayWithdrawals: number;
  totalUsers: number;
  activeUsers: number;
}

export default function AdminDashboard() {
  const { userProfile, isAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalPendingDeposits: 0,
    totalPendingWithdrawals: 0,
    totalPendingExchanges: 0,
    totalDepositAmount: 0,
    totalWithdrawalAmount: 0,
    totalExchangeAmount: 0,
    todayDeposits: 0,
    todayWithdrawals: 0,
    totalUsers: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      // Test Supabase connection first
      console.log('🔍 Testing Supabase connection...');
      const connectionTest = await testSupabaseConnection();
      console.log('🔍 Connection test result:', connectionTest);

      const queryTest = await testBasicQuery();
      console.log('🔍 Query test result:', queryTest);

      // Fetch pending requests
      console.log('🔍 Fetching pending deposits...');
      const pendingDeposits = await ApiService.getAllDepositRequests('PENDING');
      console.log('🔍 Fetching pending withdrawals...');
      const pendingWithdrawals = await ApiService.getAllWithdrawalRequests('PENDING');
      console.log('🔍 Fetching pending exchanges...');
      const pendingExchanges = await ApiService.getAllExchangeRequests('PENDING');

      // Calculate totals
      const totalDepositAmount = pendingDeposits.reduce((sum, req) => sum + req.amount, 0);
      const totalWithdrawalAmount = pendingWithdrawals.reduce((sum, req) => sum + req.amount, 0);
      const totalExchangeAmount = pendingExchanges.reduce((sum, req) => sum + req.from_amount, 0);

      // Today's transactions (simplified - you can implement proper date filtering)
      const allDeposits = await ApiService.getAllDepositRequests();
      const allWithdrawals = await ApiService.getAllWithdrawalRequests();

      const today = new Date().toISOString().split('T')[0];
      const todayDeposits = allDeposits.filter(req =>
        req.created_at?.startsWith(today)
      ).length;
      const todayWithdrawals = allWithdrawals.filter(req =>
        req.created_at?.startsWith(today)
      ).length;

      setStats({
        totalPendingDeposits: pendingDeposits.length,
        totalPendingWithdrawals: pendingWithdrawals.length,
        totalPendingExchanges: pendingExchanges.length,
        totalDepositAmount,
        totalWithdrawalAmount,
        totalExchangeAmount,
        todayDeposits,
        todayWithdrawals,
        totalUsers: 0, // You can implement user counting
        activeUsers: 0, // You can implement active user counting
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      await fetchDashboardStats();
      setLoading(false);
    };

    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  };

  const quickActions = [
    {
      title: 'Pending Deposits',
      subtitle: `${stats.totalPendingDeposits} requests`,
      amount: formatCurrency(stats.totalDepositAmount, 'BDT'),
      icon: 'arrow-down-circle',
      color: '#10B981',
      route: '/(admin)/deposits',
    },
    {
      title: 'Pending Withdrawals',
      subtitle: `${stats.totalPendingWithdrawals} requests`,
      amount: formatCurrency(stats.totalWithdrawalAmount, 'BDT'),
      icon: 'arrow-up-circle',
      color: '#F59E0B',
      route: '/(admin)/withdrawals',
    },
    {
      title: 'Pending Exchanges',
      subtitle: `${stats.totalPendingExchanges} requests`,
      amount: formatCurrency(stats.totalExchangeAmount, 'BDT'),
      icon: 'refresh-circle',
      color: '#8B5CF6',
      route: '/(admin)/exchanges',
    },
    {
      title: 'Admin Banks',
      subtitle: 'Manage accounts',
      amount: '',
      icon: 'business',
      color: '#3B82F6',
      route: '/(admin)/admin-banks',
    },
    {
      title: 'Exchange Rates',
      subtitle: 'Manage rates',
      amount: '',
      icon: 'trending-up',
      color: '#EF4444',
      route: '/(admin)/exchange-rates',
    },
    {
      title: 'View All Requests',
      subtitle: 'All transactions',
      amount: '',
      icon: 'list',
      color: '#6B7280',
      route: '/(admin)/requests',
    },
  ];

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>
            You don't have permission to access the admin dashboard.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>
            {userProfile?.full_name || 'Admin'}
          </Text>
        </View>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
          <Text style={styles.adminBadgeText}>ADMIN</Text>
        </View>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="arrow-down" size={20} color="#3B82F6" />
            <Text style={styles.statNumber}>{stats.todayDeposits}</Text>
            <Text style={styles.statLabel}>Deposits</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="arrow-up" size={20} color="#F59E0B" />
            <Text style={styles.statNumber}>{stats.todayWithdrawals}</Text>
            <Text style={styles.statLabel}>Withdrawals</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="people" size={20} color="#8B5CF6" />
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() => router.push(action.route as any)}
            >
              <View style={styles.actionHeader}>
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon as any} size={24} color="#FFFFFF" />
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              {action.amount ? (
                <Text style={[styles.actionAmount, { color: action.color }]}>
                  {action.amount}
                </Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Pending Actions Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Pending Actions Required</Text>
        {stats.totalPendingDeposits + stats.totalPendingWithdrawals + stats.totalPendingExchanges === 0 ? (
          <View style={styles.noActionsContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            <Text style={styles.noActionsTitle}>All Caught Up!</Text>
            <Text style={styles.noActionsText}>
              No pending requests require your attention.
            </Text>
          </View>
        ) : (
          <View style={styles.pendingList}>
            {stats.totalPendingDeposits > 0 && (
              <TouchableOpacity
                style={styles.pendingItem}
                onPress={() => router.push('/(admin)/deposits')}
              >
                <View style={styles.pendingIcon}>
                  <Ionicons name="arrow-down" size={20} color="#10B981" />
                </View>
                <View style={styles.pendingContent}>
                  <Text style={styles.pendingTitle}>
                    {stats.totalPendingDeposits} Deposit Requests
                  </Text>
                  <Text style={styles.pendingAmount}>
                    {formatCurrency(stats.totalDepositAmount, 'BDT')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
            {stats.totalPendingWithdrawals > 0 && (
              <TouchableOpacity
                style={styles.pendingItem}
                onPress={() => router.push('/(admin)/withdrawals')}
              >
                <View style={styles.pendingIcon}>
                  <Ionicons name="arrow-up" size={20} color="#F59E0B" />
                </View>
                <View style={styles.pendingContent}>
                  <Text style={styles.pendingTitle}>
                    {stats.totalPendingWithdrawals} Withdrawal Requests
                  </Text>
                  <Text style={styles.pendingAmount}>
                    {formatCurrency(stats.totalWithdrawalAmount, 'BDT')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
            {stats.totalPendingExchanges > 0 && (
              <TouchableOpacity
                style={styles.pendingItem}
                onPress={() => router.push('/(admin)/exchanges')}
              >
                <View style={styles.pendingIcon}>
                  <Ionicons name="refresh" size={20} color="#8B5CF6" />
                </View>
                <View style={styles.pendingContent}>
                  <Text style={styles.pendingTitle}>
                    {stats.totalPendingExchanges} Exchange Requests
                  </Text>
                  <Text style={styles.pendingAmount}>
                    {formatCurrency(stats.totalExchangeAmount, 'BDT')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  adminBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    width: (width - 56) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  actionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noActionsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  noActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  noActionsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  pendingList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  pendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pendingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pendingContent: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  pendingAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});