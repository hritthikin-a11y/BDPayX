-- Add is_active column to bank_accounts table
ALTER TABLE public.bank_accounts 
ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_bank_accounts_is_active ON public.bank_accounts(is_active);

-- Update RLS policies to include is_active filter
DROP POLICY IF EXISTS "Users can view their own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can view their own bank accounts" ON public.bank_accounts 
  FOR SELECT USING (auth.uid() = user_id AND is_active = true);