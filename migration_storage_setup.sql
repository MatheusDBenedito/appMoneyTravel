-- 1. Create the 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access to Avatars Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public Update to Avatars Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public Select from Avatars Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete from Avatars Bucket" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Select" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- 3. Create policies for the 'avatars' bucket

-- ALLOW INSERT (Upload) for Authenticated Users
CREATE POLICY "Authenticated Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

-- ALLOW UPDATE for Authenticated Users (e.g. replace their own file)
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' );

-- ALLOW SELECT (Download/View) for Everyone (Public)
CREATE POLICY "Public Select"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'avatars' );

-- ALLOW DELETE for Authenticated Users (optional, maybe restrict to owner?)
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'avatars' );
