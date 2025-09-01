import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useBanking } from '../../providers/BankingProvider';
import { useAuth } from '../../providers/AuthProvider';
import { formatCurrency } from '../../lib/constants';
import CustomButton from '../../components/CustomButton';
import { useRouter } from 'expo-router';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { balance, loading, fetchAllData } = useBanking();
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error) {
        setExchangeRates(data || []);
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    await fetchExchangeRates();
    setRefreshing(false);
  };

  const getExchangeRate = (from: string, to: string) => {
    const rate = exchangeRates.find(
      (r: any) => r.from_currency === from && r.to_currency === to
    );
    return rate ? rate.rate : 0;
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with Gradient */}
      <View style={styles.headerGradient}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>Good morning,</Text>
              <Text style={styles.userName}>
                {user?.user_metadata?.full_name || 'User'}
              </Text>
            </View>
            <TouchableOpacity style={styles.profileAvatar}>
              <Ionicons name="person" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Balance Cards */}
          <View style={styles.balanceContainer}>
            <View style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Ionicons name="eye-outline" size={16} color="#8B9DC3" />
              </View>
              <Text style={styles.totalBalance}>
                {loading
                  ? '•••••'
                  : balance
                  ? `৳${(
                      balance.bdt +
                      balance.inr * getExchangeRate('INR', 'BDT')
                    ).toFixed(2)}`
                  : '৳0.00'}
              </Text>
              <View style={styles.currencyBreakdown}>
                <Text style={styles.currencyItem}>
                  BDT:{' '}
                  {loading
                    ? '•••'
                    : balance
                    ? formatCurrency(balance.bdt, 'BDT')
                    : '৳0.00'}
                </Text>
                <Text style={styles.currencyItem}>
                  INR:{' '}
                  {loading
                    ? '•••'
                    : balance
                    ? formatCurrency(balance.inr, 'INR')
                    : '₹0.00'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Exchange Rates Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Exchange Rates</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/exchange')}>
            <Text style={styles.seeAllText}>Trade</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.ratesContainer}
        >
          <View style={styles.rateCard}>
            <View style={styles.rateHeader}>
              <Text style={styles.ratePair}>BDT → INR</Text>
              <View style={styles.trendIndicator}>
                <Ionicons name="trending-up" size={12} color="#10B981" />
              </View>
            </View>
            <Text style={styles.rateValue}>
              {getExchangeRate('BDT', 'INR').toFixed(4)}
            </Text>
            <Text style={styles.rateSubtext}>
              1 BDT = {getExchangeRate('BDT', 'INR').toFixed(4)} INR
            </Text>
          </View>

          <View style={styles.rateCard}>
            <View style={styles.rateHeader}>
              <Text style={styles.ratePair}>INR → BDT</Text>
              <View style={styles.trendIndicator}>
                <Ionicons name="trending-up" size={12} color="#10B981" />
              </View>
            </View>
            <Text style={styles.rateValue}>
              {getExchangeRate('INR', 'BDT').toFixed(2)}
            </Text>
            <Text style={styles.rateSubtext}>
              1 INR = {getExchangeRate('INR', 'BDT').toFixed(2)} BDT
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/deposit')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
              <AntDesign name="plus" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle} numberOfLines={1}>
              Deposit
            </Text>
            <Text style={styles.actionSubtitle}>Add money</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/withdraw')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#EF4444' }]}>
              <AntDesign name="minus" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle} numberOfLines={1}>
              Withdraw
            </Text>
            <Text style={styles.actionSubtitle}>Cash out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/exchange')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F59E0B' }]}>
              <AntDesign name="swap" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle} numberOfLines={1}>
              Exchange
            </Text>
            <Text style={styles.actionSubtitle}>Convert</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/transfer')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#8B5CF6' }]}>
              <AntDesign name="arrowright" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle} numberOfLines={1}>
              Transfer
            </Text>
            <Text style={styles.actionSubtitle}>Send money</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="receipt-outline" size={24} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptySubtitle}>
            Your transaction history will appear here
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  headerGradient: {
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceContainer: {
    marginTop: 8,
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#8B9DC3',
    fontWeight: '500',
  },
  totalBalance: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  currencyBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currencyItem: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
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
    flexShrink: 1,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  ratesContainer: {
    marginBottom: 4,
  },
  rateCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratePair: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  trendIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  rateSubtext: {
    fontSize: 11,
    color: '#94A3B8',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionCard: {
    flex: 1,
    maxWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    marginBottom: 6,
  },
  iconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 1,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
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
  },
});
