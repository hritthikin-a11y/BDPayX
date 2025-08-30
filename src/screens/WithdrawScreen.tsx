import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useBanking } from '../context/BankingContext';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

const WithdrawScreen = ({ navigation }: any) => {
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { withdrawRequest, bankAccounts, balance } = useBanking();

  const handleWithdraw = async () => {
    if (!amount || !bankAccount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    
    // Check if user has sufficient balance
    if (amountNum > balance.bdt) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    setLoading(true);
    
    try {
      await withdrawRequest({
        amount: amountNum,
        bank_account_id: bankAccount,
      });
      
      Alert.alert(
        'Success', 
        'Withdraw request submitted successfully. It will be processed shortly.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      
      // Reset form
      setAmount('');
      setBankAccount('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit withdraw request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Withdraw Funds</Text>
      
      <Text style={styles.balanceText}>
        Available Balance: {balance.bdt.toFixed(2)} BDT
      </Text>
      
      <CustomInput
        label="Amount (BDT)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="Enter amount"
      />
      
      <Text style={styles.label}>Select Bank Account</Text>
      {bankAccounts.map((account) => (
        <CustomButton
          key={account.id}
          title={`${account.bank_name} - ${account.account_number}`}
          onPress={() => setBankAccount(account.id)}
          variant={bankAccount === account.id ? 'primary' : 'secondary'}
        />
      ))}
      
      <CustomButton
        title="Submit Withdraw Request"
        onPress={handleWithdraw}
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
  balanceText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default WithdrawScreen;