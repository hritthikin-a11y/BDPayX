import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useBanking } from '../context/BankingContext';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

const ExchangeScreen = ({ navigation }: any) => {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('BDT');
  const [toCurrency, setToCurrency] = useState('INR');
  const [loading, setLoading] = useState(false);
  
  const { exchangeRequest, balance } = useBanking();

  // Exchange rate: 1 BDT = 2.5 INR (example rate)
  const exchangeRate = 2.5;
  const serviceCharge = 0.02; // 2% service charge

  const calculateExchange = () => {
    if (!amount) return { receiveAmount: 0, charges: 0 };
    
    const amountNum = parseFloat(amount);
    const charges = amountNum * serviceCharge;
    const exchangeAmount = (amountNum - charges) * exchangeRate;
    
    return {
      receiveAmount: exchangeAmount,
      charges: charges,
    };
  };

  const { receiveAmount, charges } = calculateExchange();

  const handleExchange = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter amount');
      return;
    }

    const amountNum = parseFloat(amount);
    
    // Check if user has sufficient balance
    if (fromCurrency === 'BDT' && amountNum > balance.bdt) {
      Alert.alert('Error', 'Insufficient BDT balance');
      return;
    }
    
    if (fromCurrency === 'INR' && amountNum > balance.inr) {
      Alert.alert('Error', 'Insufficient INR balance');
      return;
    }

    setLoading(true);
    
    try {
      await exchangeRequest({
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount: amountNum,
        receive_amount: receiveAmount,
        charges: charges,
      });
      
      Alert.alert(
        'Success', 
        'Exchange request submitted successfully. It will be processed shortly.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      
      // Reset form
      setAmount('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit exchange request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exchange Currency</Text>
      
      <CustomInput
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="Enter amount"
      />
      
      <View style={styles.currencyContainer}>
        <Text style={styles.label}>From:</Text>
        <Text style={styles.currency}>{fromCurrency}</Text>
      </View>
      
      <View style={styles.currencyContainer}>
        <Text style={styles.label}>To:</Text>
        <Text style={styles.currency}>{toCurrency}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Exchange Rate: 1 BDT = {exchangeRate} INR</Text>
        <Text style={styles.infoText}>Service Charge: {serviceCharge * 100}%</Text>
        {amount ? (
          <>
            <Text style={styles.infoText}>Charges: {charges.toFixed(2)} {fromCurrency}</Text>
            <Text style={styles.infoText}>
              You will receive: {receiveAmount.toFixed(2)} {toCurrency}
            </Text>
          </>
        ) : null}
      </View>
      
      <CustomButton
        title="Exchange"
        onPress={handleExchange}
        loading={loading}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  currencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  currency: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default ExchangeScreen;