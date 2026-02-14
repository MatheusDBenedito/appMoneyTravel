-- Allow deleting trips
CREATE POLICY "Public delete trips" ON trips FOR DELETE USING (true);
