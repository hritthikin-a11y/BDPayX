import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from '../types/supabase';

// Type aliases for easier usage
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type Wallet = Database['public']['Tables']['wallets']['Row'];
export type UserBankAccount = Database['public']['Tables']['user_bank_accounts']['Row'];
export type AdminBankAccount = Database['public']['Tables']['admin_bank_accounts']['Row'];
export type ExchangeRate = Database['public']['Tables']['exchange_rates']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type DepositRequest = Database['public']['Tables']['deposit_requests']['Row'];
export type WithdrawalRequest = Database['public']['Tables']['withdrawal_requests']['Row'];
export type ExchangeRequest = Database['public']['Tables']['exchange_requests']['Row'];

export type TransactionStatus = Database['public']['Enums']['transaction_status'];
export type CurrencyType = Database['public']['Enums']['currency_type'];
export type BankType = Database['public']['Enums']['bank_type'];

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to get the current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

// Helper function to ensure user is authenticated
export const requireAuth = async (): Promise<string> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User must be authenticated');
  }
  return userId;
};

export default supabase;
