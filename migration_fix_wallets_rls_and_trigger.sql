-- 1. Ensure the trigger function is SECURITY DEFINER (Bypass RLS)
-- This is critical for creating default data for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  new_trip_id UUID;
BEGIN
  -- Create Profile
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');

  -- Create Default Trip
  INSERT INTO public.trips (name, user_id)
  VALUES ('Minha Primeira Viagem', new.id)
  RETURNING id INTO new_trip_id;

  -- Create Default Wallet
  INSERT INTO public.wallets (name, budget, trip_id, included_in_division)
  VALUES ('Carteira Principal', 0, new_trip_id, true);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix Wallets RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Drop generic policies to be more specific
DROP POLICY IF EXISTS "Users can manage wallets in their trips" ON wallets;
DROP POLICY IF EXISTS "Users can insert wallets for own trips" ON wallets;
DROP POLICY IF EXISTS "Users can select wallets for own trips" ON wallets;
DROP POLICY IF EXISTS "Users can update wallets for own trips" ON wallets;
DROP POLICY IF EXISTS "Users can delete wallets for own trips" ON wallets;
DROP POLICY IF EXISTS "Users can manage own wallets" ON wallets;


-- Allow users to select wallets if they own the trip
CREATE POLICY "Users can select wallets for own trips" ON wallets
FOR SELECT USING (
  trip_id IN (
    SELECT id FROM trips WHERE user_id = auth.uid()
  )
);

-- Allow users to insert wallets if they own the trip
-- Note: triggers with SECURITY DEFINER will bypass this
CREATE POLICY "Users can insert wallets for own trips" ON wallets
FOR INSERT WITH CHECK (
  trip_id IN (
    SELECT id FROM trips WHERE user_id = auth.uid()
  )
);

-- Allow users to update wallets if they own the trip
CREATE POLICY "Users can update wallets for own trips" ON wallets
FOR UPDATE USING (
  trip_id IN (
    SELECT id FROM trips WHERE user_id = auth.uid()
  )
);

-- Allow users to delete wallets if they own the trip
CREATE POLICY "Users can delete wallets for own trips" ON wallets
FOR DELETE USING (
  trip_id IN (
    SELECT id FROM trips WHERE user_id = auth.uid()
  )
);
