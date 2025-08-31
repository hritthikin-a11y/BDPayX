-- Properly fix foreign key constraints to reference auth.users
-- Drop ALL existing foreign key constraints that might be pointing to wrong tables

-- Drop existing foreign key constraints (if they exist)
DO $$ 
BEGIN
    -- Drop user_profiles constraints
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_profiles_user_id_fkey') THEN
        ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_user_id_fkey;
    END IF;
    
    -- Drop wallets constraints
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'wallets_user_id_fkey') THEN
        ALTER TABLE wallets DROP CONSTRAINT wallets_user_id_fkey;
    END IF;
    
    -- Drop user_bank_accounts constraints
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_bank_accounts_user_id_fkey') THEN
        ALTER TABLE user_bank_accounts DROP CONSTRAINT user_bank_accounts_user_id_fkey;
    END IF;
    
    -- Drop transactions constraints
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'transactions_user_id_fkey') THEN
        ALTER TABLE transactions DROP CONSTRAINT transactions_user_id_fkey;
    END IF;
    
    -- Drop deposit_requests constraints
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'deposit_requests_user_id_fkey') THEN
        ALTER TABLE deposit_requests DROP CONSTRAINT deposit_requests_user_id_fkey;
    END IF;
    
    -- Drop withdrawal_requests constraints
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'withdrawal_requests_user_id_fkey') THEN
        ALTER TABLE withdrawal_requests DROP CONSTRAINT withdrawal_requests_user_id_fkey;
    END IF;
    
    -- Drop exchange_requests constraints
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'exchange_requests_user_id_fkey') THEN
        ALTER TABLE exchange_requests DROP CONSTRAINT exchange_requests_user_id_fkey;
    END IF;
END $$;

-- Add correct foreign key constraints referencing auth.users(id)
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE wallets 
ADD CONSTRAINT wallets_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_bank_accounts 
ADD CONSTRAINT user_bank_accounts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE transactions 
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE deposit_requests 
ADD CONSTRAINT deposit_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE withdrawal_requests 
ADD CONSTRAINT withdrawal_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE exchange_requests 
ADD CONSTRAINT exchange_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;