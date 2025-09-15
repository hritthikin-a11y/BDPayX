import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';
import { ApiService } from './api';

// Use the same URL as your supabase client
const SUPABASE_PROJECT_URL = "https://enzrnxiqjadyjuverbvm.supabase.co";
const CREATE_PAYMENT_URL = `${SUPABASE_PROJECT_URL}/functions/v1/create-payment`;
const VERIFY_PAYMENT_URL = `${SUPABASE_PROJECT_URL}/functions/v1/verify-payment`;

export interface PaymentRequest {
  fullname: string;
  email: string;
  amount: number;
  userId: string;
  currency: 'BDT' | 'INR';
  adminBankAccountId: string;
}

export interface PaymentResponse {
  success: boolean;
  checkout_url?: string;
  payment_id?: string;
  error?: string;
  raw?: any;
}

export interface PaymentVerification {
  success: boolean;
  status?: string;
  transaction_id?: string;
  amount?: number;
  error?: string;
  raw?: any;
}

export class PaymentService {
  private static paymentInProgress = false;

  /**
   * Initiate payment through RupantorPay gateway
   */
  static async initiatePayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (this.paymentInProgress) {
        return { success: false, error: 'Payment already in progress' };
      }

      this.paymentInProgress = true;

      // Get current user session for auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Failed to get user session');
      }

      if (!session?.access_token) {
        throw new Error('User not authenticated - no access token');
      }

      console.log('Session obtained:', !!session);
      console.log('Access token exists:', !!session.access_token);

      // Success URL - deep link back to app
      const successUrl = 'bdpayx://payment-success';
      const cancelUrl = 'bdpayx://payment-cancel';

      const payload = {
        fullname: paymentData.fullname,
        email: paymentData.email,
        amount: paymentData.amount.toString(),
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: paymentData.userId,
          currency: paymentData.currency,
          admin_bank_account_id: paymentData.adminBankAccountId,
        },
      };

      console.log('Creating payment with payload:', payload);
      console.log('Making request to:', CREATE_PAYMENT_URL);

      const response = await fetch(CREATE_PAYMENT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuenJueGlxamFkeWp1dmVyYnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1Mjk0NTgsImV4cCI6MjA3MzEwNTQ1OH0.wHfB3G9dLiIUpK21Qsk4MAAHnEklZtiaWSZQpU9GPHs',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Payment creation result:', result);

      // Extract checkout URL from response
      const checkoutUrl = result.checkout_url ||
                         result.raw?.checkout_url ||
                         result.raw?.payment_url ||
                         result.raw?.url;

      if (!checkoutUrl) {
        console.error('No checkout URL found in response:', result);
        throw new Error('No checkout URL received from payment gateway');
      }

      return {
        success: true,
        checkout_url: checkoutUrl,
        payment_id: result.raw?.payment_id || result.raw?.transaction_id,
        raw: result.raw,
      };

    } catch (error) {
      console.error('Payment initiation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    } finally {
      this.paymentInProgress = false;
    }
  }

  /**
   * Open payment gateway in browser
   */
  static async openPaymentGateway(checkoutUrl: string): Promise<void> {
    try {
      await WebBrowser.openBrowserAsync(checkoutUrl);
    } catch (error) {
      console.error('Error opening payment gateway:', error);
      throw new Error('Failed to open payment gateway');
    }
  }

  /**
   * Verify payment after callback
   */
  static async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    try {
      // Get current user session for auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      console.log('Verifying payment with transaction ID:', transactionId);

      const response = await fetch(VERIFY_PAYMENT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuenJueGlxamFkeWp1dmVyYnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1Mjk0NTgsImV4cCI6MjA3MzEwNTQ1OH0.wHfB3G9dLiIUpK21Qsk4MAAHnEklZtiaWSZQpU9GPHs',
        },
        body: JSON.stringify({ transaction_id: transactionId }),
      });

      const result = await response.json();
      console.log('Payment verification result:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to verify payment');
      }

      // Extract payment status
      const status = result.status || result.raw?.status || 'UNKNOWN';
      const amount = result.amount || result.raw?.amount;

      return {
        success: true,
        status,
        transaction_id: transactionId,
        amount,
        raw: result,
      };

    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Complete payment flow - create deposit request after successful payment
   */
  static async completePayment(
    paymentData: PaymentRequest,
    transactionId: string,
    verificationResult: PaymentVerification
  ): Promise<boolean> {
    try {
      // Create deposit request in database
      const depositRequest = await ApiService.createPaymentDepositRequest(
        paymentData.userId,
        paymentData.amount,
        paymentData.currency,
        paymentData.fullname,
        transactionId, // Use gateway transaction ID as reference
        paymentData.adminBankAccountId,
        'PAYMENT_GATEWAY', // Payment method
        {
          gateway_transaction_id: transactionId,
          payment_status: verificationResult.status,
          gateway_response: verificationResult.raw,
        }
      );

      if (!depositRequest) {
        throw new Error('Failed to create deposit request');
      }

      console.log('Deposit request created successfully:', depositRequest.id);
      return true;

    } catch (error) {
      console.error('Error completing payment:', error);
      return false;
    }
  }

  /**
   * Handle payment success callback
   */
  static async handlePaymentSuccess(
    url: string,
    originalPaymentData: PaymentRequest
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Parse URL to extract transaction ID
      const parsed = Linking.parse(url);
      const transactionId = parsed.queryParams?.transaction_id ||
                           parsed.queryParams?.transactionId ||
                           parsed.queryParams?.tx;

      if (!transactionId) {
        console.warn('No transaction ID found in callback URL:', url);
        return { success: false, message: 'No transaction ID found in payment callback' };
      }

      // Verify payment with gateway
      const verification = await this.verifyPayment(transactionId as string);

      if (!verification.success) {
        return { success: false, message: verification.error || 'Payment verification failed' };
      }

      // Check if payment was successful
      const isPaymentSuccessful = verification.status === 'SUCCESS' ||
                                  verification.status === 'COMPLETED' ||
                                  verification.status === 'PAID';

      if (!isPaymentSuccessful) {
        return {
          success: false,
          message: `Payment not successful. Status: ${verification.status}`
        };
      }

      // Complete payment and create deposit request
      const completed = await this.completePayment(
        originalPaymentData,
        transactionId as string,
        verification
      );

      if (!completed) {
        return { success: false, message: 'Failed to process deposit request' };
      }

      return { success: true, message: 'Payment completed successfully' };

    } catch (error) {
      console.error('Error handling payment success:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Handle payment cancellation
   */
  static handlePaymentCancel(): { success: boolean; message: string } {
    return { success: false, message: 'Payment was cancelled by user' };
  }

  /**
   * Get payment status message for UI
   */
  static getStatusMessage(status: string): string {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
      case 'PAID':
        return 'Payment completed successfully';
      case 'PENDING':
        return 'Payment is being processed';
      case 'FAILED':
        return 'Payment failed';
      case 'CANCELLED':
        return 'Payment was cancelled';
      default:
        return `Payment status: ${status}`;
    }
  }
}