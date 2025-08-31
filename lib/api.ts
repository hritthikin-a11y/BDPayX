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
    account_number: string;
    bank_name: string;
    bank_type?: 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK';
    currency?: 'BDT' | 'INR';
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

  static async getExchangeRate(fromCurrency: 'BDT' | 'INR', toCurrency: 'BDT' | 'INR'): Promise<ExchangeRate | null> {
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

  static async getTransactionById(transactionId: string): Promise<Transaction | null> {
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
    imageUrl: string | null
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
        console.error('Error creating withdrawal transaction:', transactionError);
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
}