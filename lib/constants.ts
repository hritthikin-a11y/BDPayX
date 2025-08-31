import { Alert } from 'react-native';

// Currency types
export type CurrencyType = 'BDT' | 'INR';

// Service charges in percentage
export const SERVICE_CHARGES = {
  DEPOSIT: 0.01, // 1%
  WITHDRAWAL: 0.015, // 1.5%
  EXCHANGE: 0.008, // 0.8%
};

// Minimum amounts
export const MIN_AMOUNTS = {
  DEPOSIT_BDT: 100,
  DEPOSIT_INR: 50,
  WITHDRAWAL_BDT: 500,
  WITHDRAWAL_INR: 300,
  EXCHANGE: 1000,
};

// Bank types
export const BANK_TYPES = {
  BKASH: 'bKash',
  NAGAD: 'Nagad',
  ROCKET: 'Rocket',
  BANK: 'Bank Account',
};

// Helper function to format currency
export const formatCurrency = (amount: number, currency: CurrencyType) => {
  const symbol = currency === 'BDT' ? '৳' : '₹';
  return `${symbol}${amount.toFixed(2)}`;
};

// Helper function to calculate charges
export const calculateCharges = (amount: number, type: keyof typeof SERVICE_CHARGES) => {
  return amount * SERVICE_CHARGES[type];
};

// Helper function to show alerts
export const showAlert = (title: string, message: string) => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};

// Helper function to validate amount
export const validateAmount = (amount: number, type: string, currency: CurrencyType): string | null => {
  if (amount <= 0) return 'Amount must be greater than 0';
  
  const key = `${type}_${currency}` as keyof typeof MIN_AMOUNTS;
  const minAmount = MIN_AMOUNTS[key];
  
  if (minAmount && amount < minAmount) {
    return `Minimum ${type.toLowerCase()} amount is ${formatCurrency(minAmount, currency)}`;
  }
  
  return null;
};