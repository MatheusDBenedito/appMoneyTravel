-- Add type column to transactions table (expense or income)
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expense';

-- Add check constraint to ensure valid types
ALTER TABLE transactions 
ADD CONSTRAINT transactions_type_check CHECK (type IN ('expense', 'income'));
