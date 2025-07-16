-- Create locations table for warehouse management
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create materials table for steel products catalog
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  grade TEXT NOT NULL, -- 304, 316, 202, etc.
  category TEXT NOT NULL, -- Sheet, Pipe, Rod, etc.
  thickness DECIMAL(10,3),
  width DECIMAL(10,3),
  length DECIMAL(10,3),
  finish TEXT, -- BA, 2B, HL, etc.
  unit TEXT NOT NULL DEFAULT 'MT', -- MT, KG, PCS
  base_price DECIMAL(12,2),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory table for stock tracking
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  quantity DECIMAL(12,3) NOT NULL DEFAULT 0,
  quality_grade TEXT NOT NULL DEFAULT 'A', -- A, B, Rejection
  unit_cost DECIMAL(12,2),
  reserved_quantity DECIMAL(12,3) NOT NULL DEFAULT 0,
  available_quantity DECIMAL(12,3) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(material_id, location_id, quality_grade)
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  gst_number TEXT,
  credit_days INTEGER DEFAULT 0,
  credit_limit DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  gst_number TEXT,
  payment_terms TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotations table
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  grand_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  valid_until DATE,
  terms_conditions TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, accepted, expired
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotation_items table
CREATE TABLE public.quotation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  quantity DECIMAL(12,3) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for stock movements
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- in, out, transfer, adjustment
  quantity DECIMAL(12,3) NOT NULL,
  quality_grade TEXT NOT NULL DEFAULT 'A',
  unit_cost DECIMAL(12,2),
  reference_type TEXT, -- quotation, purchase_order, sales_order, manual
  reference_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase_orders table
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  po_number TEXT UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, received, cancelled
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales_orders table
CREATE TABLE public.sales_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  so_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES public.quotations(id),
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, delivered, cancelled
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for fast queries
CREATE INDEX idx_materials_grade ON public.materials(grade);
CREATE INDEX idx_materials_category ON public.materials(category);
CREATE INDEX idx_materials_sku ON public.materials(sku);
CREATE INDEX idx_inventory_material_location ON public.inventory(material_id, location_id);
CREATE INDEX idx_inventory_available_qty ON public.inventory(available_quantity);
CREATE INDEX idx_transactions_material_id ON public.transactions(material_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX idx_quotations_customer_id ON public.quotations(customer_id);
CREATE INDEX idx_quotations_status ON public.quotations(status);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_orders_updated_at
  BEFORE UPDATE ON public.sales_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-generate SKU
CREATE OR REPLACE FUNCTION public.generate_sku(
  p_grade TEXT,
  p_category TEXT,
  p_thickness DECIMAL DEFAULT NULL,
  p_width DECIMAL DEFAULT NULL
) RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Function to update inventory after transactions
CREATE OR REPLACE FUNCTION public.update_inventory_from_transaction()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for inventory updates
CREATE TRIGGER update_inventory_after_transaction
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inventory_from_transaction();

-- Enable realtime for all tables
ALTER TABLE public.materials REPLICA IDENTITY FULL;
ALTER TABLE public.inventory REPLICA IDENTITY FULL;
ALTER TABLE public.customers REPLICA IDENTITY FULL;
ALTER TABLE public.suppliers REPLICA IDENTITY FULL;
ALTER TABLE public.quotations REPLICA IDENTITY FULL;
ALTER TABLE public.quotation_items REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.locations REPLICA IDENTITY FULL;
ALTER TABLE public.purchase_orders REPLICA IDENTITY FULL;
ALTER TABLE public.sales_orders REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.materials;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.suppliers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotation_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales_orders;