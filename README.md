# DecorSense Gifts & Surprises

Production-ready e-commerce platform built with Next.js 14, Supabase, and Tailwind CSS.

## Architecture

- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, Shadcn UI.
- **Backend**: Supabase (Postgres, Auth, Storage, Realtime).
- **State Management**: React Context (`DataProvider`) with Realtime subscriptions.
- **Data Fetching**: Hybrid (Server Components for initial load, Client for interactions).

## Folder Structure

- `/app`: App Router pages (Public and Admin).
- `/components`: Reusable UI components.
  - `/ui`: Shadcn primitives.
  - `/home`, `/shop`, `/admin`: Feature-specific components.
- `/lib`: Utilities and Supabase clients.
- `/db`: SQL migrations and seeds.

## Setup Instructions

1.  **Create Supabase Project**
    - Go to [Supabase](https://supabase.com) and create a new project.

2.  **Database Migration**
    - Copy the content of `db/01_schema.sql` and run it in the Supabase SQL Editor.
    - Copy the content of `db/02_seed.sql` (Seed) and run it to populate initial data.

3.  **Authentication & Security**
    - Go to Authentication -> Providers -> Email and ensure it is enabled.
    - Go to the `admins` table in Table Editor and manually insert your email address to grant yourself admin access.
      ```sql
      INSERT INTO admins (email) VALUES ('your-email@example.com');
      ```
    - **Storage**: Create two public buckets named `product-images` and `gallery`.

4.  **Environment Variables**
    - Create a `.env.local` file in the project root
    - Copy the format from `.env.local.example` (if exists) or see `SUPABASE_SETUP.md`
    - Fill in your Supabase URL, Anon Key, and Service Role Key.

5.  **Run Locally**
    ```bash
    npm install
    npm run dev
    ```

## Admin Access

- Navigate to `/admin` (or `/admin/login`).
- Log in with magic link or password (configure in Supabase Auth).
- Ensure your email is in the `admins` table.

## Features

- **Realtime**: Changes in Admin dashboard reflect immediately on the storefront.
- **WhatsApp Order**: Custom message generation for orders.
- **Dynamic Pricing**: Support for Fixed, Range, and Service Charge pricing models.
