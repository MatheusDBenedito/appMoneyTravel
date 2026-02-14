-- Add avatar_url to wallets
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS avatar_url TEXT;
