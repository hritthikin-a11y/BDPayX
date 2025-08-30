-- Simple RLS policies for money exchange app

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wallets Policies
CREATE POLICY "Users can view their own wallet" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Auto-create wallet on registration" ON public.wallets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Bank Accounts Policies
CREATE POLICY "Users can manage their own bank accounts" ON public.user_bank_accounts
    FOR ALL USING (auth.uid() = user_id);

-- Admin Bank Accounts Policies
CREATE POLICY "Users can view active admin bank accounts" ON public.admin_bank_accounts
    FOR SELECT USING (is_active = true);

-- Exchange Rates Policies
CREATE POLICY "Everyone can view active exchange rates" ON public.exchange_rates
    FOR SELECT USING (is_active = true);

-- Transactions Policies
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Deposit Requests Policies
CREATE POLICY "Users can view their own deposit requests" ON public.deposit_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create deposit requests" ON public.deposit_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Withdrawal Requests Policies
CREATE POLICY "Users can view their own withdrawal requests" ON public.withdrawal_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create withdrawal requests" ON public.withdrawal_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Exchange Requests Policies
CREATE POLICY "Users can view their own exchange requests" ON public.exchange_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create exchange requests" ON public.exchange_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);