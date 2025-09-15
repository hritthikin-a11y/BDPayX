import { supabase } from './supabase';
import type {
  UserProfile,
  Wallet,
  UserBankAccount,
  AdminBankAccount,
  ExchangeRate,
  Transaction,
  DepositRequest,
  WithdrawalRequest,
  ExchangeRequest,
} from './supabase';

export class ApiService {
  // User Profile
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    // Return first item or null if empty array
    return data && data.length > 0 ? data[0] : null;
  }

  static async createUserProfile(userData: {
    user_id: string;
    full_name?: string;
    phone?: string;
    daily_deposit_limit?: number;
    daily_withdrawal_limit?: number;
  }): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(userData)
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return data;
  }

  // Wallet
  static async getUserWallet(userId: string): Promise<Wallet | null> {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching wallet:', error);
      return null;
    }

    // Return first item or null if empty array
    return data && data.length > 0 ? data[0] : null;
  }

  static async createUserWallet(userId: string): Promise<Wallet | null> {
    const { data, error } = await supabase
      .from('wallets')
      .insert({
        user_id: userId,
        bdt_balance: 0,
        inr_balance: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating wallet:', error);
      return null;
    }

    return data;
  }

  // User Bank Accounts
  static async getUserBankAccounts(userId: string): Promise<UserBankAccount[]> {
    const { data, error } = await supabase
      .from('user_bank_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user bank accounts:', error);
      return [];
    }

    return data || [];
  }

  static async createUserBankAccount(accountData: {
    user_id: string;
    account_name: string;
    account_number?: string;
    bank_name?: string;
    bank_type?: 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK' | 'UPI';
    currency?: 'BDT' | 'INR';
    branch_name?: string;
    routing_number?: string;
    ifsc_code?: string;
    upi_id?: string;
    mobile_number?: string;
  }): Promise<UserBankAccount | null> {
    const { data, error } = await supabase
      .from('user_bank_accounts')
      .insert(accountData)
      .select()
      .single();

    if (error) {
      console.error('Error creating bank account:', error);
      return null;
    }

    return data;
  }

  static async deleteUserBankAccount(accountId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_bank_accounts')
      .update({ is_active: false })
      .eq('id', accountId);

    if (error) {
      console.error('Error deleting bank account:', error);
      return false;
    }

    return true;
  }

  // Admin Bank Accounts
  static async getAdminBankAccounts(): Promise<AdminBankAccount[]> {
    const { data, error } = await supabase
      .from('admin_bank_accounts')
      .select('*')
      .eq('is_active', true)
      .order('bank_type', { ascending: true });

    if (error) {
      console.error('Error fetching admin bank accounts:', error);
      return [];
    }

    return data || [];
  }

  // Exchange Rates
  static async getAllExchangeRates(): Promise<ExchangeRate[]> {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('is_active', true)
      .order('from_currency', { ascending: true });

    if (error) {
      console.error('Error fetching exchange rates:', error);
      return [];
    }

    return data || [];
  }

  static async getExchangeRate(
    fromCurrency: 'BDT' | 'INR',
    toCurrency: 'BDT' | 'INR'
  ): Promise<ExchangeRate | null> {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('from_currency', fromCurrency)
      .eq('to_currency', toCurrency)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching exchange rate:', error);
      return null;
    }

    return data;
  }

  // Transactions
  static async getUserTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data || [];
  }

  static async getTransactionById(
    transactionId: string
  ): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }

    return data;
  }

  // Deposit Requests
  static async createDepositRequest(
    userId: string,
    amount: number,
    currency: 'BDT' | 'INR',
    senderName: string,
    transactionRef: string,
    adminBankAccountId: string,
    imageUri: string | null
  ): Promise<DepositRequest | null> {
    try {
      let imageUrl: string | null = null;

      // Upload image if provided
      if (imageUri) {
        try {
          const fileName = `${userId}/${Date.now()}.jpg`;

          // Convert uri to blob for upload
          const response = await fetch(imageUri);
          const blob = await response.blob();

          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from('deposit-screenshots')
              .upload(fileName, blob, {
                contentType: 'image/jpeg',
                upsert: false,
              });

          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            // Continue without image if upload fails
          } else {
            const { data: urlData } = supabase.storage
              .from('deposit-screenshots')
              .getPublicUrl(fileName);
            imageUrl = urlData.publicUrl;
          }
        } catch (uploadError) {
          console.error('Error processing image upload:', uploadError);
          // Continue without image if upload fails
        }
      }

      // Create transaction first
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'DEPOSIT',
          status: 'PENDING',
          amount,
          currency,
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Error creating deposit transaction:', transactionError);
        return null;
      }

      // Create deposit request
      const { data, error } = await supabase
        .from('deposit_requests')
        .insert({
          user_id: userId,
          transaction_id: transactionData.id,
          amount,
          currency,
          sender_name: senderName,
          transaction_ref: transactionRef,
          admin_bank_account_id: adminBankAccountId,
          status: 'PENDING',
          screenshot_url: imageUrl,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating deposit request:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in createDepositRequest:', error);
      return null;
    }
  }

  // Create Payment Gateway Deposit Request
  static async createPaymentDepositRequest(
    userId: string,
    amount: number,
    currency: 'BDT' | 'INR',
    senderName: string,
    transactionRef: string,
    adminBankAccountId: string,
    paymentMethod: string = 'PAYMENT_GATEWAY',
    gatewayData?: any
  ): Promise<DepositRequest | null> {
    try {
      // Create transaction first
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'DEPOSIT',
          status: 'PENDING',
          amount,
          currency,
          reference_number: transactionRef,
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Error creating payment gateway transaction:', transactionError);
        return null;
      }

      // Create deposit request
      const { data, error } = await supabase
        .from('deposit_requests')
        .insert({
          user_id: userId,
          transaction_id: transactionData.id,
          amount,
          currency,
          sender_name: senderName,
          transaction_ref: transactionRef,
          admin_bank_account_id: adminBankAccountId,
          status: 'PENDING',
          admin_notes: `Payment Gateway: ${paymentMethod}${gatewayData ? `\nGateway Data: ${JSON.stringify(gatewayData)}` : ''}`,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating payment gateway deposit request:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in createPaymentDepositRequest:', error);
      return null;
    }
  }

  // Get User Deposit Requests
  static async getUserDepositRequests(
    userId: string
  ): Promise<DepositRequest[]> {
    try {
      const { data, error } = await supabase
        .from('deposit_requests')
        .select(
          `
          *,
          admin_bank_accounts (
            account_name,
            bank_name,
            bank_type,
            account_number,
            mobile_number,
            upi_id
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching deposit requests:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error in getUserDepositRequests:', error);
      return [];
    }
  }

  // Withdrawal Requests
  static async createWithdrawalRequest(
    userId: string,
    amount: number,
    currency: 'BDT' | 'INR',
    bankAccountId: string
  ): Promise<WithdrawalRequest | null> {
    try {
      // Create transaction first
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'WITHDRAWAL',
          status: 'PENDING',
          amount,
          currency,
        })
        .select()
        .single();

      if (transactionError) {
        console.error(
          'Error creating withdrawal transaction:',
          transactionError
        );
        return null;
      }

      // Create withdrawal request
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: userId,
          transaction_id: transactionData.id,
          amount,
          currency,
          bank_account_id: bankAccountId,
          status: 'PENDING',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating withdrawal request:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in createWithdrawalRequest:', error);
      return null;
    }
  }

  // Exchange Requests
  static async createExchangeRequest(
    userId: string,
    fromCurrency: 'BDT' | 'INR',
    toCurrency: 'BDT' | 'INR',
    fromAmount: number,
    toAmount: number,
    exchangeRate: number
  ): Promise<ExchangeRequest | null> {
    try {
      // Create transaction first
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'EXCHANGE',
          status: 'PENDING',
          amount: fromAmount,
          currency: fromCurrency,
          from_currency: fromCurrency,
          to_currency: toCurrency,
          exchange_rate: exchangeRate,
          converted_amount: toAmount,
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Error creating exchange transaction:', transactionError);
        return null;
      }

      // Create exchange request
      const { data, error } = await supabase
        .from('exchange_requests')
        .insert({
          user_id: userId,
          transaction_id: transactionData.id,
          from_currency: fromCurrency,
          to_currency: toCurrency,
          from_amount: fromAmount,
          to_amount: toAmount,
          exchange_rate: exchangeRate,
          status: 'PENDING',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating exchange request:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in createExchangeRequest:', error);
      return null;
    }
  }

  // Get User Withdrawal Requests
  static async getUserWithdrawalRequests(
    userId: string
  ): Promise<WithdrawalRequest[]> {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(
          `
          *,
          bank_account:user_bank_accounts (
            account_name,
            bank_name,
            bank_type,
            account_number,
            mobile_number,
            upi_id
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching withdrawal requests:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error in getUserWithdrawalRequests:', error);
      return [];
    }
  }

  // Get User Exchange Requests
  static async getUserExchangeRequests(
    userId: string
  ): Promise<ExchangeRequest[]> {
    try {
      const { data, error } = await supabase
        .from('exchange_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching exchange requests:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error in getUserExchangeRequests:', error);
      return [];
    }
  }

  // Admin Functions

  // Get all pending deposit requests for admin
  static async getAllDepositRequests(
    status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REJECTED'
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('deposit_requests')
        .select(
          `
          *,
          admin_bank_account:admin_bank_accounts (
            account_name,
            bank_name,
            bank_type,
            account_number,
            mobile_number,
            upi_id
          )
        `
        )
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: requests, error } = await query;

      if (error) {
        console.error('Error fetching deposit requests:', error);
        return [];
      }

      if (!requests || requests.length === 0) {
        return [];
      }

      // Manually fetch user profiles for all user IDs
      const userIds = [...new Set(requests.map(req => req.user_id))];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, phone')
        .in('user_id', userIds);

      // Create a lookup map for profiles
      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.user_id, profile);
      });

      // Merge profile data with requests
      const enrichedRequests = requests.map(request => ({
        ...request,
        user_profile: profileMap.get(request.user_id) || null,
      }));

      return enrichedRequests;
    } catch (error) {
      console.error('Unexpected error in getAllDepositRequests:', error);
      return [];
    }
  }

  // Process deposit request (approve/reject)
  static async processDepositRequest(
    requestId: string,
    adminId: string,
    action: 'SUCCESS' | 'REJECTED',
    adminNotes?: string,
    rejectionReason?: string,
    adminFeedback?: string
  ): Promise<boolean> {
    try {
      // Get the deposit request details first
      const { data: depositRequest, error: fetchError } = await supabase
        .from('deposit_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !depositRequest) {
        console.error('Error fetching deposit request:', fetchError);
        return false;
      }

      // Update deposit request
      const { error: updateError } = await supabase
        .from('deposit_requests')
        .update({
          status: action,
          processed_by: adminId,
          processed_at: new Date().toISOString(),
          admin_notes: adminNotes,
          rejection_reason: rejectionReason,
          admin_feedback: adminFeedback,
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating deposit request:', updateError);
        return false;
      }

      // Update corresponding transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .update({
          status: action,
          processed_at: new Date().toISOString(),
          admin_notes: adminNotes,
        })
        .eq('id', depositRequest.transaction_id);

      if (transactionError) {
        console.error('Error updating transaction:', transactionError);
        return false;
      }

      // If approved (SUCCESS), add money to user's wallet
      if (action === 'SUCCESS') {
        const balanceField =
          depositRequest.currency === 'BDT' ? 'bdt_balance' : 'inr_balance';

        // First get current balance
        const { data: currentWallet, error: walletFetchError } = await supabase
          .from('wallets')
          .select(balanceField)
          .eq('user_id', depositRequest.user_id)
          .single();

        if (walletFetchError) {
          console.error('Error fetching wallet:', walletFetchError);
          return false;
        }

        const currentBalance = currentWallet[balanceField] || 0;
        const newBalance = currentBalance + depositRequest.amount;

        const { error: walletError } = await supabase
          .from('wallets')
          .update({
            [balanceField]: newBalance,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', depositRequest.user_id);

        if (walletError) {
          console.error('Error updating wallet balance:', walletError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in processDepositRequest:', error);
      return false;
    }
  }

  // Get all withdrawal requests for admin
  static async getAllWithdrawalRequests(
    status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REJECTED'
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('withdrawal_requests')
        .select(
          `
          *,
          bank_account:user_bank_accounts (
            account_name,
            bank_name,
            bank_type,
            account_number,
            mobile_number,
            upi_id
          )
        `
        )
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: requests, error } = await query;

      if (error) {
        console.error('Error fetching withdrawal requests:', error);
        return [];
      }

      if (!requests || requests.length === 0) {
        return [];
      }

      // Manually fetch user profiles for all user IDs
      const userIds = [...new Set(requests.map(req => req.user_id))];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, phone')
        .in('user_id', userIds);

      // Create a lookup map for profiles
      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.user_id, profile);
      });

      // Merge profile data with requests
      const enrichedRequests = requests.map(request => ({
        ...request,
        user_profile: profileMap.get(request.user_id) || null,
      }));

      return enrichedRequests;
    } catch (error) {
      console.error('Unexpected error in getAllWithdrawalRequests:', error);
      return [];
    }
  }

  // Get all exchange requests for admin
  static async getAllExchangeRequests(
    status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REJECTED'
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('exchange_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: requests, error } = await query;

      if (error) {
        console.error('Error fetching exchange requests:', error);
        return [];
      }

      if (!requests || requests.length === 0) {
        return [];
      }

      // Manually fetch user profiles for all user IDs to fix relationship issues
      const userIds = [...new Set(requests.map(req => req.user_id))];
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, phone')
        .in('user_id', userIds);

      if (profileError) {
        console.error('Error fetching user profiles for exchange requests:', profileError);
        // Return requests without profile data if profile fetch fails
        return requests;
      }

      // Create a map for quick lookup
      const profileMap = new Map(
        (profiles || []).map(profile => [profile.user_id, profile])
      );

      // Merge profile data with requests
      const requestsWithProfiles = requests.map(request => ({
        ...request,
        user_profile: profileMap.get(request.user_id) || null,
      }));

      return requestsWithProfiles;
    } catch (error) {
      console.error('Unexpected error in getAllExchangeRequests:', error);
      return [];
    }
  }

  // Process withdrawal request (approve/reject)
  static async processWithdrawalRequest(
    requestId: string,
    adminId: string,
    action: 'SUCCESS' | 'REJECTED',
    adminNotes?: string,
    rejectionReason?: string,
    adminFeedback?: string
  ): Promise<boolean> {
    try {
      // Get the withdrawal request details first
      const { data: withdrawalRequest, error: fetchError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !withdrawalRequest) {
        console.error('Error fetching withdrawal request:', fetchError);
        return false;
      }

      // If rejecting, just update status
      if (action === 'REJECTED') {
        const { error: updateError } = await supabase
          .from('withdrawal_requests')
          .update({
            status: action,
            processed_by: adminId,
            processed_at: new Date().toISOString(),
            admin_notes: adminNotes,
            rejection_reason: rejectionReason,
            admin_feedback: adminFeedback,
          })
          .eq('id', requestId);

        if (updateError) {
          console.error('Error updating withdrawal request:', updateError);
          return false;
        }

        // Update corresponding transaction
        const { error: transactionError } = await supabase
          .from('transactions')
          .update({
            status: action,
            processed_at: new Date().toISOString(),
            admin_notes: adminNotes,
          })
          .eq('id', withdrawalRequest.transaction_id);

        if (transactionError) {
          console.error('Error updating transaction:', transactionError);
          return false;
        }

        return true;
      }

      // If approving, check wallet balance first
      const balanceField =
        withdrawalRequest.currency === 'BDT' ? 'bdt_balance' : 'inr_balance';

      const { data: currentWallet, error: walletFetchError } = await supabase
        .from('wallets')
        .select(balanceField)
        .eq('user_id', withdrawalRequest.user_id)
        .single();

      if (walletFetchError) {
        console.error('Error fetching wallet:', walletFetchError);
        return false;
      }

      const currentBalance = currentWallet[balanceField] || 0;
      if (currentBalance < withdrawalRequest.amount) {
        console.error('Insufficient balance for withdrawal');
        return false;
      }

      // Deduct money from wallet
      const newBalance = currentBalance - withdrawalRequest.amount;

      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          [balanceField]: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', withdrawalRequest.user_id);

      if (walletError) {
        console.error('Error updating wallet balance:', walletError);
        return false;
      }

      // Update withdrawal request
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: action,
          processed_by: adminId,
          processed_at: new Date().toISOString(),
          admin_notes: adminNotes,
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating withdrawal request:', updateError);
        return false;
      }

      // Update corresponding transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .update({
          status: action,
          processed_at: new Date().toISOString(),
          admin_notes: adminNotes,
        })
        .eq('id', withdrawalRequest.transaction_id);

      if (transactionError) {
        console.error('Error updating transaction:', transactionError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in processWithdrawalRequest:', error);
      return false;
    }
  }

  // Process exchange request (approve/reject)
  static async processExchangeRequest(
    requestId: string,
    adminId: string,
    action: 'SUCCESS' | 'REJECTED',
    adminNotes?: string,
    rejectionReason?: string,
    adminFeedback?: string
  ): Promise<boolean> {
    try {
      // Get the exchange request details first
      const { data: exchangeRequest, error: fetchError } = await supabase
        .from('exchange_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !exchangeRequest) {
        console.error('Error fetching exchange request:', fetchError);
        return false;
      }

      // If rejecting, just update status
      if (action === 'REJECTED') {
        const { error: updateError } = await supabase
          .from('exchange_requests')
          .update({
            status: action,
            processed_by: adminId,
            processed_at: new Date().toISOString(),
            admin_notes: adminNotes,
            rejection_reason: rejectionReason,
            admin_feedback: adminFeedback,
          })
          .eq('id', requestId);

        if (updateError) {
          console.error('Error updating exchange request:', updateError);
          return false;
        }

        // Update corresponding transaction
        const { error: transactionError } = await supabase
          .from('transactions')
          .update({
            status: action,
            processed_at: new Date().toISOString(),
            admin_notes: adminNotes,
          })
          .eq('id', exchangeRequest.transaction_id);

        if (transactionError) {
          console.error('Error updating transaction:', transactionError);
          return false;
        }

        return true;
      }

      // If approving, process the exchange
      const fromBalanceField =
        exchangeRequest.from_currency === 'BDT' ? 'bdt_balance' : 'inr_balance';
      const toBalanceField =
        exchangeRequest.to_currency === 'BDT' ? 'bdt_balance' : 'inr_balance';

      const { data: currentWallet, error: walletFetchError } = await supabase
        .from('wallets')
        .select('bdt_balance, inr_balance')
        .eq('user_id', exchangeRequest.user_id)
        .single();

      if (walletFetchError) {
        console.error('Error fetching wallet:', walletFetchError);
        return false;
      }

      const currentFromBalance = currentWallet[fromBalanceField] || 0;
      if (currentFromBalance < exchangeRequest.from_amount) {
        console.error('Insufficient balance for exchange');
        return false;
      }

      // Perform the exchange
      const newFromBalance = currentFromBalance - exchangeRequest.from_amount;
      const currentToBalance = currentWallet[toBalanceField] || 0;
      const newToBalance = currentToBalance + exchangeRequest.to_amount;

      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          [fromBalanceField]: newFromBalance,
          [toBalanceField]: newToBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', exchangeRequest.user_id);

      if (walletError) {
        console.error('Error updating wallet balance:', walletError);
        return false;
      }

      // Update exchange request
      const { error: updateError } = await supabase
        .from('exchange_requests')
        .update({
          status: action,
          processed_by: adminId,
          processed_at: new Date().toISOString(),
          admin_notes: adminNotes,
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating exchange request:', updateError);
        return false;
      }

      // Update corresponding transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .update({
          status: action,
          processed_at: new Date().toISOString(),
          admin_notes: adminNotes,
        })
        .eq('id', exchangeRequest.transaction_id);

      if (transactionError) {
        console.error('Error updating transaction:', transactionError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in processExchangeRequest:', error);
      return false;
    }
  }

  // Admin bank account management
  static async createAdminBankAccount(accountData: {
    account_name: string;
    account_number?: string;
    bank_name?: string;
    bank_type: 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK' | 'UPI';
    currency: 'BDT' | 'INR';
    branch_name?: string;
    routing_number?: string;
    ifsc_code?: string;
    swift_code?: string;
    upi_id?: string;
    mobile_number?: string;
    bank_address?: string;
    zipcode?: string;
    daily_limit?: number;
    monthly_limit?: number;
  }): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('admin_bank_accounts')
        .insert(accountData)
        .select()
        .single();

      if (error) {
        console.error('Error creating admin bank account:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in createAdminBankAccount:', error);
      return null;
    }
  }

  static async updateAdminBankAccount(
    accountId: string,
    accountData: any
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('admin_bank_accounts')
        .update(accountData)
        .eq('id', accountId);

      if (error) {
        console.error('Error updating admin bank account:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in updateAdminBankAccount:', error);
      return false;
    }
  }

  static async deleteAdminBankAccount(accountId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('admin_bank_accounts')
        .update({ is_active: false })
        .eq('id', accountId);

      if (error) {
        console.error('Error deleting admin bank account:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in deleteAdminBankAccount:', error);
      return false;
    }
  }

  // Exchange rate management
  static async createExchangeRate(rateData: {
    from_currency: 'BDT' | 'INR';
    to_currency: 'BDT' | 'INR';
    rate: number;
  }): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .insert(rateData)
        .select()
        .single();

      if (error) {
        console.error('Error creating exchange rate:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in createExchangeRate:', error);
      return null;
    }
  }

  static async updateExchangeRate(
    rateId: string,
    rateData: any
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('exchange_rates')
        .update(rateData)
        .eq('id', rateId);

      if (error) {
        console.error('Error updating exchange rate:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in updateExchangeRate:', error);
      return false;
    }
  }

  static async deleteExchangeRate(rateId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('exchange_rates')
        .update({ is_active: false })
        .eq('id', rateId);

      if (error) {
        console.error('Error deleting exchange rate:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in deleteExchangeRate:', error);
      return false;
    }
  }

  // Get rejection reasons
  static async getRejectionReasons(
    category: 'DEPOSIT' | 'WITHDRAWAL' | 'EXCHANGE'
  ): Promise<any[]> {
    try {
      // Return hardcoded common reasons for now
      return this.getDefaultRejectionReasons(category);
    } catch (error) {
      console.error('Unexpected error in getRejectionReasons:', error);
      return this.getDefaultRejectionReasons(category);
    }
  }

  // Fallback rejection reasons
  private static getDefaultRejectionReasons(
    category: 'DEPOSIT' | 'WITHDRAWAL' | 'EXCHANGE'
  ): any[] {
    const depositReasons = [
      {
        id: '1',
        reason: 'Amount Mismatch',
        description: 'The amount received does not match the requested amount',
      },
      {
        id: '2',
        reason: 'Bank Charges Deducted',
        description: 'Bank charges were deducted from the transfer amount',
      },
      {
        id: '3',
        reason: 'Poor Screenshot Quality',
        description: 'Transaction screenshot is unclear or unreadable',
      },
      {
        id: '4',
        reason: 'Invalid Transaction Reference',
        description:
          'The provided transaction reference is incorrect or not found',
      },
      {
        id: '5',
        reason: 'Wrong Bank Account',
        description: 'Payment was made to wrong admin bank account',
      },
      {
        id: '6',
        reason: 'Duplicate Request',
        description: 'This transaction has already been processed',
      },
      {
        id: '7',
        reason: 'Suspicious Activity',
        description: 'Transaction requires additional verification',
      },
      {
        id: '8',
        reason: 'Incomplete Information',
        description: 'Required transaction details are missing or incorrect',
      },
    ];

    const withdrawalReasons = [
      {
        id: '1',
        reason: 'Insufficient Balance',
        description: 'User does not have sufficient balance for withdrawal',
      },
      {
        id: '2',
        reason: 'Invalid Bank Details',
        description: 'Provided bank account details are incorrect',
      },
      {
        id: '3',
        reason: 'Daily Limit Exceeded',
        description: 'Withdrawal amount exceeds daily limit',
      },
      {
        id: '4',
        reason: 'Account Verification Required',
        description: 'User bank account needs verification',
      },
      {
        id: '5',
        reason: 'Suspicious Activity',
        description: 'Withdrawal request requires additional verification',
      },
      {
        id: '6',
        reason: 'Bank Account Inactive',
        description: 'Selected bank account is inactive or disabled',
      },
    ];

    switch (category) {
      case 'DEPOSIT':
        return depositReasons;
      case 'WITHDRAWAL':
        return withdrawalReasons;
      case 'EXCHANGE':
        return [];
      default:
        return [];
    }
  }

  // Get request history
  static async getRequestHistory(
    requestId: string,
    requestType: 'DEPOSIT' | 'WITHDRAWAL' | 'EXCHANGE'
  ): Promise<any[]> {
    try {
      // For now, return empty array since we need to create proper RPC functions
      return [];
    } catch (error) {
      console.error('Unexpected error in getRequestHistory:', error);
      return [];
    }
  }

  // Check if user is admin
  static async checkUserRole(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        console.error('Error fetching user role:', error);
        return 'USER'; // Default to USER role if error
      }

      // If no profile exists, return USER as default
      if (!data || data.length === 0) {
        return 'USER';
      }

      return data[0]?.role || 'USER';
    } catch (error) {
      console.error('Unexpected error in checkUserRole:', error);
      return 'USER'; // Default to USER role on error
    }
  }
}
