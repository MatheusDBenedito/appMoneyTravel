-- 1. Create trips table
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID DEFAULT auth.uid()
);

-- 2. Insert default trip if none exists
INSERT INTO trips (name)
SELECT 'Viagem Padrão'
WHERE NOT EXISTS (SELECT 1 FROM trips);

-- 3. Add trip_id columns
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES trips(id) ON DELETE CASCADE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES trips(id) ON DELETE CASCADE;
ALTER TABLE exchanges ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES trips(id) ON DELETE CASCADE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES trips(id) ON DELETE CASCADE;
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES trips(id) ON DELETE CASCADE;
ALTER TABLE auto_shared_categories ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES trips(id) ON DELETE CASCADE;

-- 4. Migrate existing data to the default trip
DO $$
DECLARE
    default_trip_id UUID;
BEGIN
    SELECT id INTO default_trip_id FROM trips WHERE name = 'Viagem Padrão' LIMIT 1;

    IF default_trip_id IS NOT NULL THEN
        UPDATE wallets SET trip_id = default_trip_id WHERE trip_id IS NULL;
        UPDATE transactions SET trip_id = default_trip_id WHERE trip_id IS NULL;
        UPDATE exchanges SET trip_id = default_trip_id WHERE trip_id IS NULL;
        UPDATE categories SET trip_id = default_trip_id WHERE trip_id IS NULL;
        UPDATE payment_methods SET trip_id = default_trip_id WHERE trip_id IS NULL;
        UPDATE auto_shared_categories SET trip_id = default_trip_id WHERE trip_id IS NULL;
    END IF;
END $$;

-- 5. Update Primary Keys to include trip_id (Composite PKs)
-- We need to drop dependent FKs first

-- Transactions -> Categories
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_category_fkey;

-- AutoShared -> Categories
ALTER TABLE auto_shared_categories DROP CONSTRAINT IF EXISTS auto_shared_categories_category_name_fkey;

-- Now update Categories PK
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE categories ADD PRIMARY KEY (name, trip_id);

-- Update Payment Methods PK
ALTER TABLE payment_methods DROP CONSTRAINT IF EXISTS payment_methods_pkey;
ALTER TABLE payment_methods ADD PRIMARY KEY (name, trip_id);

-- Restore FKs with composite keys
ALTER TABLE transactions 
ADD CONSTRAINT transactions_category_fpkey 
FOREIGN KEY (category, trip_id) 
REFERENCES categories (name, trip_id)
ON DELETE SET NULL;

ALTER TABLE auto_shared_categories
ADD CONSTRAINT auto_shared_categories_category_fpkey
FOREIGN KEY (category_name, trip_id)
REFERENCES categories (name, trip_id)
ON DELETE CASCADE;

-- 6. RLS Policies
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Allow all for now (development/public mode assumption slightly, or restricted to auth)
CREATE POLICY "Public read trips" ON trips FOR SELECT USING (true);
CREATE POLICY "Public insert trips" ON trips FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update trips" ON trips FOR UPDATE USING (true);
