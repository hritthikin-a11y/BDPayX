import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ExchangeCalculatorProps {
  fromCurrency: 'BDT' | 'INR';
  toCurrency: 'BDT' | 'INR';
  exchangeRate: number;
  onAmountChange: (fromAmount: number, toAmount: number) => void;
  initialAmount?: number;
}

export default function ExchangeCalculator({
  fromCurrency,
  toCurrency,
  exchangeRate,
  onAmountChange,
  initialAmount = 0,
}: ExchangeCalculatorProps) {
  const [fromAmount, setFromAmount] = useState(initialAmount.toString());
  const [toAmount, setToAmount] = useState('0');

  useEffect(() => {
    calculateToAmount(fromAmount);
  }, [exchangeRate, fromAmount]);

  const calculateToAmount = (amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    const converted = numAmount * exchangeRate;
    setToAmount(converted.toFixed(2));
    onAmountChange(numAmount, converted);
  };

  const calculateFromAmount = (amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    const converted = numAmount / exchangeRate;
    setFromAmount(converted.toFixed(2));
    onAmountChange(converted, numAmount);
  };

  const swapCurrencies = () => {
    // For BDT/INR swap, just recalculate with opposite rate
    const newFromAmount = toAmount;
    const newToAmount = fromAmount;
    setFromAmount(newFromAmount);
    setToAmount(newToAmount);
    onAmountChange(parseFloat(newFromAmount), parseFloat(newToAmount));
  };

  const getCurrencySymbol = (currency: 'BDT' | 'INR') => {
    return currency === 'BDT' ? '৳' : '₹';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exchange Calculator</Text>

      {/* From Currency */}
      <View style={styles.currencyContainer}>
        <View style={styles.currencyHeader}>
          <Text style={styles.currencyLabel}>From ({fromCurrency})</Text>
          <Text style={styles.rateText}>
            1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
          </Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>
            {getCurrencySymbol(fromCurrency)}
          </Text>
          <TextInput
            style={styles.input}
            value={fromAmount}
            onChangeText={(text) => {
              setFromAmount(text);
              calculateToAmount(text);
            }}
            placeholder="0.00"
            keyboardType="decimal-pad"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {/* Swap Button */}
      <View style={styles.swapContainer}>
        <TouchableOpacity style={styles.swapButton} onPress={swapCurrencies}>
          <Ionicons name="swap-vertical" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* To Currency */}
      <View style={styles.currencyContainer}>
        <View style={styles.currencyHeader}>
          <Text style={styles.currencyLabel}>To ({toCurrency})</Text>
          <Text style={styles.rateText}>
            1 {toCurrency} = {(1 / exchangeRate).toFixed(4)} {fromCurrency}
          </Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>
            {getCurrencySymbol(toCurrency)}
          </Text>
          <TextInput
            style={styles.input}
            value={toAmount}
            onChangeText={(text) => {
              setToAmount(text);
              calculateFromAmount(text);
            }}
            placeholder="0.00"
            keyboardType="decimal-pad"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {/* Rate Information */}
      <View style={styles.rateInfo}>
        <View style={styles.rateInfoItem}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#64748B"
          />
          <Text style={styles.rateInfoText}>Exchange rate updates daily</Text>
        </View>
        <View style={styles.rateInfoItem}>
          <Ionicons name="time-outline" size={16} color="#64748B" />
          <Text style={styles.rateInfoText}>
            Rate: {exchangeRate.toFixed(4)} {fromCurrency}/{toCurrency}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  currencyContainer: {
    marginBottom: 16,
  },
  currencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currencyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  rateText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  swapContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  swapButton: {
    width: 40,
    height: 40,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  rateInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    gap: 8,
  },
  rateInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rateInfoText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
});
