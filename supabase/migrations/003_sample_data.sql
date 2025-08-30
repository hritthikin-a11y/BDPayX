-- Simple sample data for BDT-INR exchange

-- Sample Admin Bank Accounts
INSERT INTO public.admin_bank_accounts (
    account_name, account_number, bank_name, bank_type, currency, is_active
) VALUES 
-- BDT accounts
('BDPayX bKash', '01700000000', 'bKash Limited', 'BKASH', 'BDT', true),
('BDPayX Nagad', '01800000000', 'Nagad Limited', 'NAGAD', 'BDT', true),
('BDPayX Bank', '1234567890123456', 'Dutch-Bangla Bank Limited', 'BANK', 'BDT', true),

-- INR accounts
('BDPayX India', 'IN1234567890', 'State Bank of India', 'BANK', 'INR', true);

-- Sample Exchange Rates
INSERT INTO public.exchange_rates (from_currency, to_currency, rate, is_active) VALUES 
('BDT', 'INR', 0.68, true),
('INR', 'BDT', 1.47, true);

-- Function to create wallet on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.user_profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Create wallet
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Trigger for auto-creating user data
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();