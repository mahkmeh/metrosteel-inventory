-- Fix check constraints to allow NULL values
ALTER TABLE public.materials 
DROP CONSTRAINT IF EXISTS materials_pipe_type_check,
DROP CONSTRAINT IF EXISTS materials_bar_shape_check;

-- Add new constraints that allow NULL values
ALTER TABLE public.materials 
ADD CONSTRAINT materials_pipe_type_check CHECK (pipe_type IS NULL OR pipe_type IN ('OD', 'NB')),
ADD CONSTRAINT materials_bar_shape_check CHECK (bar_shape IS NULL OR bar_shape IN ('Round', 'Square', 'Hex'));