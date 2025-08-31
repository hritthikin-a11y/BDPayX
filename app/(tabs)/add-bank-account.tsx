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
import CustomButton from '../../components/CustomButton';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AddBankAccountScreen() {
  const { addBankAccount, fetchBankAccounts } = useBanking();
  const router = useRouter();
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    bankType: 'BANK' as 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.accountName ||
      !formData.accountNumber ||
      !formData.bankName
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.accountNumber.length < 5) {
      Alert.alert('Error', 'Please enter a valid account number');
      return;
    }

    setLoading(true);
    try {
      const success = await addBankAccount({
        account_name: formData.accountName,
        account_number: formData.accountNumber,
        bank_name: formData.bankName,
        bank_type: formData.bankType,
        currency: 'BDT',
      });

      if (success) {
        await fetchBankAccounts();
        Alert.alert(
          'Bank Account Added',
          'Your bank account has been added successfully.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/wallet'),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to add bank account. Please try again.');
      }
    } catch (error) {
      console.error('Add bank account error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Bank Account</Text>
        <Text style={styles.subtitle}>
          Add a new bank account to your profile
        </Text>
      </View>

      <View style={styles.form}>
        {/* Account Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#7B8794"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={formData.accountName}
              onChangeText={(text) => handleInputChange('accountName', text)}
              placeholder="Enter account holder name"
              placeholderTextColor="#7B8794"
            />
          </View>
        </View>

        {/* Account Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Number</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="card-outline"
              size={20}
              color="#7B8794"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={formData.accountNumber}
              onChangeText={(text) => handleInputChange('accountNumber', text)}
              placeholder="Enter account number"
              placeholderTextColor="#7B8794"
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Bank Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bank Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="business-outline"
              size={20}
              color="#7B8794"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={formData.bankName}
              onChangeText={(text) => handleInputChange('bankName', text)}
              placeholder="Enter bank name"
              placeholderTextColor="#7B8794"
            />
          </View>
        </View>

        {/* Bank Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bank Type</Text>
          <View style={styles.bankTypeSelector}>
            <CustomButton
              title="bKash"
              onPress={() => handleInputChange('bankType', 'BKASH')}
              variant={formData.bankType === 'BKASH' ? 'primary' : 'outline'}
              style={[
                styles.bankTypeButton,
                formData.bankType === 'BKASH' && styles.activeBankTypeButton,
              ]}
              textStyle={styles.bankTypeButtonText}
            />
            <CustomButton
              title="Nagad"
              onPress={() => handleInputChange('bankType', 'NAGAD')}
              variant={formData.bankType === 'NAGAD' ? 'primary' : 'outline'}
              style={[
                styles.bankTypeButton,
                formData.bankType === 'NAGAD' && styles.activeBankTypeButton,
              ]}
              textStyle={styles.bankTypeButtonText}
            />
            <CustomButton
              title="Rocket"
              onPress={() => handleInputChange('bankType', 'ROCKET')}
              variant={formData.bankType === 'ROCKET' ? 'primary' : 'outline'}
              style={[
                styles.bankTypeButton,
                formData.bankType === 'ROCKET' && styles.activeBankTypeButton,
              ]}
              textStyle={styles.bankTypeButtonText}
            />
            <CustomButton
              title="Bank"
              onPress={() => handleInputChange('bankType', 'BANK')}
              variant={formData.bankType === 'BANK' ? 'primary' : 'outline'}
              style={[
                styles.bankTypeButton,
                formData.bankType === 'BANK' && styles.activeBankTypeButton,
              ]}
              textStyle={styles.bankTypeButtonText}
            />
          </View>
        </View>

        {/* Submit Button */}
        <CustomButton
          title="Add Bank Account"
          onPress={handleSubmit}
          loading={loading}
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2E3A59',
  },
  bankTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bankTypeButton: {
    flex: 1,
    minWidth: 100,
    borderRadius: 12,
    paddingVertical: 16,
  },
  activeBankTypeButton: {
    backgroundColor: '#4A90E2',
  },
  bankTypeButtonText: {
    fontSize: 14,
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
