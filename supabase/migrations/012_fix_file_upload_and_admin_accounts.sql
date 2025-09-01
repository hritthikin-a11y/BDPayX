-- Fix file upload storage for deposit screenshots
-- Create storage bucket for deposit screenshots if not exists

-- Create storage bucket for deposit screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'deposit-screenshots',
    'deposit-screenshots', 
    false,
    5242880, -- 5MB limit
    '{"image/jpeg","image/png","image/jpg"}'
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for deposit screenshots
CREATE POLICY "Users can upload their own deposit screenshots" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'deposit-screenshots' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own deposit screenshots" ON storage.objects
FOR SELECT USING (
    bucket_id = 'deposit-screenshots' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Service role can access all deposit screenshots" ON storage.objects
FOR ALL USING (bucket_id = 'deposit-screenshots' AND auth.role() = 'service_role');

-- Update deposit_requests table to ensure screenshot_url field exists
ALTER TABLE deposit_requests 
ADD COLUMN IF NOT EXISTS screenshot_url text;

-- Add some sample admin bank accounts if they don't exist
INSERT INTO admin_bank_accounts (account_name, account_number, bank_name, bank_type, currency, is_active) VALUES
('BDPayX Main Account', '1234567890', 'Dutch Bangla Bank', 'BANK', 'BDT', true),
('BDPayX bKash', '01700000000', 'bKash', 'BKASH', 'BDT', true),
('BDPayX Nagad', '01800000000', 'Nagad', 'NAGAD', 'BDT', true),
('BDPayX Rocket', '01900000000', 'Rocket', 'ROCKET', 'BDT', true),
('BDPayX INR Account', '9876543210', 'State Bank of India', 'BANK', 'INR', true)
ON CONFLICT DO NOTHING;
