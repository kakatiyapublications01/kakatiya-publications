-- ==============================================================================
-- KakatiyaPulse / Kakatiya Publications - Telugu Announcements Migration
-- ==============================================================================

-- 1. Create Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies to prevent 401 / permission denied errors:
-- Allow ALL visitors (public) to view active announcements:
DROP POLICY IF EXISTS "Public can view active announcements" ON announcements;
CREATE POLICY "Public can view active announcements" 
ON announcements FOR SELECT 
USING (is_active = true);

-- Allow authenticated admin users to view all announcements (including drafts/inactive):
DROP POLICY IF EXISTS "Admins can view all announcements" ON announcements;
CREATE POLICY "Admins can view all announcements"
ON announcements FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');

-- Allow authenticated admin users to insert, update, and delete:
DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
CREATE POLICY "Admins can manage announcements" 
ON announcements FOR ALL 
TO authenticated 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- 4. Fast Query Index
CREATE INDEX IF NOT EXISTS idx_announcements_active_created ON announcements (is_active, created_at DESC);
