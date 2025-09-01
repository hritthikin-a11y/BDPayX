-- Add some initial exchange rates for the app
INSERT INTO exchange_rates (from_currency, to_currency, rate, created_at) VALUES
('BDT', 'INR', 0.72, now()),
('INR', 'BDT', 1.39, now());
