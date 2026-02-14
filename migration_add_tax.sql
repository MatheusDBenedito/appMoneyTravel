-- Add tax column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS tax NUMERIC DEFAULT 0;
