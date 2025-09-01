-- Fix exchange rates to support time-based rates
-- Add updated_at field and unique constraint for currency pairs

-- First, drop the existing table constraints
ALTER TABLE exchange_rates DROP CONSTRAINT IF EXISTS exchange_rates_unique_pair;

-- Clear existing data and insert fresh exchange rates with proper structure
DELETE FROM exchange_rates;

-- Add updated_at field with automatic updates
ALTER TABLE exchange_rates 
ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();

-- Add unique constraint to prevent duplicate active rates for same currency pair
ALTER TABLE exchange_rates 
ADD CONSTRAINT exchange_rates_unique_active_pair 
UNIQUE (from_currency, to_currency, is_active)
DEFERRABLE INITIALLY DEFERRED;

-- Create trigger to update updated_at field
CREATE OR REPLACE FUNCTION update_exchange_rates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_exchange_rates_updated_at ON exchange_rates;
CREATE TRIGGER update_exchange_rates_updated_at
    BEFORE UPDATE ON exchange_rates
    FOR EACH ROW
    EXECUTE FUNCTION update_exchange_rates_updated_at();

-- Insert current exchange rates (only BDT and INR)
INSERT INTO exchange_rates (from_currency, to_currency, rate, is_active, created_at, updated_at) VALUES
-- BDT to INR and vice versa only
('BDT', 'INR', 0.72, true, now(), now()),
('INR', 'BDT', 1.39, true, now(), now());

-- Create function to update exchange rates (for admin use)
CREATE OR REPLACE FUNCTION update_exchange_rate(
    p_from_currency currency_type,
    p_to_currency currency_type,
    p_new_rate numeric
)
RETURNS void AS $$
BEGIN
    -- Update existing active rate or insert new one
    INSERT INTO exchange_rates (from_currency, to_currency, rate, is_active, created_at, updated_at)
    VALUES (p_from_currency, p_to_currency, p_new_rate, true, now(), now())
    ON CONFLICT (from_currency, to_currency, is_active)
    DO UPDATE SET 
        rate = EXCLUDED.rate,
        updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Create function to get latest exchange rate
CREATE OR REPLACE FUNCTION get_latest_exchange_rate(
    p_from_currency currency_type,
    p_to_currency currency_type
)
RETURNS numeric AS $$
DECLARE
    v_rate numeric;
BEGIN
    SELECT rate INTO v_rate
    FROM exchange_rates
    WHERE from_currency = p_from_currency
    AND to_currency = p_to_currency
    AND is_active = true
    ORDER BY updated_at DESC
    LIMIT 1;
    
    RETURN COALESCE(v_rate, 0);
END;
$$ LANGUAGE plpgsql;
