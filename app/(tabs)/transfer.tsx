import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, Platform } from 'react-native';
import { useBanking } from '../../providers/BankingProvider';
import { formatCurrency, validateAmount } from '../../lib/constants';
import CustomButton from '../../components/CustomButton';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TransferScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    amount: '',
    recipient: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.amount || !formData.recipient) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amountError = validateAmount(amount, 'TRANSFER', 'BDT');
    if (amountError) {
      Alert.alert('Error', amountError);
      return;
    }

    Alert.alert(
      'Feature Coming Soon',
      'Peer-to-peer transfers will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transfer Money</Text>
        <Text style={styles.subtitle}>Send money to other BDPayX users</Text>
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

        {/* Recipient */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recipient</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#7B8794" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.recipient}
              onChangeText={(text) => handleInputChange('recipient', text)}
              placeholder="Enter recipient's email or phone"
              placeholderTextColor="#7B8794"
            />
          </View>
        </View>

        {/* Note (Optional) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Note (Optional)</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.note}
              onChangeText={(text) => handleInputChange('note', text)}
              placeholder="Add a note to your transfer"
              placeholderTextColor="#7B8794"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color="#4A90E2" />
          <Text style={styles.infoText}>
            This feature allows you to send money to other BDPayX users instantly. 
            The recipient must have a BDPayX account.
          </Text>
        </View>

        {/* Submit Button */}
        <CustomButton
          title="Continue"
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
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginRight: 12,
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
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 8,
    minHeight: 80,
  },
  infoBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#7B8794',
    marginLeft: 12,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 18,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});