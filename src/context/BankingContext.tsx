import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';

interface BankingContextType {
  balance: { bdt: number; inr: number };
  transactions: any[];
  bankAccounts: any[];
  fetchBalance: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchBankAccounts: () => Promise<void>;
  addBankAccount: (account: any) => Promise<void>;
  depositRequest: (data: any) => Promise<void>;
  withdrawRequest: (data: any) => Promise<void>;
  exchangeRequest: (data: any) => Promise<void>;
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

export const BankingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState({ bdt: 0, inr: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchTransactions();
      fetchBankAccounts();
    }
  }, [user]);

  const fetchBalance = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('wallets')
      .select('bdt_balance, inr_balance')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setBalance({
        bdt: data.bdt_balance || 0,
        inr: data.inr_balance || 0,
      });
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
  };

  const fetchBankAccounts = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (!error && data) {
      setBankAccounts(data);
    }
  };

  const addBankAccount = async (account: any) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('bank_accounts')
      .insert([{ ...account, user_id: user.id }]);

    if (!error) {
      fetchBankAccounts();
    }
  };

  const depositRequest = async (data: any) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('deposit_requests')
      .insert([{ ...data, user_id: user.id, status: 'pending' }]);

    if (!error) {
      fetchTransactions();
    }
  };

  const withdrawRequest = async (data: any) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('withdraw_requests')
      .insert([{ ...data, user_id: user.id, status: 'pending' }]);

    if (!error) {
      fetchTransactions();
    }
  };

  const exchangeRequest = async (data: any) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('exchange_requests')
      .insert([{ ...data, user_id: user.id, status: 'pending' }]);

    if (!error) {
      fetchTransactions();
    }
  };

  return (
    <BankingContext.Provider
      value={{
        balance,
        transactions,
        bankAccounts,
        fetchBalance,
        fetchTransactions,
        fetchBankAccounts,
        addBankAccount,
        depositRequest,
        withdrawRequest,
        exchangeRequest,
      }}
    >
      {children}
    </BankingContext.Provider>
  );
};

export const useBanking = () => {
  const context = useContext(BankingContext);
  if (context === undefined) {
    throw new Error('useBanking must be used within a BankingProvider');
  }
  return context;
};