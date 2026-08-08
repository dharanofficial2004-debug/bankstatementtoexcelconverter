-- PDF uploads bucket + storage policies.
-- Run this in the Supabase SQL Editor (or via `supabase db push`).

-- 1. Create a private bucket for the original PDF files (50 MB per file max).
insert into storage.buckets (id, name, public, file_size_limit)
values ('pdf-uploads', 'pdf-uploads', false, 52428800)
on conflict (id) do nothing;

-- 2. Allow anonymous + signed-in users to upload PDFs into the bucket.
drop policy if exists "pdf-uploads: allow inserts" on storage.objects;
create policy "pdf-uploads: allow inserts"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'pdf-uploads');

-- 3. Allow reading files from the bucket.
drop policy if exists "pdf-uploads: allow selects" on storage.objects;
create policy "pdf-uploads: allow selects"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'pdf-uploads');

-- 4. Allow signed-in users to delete files they uploaded.
drop policy if exists "pdf-uploads: allow deletes" on storage.objects;
create policy "pdf-uploads: allow deletes"
on storage.objects for delete
to authenticated
using (bucket_id = 'pdf-uploads' and owner = auth.uid());
