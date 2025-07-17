-- Add new columns to materials table for multi-step form
ALTER TABLE public.materials 
ADD COLUMN heat_number TEXT,
ADD COLUMN make TEXT,
ADD COLUMN pipe_type TEXT CHECK (pipe_type IN ('OD', 'NB')),
ADD COLUMN bar_shape TEXT CHECK (bar_shape IN ('Round', 'Square', 'Hex')),
ADD COLUMN diameter NUMERIC,
ADD COLUMN no_of_sheets INTEGER,
ADD COLUMN batch_weight NUMERIC,
ADD COLUMN size_description TEXT;