-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ADMINT TABLE (Simple permission system)
create table if not exists admins (
  email text primary key
);

-- 2. CATEGORIES
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  sort_order int default 0,
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. PRODUCTS
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  short_desc text,
  long_desc text,
  pricing_type text check (pricing_type in ('FIXED','RANGE','AMOUNT_SERVICE_CHARGE','REQUEST_QUOTE')),
  price numeric,         -- Used for FIXED
  price_min numeric,     -- Used for RANGE and display
  price_max numeric,     -- Used for RANGE
  currency text default 'GHS',
  is_featured boolean default false,
  is_active boolean default true,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. PRODUCT IMAGES
create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 5. PRODUCT TIERS (For packages like Standard/Classic/Premium)
create table if not exists product_tiers (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  name text not null,
  price numeric not null,
  inclusions text[] default '{}',
  is_default boolean default false,
  sort_order int default 0
);

-- 6. PRODUCT PRICE ROWS (For Money Bouquets service charges)
create table if not exists product_price_rows (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  amount_min numeric,
  amount_max numeric, -- if specialized range
  service_charge numeric not null,
  notes text
);

-- 7. ADDONS
create table if not exists addons (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 8. GALLERY ITEMS
create table if not exists gallery_items (
  id uuid primary key default uuid_generate_v4(),
  title text,
  media_type text check (media_type in ('image','video')),
  url text not null,
  caption text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 9. ORDER REQUESTS
create table if not exists order_requests (
  id uuid primary key default uuid_generate_v4(),
  order_no text unique, -- Generate e.g. ORD-1234
  customer_name text,
  phone text,
  whatsapp text,
  email text,
  delivery_location text,
  event_date date,
  notes text,
  items jsonb, -- Snapshot of what they wanted
  total_estimate numeric,
  status text check (status in ('NEW','CONTACTED','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED')) default 'NEW',
  source text check (source in ('FORM','WHATSAPP','PAYMENT')) default 'FORM',
  internal_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10. FAQS
create table if not exists faqs (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  sort_order int default 0,
  is_active boolean default true
);

-- 11. POLICIES
create table if not exists policies (
  id uuid primary key default uuid_generate_v4(),
  content text not null
);

-- 12. SITE SETTINGS
create table if not exists site_settings (
  id uuid primary key default uuid_generate_v4(),
  business_name text,
  phone text,
  whatsapp_link text,
  address text,
  socials jsonb,
  seo_defaults jsonb,
  service_areas text[],
  home_sections jsonb
);

-- 13. TESTIMONIALS
create table if not exists testimonials (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  content text not null,
  rating int check (rating >= 1 and rating <= 5),
  image_url text,
  is_featured boolean default false,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ROW LEVEL SECURITY RULES

-- Enable RLS
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_tiers enable row level security;
alter table product_price_rows enable row level security;
alter table addons enable row level security;
alter table gallery_items enable row level security;
alter table order_requests enable row level security;
alter table faqs enable row level security;
alter table policies enable row level security;
alter table site_settings enable row level security;
alter table testimonials enable row level security;

-- Create a helper function to check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from admins
    where email = auth.jwt() ->> 'email'
  );
end;
$$ language plpgsql security definer;

-- POLICIES

-- Public Read Access
create policy "Public read categories" on categories for select using (true);
create policy "Public read products" on products for select using (true);
create policy "Public read product_images" on product_images for select using (true);
create policy "Public read product_tiers" on product_tiers for select using (true);
create policy "Public read product_price_rows" on product_price_rows for select using (true);
create policy "Public read addons" on addons for select using (true);
create policy "Public read gallery_items" on gallery_items for select using (true);
create policy "Public read faqs" on faqs for select using (true);
create policy "Public read policies" on policies for select using (true);
create policy "Public read site_settings" on site_settings for select using (true);
create policy "Public read testimonials" on testimonials for select using (is_active = true);

-- Admin Full Access (Insert/Update/Delete)
create policy "Admin all categories" on categories using (is_admin());
create policy "Admin all products" on products using (is_admin());
create policy "Admin all product_images" on product_images using (is_admin());
create policy "Admin all product_tiers" on product_tiers using (is_admin());
create policy "Admin all product_price_rows" on product_price_rows using (is_admin());
create policy "Admin all addons" on addons using (is_admin());
create policy "Admin all gallery_items" on gallery_items using (is_admin());
create policy "Admin all faqs" on faqs using (is_admin());
create policy "Admin all policies" on policies using (is_admin());
create policy "Admin all site_settings" on site_settings using (is_admin());
create policy "Admin all testimonials" on testimonials using (is_admin());

-- Order Requests: Public can INSERT, Admin can ALL
create policy "Public insert orders" on order_requests for insert with check (true);
create policy "Admin all orders" on order_requests using (is_admin());

-- STORAGE BUCKETS (You must create these in Supabase Dashboard manually ideally, but we can try sql to insert into storage.buckets if using supabase)
-- For this file, we assume buckets 'product-images' and 'gallery' exist and are public.

-- REALTIME
-- Enable realtime for all tables
alter publication supabase_realtime add table categories, products, product_tiers, product_price_rows, addons, gallery_items, site_settings, faqs, policies, testimonials, order_requests;
-- Note: 'order_requests' might be sensitive, consider if public needs to listen. For admin dashboard, yes.

