import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useBanking } from '../context/BankingContext';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

const ProfileScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { bankAccounts, addBankAccount } = useBanking();
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddBankAccount = async () => {
    if (!bankName || !accountNumber || !accountHolderName) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    
    try {
      await addBankAccount({
        bank_name: bankName,
        account_number: accountNumber,
        account_holder_name: accountHolderName,
      });
      
      // Reset form
      setBankName('');
      setAccountNumber('');
      setAccountHolderName('');
      
      Alert.alert('Success', 'Bank account added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add bank account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>
      
      <Text style={styles.sectionTitle}>Bank Accounts</Text>
      
      {bankAccounts.length === 0 ? (
        <Text style={styles.noAccountsText}>No bank accounts added yet</Text>
      ) : (
        bankAccounts.map((account) => (
          <View key={account.id} style={styles.accountContainer}>
            <Text style={styles.accountText}>{account.bank_name}</Text>
            <Text style={styles.accountText}>{account.account_number}</Text>
            <Text style={styles.accountText}>{account.account_holder_name}</Text>
          </View>
        ))
      )}
      
      <Text style={styles.sectionTitle}>Add Bank Account</Text>
      
      <CustomInput
        label="Bank Name"
        value={bankName}
        onChangeText={setBankName}
        placeholder="Enter bank name"
      />
      
      <CustomInput
        label="Account Number"
        value={accountNumber}
        onChangeText={setAccountNumber}
        placeholder="Enter account number"
      />
      
      <CustomInput
        label="Account Holder Name"
        value={accountHolderName}
        onChangeText={setAccountHolderName}
        placeholder="Enter account holder name"
      />
      
      <CustomButton
        title="Add Bank Account"
        onPress={handleAddBankAccount}
        loading={loading}
        disabled={loading}
      />
    </ScrollView>
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
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  noAccountsText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  accountContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  accountText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default ProfileScreen;