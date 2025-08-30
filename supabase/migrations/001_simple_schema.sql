-- Simple production-grade money exchange schema
-- Focused on BDT and INR exchange

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
DO $$ BEGIN
    CREATE TYPE public.transaction_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.currency_type AS ENUM ('BDT', 'INR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.bank_type AS ENUM ('BKASH', 'NAGAD', 'ROCKET', 'BANK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    
    -- KYC status
    is_verified BOOLEAN DEFAULT FALSE,
    kyc_status VARCHAR(20) DEFAULT 'UNVERIFIED',
    
    -- Limits
    daily_deposit_limit DECIMAL(15,2) DEFAULT 100000.00,
    daily_withdrawal_limit DECIMAL(15,2) DEFAULT 50000.00,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallets table with BDT and INR
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    bdt_balance DECIMAL(15,2) DEFAULT 0.00 CHECK (bdt_balance >= 0),
    inr_balance DECIMAL(15,2) DEFAULT 0.00 CHECK (inr_balance >= 0),
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User bank accounts
CREATE TABLE IF NOT EXISTS public.user_bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    bank_type public.bank_type NOT NULL DEFAULT 'BANK',
    
    currency public.currency_type NOT NULL DEFAULT 'BDT',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin bank accounts
CREATE TABLE IF NOT EXISTS public.admin_bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    bank_type public.bank_type NOT NULL,
    
    currency public.currency_type NOT NULL DEFAULT 'BDT',
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Exchange rates
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    from_currency public.currency_type NOT NULL,
    to_currency public.currency_type NOT NULL,
    rate DECIMAL(10,6) NOT NULL CHECK (rate > 0),
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT different_currencies CHECK (from_currency != to_currency)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    type VARCHAR(20) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'EXCHANGE')),
    status public.transaction_status DEFAULT 'PENDING',
    
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency public.currency_type NOT NULL,
    
    -- Exchange specific
    from_currency public.currency_type,
    to_currency public.currency_type,
    exchange_rate DECIMAL(10,6),
    converted_amount DECIMAL(15,2),
    
    -- References
    bank_account_id UUID REFERENCES public.user_bank_accounts(id),
    admin_bank_account_id UUID REFERENCES public.admin_bank_accounts(id),
    reference_number VARCHAR(255),
    
    -- Processing
    processed_at TIMESTAMP,
    admin_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Deposit requests
CREATE TABLE IF NOT EXISTS public.deposit_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency public.currency_type NOT NULL DEFAULT 'BDT',
    
    sender_name VARCHAR(255) NOT NULL,
    transaction_ref VARCHAR(255) NOT NULL,
    admin_bank_account_id UUID NOT NULL REFERENCES public.admin_bank_accounts(id),
    
    status public.transaction_status DEFAULT 'PENDING',
    admin_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Withdrawal requests
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency public.currency_type NOT NULL DEFAULT 'BDT',
    
    bank_account_id UUID NOT NULL REFERENCES public.user_bank_accounts(id),
    
    status public.transaction_status DEFAULT 'PENDING',
    admin_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Exchange requests
CREATE TABLE IF NOT EXISTS public.exchange_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    
    from_currency public.currency_type NOT NULL,
    to_currency public.currency_type NOT NULL,
    from_amount DECIMAL(15,2) NOT NULL CHECK (from_amount > 0),
    to_amount DECIMAL(15,2) NOT NULL CHECK (to_amount > 0),
    
    exchange_rate DECIMAL(10,6) NOT NULL,
    
    status public.transaction_status DEFAULT 'PENDING',
    admin_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT different_exchange_currencies CHECK (from_currency != to_currency)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bank_accounts_user_id ON public.user_bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON public.deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_user_id ON public.exchange_requests(user_id);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_requests ENABLE ROW LEVEL SECURITY;

-- Create update trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_user_bank_accounts_updated_at BEFORE UPDATE ON public.user_bank_accounts FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_admin_bank_accounts_updated_at BEFORE UPDATE ON public.admin_bank_accounts FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_deposit_requests_updated_at BEFORE UPDATE ON public.deposit_requests FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_withdrawal_requests_updated_at BEFORE UPDATE ON public.withdrawal_requests FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_exchange_requests_updated_at BEFORE UPDATE ON public.exchange_requests FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();