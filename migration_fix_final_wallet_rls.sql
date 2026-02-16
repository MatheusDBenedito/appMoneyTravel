-- 1. Drop the function fully to ensure clean slate
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Clean up policies on wallets to ensure no ghosts
DROP POLICY IF EXISTS "Public read wallets" ON wallets;
DROP POLICY IF EXISTS "Public insert wallets" ON wallets;
DROP POLICY IF EXISTS "Public update wallets" ON wallets;
DROP POLICY IF EXISTS "Public delete wallets" ON wallets;
DROP POLICY IF EXISTS "Users can insert wallets for own trips" ON wallets;
DROP POLICY IF EXISTS "Users can manage wallets in their trips" ON wallets;
DROP POLICY IF EXISTS "Users can select wallets for own trips" ON wallets;
DROP POLICY IF EXISTS "Users can update wallets for own trips" ON wallets;
DROP POLICY IF EXISTS "Users can delete wallets for own trips" ON wallets;

-- 3. Recreate the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
SECURITY DEFINER 
SET search_path = public
AS $$
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
  -- This insert passes because of SECURITY DEFINER + Owner Permissions
  INSERT INTO public.wallets (name, budget, trip_id, included_in_division)
  VALUES ('Carteira Principal', 0, new_trip_id, true);

  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 4. FORCE ownership to postgres (standard superuser/admin in Supabase)
-- This ensures SECURITY DEFINER runs as this user
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
ALTER TABLE public.trips OWNER TO postgres;
ALTER TABLE public.wallets OWNER TO postgres;

-- 5. Bind Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Define RLS Policies for Wallets
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Allow users to SELECT wallets if they own the trip
CREATE POLICY "Users can select wallets for own trips" ON wallets
FOR SELECT USING (
  trip_id IN (
    SELECT id FROM trips WHERE user_id = auth.uid()
  )
);

-- Allow users to INSERT wallets if they own the trip
CREATE POLICY "Users can insert wallets for own trips" ON wallets
FOR INSERT WITH CHECK (
  trip_id IN (
    SELECT id FROM trips WHERE user_id = auth.uid()
  )
);

-- Allow users to UPDATE wallets if they own the trip
CREATE POLICY "Users can update wallets for own trips" ON wallets
FOR UPDATE USING (
  trip_id IN (
    SELECT id FROM trips WHERE user_id = auth.uid()
  )
);

-- Allow users to DELETE wallets if they own the trip
CREATE POLICY "Users can delete wallets for own trips" ON wallets
FOR DELETE USING (
  trip_id IN (
    SELECT id FROM trips WHERE user_id = auth.uid()
  )
);
