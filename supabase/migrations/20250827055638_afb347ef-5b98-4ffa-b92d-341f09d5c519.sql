-- Create function to generate unique sales order numbers
CREATE OR REPLACE FUNCTION public.generate_so_number()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  current_year INTEGER;
  next_number INTEGER;
  new_so_number TEXT;
BEGIN
  -- Get current year
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Get the next SO number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(so_number FROM 'SO-' || current_year || '-([0-9]+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.sales_orders
  WHERE so_number ~ ('^SO-' || current_year || '-[0-9]+$');
  
  -- Format as SO-YYYY-NNN (e.g., SO-2025-001)
  new_so_number := 'SO-' || current_year || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_so_number;
END;
$function$