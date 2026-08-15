-- Migration: Create updates table for IDEA LAB Announcement & Image Updates Carousel

CREATE TABLE IF NOT EXISTS updates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tag TEXT DEFAULT 'UPDATES',
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  badge_color TEXT DEFAULT 'sky',
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) if required
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active updates
CREATE POLICY "Allow public read access to updates" 
  ON updates FOR SELECT 
  USING (true);

-- Allow all operations for authenticated/service role users
CREATE POLICY "Allow full access to updates" 
  ON updates FOR ALL 
  USING (true);
