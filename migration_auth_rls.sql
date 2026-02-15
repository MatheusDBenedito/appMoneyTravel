
-- Enable RLS on all tables
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_shared_categories ENABLE ROW LEVEL SECURITY;

-- TRIPS Policies
DROP POLICY IF EXISTS "Users can only see their own trips" ON trips;
CREATE POLICY "Users can only see their own trips" ON trips
    FOR ALL
    USING (user_id = auth.uid());

-- Helper function to check trip access (optional, but cleaner if reused, though subqueries are fine)

-- WALLETS Policies
DROP POLICY IF EXISTS "Users can manage wallets in their trips" ON wallets;
CREATE POLICY "Users can manage wallets in their trips" ON wallets
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = wallets.trip_id 
            AND trips.user_id = auth.uid()
        )
    );

-- TRANSACTIONS Policies
DROP POLICY IF EXISTS "Users can manage transactions in their trips" ON transactions;
CREATE POLICY "Users can manage transactions in their trips" ON transactions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = transactions.trip_id 
            AND trips.user_id = auth.uid()
        )
    );

-- EXCHANGES Policies
DROP POLICY IF EXISTS "Users can manage exchanges in their trips" ON exchanges;
CREATE POLICY "Users can manage exchanges in their trips" ON exchanges
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = exchanges.trip_id 
            AND trips.user_id = auth.uid()
        )
    );

-- CATEGORIES Policies
DROP POLICY IF EXISTS "Users can manage categories in their trips" ON categories;
CREATE POLICY "Users can manage categories in their trips" ON categories
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = categories.trip_id 
            AND trips.user_id = auth.uid()
        )
    );

-- PAYMENT METHODS Policies
DROP POLICY IF EXISTS "Users can manage payment methods in their trips" ON payment_methods;
CREATE POLICY "Users can manage payment methods in their trips" ON payment_methods
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = payment_methods.trip_id 
            AND trips.user_id = auth.uid()
        )
    );

-- AUTO SHARED CATEGORIES Policies
DROP POLICY IF EXISTS "Users can manage auto shared categories in their trips" ON auto_shared_categories;
CREATE POLICY "Users can manage auto shared categories in their trips" ON auto_shared_categories
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = auto_shared_categories.trip_id 
            AND trips.user_id = auth.uid()
        )
    );
