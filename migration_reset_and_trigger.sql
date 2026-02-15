-- 1. Reset all trip data (WARNING: THIS DELETES ALL TRIPS, WALLETS, TRANSACTIONS)
TRUNCATE TABLE trips CASCADE;

-- 2. Update the handle_new_user trigger function to create a default trip and wallet
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  new_trip_id UUID;
BEGIN
  -- Create Profile
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');

  -- Create Default Trip for the new user
  INSERT INTO public.trips (name, user_id)
  VALUES ('Minha Primeira Viagem', new.id)
  RETURNING id INTO new_trip_id;

  -- Create Default Wallet for the new trip
  INSERT INTO public.wallets (name, budget, trip_id, included_in_division)
  VALUES ('Carteira Principal', 0, new_trip_id, true);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
