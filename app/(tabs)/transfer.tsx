import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Platform,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useBanking } from '../../providers/BankingProvider';
import { formatCurrency, validateAmount } from '../../lib/constants';
import CustomButton from '../../components/CustomButton';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function TransferScreen() {
  const { balance } = useBanking();
  const router = useRouter();
  const [formData, setFormData] = useState({
    amount: '',
    recipient: '',
    note: '',
    currency: 'BDT' as 'BDT' | 'INR',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getAvailableBalance = () => {
    const currentBalance =
      formData.currency === 'BDT' ? balance?.bdt : balance?.inr;
    return currentBalance || 0;
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

    // Check if user has sufficient balance
    const currentBalance = getAvailableBalance();
    if (currentBalance < amount) {
      Alert.alert('Error', `Insufficient ${formData.currency} balance`);
      return;
    }

    const amountError = validateAmount(amount, 'TRANSFER', formData.currency);
    if (amountError) {
      Alert.alert('Error', amountError);
      return;
    }

    Alert.alert(
      'Transfer Preview',
      `Send ${formatCurrency(amount, formData.currency)} to ${
        formData.recipient
      }?\n\n${formData.note ? `Note: ${formData.note}` : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            Alert.alert(
              'Feature Coming Soon',
              'Peer-to-peer transfers will be available in a future update.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transfer Money</Text>
        <Text style={styles.headerSubtitle}>
          Send money to BDPayX users instantly
        </Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceTitle}>Available Balance</Text>
          <View style={styles.currencySelector}>
            <TouchableOpacity
              style={[
                styles.currencyOption,
                formData.currency === 'BDT' && styles.activeCurrencyOption,
              ]}
              onPress={() => handleInputChange('currency', 'BDT')}
            >
              <Text
                style={[
                  styles.currencyText,
                  formData.currency === 'BDT' && styles.activeCurrencyText,
                ]}
              >
                BDT
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.currencyOption,
                formData.currency === 'INR' && styles.activeCurrencyOption,
              ]}
              onPress={() => handleInputChange('currency', 'INR')}
            >
              <Text
                style={[
                  styles.currencyText,
                  formData.currency === 'INR' && styles.activeCurrencyText,
                ]}
              >
                INR
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.balanceAmount}>
          {formatCurrency(getAvailableBalance(), formData.currency)}
        </Text>
      </View>

      {/* Transfer Form */}
      <View style={styles.formCard}>
        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>
              {formData.currency === 'BDT' ? '৳' : '₹'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.amount}
              onChangeText={(text) => handleInputChange('amount', text)}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Recipient Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recipient</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Ionicons name="person" size={20} color="#64748B" />
            </View>
            <TextInput
              style={styles.input}
              value={formData.recipient}
              onChangeText={(text) => handleInputChange('recipient', text)}
              placeholder="Email or phone number"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Note Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Note (Optional)</Text>
          <View style={[styles.inputContainer, styles.noteContainer]}>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={formData.note}
              onChangeText={(text) => handleInputChange('note', text)}
              placeholder="Add a note to your transfer"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Quick Contact Options */}
        <View style={styles.quickContacts}>
          <Text style={styles.quickContactsTitle}>Quick Send</Text>
          <View style={styles.contactGrid}>
            <TouchableOpacity style={styles.contactOption}>
              <View style={styles.contactIcon}>
                <Ionicons name="scan" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.contactText}>QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactOption}>
              <View style={styles.contactIcon}>
                <Ionicons name="people" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.contactText}>Contacts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactOption}>
              <View style={styles.contactIcon}>
                <Ionicons name="time" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.contactText}>Recent</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <View style={styles.infoIcon}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.infoText}>
            Transfers are instant and free between BDPayX users. The recipient
            will be notified immediately.
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!formData.amount || !formData.recipient || loading) &&
              styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={!formData.amount || !formData.recipient || loading}
        >
          {loading ? (
            <Text style={styles.continueButtonText}>Processing...</Text>
          ) : (
            <>
              <Ionicons name="send" size={20} color="#FFFFFF" />
              <Text style={styles.continueButtonText}>Continue Transfer</Text>
            </>
          )}
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  currencySelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 4,
  },
  currencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeCurrencyOption: {
    backgroundColor: '#3B82F6',
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeCurrencyText: {
    color: '#FFFFFF',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
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
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noteContainer: {
    alignItems: 'flex-start',
    minHeight: 80,
  },
  inputIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  noteInput: {
    textAlignVertical: 'top',
    minHeight: 60,
  },
  quickContacts: {
    marginBottom: 20,
  },
  quickContactsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  contactGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  contactOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
