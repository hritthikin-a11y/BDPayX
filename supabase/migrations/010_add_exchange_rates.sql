-- Add some initial exchange rates for the app
INSERT INTO exchange_rates (from_currency, to_currency, rate, created_at, updated_at) VALUES
('BDT', 'INR', 0.62, now(), now()),
('INR', 'BDT', 1.61, now(), now()),
('USD', 'BDT', 110.0, now(), now()),
('BDT', 'USD', 0.0091, now(), now()),
('USD', 'INR', 83.0, now(), now()),
('INR', 'USD', 0.012, now(), now())
ON CONFLICT (from_currency, to_currency) DO UPDATE SET
  rate = EXCLUDED.rate,
  updated_at = now();
