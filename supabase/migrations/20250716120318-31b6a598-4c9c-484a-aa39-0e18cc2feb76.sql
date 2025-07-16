-- Add batch_no field to materials table for tracking batches in sheets and pipes
ALTER TABLE public.materials 
ADD COLUMN batch_no TEXT;