import { Alert } from 'react-native';

// Mock exchange rates
export const EXCHANGE_RATES = {
  BDT_TO_INR: 2.5,
  INR_TO_BDT: 0.4,
};

// Service charges in percentage
export const SERVICE_CHARGES = {
  DEPOSIT: 0.02, // 2%
  WITHDRAW: 0.03, // 3%
  EXCHANGE: 0.02, // 2%
};

// Helper function to format currency
export const formatCurrency = (amount: number, currency: string) => {
  return `${amount.toFixed(2)} ${currency}`;
};

// Helper function to calculate charges
export const calculateCharges = (amount: number, chargeRate: number) => {
  return amount * chargeRate;
};

// Helper function to show alerts
export const showAlert = (title: string, message: string) => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};