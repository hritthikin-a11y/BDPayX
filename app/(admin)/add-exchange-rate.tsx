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

export default function AddExchangeRate() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    from_currency: 'BDT' as 'BDT' | 'INR',
    to_currency: 'INR' as 'BDT' | 'INR',
    rate: '',
  });

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
    if (formData.from_currency === formData.to_currency) {
      Alert.alert('Validation Error', 'From and To currencies cannot be the same');
      return false;
    }

    if (!formData.rate.trim() || parseFloat(formData.rate) <= 0) {
      Alert.alert('Validation Error', 'Exchange rate must be greater than 0');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const rateData = {
        from_currency: formData.from_currency,
        to_currency: formData.to_currency,
        rate: parseFloat(formData.rate),
        is_active: true,
      };

      const success = await ApiService.createExchangeRate(rateData);

      if (success) {
        Alert.alert(
          'Success',
          'Exchange rate created successfully',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to create exchange rate');
      }
    } catch (error) {
      console.error('Error creating exchange rate:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getCurrencyIcon = (currency: string) => {
    return currency === 'BDT' ? '🇧🇩' : '🇮🇳';
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
        <Text style={styles.title}>Add Exchange Rate</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Currency Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency Pair</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>From Currency</Text>
            <View style={styles.currencyContainer}>
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={`from-${currency.value}`}
                  style={[
                    styles.currencyButton,
                    formData.from_currency === currency.value && styles.selectedCurrency,
                  ]}
                  onPress={() => handleInputChange('from_currency', currency.value)}
                >
                  <Text style={styles.currencyFlag}>{currency.flag}</Text>
                  <Text style={[
                    styles.currencyText,
                    formData.from_currency === currency.value && styles.selectedCurrencyText,
                  ]}>
                    {currency.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>To Currency</Text>
            <View style={styles.currencyContainer}>
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={`to-${currency.value}`}
                  style={[
                    styles.currencyButton,
                    formData.to_currency === currency.value && styles.selectedCurrency,
                  ]}
                  onPress={() => handleInputChange('to_currency', currency.value)}
                >
                  <Text style={styles.currencyFlag}>{currency.flag}</Text>
                  <Text style={[
                    styles.currencyText,
                    formData.to_currency === currency.value && styles.selectedCurrencyText,
                  ]}>
                    {currency.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Exchange Rate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exchange Rate</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Rate (1 {formData.from_currency} = ? {formData.to_currency})
            </Text>
            <TextInput
              style={styles.textInput}
              value={formData.rate}
              onChangeText={(value) => handleInputChange('rate', value)}
              placeholder="Enter exchange rate"
              keyboardType="numeric"
            />
          </View>

          {/* Preview */}
          {formData.rate && parseFloat(formData.rate) > 0 && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>Preview</Text>
              <View style={styles.previewRow}>
                <View style={styles.previewCurrency}>
                  <Text style={styles.previewFlag}>{getCurrencyIcon(formData.from_currency)}</Text>
                  <Text style={styles.previewAmount}>1 {formData.from_currency}</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#8B5CF6" />
                <View style={styles.previewCurrency}>
                  <Text style={styles.previewFlag}>{getCurrencyIcon(formData.to_currency)}</Text>
                  <Text style={styles.previewAmount}>{formData.rate} {formData.to_currency}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <CustomButton
          title="Create Exchange Rate"
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
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
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
    color: '#8B5CF6',
  },
  previewContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewCurrency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewFlag: {
    fontSize: 24,
  },
  previewAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 40,
  },
});