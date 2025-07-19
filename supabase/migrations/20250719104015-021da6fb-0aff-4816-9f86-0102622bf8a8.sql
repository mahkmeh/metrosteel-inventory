
-- Fix the generate_batch_code function to resolve the ambiguous column reference
CREATE OR REPLACE FUNCTION public.generate_batch_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  new_batch_code TEXT;
BEGIN
  -- Get the next batch number by using a qualified column name
  SELECT COALESCE(MAX(CAST(SUBSTRING(batches.batch_code FROM 2) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.batches
  WHERE batches.batch_code ~ '^B[0-9]+$';
  
  -- Format as B001, B002, etc.
  new_batch_code := 'B' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_batch_code;
END;
$$;
