import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiService } from '../lib/api';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import type {
  Wallet,
  UserBankAccount,
  AdminBankAccount,
  Transaction,
  ExchangeRate,
} from '../lib/supabase';

interface BankingContextType {
  balance: { bdt: number; inr: number } | null;
  transactions: Transaction[];
  bankAccounts: UserBankAccount[];
  adminBankAccounts: AdminBankAccount[];
  exchangeRates: ExchangeRate[];
  loading: boolean;
  fetchAllData: () => Promise<void>;
  fetchBalance: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchBankAccounts: () => Promise<void>;
  fetchAdminBankAccounts: () => Promise<void>;
  fetchExchangeRates: () => Promise<void>;
  addBankAccount: (account: {
    account_name: string;
    account_number: string;
    bank_name: string;
    bank_type?: 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK';
    currency?: 'BDT' | 'INR';
  }) => Promise<boolean>;
  deleteUserBankAccount: (accountId: string) => Promise<boolean>;
  depositRequest: (
    userId: string,
    amount: number,
    currency: 'BDT' | 'INR',
    senderName: string,
    transactionRef: string,
    adminBankAccountId: string,
    imageUri: string | null
  ) => Promise<boolean>;
  withdrawRequest: (
    userId: string,
    amount: number,
    currency: 'BDT' | 'INR',
    bankAccountId: string
  ) => Promise<boolean>;
  exchangeRequest: (
    userId: string,
    fromCurrency: 'BDT' | 'INR',
    toCurrency: 'BDT' | 'INR',
    fromAmount: number,
    toAmount: number,
    exchangeRate: number
  ) => Promise<boolean>;
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

export function BankingProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<{ bdt: number; inr: number } | null>(
    null
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<UserBankAccount[]>([]);
  const [adminBankAccounts, setAdminBankAccounts] = useState<
    AdminBankAccount[]
  >([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      // Reset state when user logs out
      setBalance(null);
      setTransactions([]);
      setBankAccounts([]);
      setAdminBankAccounts([]);
      setExchangeRates([]);
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBalance(),
        fetchTransactions(),
        fetchBankAccounts(),
        fetchAdminBankAccounts(),
        fetchExchangeRates(),
      ]);
    } catch (error) {
      console.error('Error fetching all data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    if (!user) return;

    try {
      // Try to get user profile first
      let userProfile = await ApiService.getUserProfile(user.id);

      // If user profile doesn't exist, create it
      if (!userProfile) {
        userProfile = await ApiService.createUserProfile({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
        });
      }

      // Get or create wallet
      let wallet = await ApiService.getUserWallet(user.id);

      if (!wallet) {
        wallet = await ApiService.createUserWallet(user.id);
      }

      if (wallet) {
        setBalance({
          bdt: wallet.bdt_balance || 0,
          inr: wallet.inr_balance || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const data = await ApiService.getUserTransactions(user.id);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchBankAccounts = async () => {
    if (!user) return;

    try {
      const data = await ApiService.getUserBankAccounts(user.id);
      setBankAccounts(data);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  const fetchAdminBankAccounts = async () => {
    try {
      const data = await ApiService.getAdminBankAccounts();
      setAdminBankAccounts(data);
    } catch (error) {
      console.error('Error fetching admin bank accounts:', error);
    }
  };

  const fetchExchangeRates = async () => {
    try {
      const data = await ApiService.getAllExchangeRates();
      setExchangeRates(data);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };

  const addBankAccount = async (account: {
    account_name: string;
    account_number: string;
    bank_name: string;
    bank_type?: 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK';
    currency?: 'BDT' | 'INR';
  }): Promise<boolean> => {
    if (!user) return false;

    try {
      const result = await ApiService.createUserBankAccount({
        ...account,
        user_id: user.id,
      });

      if (result) {
        await fetchBankAccounts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding bank account:', error);
      return false;
    }
  };

  const depositRequest = async (
    userId: string,
    amount: number,
    currency: 'BDT' | 'INR',
    senderName: string,
    transactionRef: string,
    adminBankAccountId: string,
    imageUri: string | null
  ): Promise<boolean> => {
    try {
      const result = await ApiService.createDepositRequest(
        userId,
        amount,
        currency,
        senderName,
        transactionRef,
        adminBankAccountId,
        imageUri
      );

      if (result) {
        await Promise.all([fetchTransactions(), fetchBalance()]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating deposit request:', error);
      return false;
    }
  };

  const withdrawRequest = async (
    userId: string,
    amount: number,
    currency: 'BDT' | 'INR',
    bankAccountId: string
  ): Promise<boolean> => {
    try {
      const result = await ApiService.createWithdrawalRequest(
        userId,
        amount,
        currency,
        bankAccountId
      );

      if (result) {
        await Promise.all([fetchTransactions(), fetchBalance()]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      return false;
    }
  };

  const deleteUserBankAccount = async (accountId: string): Promise<boolean> => {
    try {
      const result = await ApiService.deleteUserBankAccount(accountId);
      if (result) {
        await fetchBankAccounts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting bank account:', error);
      return false;
    }
  };

  const exchangeRequest = async (
    userId: string,
    fromCurrency: 'BDT' | 'INR',
    toCurrency: 'BDT' | 'INR',
    fromAmount: number,
    toAmount: number,
    exchangeRate: number
  ): Promise<boolean> => {
    try {
      const result = await ApiService.createExchangeRequest(
        userId,
        fromCurrency,
        toCurrency,
        fromAmount,
        toAmount,
        exchangeRate
      );

      if (result) {
        await Promise.all([fetchTransactions(), fetchBalance()]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating exchange request:', error);
      return false;
    }
  };

  const value = {
    balance,
    transactions,
    bankAccounts,
    adminBankAccounts,
    exchangeRates,
    loading,
    fetchAllData,
    fetchBalance,
    fetchTransactions,
    fetchBankAccounts,
    fetchAdminBankAccounts,
    fetchExchangeRates,
    addBankAccount,
    deleteUserBankAccount,
    depositRequest,
    withdrawRequest,
    exchangeRequest,
  };

  return (
    <BankingContext.Provider value={value}>{children}</BankingContext.Provider>
  );
}

export function useBanking() {
  const context = useContext(BankingContext);
  if (context === undefined) {
    throw new Error('useBanking must be used within a BankingProvider');
  }
  return context;
}
