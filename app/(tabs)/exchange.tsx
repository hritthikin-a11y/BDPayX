import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, Platform } from 'react-native';
import { useBanking } from '../../providers/BankingProvider';
import { useAuth } from '../../providers/AuthProvider';
import { formatCurrency, validateAmount } from '../../lib/constants';
import CustomButton from '../../components/CustomButton';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ExchangeScreen() {
  const { exchangeRates, exchangeRequest, fetchBalance } = useBanking();
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
        r => r.from_currency === formData.fromCurrency && r.to_currency === formData.toCurrency
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
        setFormData(prev => ({
          ...prev,
          toAmount: toAmount.toFixed(2),
        }));
      }
    }
  }, [formData.fromAmount, exchangeRate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const swapCurrencies = () => {
    setFormData(prev => ({
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

    const amountError = validateAmount(fromAmount, 'EXCHANGE', formData.fromCurrency);
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
          'Exchange Request Submitted',
          'Your exchange request has been submitted successfully. We will process it shortly.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to submit exchange request. Please try again.');
      }
    } catch (error) {
      console.error('Exchange error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exchange Currency</Text>
        <Text style={styles.subtitle}>Convert between BDT and INR</Text>
      </View>

      <View style={styles.form}>
        {/* From Currency */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>From</Text>
          <View style={styles.currencySelector}>
            <CustomButton
              title="BDT"
              onPress={() => handleInputChange('fromCurrency', 'BDT')}
              variant={formData.fromCurrency === 'BDT' ? 'primary' : 'outline'}
              style={[styles.currencyButton, formData.fromCurrency === 'BDT' && styles.activeCurrencyButton]}
              textStyle={styles.currencyButtonText}
            />
            <CustomButton
              title="INR"
              onPress={() => handleInputChange('fromCurrency', 'INR')}
              variant={formData.fromCurrency === 'INR' ? 'primary' : 'outline'}
              style={[styles.currencyButton, formData.fromCurrency === 'INR' && styles.activeCurrencyButton]}
              textStyle={styles.currencyButtonText}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>
              {formData.fromCurrency === 'BDT' ? '৳' : '₹'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.fromAmount}
              onChangeText={(text) => handleInputChange('fromAmount', text)}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor="#7B8794"
            />
          </View>
        </View>

        {/* Swap Button */}
        <View style={styles.swapContainer}>
          <CustomButton
            title=""
            onPress={swapCurrencies}
            variant="outline"
            style={styles.swapButton}
            leftIcon={<Ionicons name="swap-vertical" size={24} color="#4A90E2" />}
          />
        </View>

        {/* To Currency */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>To</Text>
          <View style={styles.currencySelector}>
            <CustomButton
              title="BDT"
              onPress={() => handleInputChange('toCurrency', 'BDT')}
              variant={formData.toCurrency === 'BDT' ? 'primary' : 'outline'}
              style={[styles.currencyButton, formData.toCurrency === 'BDT' && styles.activeCurrencyButton]}
              textStyle={styles.currencyButtonText}
            />
            <CustomButton
              title="INR"
              onPress={() => handleInputChange('toCurrency', 'INR')}
              variant={formData.toCurrency === 'INR' ? 'primary' : 'outline'}
              style={[styles.currencyButton, formData.toCurrency === 'INR' && styles.activeCurrencyButton]}
              textStyle={styles.currencyButtonText}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>
              {formData.toCurrency === 'BDT' ? '৳' : '₹'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.toAmount}
              onChangeText={(text) => handleInputChange('toAmount', text)}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor="#7B8794"
              editable={false}
            />
          </View>
        </View>

        {/* Exchange Rate */}
        {exchangeRate && (
          <View style={styles.rateContainer}>
            <Text style={styles.rateText}>
              1 {formData.fromCurrency} = {exchangeRate.toFixed(6)} {formData.toCurrency}
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <CustomButton
          title="Exchange Currency"
          onPress={handleSubmit}
          loading={loading}
          disabled={!exchangeRate}
          style={styles.submitButton}
          textStyle={styles.submitButtonText}
        />
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
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E3A59',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7B8794',
  },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    margin: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 8,
  },
  currencySelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  currencyButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
  },
  activeCurrencyButton: {
    backgroundColor: '#4A90E2',
  },
  currencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2E3A59',
  },
  swapContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  swapButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    padding: 0,
    minWidth: 0,
    minHeight: 0,
  },
  rateContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  rateText: {
    fontSize: 16,
    color: '#7B8794',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 18,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});