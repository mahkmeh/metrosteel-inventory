-- Add concerned_person column to quotations table if it doesn't exist
ALTER TABLE public.quotations 
ADD COLUMN IF NOT EXISTS concerned_person TEXT;