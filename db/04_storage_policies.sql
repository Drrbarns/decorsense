-- Storage Policies for product-images bucket
-- Run this AFTER creating the 'product-images' bucket in Supabase Storage

-- Allow authenticated users (admins) to upload files
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users (admins) to update files
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- Allow authenticated users (admins) to delete files
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- Allow public to read files (so images display on frontend)
CREATE POLICY "Public can read product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- ============================================
-- Optional: Gallery bucket policies (if you create it later)
-- ============================================
-- CREATE POLICY "Admins can upload gallery items"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'gallery');
--
-- CREATE POLICY "Admins can update gallery items"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (bucket_id = 'gallery');
--
-- CREATE POLICY "Admins can delete gallery items"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'gallery');
--
-- CREATE POLICY "Public can read gallery items"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'gallery');

