-- Enable realtime for occurrences table
ALTER TABLE public.occurrences REPLICA IDENTITY FULL;

-- The table is already in the supabase_realtime publication by default
-- This ensures all changes (INSERT, UPDATE, DELETE) are broadcast in real-time