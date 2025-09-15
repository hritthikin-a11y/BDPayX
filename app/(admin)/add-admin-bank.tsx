import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ApiService } from '../../lib/api';
import CustomButton from '../../components/CustomButton';

export default function AddAdminBank() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    account_name: '',
    account_number: '',
    bank_name: '',
    bank_type: 'COMMERCIAL',
    currency: 'BDT' as 'BDT' | 'INR',
    branch_name: '',
    routing_number: '',
    ifsc_code: '',
    swift_code: '',
    upi_id: '',
    mobile_number: '',
    bank_address: '',
    zipcode: '',
    daily_limit: '1000000',
    monthly_limit: '30000000',
  });

  const bankTypes = [
    { value: 'COMMERCIAL', label: 'Commercial Bank' },
    { value: 'ISLAMIC', label: 'Islamic Bank' },
    { value: 'SPECIALIZED', label: 'Specialized Bank' },
    { value: 'FOREIGN', label: 'Foreign Bank' },
    { value: 'DEVELOPMENT', label: 'Development Bank' },
  ];

  const currencies = [
    { value: 'BDT', label: 'BDT (৳)', flag: '🇧🇩' },
    { value: 'INR', label: 'INR (₹)', flag: '🇮🇳' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const required = ['account_name', 'account_number', 'bank_name'];

    for (const field of required) {
      if (!formData[field as keyof typeof formData].trim()) {
        Alert.alert('Validation Error', `${field.replace('_', ' ')} is required`);
        return false;
      }
    }

    if (formData.currency === 'INR' && !formData.ifsc_code.trim()) {
      Alert.alert('Validation Error', 'IFSC code is required for INR accounts');
      return false;
    }

    if (parseFloat(formData.daily_limit) <= 0 || parseFloat(formData.monthly_limit) <= 0) {
      Alert.alert('Validation Error', 'Limits must be greater than 0');
      return false;
    }

    if (parseFloat(formData.daily_limit) > parseFloat(formData.monthly_limit)) {
      Alert.alert('Validation Error', 'Daily limit cannot be greater than monthly limit');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const accountData = {
        ...formData,
        daily_limit: parseFloat(formData.daily_limit),
        monthly_limit: parseFloat(formData.monthly_limit),
        is_active: true,
      };

      const success = await ApiService.createAdminBankAccount(accountData);

      if (success) {
        Alert.alert(
          'Success',
          'Admin bank account created successfully',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to create admin bank account');
      }
    } catch (error) {
      console.error('Error creating admin bank:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Bank Account</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Name *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.account_name}
              onChangeText={(value) => handleInputChange('account_name', value)}
              placeholder="Enter account holder name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Number *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.account_number}
              onChangeText={(value) => handleInputChange('account_number', value)}
              placeholder="Enter account number"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bank Name *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.bank_name}
              onChangeText={(value) => handleInputChange('bank_name', value)}
              placeholder="Enter bank name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Branch Name</Text>
            <TextInput
              style={styles.textInput}
              value={formData.branch_name}
              onChangeText={(value) => handleInputChange('branch_name', value)}
              placeholder="Enter branch name"
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Bank Type & Currency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Type & Currency</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bank Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionContainer}>
              {bankTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.optionButton,
                    formData.bank_type === type.value && styles.selectedOption,
                  ]}
                  onPress={() => handleInputChange('bank_type', type.value)}
                >
                  <Text style={[
                    styles.optionText,
                    formData.bank_type === type.value && styles.selectedOptionText,
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Currency</Text>
            <View style={styles.currencyContainer}>
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency.value}
                  style={[
                    styles.currencyButton,
                    formData.currency === currency.value && styles.selectedCurrency,
                  ]}
                  onPress={() => handleInputChange('currency', currency.value)}
                >
                  <Text style={styles.currencyFlag}>{currency.flag}</Text>
                  <Text style={[
                    styles.currencyText,
                    formData.currency === currency.value && styles.selectedCurrencyText,
                  ]}>
                    {currency.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Bank Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Details</Text>

          {formData.currency === 'BDT' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Routing Number</Text>
              <TextInput
                style={styles.textInput}
                value={formData.routing_number}
                onChangeText={(value) => handleInputChange('routing_number', value)}
                placeholder="Enter routing number"
                keyboardType="numeric"
              />
            </View>
          )}

          {formData.currency === 'INR' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>IFSC Code *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.ifsc_code}
                  onChangeText={(value) => handleInputChange('ifsc_code', value.toUpperCase())}
                  placeholder="Enter IFSC code"
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>UPI ID</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.upi_id}
                  onChangeText={(value) => handleInputChange('upi_id', value)}
                  placeholder="Enter UPI ID"
                  keyboardType="email-address"
                />
              </View>
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SWIFT Code</Text>
            <TextInput
              style={styles.textInput}
              value={formData.swift_code}
              onChangeText={(value) => handleInputChange('swift_code', value.toUpperCase())}
              placeholder="Enter SWIFT code"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <TextInput
              style={styles.textInput}
              value={formData.mobile_number}
              onChangeText={(value) => handleInputChange('mobile_number', value)}
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bank Address</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.bank_address}
              onChangeText={(value) => handleInputChange('bank_address', value)}
              placeholder="Enter bank address"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ZIP Code</Text>
            <TextInput
              style={styles.textInput}
              value={formData.zipcode}
              onChangeText={(value) => handleInputChange('zipcode', value)}
              placeholder="Enter ZIP code"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Limits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Limits</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Daily Limit ({formData.currency})</Text>
            <TextInput
              style={styles.textInput}
              value={formData.daily_limit}
              onChangeText={(value) => handleInputChange('daily_limit', value)}
              placeholder="Enter daily limit"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Monthly Limit ({formData.currency})</Text>
            <TextInput
              style={styles.textInput}
              value={formData.monthly_limit}
              onChangeText={(value) => handleInputChange('monthly_limit', value)}
              placeholder="Enter monthly limit"
              keyboardType="numeric"
            />
          </View>
        </View>

        <CustomButton
          title="Create Bank Account"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionContainer: {
    flexDirection: 'row',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  selectedOption: {
    backgroundColor: '#3B82F6',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  currencyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedCurrency: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  currencyFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedCurrencyText: {
    color: '#3B82F6',
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 40,
  },
});