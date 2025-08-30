import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  is_verified: boolean;
  kyc_status: string;
  daily_deposit_limit: number;
  daily_withdrawal_limit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  bdt_balance: number;
  inr_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserBankAccount {
  id: string;
  user_id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_type: 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK';
  currency: 'BDT' | 'INR';
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminBankAccount {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_type: 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK';
  currency: 'BDT' | 'INR';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExchangeRate {
  id: string;
  from_currency: 'BDT' | 'INR';
  to_currency: 'BDT' | 'INR';
  rate: number;
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'EXCHANGE';
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REJECTED';
  amount: number;
  currency: 'BDT' | 'INR';
  from_currency?: 'BDT' | 'INR';
  to_currency?: 'BDT' | 'INR';
  exchange_rate?: number;
  converted_amount?: number;
  bank_account_id?: string;
  admin_bank_account_id?: string;
  reference_number?: string;
  processed_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DepositRequest {
  id: string;
  user_id: string;
  transaction_id: string;
  amount: number;
  currency: 'BDT' | 'INR';
  sender_name: string;
  transaction_ref: string;
  admin_bank_account_id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REJECTED';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  transaction_id: string;
  amount: number;
  currency: 'BDT' | 'INR';
  bank_account_id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REJECTED';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExchangeRequest {
  id: string;
  user_id: string;
  transaction_id: string;
  from_currency: 'BDT' | 'INR';
  to_currency: 'BDT' | 'INR';
  from_amount: number;
  to_amount: number;
  exchange_rate: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REJECTED';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}