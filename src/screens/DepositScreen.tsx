import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useBanking } from '../context/BankingContext';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

const DepositScreen = ({ navigation }: any) => {
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [bankName, setBankName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { depositRequest } = useBanking();

  const handleDeposit = async () => {
    if (!amount || !transactionId || !bankName) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    
    try {
      await depositRequest({
        amount: parseFloat(amount),
        transaction_id: transactionId,
        bank_name: bankName,
      });
      
      Alert.alert(
        'Success', 
        'Deposit request submitted successfully. It will be processed shortly.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      
      // Reset form
      setAmount('');
      setTransactionId('');
      setBankName('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit deposit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deposit Funds</Text>
      
      <Text style={styles.infoText}>
        Please transfer the amount to one of our bank accounts and fill the form below.
      </Text>
      
      <CustomInput
        label="Amount (BDT)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="Enter amount"
      />
      
      <CustomInput
        label="Transaction ID"
        value={transactionId}
        onChangeText={setTransactionId}
        placeholder="Enter transaction ID"
      />
      
      <CustomInput
        label="Bank Name"
        value={bankName}
        onChangeText={setBankName}
        placeholder="Enter bank name"
      />
      
      <CustomButton
        title="Submit Deposit Request"
        onPress={handleDeposit}
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
  infoText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
});

export default DepositScreen;