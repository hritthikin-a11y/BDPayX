import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { useBanking } from '../../providers/BankingProvider';
import { useAuth } from '../../providers/AuthProvider';
import { formatCurrency, validateAmount } from '../../lib/constants';
import CustomButton from '../../components/CustomButton';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WithdrawScreen() {
  const { bankAccounts, withdrawRequest, fetchBalance } = useBanking();
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    amount: '',
    bankAccountId: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.amount || !formData.bankAccountId) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amountError = validateAmount(amount, 'WITHDRAWAL', 'BDT');
    if (amountError) {
      Alert.alert('Error', amountError);
      return;
    }

    setLoading(true);
    try {
      const success = await withdrawRequest(
        user!.id,
        amount,
        'BDT',
        formData.bankAccountId
      );

      if (success) {
        await fetchBalance();
        Alert.alert(
          'Withdrawal Request Submitted',
          'Your withdrawal request has been submitted successfully. We will process it shortly.',
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
          'Failed to submit withdrawal request. Please try again.'
        );
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Withdraw Funds</Text>
        <Text style={styles.subtitle}>
          Transfer money from your BDPayX wallet
        </Text>
      </View>

      <View style={styles.form}>
        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount (BDT)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>৳</Text>
            <TextInput
              style={styles.input}
              value={formData.amount}
              onChangeText={(text) => handleInputChange('amount', text)}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor="#7B8794"
            />
          </View>
        </View>

        {/* Bank Account */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Withdraw To</Text>
          {bankAccounts.length === 0 ? (
            <View style={styles.placeholderContainer}>
              <Ionicons name="card-outline" size={48} color="#7B8794" />
              <Text style={styles.placeholderText}>No bank accounts added</Text>
              <Text style={styles.placeholderSubtext}>
                Add a bank account to withdraw funds
              </Text>
              <CustomButton
                title="Add Bank Account"
                onPress={() => router.push('/(tabs)/add-bank-account')}
                style={styles.addButton}
                textStyle={styles.addButtonText}
              />
            </View>
          ) : (
            bankAccounts.map((account) => (
              <View key={account.id} style={styles.bankOption}>
                <CustomButton
                  title={`${account.bank_name} (${account.account_number})`}
                  onPress={() => handleInputChange('bankAccountId', account.id)}
                  variant={
                    formData.bankAccountId === account.id
                      ? 'primary'
                      : 'outline'
                  }
                  style={styles.bankButton}
                  textStyle={styles.bankButtonText}
                />
              </View>
            ))
          )}
        </View>

        {/* Submit Button */}
        <CustomButton
          title="Submit Withdrawal Request"
          onPress={handleSubmit}
          loading={loading}
          disabled={bankAccounts.length === 0}
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
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: 32,
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
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bankOption: {
    marginBottom: 12,
  },
  bankButton: {
    borderRadius: 12,
    paddingVertical: 16,
  },
  bankButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 18,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
