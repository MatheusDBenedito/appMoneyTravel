-- Add payment_method to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add location to exchanges
ALTER TABLE exchanges ADD COLUMN IF NOT EXISTS location TEXT;
