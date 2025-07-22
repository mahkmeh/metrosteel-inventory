
-- Create a function to generate unique PO numbers
CREATE OR REPLACE FUNCTION public.generate_po_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  current_year INTEGER;
  next_number INTEGER;
  new_po_number TEXT;
BEGIN
  -- Get current year
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Get the next PO number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(po_number FROM 'PO-' || current_year || '-([0-9]+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.purchase_orders
  WHERE po_number ~ ('^PO-' || current_year || '-[0-9]+$');
  
  -- Format as PO-YYYY-NNN (e.g., PO-2025-001)
  new_po_number := 'PO-' || current_year || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_po_number;
END;
$$;

-- Add unique constraint on po_number if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'purchase_orders_po_number_key' 
    AND table_name = 'purchase_orders'
  ) THEN
    ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_po_number_key UNIQUE (po_number);
  END IF;
END $$;
