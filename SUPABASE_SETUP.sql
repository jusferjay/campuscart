-- ============================================================================
-- CAMPUS CART - SUPABASE DATABASE SETUP
-- ============================================================================
-- Copy and paste ALL of this code into your Supabase SQL Editor
-- Then run it to create all necessary tables and policies
-- ============================================================================

-- 1. Create PROFILES table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text DEFAULT 'Campus',
  last_name text DEFAULT 'User',
  email text,
  role text DEFAULT 'Student',
  course text,
  year text,
  joined text,
  orders integer DEFAULT 0,
  spent integer DEFAULT 0,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id)
);

-- 2. Create USER_SETTINGS table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notif_orders boolean DEFAULT true,
  notif_promo boolean DEFAULT false,
  notif_restock boolean DEFAULT true,
  dark_mode boolean DEFAULT true,
  compact_view boolean DEFAULT false,
  activity_visible boolean DEFAULT false,
  data_analytics boolean DEFAULT true,
  two_factor boolean DEFAULT false,
  email_digest boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id)
);

-- 3. Enable Row Level Security (RLS)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for PROFILES
-- ============================================================================
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Create RLS Policies for USER_SETTINGS
-- ============================================================================
CREATE POLICY "Users can view own settings"
  ON public.user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Create Storage Bucket for Avatars (OPTIONAL - for profile pictures)
-- ============================================================================
-- Go to Storage → Create a new bucket called "avatars"
-- Set it to PUBLIC (Allow public access)
-- This will be used for profile photo uploads

-- ============================================================================
-- DONE! Your Supabase database is now ready for CampusCart.
-- ============================================================================
