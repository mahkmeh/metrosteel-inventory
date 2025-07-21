
-- Add total_value column to inventory table for WAC
ALTER TABLE public.inventory 
ADD COLUMN total_value DECIMAL(12,2) DEFAULT 0;

-- Update existing inventory records to calculate initial total_value
UPDATE public.inventory 
SET total_value = quantity * COALESCE(unit_cost, 0)
WHERE total_value IS NULL OR total_value = 0;

-- Drop the existing trigger that updates inventory
DROP TRIGGER IF EXISTS update_inventory_after_transaction ON public.transactions;

-- Create new WAC function to replace the old inventory update function
CREATE OR REPLACE FUNCTION public.update_inventory_wac_from_transaction()
RETURNS TRIGGER AS $$
DECLARE
  current_qty DECIMAL(12,3);
  current_value DECIMAL(12,2);
  new_avg_cost DECIMAL(12,2);
  proportional_value DECIMAL(12,2);
BEGIN
  -- Update inventory using Weighted Average Costing based on transaction type
  IF NEW.transaction_type = 'in' THEN
    -- Get current inventory for this material/location/grade
    SELECT quantity, total_value 
    INTO current_qty, current_value
    FROM public.inventory 
    WHERE material_id = NEW.material_id 
      AND location_id = NEW.location_id 
      AND quality_grade = NEW.quality_grade;
    
    -- Default values if no existing inventory
    current_qty := COALESCE(current_qty, 0);
    current_value := COALESCE(current_value, 0);
    
    -- Calculate new weighted average cost
    IF (current_qty + NEW.quantity) > 0 THEN
      new_avg_cost := (current_value + (NEW.quantity * COALESCE(NEW.unit_cost, 0))) / (current_qty + NEW.quantity);
    ELSE
      new_avg_cost := COALESCE(NEW.unit_cost, 0);
    END IF;
    
    -- Insert or update inventory with WAC
    INSERT INTO public.inventory (material_id, location_id, quantity, quality_grade, unit_cost, total_value)
    VALUES (NEW.material_id, NEW.location_id, NEW.quantity, NEW.quality_grade, new_avg_cost, NEW.quantity * COALESCE(NEW.unit_cost, 0))
    ON CONFLICT (material_id, location_id, quality_grade)
    DO UPDATE SET 
      quantity = current_qty + NEW.quantity,
      unit_cost = new_avg_cost,
      total_value = current_value + (NEW.quantity * COALESCE(NEW.unit_cost, 0)),
      last_updated = now();
      
  ELSIF NEW.transaction_type = 'out' THEN
    -- Get current inventory
    SELECT quantity, total_value, unit_cost
    INTO current_qty, current_value, new_avg_cost
    FROM public.inventory 
    WHERE material_id = NEW.material_id 
      AND location_id = NEW.location_id 
      AND quality_grade = NEW.quality_grade;
    
    IF current_qty IS NOT NULL AND current_qty >= NEW.quantity THEN
      -- Calculate proportional value to deduct
      proportional_value := (NEW.quantity / current_qty) * current_value;
      
      -- Update inventory by reducing quantity and proportional value
      UPDATE public.inventory 
      SET quantity = quantity - NEW.quantity,
          total_value = total_value - proportional_value,
          last_updated = now()
      WHERE material_id = NEW.material_id 
        AND location_id = NEW.location_id 
        AND quality_grade = NEW.quality_grade;
    END IF;
      
  ELSIF NEW.transaction_type = 'adjustment' THEN
    -- For adjustments, set the exact quantity and recalculate total_value using current unit_cost
    SELECT unit_cost INTO new_avg_cost
    FROM public.inventory 
    WHERE material_id = NEW.material_id 
      AND location_id = NEW.location_id 
      AND quality_grade = NEW.quality_grade;
    
    UPDATE public.inventory 
    SET quantity = NEW.quantity,
        total_value = NEW.quantity * COALESCE(new_avg_cost, NEW.unit_cost, 0),
        unit_cost = COALESCE(NEW.unit_cost, new_avg_cost, 0),
        last_updated = now()
    WHERE material_id = NEW.material_id 
      AND location_id = NEW.location_id 
      AND quality_grade = NEW.quality_grade;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger for WAC inventory updates
CREATE TRIGGER update_inventory_wac_after_transaction
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inventory_wac_from_transaction();

-- Create inventory valuation view for reporting
CREATE OR REPLACE VIEW public.inventory_valuation AS
SELECT 
  i.id,
  i.material_id,
  m.name as material_name,
  m.sku,
  m.grade,
  m.category,
  i.location_id,
  l.name as location_name,
  i.quality_grade,
  i.quantity,
  i.available_quantity,
  i.reserved_quantity,
  i.unit_cost as weighted_avg_cost,
  i.total_value,
  CASE 
    WHEN i.quantity > 0 THEN i.total_value / i.quantity 
    ELSE 0 
  END as calculated_avg_cost,
  i.last_updated
FROM public.inventory i
JOIN public.materials m ON i.material_id = m.id
JOIN public.locations l ON i.location_id = l.id
WHERE i.quantity > 0;

-- Create summary view for overall inventory valuation
CREATE OR REPLACE VIEW public.inventory_valuation_summary AS
SELECT 
  COUNT(*) as total_materials,
  SUM(quantity) as total_quantity,
  SUM(total_value) as total_inventory_value,
  AVG(unit_cost) as overall_avg_cost
FROM public.inventory
WHERE quantity > 0;

-- Create material-wise valuation summary
CREATE OR REPLACE VIEW public.material_valuation_summary AS
SELECT 
  m.id as material_id,
  m.name as material_name,
  m.sku,
  m.grade,
  m.category,
  SUM(i.quantity) as total_quantity,
  SUM(i.total_value) as total_value,
  CASE 
    WHEN SUM(i.quantity) > 0 THEN SUM(i.total_value) / SUM(i.quantity)
    ELSE 0 
  END as weighted_avg_cost
FROM public.materials m
LEFT JOIN public.inventory i ON m.id = i.material_id
WHERE m.is_active = true
GROUP BY m.id, m.name, m.sku, m.grade, m.category
HAVING SUM(i.quantity) > 0;

-- Add index on total_value for performance
CREATE INDEX IF NOT EXISTS idx_inventory_total_value ON public.inventory(total_value);
CREATE INDEX IF NOT EXISTS idx_inventory_unit_cost ON public.inventory(unit_cost);
