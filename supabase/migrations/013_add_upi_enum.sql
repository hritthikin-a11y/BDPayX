-- Add UPI to bank_type enum
-- This needs to be in a separate transaction

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'UPI' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'bank_type')) THEN
    ALTER TYPE bank_type ADD VALUE 'UPI';
  END IF;
END $$;
