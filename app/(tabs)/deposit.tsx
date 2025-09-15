import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Platform,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useBanking } from '../../providers/BankingProvider';
import { useAuth } from '../../providers/AuthProvider';
import { formatCurrency, validateAmount } from '../../lib/constants';
import CustomButton from '../../components/CustomButton';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { PaymentService } from '../../lib/paymentService';
import { usePaymentDeepLink } from '../../hooks/usePaymentDeepLink';

const { width } = Dimensions.get('window');

export default function DepositScreen() {
  const { adminBankAccounts, depositRequest, fetchBalance } = useBanking();
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    amount: '',
    senderName: user?.user_metadata?.full_name || '',
    transactionRef: '',
    adminBankAccountId: '',
    currency: 'BDT' as 'BDT' | 'INR',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [depositMethod, setDepositMethod] = useState<'manual' | 'gateway'>('manual');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Payment deep link handler
  const { setCurrentPaymentData, clearPaymentData } = usePaymentDeepLink({
    onPaymentSuccess: (result) => {
      setPaymentLoading(false);
      if (result.success) {
        Alert.alert(
          'Payment Successful!',
          'Your deposit has been processed successfully. It may take a few minutes to reflect in your wallet.',
          [
            {
              text: 'View Transactions',
              onPress: () => router.push('/(tabs)/transactions'),
            },
            {
              text: 'OK',
              onPress: () => {
                fetchBalance();
                router.replace('/(tabs)');
              },
            },
          ]
        );
        // Reset form
        setFormData({
          amount: '',
          senderName: user?.user_metadata?.full_name || '',
          transactionRef: '',
          adminBankAccountId: '',
          currency: formData.currency,
        });
      } else {
        Alert.alert('Payment Failed', result.message);
      }
    },
    onPaymentCancel: (result) => {
      setPaymentLoading(false);
      Alert.alert('Payment Cancelled', result.message);
    },
    onPaymentError: (error) => {
      setPaymentLoading(false);
      Alert.alert('Payment Error', error);
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      // If currency is changed, reset admin bank account selection
      if (field === 'currency') {
        return {
          ...prev,
          currency: value as 'BDT' | 'INR',
          adminBankAccountId: '',
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handlePaymentGateway = async () => {
    // Validation
    if (!formData.amount || !formData.senderName || !formData.adminBankAccountId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amountError = validateAmount(amount, 'DEPOSIT', formData.currency);
    if (amountError) {
      Alert.alert('Error', amountError);
      return;
    }

    // Only allow BDT for payment gateway (assuming RupantorPay supports BDT)
    if (formData.currency !== 'BDT') {
      Alert.alert('Error', 'Payment gateway currently only supports BDT deposits');
      return;
    }

    setPaymentLoading(true);

    try {
      const paymentData = {
        fullname: formData.senderName,
        email: user?.email || '',
        amount: amount,
        userId: user!.id,
        currency: formData.currency,
        adminBankAccountId: formData.adminBankAccountId,
      };

      // Store payment data for callback handling
      setCurrentPaymentData(paymentData);

      // Initiate payment
      const result = await PaymentService.initiatePayment(paymentData);

      if (!result.success) {
        setPaymentLoading(false);
        Alert.alert('Payment Error', result.error || 'Failed to initiate payment');
        return;
      }

      if (!result.checkout_url) {
        setPaymentLoading(false);
        Alert.alert('Payment Error', 'No payment URL received');
        return;
      }

      // Open payment gateway
      await PaymentService.openPaymentGateway(result.checkout_url);

    } catch (error) {
      setPaymentLoading(false);
      console.error('Payment gateway error:', error);
      Alert.alert('Error', 'Failed to open payment gateway. Please try again.');
    }
  };

  // Filter admin bank accounts by selected currency
  const filteredAdminBankAccounts = adminBankAccounts.filter(
    (account) => account.currency === formData.currency && account.is_active
  );

  const selectImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to upload screenshots.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Settings',
              onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync(),
            },
          ]
        );
        return;
      }

      Alert.alert(
        'Select Image',
        'Choose how you want to select your transaction screenshot',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Camera',
            onPress: () => openImagePicker('camera'),
          },
          {
            text: 'Gallery',
            onPress: () => openImagePicker('gallery'),
          },
        ]
      );
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
    }
  };

  const openImagePicker = async (source: 'camera' | 'gallery') => {
    try {
      setImageUploading(true);

      let result;

      if (source === 'camera') {
        const cameraPermission =
          await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) {
          Alert.alert(
            'Permission Required',
            'Camera access is required to take photos.'
          );
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // Validate image size (max 10MB)
        if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
          Alert.alert(
            'File Too Large',
            'Please select an image smaller than 10MB.'
          );
          return;
        }

        setSelectedImage(asset.uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = () => {
    Alert.alert(
      'Remove Screenshot',
      'Are you sure you want to remove this screenshot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setSelectedImage(null),
        },
      ]
    );
  };

  const handleSubmit = async () => {
    // Validation for manual deposit
    if (
      !formData.amount ||
      !formData.senderName ||
      !formData.adminBankAccountId
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Additional validation for manual deposits
    if (depositMethod === 'manual') {
      if (!formData.transactionRef) {
        Alert.alert('Error', 'Please enter transaction reference');
        return;
      }

      if (!selectedImage) {
        Alert.alert('Error', 'Please upload a screenshot of your transaction');
        return;
      }
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amountError = validateAmount(amount, 'DEPOSIT', formData.currency);
    if (amountError) {
      Alert.alert('Error', amountError);
      return;
    }

    setLoading(true);
    try {
      const success = await depositRequest(
        user!.id,
        amount,
        formData.currency,
        formData.senderName,
        formData.transactionRef,
        formData.adminBankAccountId,
        selectedImage
      );

      if (success) {
        await fetchBalance();

        // Reset form
        setFormData({
          amount: '',
          senderName: user?.user_metadata?.full_name || '',
          transactionRef: '',
          adminBankAccountId: '',
          currency: formData.currency,
        });
        setSelectedImage(null);

        Alert.alert(
          'Deposit Request Submitted',
          'Your deposit request has been submitted successfully. We will process it shortly.',
          [
            {
              text: 'View Transactions',
              onPress: () => router.push('/(tabs)/transactions'),
            },
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
        {/* Deposit Method Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Deposit Method</Text>
          <View style={styles.methodSelector}>
            <CustomButton
              title="Manual Transfer"
              onPress={() => setDepositMethod('manual')}
              variant={'outline'}
              style={
                [
                  styles.methodButton,
                  depositMethod === 'manual' && styles.activeMethodButton,
                ].filter(Boolean) as any
              }
              textStyle={styles.methodButtonText}
              leftIcon={
                <Ionicons
                  name="receipt-outline"
                  size={20}
                  color={depositMethod === 'manual' ? '#FFFFFF' : '#3B82F6'}
                />
              }
            />
            <CustomButton
              title="Payment Gateway"
              onPress={() => setDepositMethod('gateway')}
              variant={'outline'}
              style={
                [
                  styles.methodButton,
                  depositMethod === 'gateway' && styles.activeMethodButton,
                ].filter(Boolean) as any
              }
              textStyle={styles.methodButtonText}
              leftIcon={
                <Ionicons
                  name="card-outline"
                  size={20}
                  color={depositMethod === 'gateway' ? '#FFFFFF' : '#3B82F6'}
                />
              }
            />
          </View>
          <Text style={styles.sublabel}>
            {depositMethod === 'manual'
              ? 'Transfer money manually and upload proof'
              : 'Pay securely through our payment gateway'}
          </Text>
        </View>

        {/* Currency Selection */}
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

        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount ({formData.currency})</Text>
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

        {/* Transaction Reference - Only for manual deposits */}
        {depositMethod === 'manual' && (
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
        )}

        {/* Admin Bank Account */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Bank to Deposit</Text>
          <Text style={styles.sublabel}>
            Choose an admin bank account and make payment to the provided
            details
          </Text>
          {filteredAdminBankAccounts.length === 0 ? (
            <View style={styles.placeholderContainer}>
              <Ionicons name="card-outline" size={40} color="#7B8794" />
              <Text style={styles.placeholderText}>
                No {formData.currency} Admin Accounts Available
              </Text>
              <Text style={styles.placeholderSubtext}>
                Please contact support or try a different currency
              </Text>
            </View>
          ) : (
            filteredAdminBankAccounts.map((account) => {
              const isSelected = formData.adminBankAccountId === account.id;

              return (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.bankCard,
                    isSelected && styles.selectedBankCard,
                  ]}
                  onPress={() =>
                    handleInputChange('adminBankAccountId', account.id)
                  }
                >
                  <View style={styles.bankCardHeader}>
                    <View style={styles.bankTypeContainer}>
                      <View
                        style={[
                          styles.bankTypeIcon,
                          {
                            backgroundColor: isSelected ? '#3B82F6' : '#F1F5F9',
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            account.bank_type === 'BANK'
                              ? 'business'
                              : account.bank_type === 'UPI'
                              ? 'at'
                              : 'phone-portrait'
                          }
                          size={20}
                          color={isSelected ? '#FFFFFF' : '#3B82F6'}
                        />
                      </View>
                      <View style={styles.bankTypeInfo}>
                        <Text
                          style={[
                            styles.bankTypeName,
                            isSelected && styles.selectedText,
                          ]}
                        >
                          {account.bank_name || account.bank_type}
                        </Text>
                        <Text
                          style={[
                            styles.bankTypeLabel,
                            isSelected && styles.selectedSubtext,
                          ]}
                        >
                          {account.bank_type} • {account.currency}
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#10B981"
                        />
                      </View>
                    )}
                  </View>

                  <View style={styles.bankCardDetails}>
                    <Text
                      style={[
                        styles.accountName,
                        isSelected && styles.selectedText,
                      ]}
                    >
                      {account.account_name}
                    </Text>

                    {/* Account Number or Mobile/UPI */}
                    {account.account_number && (
                      <View style={styles.detailRow}>
                        <Text
                          style={[
                            styles.detailLabel,
                            isSelected && styles.selectedSubtext,
                          ]}
                        >
                          Account Number:
                        </Text>
                        <Text
                          style={[
                            styles.detailValue,
                            isSelected && styles.selectedText,
                          ]}
                        >
                          {account.account_number}
                        </Text>
                      </View>
                    )}

                    {account.mobile_number && (
                      <View style={styles.detailRow}>
                        <Text
                          style={[
                            styles.detailLabel,
                            isSelected && styles.selectedSubtext,
                          ]}
                        >
                          Mobile Number:
                        </Text>
                        <Text
                          style={[
                            styles.detailValue,
                            isSelected && styles.selectedText,
                          ]}
                        >
                          {account.mobile_number}
                        </Text>
                      </View>
                    )}

                    {account.upi_id && (
                      <View style={styles.detailRow}>
                        <Text
                          style={[
                            styles.detailLabel,
                            isSelected && styles.selectedSubtext,
                          ]}
                        >
                          UPI ID:
                        </Text>
                        <Text
                          style={[
                            styles.detailValue,
                            isSelected && styles.selectedText,
                          ]}
                        >
                          {account.upi_id}
                        </Text>
                      </View>
                    )}

                    {account.ifsc_code && (
                      <View style={styles.detailRow}>
                        <Text
                          style={[
                            styles.detailLabel,
                            isSelected && styles.selectedSubtext,
                          ]}
                        >
                          IFSC Code:
                        </Text>
                        <Text
                          style={[
                            styles.detailValue,
                            isSelected && styles.selectedText,
                          ]}
                        >
                          {account.ifsc_code}
                        </Text>
                      </View>
                    )}

                    {account.routing_number && (
                      <View style={styles.detailRow}>
                        <Text
                          style={[
                            styles.detailLabel,
                            isSelected && styles.selectedSubtext,
                          ]}
                        >
                          Routing Number:
                        </Text>
                        <Text
                          style={[
                            styles.detailValue,
                            isSelected && styles.selectedText,
                          ]}
                        >
                          {account.routing_number}
                        </Text>
                      </View>
                    )}

                    {account.branch_name && (
                      <View style={styles.detailRow}>
                        <Text
                          style={[
                            styles.detailLabel,
                            isSelected && styles.selectedSubtext,
                          ]}
                        >
                          Branch:
                        </Text>
                        <Text
                          style={[
                            styles.detailValue,
                            isSelected && styles.selectedText,
                          ]}
                        >
                          {account.branch_name}
                        </Text>
                      </View>
                    )}

                    {/* Daily Limit Info */}
                    <View style={styles.limitInfo}>
                      <Text
                        style={[
                          styles.limitText,
                          isSelected && styles.selectedSubtext,
                        ]}
                      >
                        Daily Limit:{' '}
                        {formatCurrency(
                          account.daily_limit || 0,
                          account.currency
                        )}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Screenshot Upload - Only for manual deposits */}
        {depositMethod === 'manual' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Transaction Screenshot *</Text>
            <Text style={styles.sublabel}>
              Upload a clear screenshot of your transaction as proof
            </Text>

          {!selectedImage ? (
            <CustomButton
              title={
                imageUploading ? 'Selecting Image...' : 'Upload Screenshot'
              }
              onPress={selectImage}
              variant="outline"
              style={styles.uploadButton}
              textStyle={styles.uploadButtonText}
              leftIcon={
                <Ionicons name="camera-outline" size={20} color="#3B82F6" />
              }
              disabled={imageUploading}
            />
          ) : (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.imagePreview}
              />
              <View style={styles.imageActions}>
                <TouchableOpacity
                  style={styles.imageActionButton}
                  onPress={selectImage}
                >
                  <Ionicons name="pencil" size={16} color="#3B82F6" />
                  <Text style={styles.imageActionText}>Change</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.imageActionButton}
                  onPress={removeImage}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text style={[styles.imageActionText, { color: '#EF4444' }]}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          </View>
        )}

        {/* Submit Buttons */}
        {depositMethod === 'manual' ? (
          <CustomButton
            title="Submit Deposit Request"
            onPress={handleSubmit}
            loading={loading}
            disabled={filteredAdminBankAccounts.length === 0 || imageUploading}
            style={styles.submitButton}
            textStyle={styles.submitButtonText}
            leftIcon={
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            }
          />
        ) : (
          <CustomButton
            title={paymentLoading ? "Processing..." : "Pay with Gateway"}
            onPress={handlePaymentGateway}
            loading={paymentLoading}
            disabled={filteredAdminBankAccounts.length === 0 || formData.currency !== 'BDT'}
            style={[styles.submitButton, styles.paymentGatewayButton]}
            textStyle={styles.submitButtonText}
            leftIcon={
              <Ionicons
                name="card-outline"
                size={20}
                color="#FFFFFF"
              />
            }
          />
        )}

        {/* Payment Gateway Info */}
        {depositMethod === 'gateway' && formData.currency !== 'BDT' && (
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#F59E0B" />
            <Text style={styles.infoText}>
              Payment gateway currently only supports BDT deposits
            </Text>
          </View>
        )}
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
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  placeholderText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    fontWeight: '600',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  sublabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  imagePreviewContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  imageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    gap: 4,
  },
  imageActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  // Bank card styles
  bankCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedBankCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  bankCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bankTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bankTypeInfo: {
    flex: 1,
  },
  bankTypeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  bankTypeLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  selectedIndicator: {
    marginLeft: 12,
  },
  bankCardDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 2,
    textAlign: 'right',
  },
  limitInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  limitText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  selectedText: {
    color: '#1E293B',
  },
  selectedSubtext: {
    color: '#475569',
  },
  // Method selector styles
  methodSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  methodButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeMethodButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentGatewayButton: {
    backgroundColor: '#10B981',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
});
