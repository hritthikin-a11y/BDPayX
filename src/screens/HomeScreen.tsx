import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useBanking } from '../context/BankingContext';
import CustomButton from '../components/CustomButton';

const HomeScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const { balance } = useBanking();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const ActionCard = ({ title, description, onPress, color = '#4A90E2' }: any) => (
    <TouchableOpacity 
      style={[styles.actionCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionDescription}>{description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Your Wallet</Text>
          <View style={styles.balanceRow}>
            <View style={styles.currencyBox}>
              <Text style={styles.currencyLabel}>BDT</Text>
              <Text style={styles.currencyAmount}>৳{balance.bdt.toFixed(2)}</Text>
            </View>
            <View style={[styles.currencyBox, styles.currencyBoxSecondary]}>
              <Text style={styles.currencyLabel}>INR</Text>
              <Text style={styles.currencyAmount}>₹{balance.inr.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <ActionCard
            title="💰 Deposit Money"
            description="Add funds to your wallet"
            onPress={() => navigation.navigate('DepositFlow')}
            color="#28A745"
          />
          
          <ActionCard
            title="💸 Withdraw Funds"
            description="Transfer money to your bank"
            onPress={() => navigation.navigate('WithdrawFlow')}
            color="#FD7E14"
          />
          
          <ActionCard
            title="🔄 Currency Exchange"
            description="Convert between BDT and INR"
            onPress={() => navigation.navigate('ExchangeFlow')}
            color="#6F42C1"
          />
          
          <ActionCard
            title="👤 My Profile"
            description="Manage your account settings"
            onPress={() => navigation.navigate('ProfileFlow')}
            color="#17A2B8"
          />
        </View>

        <View style={styles.logoutContainer}>
          <CustomButton
            title="Sign Out"
            onPress={handleLogout}
            variant="outline"
            size="medium"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 50,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginTop: -20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E3A59',
    textAlign: 'center',
    marginBottom: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  currencyBox: {
    flex: 1,
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  currencyBoxSecondary: {
    backgroundColor: '#FFF3E0',
  },
  currencyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7B8794',
    marginBottom: 4,
  },
  currencyAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E3A59',
  },
  actionsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#7B8794',
  },
  logoutContainer: {
    paddingBottom: 32,
  },
});

export default HomeScreen;