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
import * as ImagePicker from 'expo-image-picker';

export default function DepositScreen() {
  const { adminBankAccounts, depositRequest, fetchBalance } = useBanking();
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    amount: '',
    senderName: user?.user_metadata?.full_name || '',
    transactionRef: '',
    adminBankAccountId: '',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission required',
          'Permission to access camera roll is required!'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.amount ||
      !formData.senderName ||
      !formData.transactionRef ||
      !formData.adminBankAccountId
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amountError = validateAmount(amount, 'DEPOSIT', 'BDT');
    if (amountError) {
      Alert.alert('Error', amountError);
      return;
    }

    if (!selectedImage) {
      Alert.alert('Error', 'Please upload a screenshot of your transaction');
      return;
    }

    setLoading(true);
    try {
      const success = await depositRequest(
        user!.id,
        amount,
        'BDT',
        formData.senderName,
        formData.transactionRef,
        formData.adminBankAccountId,
        selectedImage
      );

      if (success) {
        await fetchBalance();
        Alert.alert(
          'Deposit Request Submitted',
          'Your deposit request has been submitted successfully. We will process it shortly.',
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
          'Failed to submit deposit request. Please try again.'
        );
      }
    } catch (error) {
      console.error('Deposit error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Deposit Funds</Text>
        <Text style={styles.subtitle}>Add money to your BDPayX wallet</Text>
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

        {/* Sender Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sender Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#7B8794"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={formData.senderName}
              onChangeText={(text) => handleInputChange('senderName', text)}
              placeholder="Enter sender's name"
              placeholderTextColor="#7B8794"
            />
          </View>
        </View>

        {/* Transaction Reference */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Transaction Reference</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="receipt-outline"
              size={20}
              color="#7B8794"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={formData.transactionRef}
              onChangeText={(text) => handleInputChange('transactionRef', text)}
              placeholder="Enter transaction reference number"
              placeholderTextColor="#7B8794"
            />
          </View>
        </View>

        {/* Admin Bank Account */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Deposit To</Text>
          {adminBankAccounts
            .filter((acc) => acc.currency === 'BDT')
            .map((account) => {
              const displayName =
                account.bank_name || account.bank_type || 'Unknown Bank';
              const displayIdentifier = account.account_number
                ? `•••• ${account.account_number.slice(-4)}`
                : account.upi_id || account.mobile_number || 'N/A';

              return (
                <View key={account.id} style={styles.bankOption}>
                  <CustomButton
                    title={`${displayName} (${displayIdentifier})`}
                    onPress={() =>
                      handleInputChange('adminBankAccountId', account.id)
                    }
                    variant={
                      formData.adminBankAccountId === account.id
                        ? 'primary'
                        : 'outline'
                    }
                    style={styles.bankButton}
                    textStyle={styles.bankButtonText}
                  />
                </View>
              );
            })}
        </View>

        {/* Screenshot Upload */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Transaction Screenshot</Text>
          <CustomButton
            title={selectedImage ? 'Change Screenshot' : 'Upload Screenshot'}
            onPress={selectImage}
            variant="outline"
            style={styles.uploadButton}
            textStyle={styles.uploadButtonText}
            leftIcon={
              <Ionicons name="camera-outline" size={20} color="#4A90E2" />
            }
          />
          {selectedImage && (
            <Text style={styles.imageSelectedText}>✓ Image selected</Text>
          )}
        </View>

        {/* Submit Button */}
        <CustomButton
          title="Submit Deposit Request"
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
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
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
  uploadButton: {
    borderRadius: 12,
    paddingVertical: 16,
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  uploadButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  imageSelectedText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
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
