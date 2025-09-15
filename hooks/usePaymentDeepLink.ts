import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { PaymentService, PaymentRequest } from '../lib/paymentService';

export interface PaymentDeepLinkCallbacks {
  onPaymentSuccess?: (result: { success: boolean; message: string }) => void;
  onPaymentCancel?: (result: { success: boolean; message: string }) => void;
  onPaymentError?: (error: string) => void;
}

export function usePaymentDeepLink(callbacks: PaymentDeepLinkCallbacks) {
  const currentPaymentDataRef = useRef<PaymentRequest | null>(null);

  const handleDeepLink = async (url: string) => {
    try {
      console.log('Received deep link:', url);

      const parsed = Linking.parse(url);

      if (parsed.path === 'payment-success') {
        // Handle successful payment
        if (!currentPaymentDataRef.current) {
          console.warn('No payment data found for success callback');
          callbacks.onPaymentError?.('No payment data found');
          return;
        }

        const result = await PaymentService.handlePaymentSuccess(
          url,
          currentPaymentDataRef.current
        );

        callbacks.onPaymentSuccess?.(result);

        // Clear payment data after handling
        currentPaymentDataRef.current = null;

      } else if (parsed.path === 'payment-cancel') {
        // Handle cancelled payment
        const result = PaymentService.handlePaymentCancel();
        callbacks.onPaymentCancel?.(result);

        // Clear payment data
        currentPaymentDataRef.current = null;

      } else {
        console.log('Unhandled deep link path:', parsed.path);
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
      callbacks.onPaymentError?.(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  };

  useEffect(() => {
    // Listen for incoming links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Check if app was opened with a link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Function to store payment data when initiating payment
  const setCurrentPaymentData = (paymentData: PaymentRequest) => {
    currentPaymentDataRef.current = paymentData;
  };

  // Function to clear payment data
  const clearPaymentData = () => {
    currentPaymentDataRef.current = null;
  };

  return {
    setCurrentPaymentData,
    clearPaymentData,
  };
}