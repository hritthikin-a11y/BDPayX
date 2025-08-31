-- Clean fix: Remove all triggers and fix foreign keys properly
-- Handle wallet/profile creation in app code, not triggers

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS create_wallet_after_signup ON auth.users;
DROP FUNCTION IF EXISTS public.create_user_wallet();

-- Drop ALL foreign key constraints from all tables
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT conname, conrelid::regclass as table_name 
        FROM pg_constraint 
        WHERE contype = 'f' 
        AND connamespace = 'public'::regnamespace
    LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I', 
                      constraint_record.table_name, 
                      constraint_record.conname);
    END LOOP;
END $$;

-- Now add proper foreign key constraints pointing to auth.users
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.wallets 
ADD CONSTRAINT wallets_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_bank_accounts 
ADD CONSTRAINT user_bank_accounts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.deposit_requests 
ADD CONSTRAINT deposit_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.withdrawal_requests 
ADD CONSTRAINT withdrawal_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.exchange_requests 
ADD CONSTRAINT exchange_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add back the other foreign keys that are needed
ALTER TABLE public.transactions
ADD CONSTRAINT transactions_bank_account_id_fkey 
FOREIGN KEY (bank_account_id) REFERENCES public.user_bank_accounts(id);

ALTER TABLE public.transactions
ADD CONSTRAINT transactions_admin_bank_account_id_fkey 
FOREIGN KEY (admin_bank_account_id) REFERENCES public.admin_bank_accounts(id);

ALTER TABLE public.deposit_requests
ADD CONSTRAINT deposit_requests_transaction_id_fkey 
FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE;

ALTER TABLE public.deposit_requests
ADD CONSTRAINT deposit_requests_admin_bank_account_id_fkey 
FOREIGN KEY (admin_bank_account_id) REFERENCES public.admin_bank_accounts(id);

ALTER TABLE public.withdrawal_requests
ADD CONSTRAINT withdrawal_requests_transaction_id_fkey 
FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE;

ALTER TABLE public.withdrawal_requests
ADD CONSTRAINT withdrawal_requests_bank_account_id_fkey 
FOREIGN KEY (bank_account_id) REFERENCES public.user_bank_accounts(id);

ALTER TABLE public.exchange_requests
ADD CONSTRAINT exchange_requests_transaction_id_fkey 
FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE;