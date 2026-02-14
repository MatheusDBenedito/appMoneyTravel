-- Enable RLS on storage.objects (it is enabled by default, but good to be explicit or if we need to drop policies first)
-- Actually, we just need to add a policy for the 'avatars' bucket.

-- Policy to allow public uploads to 'avatars' bucket
create policy "Public Access to Avatars Bucket"
on storage.objects for insert
with check ( bucket_id = 'avatars' );

-- Policy to allow public updates to 'avatars' bucket (if overwriting)
create policy "Public Update to Avatars Bucket"
on storage.objects for update
with check ( bucket_id = 'avatars' );

-- Policy to allow public selects (already covered if bucket is public, but good for RLS)
create policy "Public Select from Avatars Bucket"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- Policy to allow public deletes (optional, but good for cleanup if needed)
create policy "Public Delete from Avatars Bucket"
on storage.objects for delete
using ( bucket_id = 'avatars' );
