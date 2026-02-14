-- Add included_in_division column to wallets table
-- Default to TRUE so existing users continue to share expenses
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS included_in_division BOOLEAN DEFAULT TRUE;
