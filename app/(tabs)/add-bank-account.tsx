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
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AddBankAccountScreen() {
  const { addBankAccount, fetchBankAccounts } = useBanking();
  const router = useRouter();
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    bankType: 'BANK' as 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK' | 'UPI',
    currency: 'BDT' as 'BDT' | 'INR',
    // Additional fields
    branchName: '',
    routingNumber: '',
    ifscCode: '',
    upiId: '',
    mobileNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Clear relevant fields when bank type changes
      if (field === 'bankType') {
        // Clear all conditional fields
        newData.accountNumber = '';
        newData.bankName = '';
        newData.upiId = '';
        newData.mobileNumber = '';
        newData.branchName = '';
        newData.routingNumber = '';
        newData.ifscCode = '';

        // Set currency based on bank type
        if (value === 'UPI') {
          newData.currency = 'INR';
        } else if (['BKASH', 'NAGAD', 'ROCKET'].includes(value)) {
          newData.currency = 'BDT';
        }
      }

      // Clear IFSC when currency changes from INR to BDT
      if (field === 'currency' && value === 'BDT') {
        newData.ifscCode = '';
      }

      // Clear routing number when currency changes from BDT to INR
      if (field === 'currency' && value === 'INR') {
        newData.routingNumber = '';
      }

      return newData;
    });
  };

  const handleSubmit = async () => {
    // Validation based on bank type
    if (!formData.accountName) {
      Alert.alert('Error', 'Please enter account name');
      return;
    }

    // UPI specific validation
    if (formData.bankType === 'UPI') {
      if (!formData.upiId) {
        Alert.alert('Error', 'Please enter UPI ID');
        return;
      }
      if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(formData.upiId)) {
        Alert.alert('Error', 'Please enter a valid UPI ID (e.g., user@paytm)');
        return;
      }
      if (formData.currency !== 'INR') {
        Alert.alert('Error', 'UPI is only available for INR currency');
        return;
      }
    }

    // Mobile financial services validation
    if (['BKASH', 'NAGAD', 'ROCKET'].includes(formData.bankType)) {
      if (!formData.mobileNumber) {
        Alert.alert('Error', 'Please enter mobile number');
        return;
      }
      if (formData.currency !== 'BDT') {
        Alert.alert(
          'Error',
          'Mobile financial services are only available for BDT currency'
        );
        return;
      }
    }

    // Traditional bank validation
    if (formData.bankType === 'BANK') {
      if (!formData.accountNumber || !formData.bankName) {
        Alert.alert('Error', 'Please enter account number and bank name');
        return;
      }
      if (formData.currency === 'INR' && !formData.ifscCode) {
        Alert.alert('Error', 'IFSC code is required for Indian banks');
        return;
      }
    }

    setLoading(true);
    try {
      const success = await addBankAccount({
        account_name: formData.accountName,
        account_number: formData.accountNumber || undefined,
        bank_name: formData.bankName || undefined,
        bank_type: formData.bankType,
        currency: formData.currency,
        branch_name: formData.branchName || undefined,
        routing_number: formData.routingNumber || undefined,
        ifsc_code: formData.ifscCode || undefined,
        upi_id: formData.upiId || undefined,
        mobile_number: formData.mobileNumber || undefined,
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

        {/* Bank Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bank Type</Text>
          <View style={styles.bankTypeSelector}>
            <CustomButton
              title="bKash"
              onPress={() => handleInputChange('bankType', 'BKASH')}
              variant={'outline'}
              style={
                [
                  styles.bankTypeButton,
                  formData.bankType === 'BKASH' && styles.activeBankTypeButton,
                ].filter(Boolean) as any
              }
              textStyle={styles.bankTypeButtonText}
            />
            <CustomButton
              title="Nagad"
              onPress={() => handleInputChange('bankType', 'NAGAD')}
              variant={'outline'}
              style={
                [
                  styles.bankTypeButton,
                  formData.bankType === 'NAGAD' && styles.activeBankTypeButton,
                ].filter(Boolean) as any
              }
              textStyle={styles.bankTypeButtonText}
            />
            <CustomButton
              title="Rocket"
              onPress={() => handleInputChange('bankType', 'ROCKET')}
              variant={'outline'}
              style={
                [
                  styles.bankTypeButton,
                  formData.bankType === 'ROCKET' && styles.activeBankTypeButton,
                ].filter(Boolean) as any
              }
              textStyle={styles.bankTypeButtonText}
            />
            <CustomButton
              title="Bank"
              onPress={() => handleInputChange('bankType', 'BANK')}
              variant={'outline'}
              style={
                [
                  styles.bankTypeButton,
                  formData.bankType === 'BANK' && styles.activeBankTypeButton,
                ].filter(Boolean) as any
              }
              textStyle={styles.bankTypeButtonText}
            />
            <CustomButton
              title="UPI"
              onPress={() => handleInputChange('bankType', 'UPI')}
              variant={'outline'}
              style={
                [
                  styles.bankTypeButton,
                  formData.bankType === 'UPI' && styles.activeBankTypeButton,
                ].filter(Boolean) as any
              }
              textStyle={styles.bankTypeButtonText}
            />
          </View>
        </View>

        {/* Currency */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Currency</Text>
          <View style={styles.currencySelector}>
            <CustomButton
              title="BDT (৳)"
              onPress={() => handleInputChange('currency', 'BDT')}
              variant={'outline'}
              style={
                [
                  styles.currencyButton,
                  formData.currency === 'BDT' && styles.activeCurrencyButton,
                ].filter(Boolean) as any
              }
              textStyle={styles.currencyButtonText}
            />
            <CustomButton
              title="INR (₹)"
              onPress={() => handleInputChange('currency', 'INR')}
              variant={'outline'}
              style={
                [
                  styles.currencyButton,
                  formData.currency === 'INR' && styles.activeCurrencyButton,
                ].filter(Boolean) as any
              }
              textStyle={styles.currencyButtonText}
            />
          </View>
        </View>

        {/* Conditional fields based on bank type */}
        {formData.bankType === 'UPI' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>UPI ID</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="at-outline"
                size={20}
                color="#7B8794"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={formData.upiId}
                onChangeText={(text) => handleInputChange('upiId', text)}
                placeholder="user@paytm"
                placeholderTextColor="#7B8794"
                keyboardType="email-address"
              />
            </View>
          </View>
        )}

        {['BKASH', 'NAGAD', 'ROCKET'].includes(formData.bankType) && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="phone-portrait-outline"
                size={20}
                color="#7B8794"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={formData.mobileNumber}
                onChangeText={(text) => handleInputChange('mobileNumber', text)}
                placeholder="01XXXXXXXXX"
                placeholderTextColor="#7B8794"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        )}

        {(formData.bankType === 'BANK' || formData.bankType === 'UPI') && (
          <>
            {/* Account Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Account Number {formData.bankType === 'UPI' ? '(Optional)' : ''}
              </Text>
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
                  onChangeText={(text) =>
                    handleInputChange('accountNumber', text)
                  }
                  placeholder="Enter account number"
                  placeholderTextColor="#7B8794"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Bank Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Bank Name {formData.bankType === 'UPI' ? '(Optional)' : ''}
              </Text>
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
          </>
        )}

        {formData.bankType === 'BANK' && (
          <>
            {/* Branch Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Branch Name (Optional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color="#7B8794"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={formData.branchName}
                  onChangeText={(text) => handleInputChange('branchName', text)}
                  placeholder="Enter branch name"
                  placeholderTextColor="#7B8794"
                />
              </View>
            </View>

            {formData.currency === 'BDT' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Routing Number (Optional)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="git-branch-outline"
                    size={20}
                    color="#7B8794"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={formData.routingNumber}
                    onChangeText={(text) =>
                      handleInputChange('routingNumber', text)
                    }
                    placeholder="Enter routing number"
                    placeholderTextColor="#7B8794"
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            )}

            {formData.currency === 'INR' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>IFSC Code</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="code-outline"
                    size={20}
                    color="#7B8794"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={formData.ifscCode}
                    onChangeText={(text) =>
                      handleInputChange('ifscCode', text.toUpperCase())
                    }
                    placeholder="SBIN0001234"
                    placeholderTextColor="#7B8794"
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            )}
          </>
        )}

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
    backgroundColor: '#F1F5F9',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 12,
    color: '#64748B',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  bankTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bankTypeButton: {
    flex: 1,
    minWidth: 80,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeBankTypeButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  bankTypeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  currencySelector: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeCurrencyButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  currencyButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
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
