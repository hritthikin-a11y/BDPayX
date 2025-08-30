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
    
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('bdt_balance, inr_balance')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching balance:', error);
        return;
      }

      if (data) {
        setBalance({
          bdt: parseFloat(data.bdt_balance) || 0,
          inr: parseFloat(data.inr_balance) || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      if (data) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchBankAccounts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching bank accounts:', error);
        return;
      }

      if (data) {
        setBankAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  const addBankAccount = async (account: any) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .insert([{ ...account, user_id: user.id }]);

      if (error) {
        console.error('Error adding bank account:', error);
        throw error;
      }

      await fetchBankAccounts();
    } catch (error) {
      console.error('Error adding bank account:', error);
      throw error;
    }
  };

  const depositRequest = async (data: any) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('deposit_requests')
        .insert([{ ...data, user_id: user.id, status: 'pending' }]);

      if (error) {
        console.error('Error creating deposit request:', error);
        throw error;
      }

      // Also create a transaction record
      await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: 'deposit',
          amount: data.amount,
          currency: 'BDT',
          status: 'pending',
          description: `Deposit request - ${data.bank_name} - ${data.transaction_id}`
        }]);

      await fetchTransactions();
    } catch (error) {
      console.error('Error creating deposit request:', error);
      throw error;
    }
  };

  const withdrawRequest = async (data: any) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('withdraw_requests')
        .insert([{ ...data, user_id: user.id, status: 'pending' }]);

      if (error) {
        console.error('Error creating withdraw request:', error);
        throw error;
      }

      // Also create a transaction record
      await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: 'withdraw',
          amount: data.amount,
          currency: 'BDT',
          status: 'pending',
          description: `Withdrawal request - ${data.amount} BDT`
        }]);

      await fetchTransactions();
    } catch (error) {
      console.error('Error creating withdraw request:', error);
      throw error;
    }
  };

  const exchangeRequest = async (data: any) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('exchange_requests')
        .insert([{ ...data, user_id: user.id, status: 'pending' }]);

      if (error) {
        console.error('Error creating exchange request:', error);
        throw error;
      }

      // Also create a transaction record
      await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: 'exchange',
          amount: data.amount,
          currency: data.from_currency,
          status: 'pending',
          description: `Exchange ${data.amount} ${data.from_currency} to ${data.receive_amount} ${data.to_currency}`
        }]);

      await fetchTransactions();
    } catch (error) {
      console.error('Error creating exchange request:', error);
      throw error;
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