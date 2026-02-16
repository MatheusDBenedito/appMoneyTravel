-- 1. Wipe ALL existing policies on wallets (Clean slate V3)
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'wallets' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON wallets', pol.policyname);
    END LOOP;
END $$;

-- 2. Redefine the trigger function (just to be safe and ensure owner)
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
  INSERT INTO public.wallets (name, budget, trip_id, included_in_division)
  VALUES ('Carteira Principal', 0, new_trip_id, true);

  RETURN new;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- 3. Trigger Binding
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- 5. [CRITICAL FIX] Create EXPLICIT policies for the 'postgres' role (and service_role)
-- This ensures that even if BYPASS RLS is acting up, the owner can act.
CREATE POLICY "Allow postgres full access" ON wallets
TO postgres, service_role
USING (true)
WITH CHECK (true);

-- 6. Create STANDARD policies for Users
CREATE POLICY "Users can select wallets for own trips" ON wallets
FOR SELECT USING (
  trip_id IN (
    SELECT id FROM trips WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert wallets for own trips" ON wallets
FOR INSERT WITH CHECK (
  trip_id IN (
    SELECT id FROM trips WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update wallets for own trips" ON wallets
FOR UPDATE USING (
  trip_id IN (
    SELECT id FROM trips WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete wallets for own trips" ON wallets
FOR DELETE USING (
  trip_id IN (
    SELECT id FROM trips WHERE user_id = auth.uid()
  )
);
