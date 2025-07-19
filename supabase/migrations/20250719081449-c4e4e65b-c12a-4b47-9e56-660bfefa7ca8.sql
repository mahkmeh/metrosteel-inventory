-- Phase 1: Enhanced Batch Tracking System Implementation
-- Create new batches table for proper batch management

CREATE TABLE public.batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_code TEXT NOT NULL UNIQUE, -- Format: B001, B002, etc.
  sku_id UUID NOT NULL REFERENCES materials(id),
  supplier_id UUID REFERENCES suppliers(id),
  purchase_order_id UUID REFERENCES purchase_orders(id),
  
  -- Physical properties (all in KG)
  total_weight_kg NUMERIC NOT NULL DEFAULT 0,
  available_weight_kg NUMERIC NOT NULL DEFAULT 0,
  reserved_weight_kg NUMERIC NOT NULL DEFAULT 0,
  
  -- Batch characteristics
  heat_number TEXT,
  make TEXT,
  quality_grade TEXT NOT NULL DEFAULT 'A',
  compliance_status TEXT DEFAULT 'pending', -- pending, approved, rejected
  
  -- Timestamps
  manufactured_date DATE,
  received_date DATE,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'active', -- active, consumed, expired
  notes TEXT
);

-- Create location-wise batch inventory
CREATE TABLE public.batch_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES batches(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  
  -- Weight tracking (all in KG)
  quantity_kg NUMERIC NOT NULL DEFAULT 0,
  reserved_kg NUMERIC NOT NULL DEFAULT 0,
  available_kg NUMERIC GENERATED ALWAYS AS (quantity_kg - reserved_kg) STORED,
  
  -- Cost tracking
  unit_cost_per_kg NUMERIC,
  total_value NUMERIC GENERATED ALWAYS AS (quantity_kg * unit_cost_per_kg) STORED,
  
  -- Timestamps
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(batch_id, location_id)
);

-- Create job work transformation tracking
CREATE TABLE public.job_work_transformations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Job work reference
  job_work_number TEXT NOT NULL,
  contractor_id UUID NOT NULL REFERENCES suppliers(id),
  
  -- Input materials (what we sent out)
  input_batch_id UUID NOT NULL REFERENCES batches(id),
  input_weight_kg NUMERIC NOT NULL,
  input_sku_id UUID NOT NULL REFERENCES materials(id),
  
  -- Output materials (what we expect back)
  output_sku_id UUID NOT NULL REFERENCES materials(id),
  expected_output_weight_kg NUMERIC NOT NULL,
  actual_output_weight_kg NUMERIC, -- filled when received
  output_batch_id UUID REFERENCES batches(id), -- created when received
  
  -- Process details
  process_type TEXT NOT NULL, -- cutting, welding, machining, etc.
  process_description TEXT,
  
  -- Dates
  sent_date DATE NOT NULL,
  expected_return_date DATE,
  actual_return_date DATE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'sent', -- sent, in_progress, completed, received
  
  -- Financial
  processing_cost_per_kg NUMERIC,
  total_processing_cost NUMERIC,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add batch tracking to transactions
ALTER TABLE public.transactions 
ADD COLUMN batch_id UUID REFERENCES batches(id),
ADD COLUMN weight_kg NUMERIC, -- actual weight in KG
ADD COLUMN transformation_id UUID REFERENCES job_work_transformations(id);

-- Standardize materials table unit to KG
UPDATE public.materials SET unit = 'KG' WHERE unit != 'KG';
ALTER TABLE public.materials ALTER COLUMN unit SET DEFAULT 'KG';

-- Create function for batch inventory management
CREATE OR REPLACE FUNCTION public.update_batch_inventory_from_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if batch_id is provided
  IF NEW.batch_id IS NOT NULL THEN
    IF NEW.transaction_type = 'in' THEN
      -- Increase batch inventory
      INSERT INTO public.batch_inventory (batch_id, location_id, quantity_kg, unit_cost_per_kg)
      VALUES (NEW.batch_id, NEW.location_id, COALESCE(NEW.weight_kg, NEW.quantity), NEW.unit_cost)
      ON CONFLICT (batch_id, location_id)
      DO UPDATE SET 
        quantity_kg = batch_inventory.quantity_kg + COALESCE(NEW.weight_kg, NEW.quantity),
        unit_cost_per_kg = COALESCE(NEW.unit_cost, batch_inventory.unit_cost_per_kg),
        last_updated = now();
        
    ELSIF NEW.transaction_type = 'out' THEN
      -- Decrease batch inventory
      UPDATE public.batch_inventory 
      SET quantity_kg = quantity_kg - COALESCE(NEW.weight_kg, NEW.quantity),
          last_updated = now()
      WHERE batch_id = NEW.batch_id 
        AND location_id = NEW.location_id;
        
    ELSIF NEW.transaction_type = 'transfer' THEN
      -- Handle location transfers if needed in future
      NULL;
    END IF;
    
    -- Update batch totals
    UPDATE public.batches 
    SET available_weight_kg = (
      SELECT COALESCE(SUM(quantity_kg), 0) 
      FROM batch_inventory 
      WHERE batch_id = NEW.batch_id
    ),
    updated_at = now()
    WHERE id = NEW.batch_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for batch inventory updates
CREATE TRIGGER update_batch_inventory_trigger
AFTER INSERT OR UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_batch_inventory_from_transaction();

-- Create function to generate batch codes
CREATE OR REPLACE FUNCTION public.generate_batch_code()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  batch_code TEXT;
BEGIN
  -- Get the next batch number
  SELECT COALESCE(MAX(CAST(SUBSTRING(batch_code FROM 2) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.batches
  WHERE batch_code ~ '^B[0-9]+$';
  
  -- Format as B001, B002, etc.
  batch_code := 'B' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN batch_code;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for better performance
CREATE INDEX idx_batches_sku_id ON public.batches(sku_id);
CREATE INDEX idx_batches_supplier_id ON public.batches(supplier_id);
CREATE INDEX idx_batches_status ON public.batches(status);
CREATE INDEX idx_batch_inventory_batch_id ON public.batch_inventory(batch_id);
CREATE INDEX idx_batch_inventory_location_id ON public.batch_inventory(location_id);
CREATE INDEX idx_job_work_transformations_contractor_id ON public.job_work_transformations(contractor_id);
CREATE INDEX idx_job_work_transformations_status ON public.job_work_transformations(status);
CREATE INDEX idx_transactions_batch_id ON public.transactions(batch_id);

-- Enable RLS on new tables
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_work_transformations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Allow all operations on batches" ON public.batches FOR ALL USING (true);
CREATE POLICY "Allow all operations on batch_inventory" ON public.batch_inventory FOR ALL USING (true);
CREATE POLICY "Allow all operations on job_work_transformations" ON public.job_work_transformations FOR ALL USING (true);

-- Add triggers for updated_at columns
CREATE TRIGGER update_batches_updated_at
BEFORE UPDATE ON public.batches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_work_transformations_updated_at
BEFORE UPDATE ON public.job_work_transformations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();