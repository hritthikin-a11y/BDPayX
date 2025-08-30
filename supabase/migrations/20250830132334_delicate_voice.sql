/*
  # Banking App Database Schema

  1. New Tables
    - `wallets` - User wallet balances for BDT and INR
    - `bank_accounts` - User bank account information
    - `deposit_requests` - Deposit transaction requests
    - `withdraw_requests` - Withdrawal transaction requests  
    - `exchange_requests` - Currency exchange requests
    - `transactions` - Complete transaction history

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data
    - Secure user data isolation

  3. Features
    - Automatic wallet creation for new users
    - Transaction tracking and history
    - Multi-currency support (BDT/INR)
    - Request-based approval system
*/

-- Create wallets table for user balances
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  bdt_balance decimal(12, 2) DEFAULT 0.00,
  inr_balance decimal(12, 2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bank accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name varchar(255) NOT NULL,
  account_number varchar(50) NOT NULL,
  account_holder_name varchar(255) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create deposit requests table
CREATE TABLE IF NOT EXISTS deposit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount decimal(12, 2) NOT NULL,
  transaction_id varchar(255) NOT NULL,
  bank_name varchar(255) NOT NULL,
  status varchar(20) DEFAULT 'pending',
  admin_notes text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create withdraw requests table
CREATE TABLE IF NOT EXISTS withdraw_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount decimal(12, 2) NOT NULL,
  bank_account_id uuid REFERENCES bank_accounts(id),
  status varchar(20) DEFAULT 'pending',
  admin_notes text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create exchange requests table
CREATE TABLE IF NOT EXISTS exchange_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  from_currency varchar(3) NOT NULL,
  to_currency varchar(3) NOT NULL,
  amount decimal(12, 2) NOT NULL,
  receive_amount decimal(12, 2) NOT NULL,
  exchange_rate decimal(10, 4) NOT NULL,
  charges decimal(12, 2) NOT NULL,
  status varchar(20) DEFAULT 'pending',
  admin_notes text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table for complete history
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type varchar(20) NOT NULL, -- deposit, withdraw, exchange
  amount decimal(12, 2) NOT NULL,
  currency varchar(3) NOT NULL,
  status varchar(20) DEFAULT 'pending',
  reference_id uuid, -- references to specific request tables
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdraw_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for wallets
CREATE POLICY "Users can view own wallet"
  ON wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
  ON wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for bank accounts
CREATE POLICY "Users can view own bank accounts"
  ON bank_accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank accounts"
  ON bank_accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank accounts"
  ON bank_accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for deposit requests
CREATE POLICY "Users can view own deposit requests"
  ON deposit_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deposit requests"
  ON deposit_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for withdraw requests
CREATE POLICY "Users can view own withdraw requests"
  ON withdraw_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdraw requests"
  ON withdraw_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for exchange requests
CREATE POLICY "Users can view own exchange requests"
  ON exchange_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exchange requests"
  ON exchange_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create wallet for new users
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id, bdt_balance, inr_balance)
  VALUES (NEW.id, 0.00, 0.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create wallet when user signs up
DROP TRIGGER IF EXISTS create_wallet_trigger ON auth.users;
CREATE TRIGGER create_wallet_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_wallet();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdraw_requests_user_id ON withdraw_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_user_id ON exchange_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);