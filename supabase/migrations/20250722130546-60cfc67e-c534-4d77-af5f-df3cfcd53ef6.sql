
-- Phase 1: Create Batches & Inventory Data
-- This creates realistic batches and inventory records for all materials

-- First, let's create batches for each material (2-4 batches per material)
WITH material_batches AS (
  SELECT 
    m.id as material_id,
    m.sku,
    m.name,
    generate_series(1, 2 + (random() * 2)::int) as batch_seq,
    (SELECT id FROM suppliers ORDER BY random() LIMIT 1) as supplier_id
  FROM materials m
  WHERE m.is_active = true
)
INSERT INTO batches (
  batch_code,
  sku_id,
  supplier_id,
  total_weight_kg,
  available_weight_kg,
  reserved_weight_kg,
  heat_number,
  make,
  quality_grade,
  compliance_status,
  manufactured_date,
  received_date,
  status,
  notes
)
SELECT 
  'B' || LPAD((ROW_NUMBER() OVER ())::text, 3, '0') as batch_code,
  mb.material_id,
  mb.supplier_id,
  (500 + random() * 2000)::numeric(10,2) as total_weight_kg,
  (500 + random() * 2000)::numeric(10,2) as available_weight_kg,
  0 as reserved_weight_kg,
  'HN-' || (2023 + (random() * 2)::int) || '-' || LPAD((1 + random() * 999)::int::text, 3, '0') as heat_number,
  CASE 
    WHEN random() < 0.3 THEN 'Tata Steel'
    WHEN random() < 0.6 THEN 'Jindal Steel'
    WHEN random() < 0.8 THEN 'JSW Steel'
    ELSE 'SAIL'
  END as make,
  CASE 
    WHEN random() < 0.7 THEN 'A'
    WHEN random() < 0.9 THEN 'B'
    ELSE 'C'
  END as quality_grade,
  CASE 
    WHEN random() < 0.8 THEN 'approved'
    WHEN random() < 0.95 THEN 'pending'
    ELSE 'rejected'
  END as compliance_status,
  CURRENT_DATE - (random() * 365)::int as manufactured_date,
  CURRENT_DATE - (random() * 180)::int as received_date,
  'active' as status,
  'Initial batch for ' || mb.name as notes
FROM material_batches mb;

-- Create inventory records for each material at different locations
-- We'll distribute stock across 2-3 locations per material
WITH material_locations AS (
  SELECT 
    m.id as material_id,
    l.id as location_id,
    m.sku,
    ROW_NUMBER() OVER (PARTITION BY m.id ORDER BY random()) as location_seq
  FROM materials m
  CROSS JOIN locations l
  WHERE m.is_active = true 
    AND l.is_active = true
    AND random() < 0.6  -- Not all materials in all locations
),
batch_distributions AS (
  SELECT 
    b.id as batch_id,
    b.sku_id as material_id,
    ml.location_id,
    b.available_weight_kg * (0.3 + random() * 0.4) as quantity_kg,
    (50 + random() * 200)::numeric(10,2) as unit_cost_per_kg
  FROM batches b
  JOIN material_locations ml ON b.sku_id = ml.material_id
  WHERE ml.location_seq <= 2  -- Max 2 locations per material
)
INSERT INTO batch_inventory (
  batch_id,
  location_id,
  quantity_kg,
  reserved_kg,
  unit_cost_per_kg
)
SELECT 
  bd.batch_id,
  bd.location_id,
  bd.quantity_kg,
  (bd.quantity_kg * random() * 0.1)::numeric(10,2) as reserved_kg, -- Reserve up to 10%
  bd.unit_cost_per_kg
FROM batch_distributions bd;

-- Create aggregated inventory records from batch inventory
INSERT INTO inventory (
  material_id,
  location_id,
  quantity,
  quality_grade,
  unit_cost,
  total_value,
  reserved_quantity
)
SELECT 
  b.sku_id as material_id,
  bi.location_id,
  SUM(bi.quantity_kg) as quantity,
  b.quality_grade,
  AVG(bi.unit_cost_per_kg) as unit_cost,
  SUM(bi.quantity_kg * bi.unit_cost_per_kg) as total_value,
  SUM(bi.reserved_kg) as reserved_quantity
FROM batch_inventory bi
JOIN batches b ON bi.batch_id = b.id
GROUP BY b.sku_id, bi.location_id, b.quality_grade;

-- Update batch available weights based on batch inventory
UPDATE batches 
SET available_weight_kg = (
  SELECT COALESCE(SUM(bi.quantity_kg - bi.reserved_kg), 0)
  FROM batch_inventory bi 
  WHERE bi.batch_id = batches.id
),
reserved_weight_kg = (
  SELECT COALESCE(SUM(bi.reserved_kg), 0)
  FROM batch_inventory bi 
  WHERE bi.batch_id = batches.id
);

-- Add some sample transactions to record the initial stock receipt
INSERT INTO transactions (
  material_id,
  location_id,
  transaction_type,
  quantity,
  quality_grade,
  unit_cost,
  batch_id,
  weight_kg,
  reference_type,
  notes
)
SELECT 
  i.material_id,
  i.location_id,
  'in' as transaction_type,
  i.quantity,
  i.quality_grade,
  i.unit_cost,
  (SELECT b.id FROM batches b WHERE b.sku_id = i.material_id LIMIT 1) as batch_id,
  i.quantity as weight_kg,
  'initial_stock' as reference_type,
  'Initial stock entry for ' || m.name as notes
FROM inventory i
JOIN materials m ON i.material_id = m.id;
