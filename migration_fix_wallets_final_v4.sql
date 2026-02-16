-- 1. Wipe ALL existing policies on wallets (Clean slate V4)
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'wallets' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON wallets', pol.policyname);
    END LOOP;
END $$;

-- 2. Redefine the trigger function to set a session variable
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  new_trip_id UUID;
BEGIN
  -- Set a local variable to indicate system context
  -- This allows us to bypass RLS policies that check for this variable
  PERFORM set_config('app.bypass_rls', 'true', true);

  -- Create Profile
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');

  -- Create Default Trip
  INSERT INTO public.trips (name, user_id)
  VALUES ('Minha Primeira Viagem', new.id)
  RETURNING id INTO new_trip_id;

  -- Create Default Wallet
  -- The policy on wallets will check for app.bypass_rls = 'true'
  INSERT INTO public.wallets (name, budget, trip_id, included_in_division)
  VALUES ('Carteira Principal', 0, new_trip_id, true);

  RETURN new;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- 3. Trigger Binding (Reset)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- 5. [CRITICAL FIX] Create BYPASS policy for System/Trigger
CREATE POLICY "Allow system bypass" ON wallets
FOR ALL
USING (current_setting('app.bypass_rls', true) = 'true')
WITH CHECK (current_setting('app.bypass_rls', true) = 'true');

-- 6. Create STANDARD policies for Users
-- Only apply these if NOT bypassing (though OR logic handles it, explicit separate policies is cleaner)

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
