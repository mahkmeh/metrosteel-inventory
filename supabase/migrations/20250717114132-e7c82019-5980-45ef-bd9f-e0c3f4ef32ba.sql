-- Enable Row Level Security on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for customers table
CREATE POLICY "Allow all operations on customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

-- Create policies for inventory table
CREATE POLICY "Allow all operations on inventory" ON public.inventory FOR ALL USING (true) WITH CHECK (true);

-- Create policies for locations table
CREATE POLICY "Allow all operations on locations" ON public.locations FOR ALL USING (true) WITH CHECK (true);

-- Create policies for materials table
CREATE POLICY "Allow all operations on materials" ON public.materials FOR ALL USING (true) WITH CHECK (true);

-- Create policies for purchase_orders table
CREATE POLICY "Allow all operations on purchase_orders" ON public.purchase_orders FOR ALL USING (true) WITH CHECK (true);

-- Create policies for quotation_items table
CREATE POLICY "Allow all operations on quotation_items" ON public.quotation_items FOR ALL USING (true) WITH CHECK (true);

-- Create policies for quotations table
CREATE POLICY "Allow all operations on quotations" ON public.quotations FOR ALL USING (true) WITH CHECK (true);

-- Create policies for sales_orders table
CREATE POLICY "Allow all operations on sales_orders" ON public.sales_orders FOR ALL USING (true) WITH CHECK (true);

-- Create policies for suppliers table
CREATE POLICY "Allow all operations on suppliers" ON public.suppliers FOR ALL USING (true) WITH CHECK (true);

-- Create policies for transactions table
CREATE POLICY "Allow all operations on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- Fix function security warnings by updating search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_sku(p_grade text, p_category text, p_thickness numeric DEFAULT NULL::numeric, p_width numeric DEFAULT NULL::numeric)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  base_sku TEXT;
  counter INTEGER;
  final_sku TEXT;
BEGIN
  -- Create base SKU from grade and category
  base_sku := UPPER(p_grade) || '-' || UPPER(LEFT(p_category, 3));
  
  -- Add dimensions if provided
  IF p_thickness IS NOT NULL THEN
    base_sku := base_sku || '-' || REPLACE(p_thickness::TEXT, '.', '');
  END IF;
  
  IF p_width IS NOT NULL THEN
    base_sku := base_sku || 'x' || REPLACE(p_width::TEXT, '.', '');
  END IF;
  
  -- Check for existing SKUs and add counter if needed
  counter := 1;
  final_sku := base_sku;
  
  WHILE EXISTS (SELECT 1 FROM public.materials WHERE sku = final_sku) LOOP
    counter := counter + 1;
    final_sku := base_sku || '-' || LPAD(counter::TEXT, 2, '0');
  END LOOP;
  
  RETURN final_sku;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_inventory_from_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update inventory quantity based on transaction type
  IF NEW.transaction_type = 'in' THEN
    INSERT INTO public.inventory (material_id, location_id, quantity, quality_grade, unit_cost)
    VALUES (NEW.material_id, NEW.location_id, NEW.quantity, NEW.quality_grade, NEW.unit_cost)
    ON CONFLICT (material_id, location_id, quality_grade)
    DO UPDATE SET 
      quantity = inventory.quantity + NEW.quantity,
      unit_cost = COALESCE(NEW.unit_cost, inventory.unit_cost),
      last_updated = now();
      
  ELSIF NEW.transaction_type = 'out' THEN
    UPDATE public.inventory 
    SET quantity = quantity - NEW.quantity,
        last_updated = now()
    WHERE material_id = NEW.material_id 
      AND location_id = NEW.location_id 
      AND quality_grade = NEW.quality_grade;
      
  ELSIF NEW.transaction_type = 'adjustment' THEN
    UPDATE public.inventory 
    SET quantity = NEW.quantity,
        last_updated = now()
    WHERE material_id = NEW.material_id 
      AND location_id = NEW.location_id 
      AND quality_grade = NEW.quality_grade;
  END IF;
  
  RETURN NEW;
END;
$$;