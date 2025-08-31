import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useBanking } from '../../providers/BankingProvider';
import { useAuth } from '../../providers/AuthProvider';
import { formatCurrency } from '../../lib/constants';
import CustomButton from '../../components/CustomButton';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { balance, loading, fetchAllData } = useBanking();
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.user_metadata?.full_name || 'User'}</Text>
      </View>

      {/* Balance Cards */}
      <View style={styles.balanceContainer}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>BDT Balance</Text>
          <Text style={styles.balanceAmount}>
            {loading ? 'Loading...' : balance ? formatCurrency(balance.bdt, 'BDT') : '৳0.00'}
          </Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>INR Balance</Text>
          <Text style={styles.balanceAmount}>
            {loading ? 'Loading...' : balance ? formatCurrency(balance.inr, 'INR') : '₹0.00'}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <CustomButton
            title="Deposit"
            onPress={() => router.push('/(tabs)/deposit')}
            style={styles.actionButton}
            textStyle={styles.actionButtonText}
            leftIcon={<Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />}
          />
          <CustomButton
            title="Withdraw"
            onPress={() => router.push('/(tabs)/withdraw')}
            style={styles.actionButton}
            textStyle={styles.actionButtonText}
            leftIcon={<Ionicons name="remove-circle-outline" size={20} color="#FFFFFF" />}
          />
          <CustomButton
            title="Exchange"
            onPress={() => router.push('/(tabs)/exchange')}
            style={styles.actionButton}
            textStyle={styles.actionButtonText}
            leftIcon={<Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />}
          />
          <CustomButton
            title="Transfer"
            onPress={() => router.push('/(tabs)/transfer')}
            style={styles.actionButton}
            textStyle={styles.actionButtonText}
            leftIcon={<Ionicons name="send-outline" size={20} color="#FFFFFF" />}
          />
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <CustomButton
            title="View All"
            onPress={() => router.push('/(tabs)/transactions')}
            variant="ghost"
            size="small"
            textStyle={styles.viewAllText}
          />
        </View>
        <View style={styles.placeholderContainer}>
          <Ionicons name="document-text-outline" size={48} color="#7B8794" />
          <Text style={styles.placeholderText}>No recent transactions</Text>
          <Text style={styles.placeholderSubtext}>Your transactions will appear here</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 24,
    paddingTop: 40,
    backgroundColor: '#FFFFFF',
  },
  welcomeText: {
    fontSize: 16,
    color: '#7B8794',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E3A59',
    marginTop: 4,
  },
  balanceContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#7B8794',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E3A59',
  },
  section: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E3A59',
  },
  viewAllText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: 40,
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
  },
});