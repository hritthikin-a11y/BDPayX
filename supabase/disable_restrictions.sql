-- Disable RLS on all tables
ALTER TABLE public.bank_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdraw_requests DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users
GRANT ALL ON public.bank_accounts TO authenticated;
GRANT ALL ON public.deposit_requests TO authenticated;
GRANT ALL ON public.exchange_requests TO authenticated;
GRANT ALL ON public.transactions TO authenticated;
GRANT ALL ON public.wallets TO authenticated;
GRANT ALL ON public.withdraw_requests TO authenticated;

-- Grant usage on auth schema to authenticated users
GRANT USAGE ON SCHEMA auth TO authenticated;

-- Grant select on auth.users to authenticated users
GRANT SELECT ON auth.users TO authenticated;