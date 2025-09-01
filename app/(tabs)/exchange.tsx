import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useBanking } from '../../providers/BankingProvider';
import { useAuth } from '../../providers/AuthProvider';
import { formatCurrency, validateAmount } from '../../lib/constants';
import CustomButton from '../../components/CustomButton';
import ExchangeCalculator from '../../components/ExchangeCalculator';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ExchangeScreen() {
  const { exchangeRates, exchangeRequest, fetchBalance, balance } =
    useBanking();
  const { user } = useAuth();
  const router = useRouter();
  const [fromCurrency, setFromCurrency] = useState<'BDT' | 'INR'>('BDT');
  const [toCurrency, setToCurrency] = useState<'BDT' | 'INR'>('INR');
  const [fromAmount, setFromAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Find the exchange rate when currencies change
  useEffect(() => {
    if (exchangeRates.length > 0) {
      const rate = exchangeRates.find(
        (r) => r.from_currency === fromCurrency && r.to_currency === toCurrency
      );
      setExchangeRate(rate ? rate.rate : 0);
    }
  }, [fromCurrency, toCurrency, exchangeRates]);

  const handleAmountChange = (from: number, to: number) => {
    setFromAmount(from);
    setToAmount(to);
  };

  const swapCurrencies = () => {
    const newFromCurrency = toCurrency;
    const newToCurrency = fromCurrency;
    setFromCurrency(newFromCurrency);
    setToCurrency(newToCurrency);
  };

  const handleExchange = async () => {
    if (!fromAmount || fromAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // Check if user has sufficient balance
    const currentBalance = fromCurrency === 'BDT' ? balance?.bdt : balance?.inr;
    if (!currentBalance || currentBalance < fromAmount) {
      Alert.alert('Error', `Insufficient ${fromCurrency} balance`);
      return;
    }

    const amountError = validateAmount(fromAmount, 'EXCHANGE', fromCurrency);
    if (amountError) {
      Alert.alert('Error', amountError);
      return;
    }

    setLoading(true);
    try {
      const success = await exchangeRequest(
        user!.id,
        fromCurrency,
        toCurrency,
        fromAmount,
        toAmount,
        exchangeRate
      );

      if (success) {
        await fetchBalance();
        Alert.alert(
          'Exchange Successful',
          `Successfully exchanged ${formatCurrency(
            fromAmount,
            fromCurrency
          )} to ${formatCurrency(toAmount, toCurrency)}`,
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      } else {
        Alert.alert('Error', 'Failed to process exchange. Please try again.');
      }
    } catch (error) {
      console.error('Exchange error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableBalance = () => {
    const currentBalance = fromCurrency === 'BDT' ? balance?.bdt : balance?.inr;
    return currentBalance || 0;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Currency Exchange</Text>
        <Text style={styles.headerSubtitle}>
          Convert between BDT and INR with live rates
        </Text>
      </View>

      {/* Current Exchange Rates */}
      <View style={styles.ratesContainer}>
        <Text style={styles.sectionTitle}>Current Exchange Rates</Text>
        <View style={styles.rateGrid}>
          {exchangeRates.map((rate) => (
            <View
              key={`${rate.from_currency}-${rate.to_currency}`}
              style={styles.rateCard}
            >
              <View style={styles.rateHeader}>
                <Text style={styles.ratePair}>
                  {rate.from_currency} → {rate.to_currency}
                </Text>
                <Ionicons name="trending-up" size={16} color="#10B981" />
              </View>
              <Text style={styles.rateValue}>{rate.rate.toFixed(4)}</Text>
              <Text style={styles.rateSubtext}>
                1 {rate.from_currency} = {rate.rate.toFixed(4)}{' '}
                {rate.to_currency}
              </Text>
              <Text style={styles.rateTime}>
                Updated: {new Date(rate.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Exchange Calculator */}
      <ExchangeCalculator
        fromCurrency={fromCurrency}
        toCurrency={toCurrency}
        exchangeRate={exchangeRate}
        onAmountChange={handleAmountChange}
      />

      {/* Currency Swap */}
      <View style={styles.swapContainer}>
        <TouchableOpacity style={styles.swapButton} onPress={swapCurrencies}>
          <Ionicons name="swap-horizontal" size={20} color="#3B82F6" />
          <Text style={styles.swapButtonText}>Swap Currencies</Text>
        </TouchableOpacity>
      </View>

      {/* Balance Info */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>
          {formatCurrency(getAvailableBalance(), fromCurrency)}
        </Text>
      </View>

      {/* Exchange Button */}
      <View style={styles.actionContainer}>
        <CustomButton
          title={loading ? 'Processing...' : 'Exchange Currency'}
          onPress={handleExchange}
          loading={loading}
          disabled={!fromAmount || fromAmount <= 0 || !exchangeRate}
          leftIcon={
            !loading ? (
              <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />
            ) : undefined
          }
          style={styles.exchangeButton}
          textStyle={styles.exchangeButtonText}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
    flexShrink: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  ratesContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    flexShrink: 1,
  },
  rateGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  rateCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
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
  rateValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  rateSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
  },
  rateTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  swapContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  swapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 8,
  },
  swapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  balanceContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  exchangeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 18,
  },
  exchangeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
