-- Add is_trending field to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_trending boolean DEFAULT false;

-- Add comment
COMMENT ON COLUMN products.is_trending IS 'Whether this product should appear in the Trending Packages section on the homepage';



