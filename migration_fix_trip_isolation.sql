-- 1. Drop existing permissive policies
DROP POLICY IF EXISTS "Public read trips" ON trips;
DROP POLICY IF EXISTS "Public insert trips" ON trips;
DROP POLICY IF EXISTS "Public update trips" ON trips;
DROP POLICY IF EXISTS "Users can insert own trips" ON trips; -- Drop this if it exists from previous attempts

-- 2. Create strict policies
-- Allow users to see only their own trips
CREATE POLICY "Users can only see own trips"
ON trips FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own trips
CREATE POLICY "Users can insert own trips"
ON trips FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own trips
CREATE POLICY "Users can update own trips"
ON trips FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete their own trips
CREATE POLICY "Users can delete own trips"
ON trips FOR DELETE
USING (auth.uid() = user_id);
