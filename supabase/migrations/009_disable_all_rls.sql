-- Remove all RLS policies and disable RLS completely to debug auth issues

-- Disable RLS on all tables
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bank_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_bank_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_requests DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can insert own wallet" ON public.wallets;

DROP POLICY IF EXISTS "Users can view own bank accounts" ON public.user_bank_accounts;
DROP POLICY IF EXISTS "Users can insert own bank accounts" ON public.user_bank_accounts;
DROP POLICY IF EXISTS "Users can update own bank accounts" ON public.user_bank_accounts;
DROP POLICY IF EXISTS "Users can delete own bank accounts" ON public.user_bank_accounts;

DROP POLICY IF EXISTS "Everyone can view admin bank accounts" ON public.admin_bank_accounts;
DROP POLICY IF EXISTS "Everyone can view exchange rates" ON public.exchange_rates;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;

DROP POLICY IF EXISTS "Users can view own deposit requests" ON public.deposit_requests;
DROP POLICY IF EXISTS "Users can insert own deposit requests" ON public.deposit_requests;

DROP POLICY IF EXISTS "Users can view own withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Users can insert own withdrawal requests" ON public.withdrawal_requests;

DROP POLICY IF EXISTS "Users can view own exchange requests" ON public.exchange_requests;
DROP POLICY IF EXISTS "Users can insert own exchange requests" ON public.exchange_requests;