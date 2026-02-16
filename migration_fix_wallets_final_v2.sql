-- 1. Wipe ALL existing policies on wallets using Dynamic SQL
-- This ensures no hidden/mistyped policies remain
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'wallets' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON wallets', pol.policyname);
    END LOOP;
END $$;

-- 2. Wipe policies on trips just in case (optional, but good for consistency)
-- DO $$
-- DECLARE
--     pol record;
-- BEGIN
--     FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'trips' LOOP
--         EXECUTE format('DROP POLICY IF EXISTS %I ON trips', pol.policyname);
--     END LOOP;
-- END $$;
-- Note: Keeping trips policies as they seem to work, focusing on wallets.

-- 3. Redefine the trigger function with explicit security settings
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
  -- SECURITY DEFINER allows this to bypass RLS
  INSERT INTO public.wallets (name, budget, trip_id, included_in_division)
  VALUES ('Carteira Principal', 0, new_trip_id, true);

  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 4. Ensure ownership (Try/Catch in case user isn't superuser, but usually works in Dashboard)
DO $$
BEGIN
  ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore if we can't change owner, hope SECURITY DEFINER works with current user
END $$;

-- 5. Re-bind Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Re-enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- 7. Create STANDARD policies for Wallets (User access)
-- Select
CREATE POLICY "Users can select wallets for own trips" ON wallets
FOR SELECT USING (
  trip_id IN (
    SELECT id FROM trips WHERE user_id = auth.uid()
  )
);

-- Insert
CREATE POLICY "Users can insert wallets for own trips" ON wallets
FOR INSERT WITH CHECK (
  trip_id IN (
    SELECT id FROM trips WHERE user_id = auth.uid()
  )
);

-- Update
CREATE POLICY "Users can update wallets for own trips" ON wallets
FOR UPDATE USING (
  trip_id IN (
    SELECT id FROM trips WHERE user_id = auth.uid()
  )
);

-- Delete
CREATE POLICY "Users can delete wallets for own trips" ON wallets
FOR DELETE USING (
  trip_id IN (
    SELECT id FROM trips WHERE user_id = auth.uid()
  )
);
