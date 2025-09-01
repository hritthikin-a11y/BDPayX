-- Enhanced Banking Schema - Add additional banking fields
-- Supports UPI, bKash, Nagad, Rocket, and traditional banks for both Bangladesh and India

-- Add new columns to user_bank_accounts table
ALTER TABLE public.user_bank_accounts 
ADD COLUMN IF NOT EXISTS branch_name character varying,
ADD COLUMN IF NOT EXISTS routing_number character varying, -- Bangladesh routing number or similar
ADD COLUMN IF NOT EXISTS ifsc_code character varying, -- India IFSC code
ADD COLUMN IF NOT EXISTS swift_code character varying, -- International transfers
ADD COLUMN IF NOT EXISTS upi_id character varying, -- For UPI payments (like user@paytm)
ADD COLUMN IF NOT EXISTS mobile_number character varying, -- For bKash, Nagad, Rocket
ADD COLUMN IF NOT EXISTS bank_address text,
ADD COLUMN IF NOT EXISTS zipcode character varying;

-- Add new columns to admin_bank_accounts table
ALTER TABLE public.admin_bank_accounts 
ADD COLUMN IF NOT EXISTS branch_name character varying,
ADD COLUMN IF NOT EXISTS routing_number character varying,
ADD COLUMN IF NOT EXISTS ifsc_code character varying,
ADD COLUMN IF NOT EXISTS swift_code character varying,
ADD COLUMN IF NOT EXISTS upi_id character varying,
ADD COLUMN IF NOT EXISTS mobile_number character varying,
ADD COLUMN IF NOT EXISTS bank_address text,
ADD COLUMN IF NOT EXISTS zipcode character varying,
ADD COLUMN IF NOT EXISTS daily_limit numeric DEFAULT 1000000.00,
ADD COLUMN IF NOT EXISTS monthly_limit numeric DEFAULT 30000000.00;

-- Make account_number optional for UPI accounts
ALTER TABLE public.user_bank_accounts ALTER COLUMN account_number DROP NOT NULL;
ALTER TABLE public.user_bank_accounts ALTER COLUMN bank_name DROP NOT NULL;
ALTER TABLE public.admin_bank_accounts ALTER COLUMN account_number DROP NOT NULL;
ALTER TABLE public.admin_bank_accounts ALTER COLUMN bank_name DROP NOT NULL;

-- Update existing mobile financial service accounts to use mobile_number field
UPDATE public.user_bank_accounts 
SET mobile_number = account_number 
WHERE bank_type IN ('BKASH', 'NAGAD', 'ROCKET') AND mobile_number IS NULL;

UPDATE public.admin_bank_accounts 
SET mobile_number = account_number 
WHERE bank_type IN ('BKASH', 'NAGAD', 'ROCKET') AND mobile_number IS NULL;

-- Add sample admin accounts for enhanced banking
INSERT INTO public.admin_bank_accounts (
  account_name, bank_type, currency, mobile_number, is_active
) VALUES 
  ('BDPayX bKash', 'BKASH', 'BDT', '01700000000', true),
  ('BDPayX Nagad', 'NAGAD', 'BDT', '01800000000', true),
  ('BDPayX Rocket', 'ROCKET', 'BDT', '01900000000', true)
ON CONFLICT DO NOTHING;

-- Add UPI admin account
INSERT INTO public.admin_bank_accounts (
  account_name, bank_type, currency, upi_id, is_active
) VALUES 
  ('BDPayX PayTM', 'UPI', 'INR', 'bdpayx@paytm', true)
ON CONFLICT DO NOTHING;

-- Add traditional bank accounts
INSERT INTO public.admin_bank_accounts (
  account_name, account_number, bank_name, bank_type, currency, 
  routing_number, branch_name, is_active
) VALUES 
  ('BDPayX Islami Bank', '1234567890', 'Islami Bank Bangladesh', 'BANK', 'BDT', 
   '125261203', 'Dhanmondi Branch', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.admin_bank_accounts (
  account_name, account_number, bank_name, bank_type, currency,
  ifsc_code, branch_name, is_active
) VALUES 
  ('BDPayX SBI', '987654321012', 'State Bank of India', 'BANK', 'INR',
   'SBIN0001234', 'Delhi Main Branch', true)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_bank_accounts_bank_type ON public.user_bank_accounts(bank_type);
CREATE INDEX IF NOT EXISTS idx_user_bank_accounts_mobile_number ON public.user_bank_accounts(mobile_number);
CREATE INDEX IF NOT EXISTS idx_user_bank_accounts_upi_id ON public.user_bank_accounts(upi_id);
CREATE INDEX IF NOT EXISTS idx_admin_bank_accounts_bank_type ON public.admin_bank_accounts(bank_type);
CREATE INDEX IF NOT EXISTS idx_admin_bank_accounts_mobile_number ON public.admin_bank_accounts(mobile_number);
CREATE INDEX IF NOT EXISTS idx_admin_bank_accounts_upi_id ON public.admin_bank_accounts(upi_id);

-- Add comments for documentation
COMMENT ON COLUMN public.user_bank_accounts.upi_id IS 'UPI ID for Indian UPI payments (e.g., user@paytm)';
COMMENT ON COLUMN public.user_bank_accounts.mobile_number IS 'Mobile number for bKash, Nagad, Rocket';
COMMENT ON COLUMN public.user_bank_accounts.ifsc_code IS 'IFSC code for Indian banks';
COMMENT ON COLUMN public.user_bank_accounts.routing_number IS 'Routing number for Bangladesh banks or similar codes';
COMMENT ON COLUMN public.user_bank_accounts.branch_name IS 'Bank branch name';
COMMENT ON COLUMN public.user_bank_accounts.swift_code IS 'SWIFT code for international transfers';
