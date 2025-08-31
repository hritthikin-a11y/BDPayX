import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Platform,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useBanking } from '../../providers/BankingProvider';
import { useAuth } from '../../providers/AuthProvider';
import { formatCurrency, validateAmount } from '../../lib/constants';
import CustomButton from '../../components/CustomButton';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ExchangeScreen() {
  const { exchangeRates, exchangeRequest, fetchBalance, balance } =
    useBanking();
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fromCurrency: 'BDT' as 'BDT' | 'INR',
    toCurrency: 'INR' as 'BDT' | 'INR',
    fromAmount: '',
    toAmount: '',
  });
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Find the exchange rate when currencies change
  useEffect(() => {
    if (exchangeRates.length > 0) {
      const rate = exchangeRates.find(
        (r) =>
          r.from_currency === formData.fromCurrency &&
          r.to_currency === formData.toCurrency
      );
      setExchangeRate(rate ? rate.rate : null);
    }
  }, [formData.fromCurrency, formData.toCurrency, exchangeRates]);

  // Calculate the converted amount when fromAmount changes
  useEffect(() => {
    if (exchangeRate && formData.fromAmount) {
      const fromAmount = parseFloat(formData.fromAmount);
      if (!isNaN(fromAmount)) {
        const toAmount = fromAmount * exchangeRate;
        setFormData((prev) => ({
          ...prev,
          toAmount: toAmount.toFixed(2),
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, toAmount: '' }));
    }
  }, [formData.fromAmount, exchangeRate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const swapCurrencies = () => {
    setFormData((prev) => ({
      fromCurrency: prev.toCurrency,
      toCurrency: prev.fromCurrency,
      fromAmount: '',
      toAmount: '',
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.fromAmount || !formData.toAmount) {
      Alert.alert('Error', 'Please enter amount');
      return;
    }

    const fromAmount = parseFloat(formData.fromAmount);
    const toAmount = parseFloat(formData.toAmount);

    if (isNaN(fromAmount) || isNaN(toAmount)) {
      Alert.alert('Error', 'Please enter valid amounts');
      return;
    }

    if (!exchangeRate) {
      Alert.alert('Error', 'Exchange rate not available');
      return;
    }

    // Check if user has sufficient balance
    const currentBalance =
      formData.fromCurrency === 'BDT' ? balance?.bdt : balance?.inr;
    if (!currentBalance || currentBalance < fromAmount) {
      Alert.alert('Error', `Insufficient ${formData.fromCurrency} balance`);
      return;
    }

    const amountError = validateAmount(
      fromAmount,
      'EXCHANGE',
      formData.fromCurrency
    );
    if (amountError) {
      Alert.alert('Error', amountError);
      return;
    }

    setLoading(true);
    try {
      const success = await exchangeRequest(
        user!.id,
        formData.fromCurrency,
        formData.toCurrency,
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
            formData.fromCurrency
          )} to ${formatCurrency(toAmount, formData.toCurrency)}`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to process exchange request. Please try again.'
        );
      }
    } catch (error) {
      console.error('Exchange error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableBalance = () => {
    const currentBalance =
      formData.fromCurrency === 'BDT' ? balance?.bdt : balance?.inr;
    return currentBalance || 0;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Currency Exchange</Text>
        <Text style={styles.headerSubtitle}>
          Convert between BDT and INR instantly
        </Text>
      </View>

      {/* Exchange Rate Card */}
      {exchangeRate && (
        <View style={styles.rateCard}>
          <View style={styles.rateHeader}>
            <View style={styles.rateIcon}>
              <Ionicons name="trending-up" size={20} color="#10B981" />
            </View>
            <View>
              <Text style={styles.rateTitle}>Current Rate</Text>
              <Text style={styles.rateSubtitle}>Live exchange rate</Text>
            </View>
          </View>
          <Text style={styles.rateText}>
            1 {formData.fromCurrency} = {exchangeRate.toFixed(6)}{' '}
            {formData.toCurrency}
          </Text>
        </View>
      )}

      {/* Exchange Form */}
      <View style={styles.formCard}>
        {/* From Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>From</Text>

          {/* Currency Selector */}
          <View style={styles.currencySelector}>
            <TouchableOpacity
              style={[
                styles.currencyOption,
                formData.fromCurrency === 'BDT' && styles.activeCurrencyOption,
              ]}
              onPress={() => handleInputChange('fromCurrency', 'BDT')}
            >
              <Text style={styles.currencySymbol}>৳</Text>
              <Text
                style={[
                  styles.currencyText,
                  formData.fromCurrency === 'BDT' && styles.activeCurrencyText,
                ]}
              >
                BDT
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.currencyOption,
                formData.fromCurrency === 'INR' && styles.activeCurrencyOption,
              ]}
              onPress={() => handleInputChange('fromCurrency', 'INR')}
            >
              <Text style={styles.currencySymbol}>₹</Text>
              <Text
                style={[
                  styles.currencyText,
                  formData.fromCurrency === 'INR' && styles.activeCurrencyText,
                ]}
              >
                INR
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputSymbol}>
              {formData.fromCurrency === 'BDT' ? '৳' : '₹'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.fromAmount}
              onChangeText={(text) => handleInputChange('fromAmount', text)}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Available Balance */}
          <Text style={styles.balanceText}>
            Available:{' '}
            {formatCurrency(getAvailableBalance(), formData.fromCurrency)}
          </Text>
        </View>

        {/* Swap Button */}
        <View style={styles.swapContainer}>
          <TouchableOpacity style={styles.swapButton} onPress={swapCurrencies}>
            <Ionicons name="swap-vertical" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* To Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>To</Text>

          {/* Currency Selector */}
          <View style={styles.currencySelector}>
            <TouchableOpacity
              style={[
                styles.currencyOption,
                formData.toCurrency === 'BDT' && styles.activeCurrencyOption,
              ]}
              onPress={() => handleInputChange('toCurrency', 'BDT')}
            >
              <Text style={styles.currencySymbol}>৳</Text>
              <Text
                style={[
                  styles.currencyText,
                  formData.toCurrency === 'BDT' && styles.activeCurrencyText,
                ]}
              >
                BDT
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.currencyOption,
                formData.toCurrency === 'INR' && styles.activeCurrencyOption,
              ]}
              onPress={() => handleInputChange('toCurrency', 'INR')}
            >
              <Text style={styles.currencySymbol}>₹</Text>
              <Text
                style={[
                  styles.currencyText,
                  formData.toCurrency === 'INR' && styles.activeCurrencyText,
                ]}
              >
                INR
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Display */}
          <View style={[styles.inputContainer, styles.outputContainer]}>
            <Text style={styles.inputSymbol}>
              {formData.toCurrency === 'BDT' ? '৳' : '₹'}
            </Text>
            <Text style={styles.outputText}>{formData.toAmount || '0.00'}</Text>
          </View>
        </View>

        {/* Exchange Button */}
        <TouchableOpacity
          style={[
            styles.exchangeButton,
            (!exchangeRate || !formData.fromAmount || loading) &&
              styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={!exchangeRate || !formData.fromAmount || loading}
        >
          {loading ? (
            <Text style={styles.exchangeButtonText}>Processing...</Text>
          ) : (
            <>
              <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />
              <Text style={styles.exchangeButtonText}>Exchange Currency</Text>
            </>
          )}
        </TouchableOpacity>
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  rateCard: {
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
  rateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rateIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  rateSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  rateText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
  },
  formCard: {
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  currencySelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  currencyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  activeCurrencyOption: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  activeCurrencyText: {
    color: '#3B82F6',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  outputContainer: {
    backgroundColor: '#F1F5F9',
  },
  inputSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  outputText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  balanceText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'right',
  },
  swapContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  swapButton: {
    width: 48,
    height: 48,
    backgroundColor: '#EFF6FF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  exchangeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
  exchangeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
