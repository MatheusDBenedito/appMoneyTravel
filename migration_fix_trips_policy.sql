-- Ensure users can insert their own trips
DROP POLICY IF EXISTS "Users can insert own trips" ON trips;

CREATE POLICY "Users can insert own trips" ON trips
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Ensure generated columns work
ALTER TABLE trips ALTER COLUMN user_id SET DEFAULT auth.uid();
