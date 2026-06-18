-- TEMU Database Schema Helper
-- Execute this query in your Supabase Dashboard SQL Editor:

ALTER TABLE lansia ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
