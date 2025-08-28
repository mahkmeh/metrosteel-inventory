-- Create test material
INSERT INTO public.materials (
  id,
  sku,
  name,
  grade,
  category,
  thickness,
  width,
  unit,
  base_price,
  is_active
) VALUES (
  'test-material-001',
  'MS-PLA-6x4',
  'Test MS Plate 6mm x 4ft',
  'MS',
  'Plate',
  6.0,
  4.0,
  'KG',
  50.00,
  true
);

-- Create 4 test batches for this material
INSERT INTO public.batches (
  id,
  batch_code,
  sku_id,
  total_weight_kg,
  available_weight_kg,
  quality_grade,
  status,
  heat_number,
  make,
  received_date
) VALUES 
(
  'test-batch-001',
  'B100',
  'test-material-001',
  1500.0,
  1500.0,
  'A',
  'active',
  'HT001',
  'TATA',
  CURRENT_DATE - INTERVAL '10 days'
),
(
  'test-batch-002', 
  'B101',
  'test-material-001',
  2000.0,
  2000.0,
  'A',
  'active',
  'HT002',
  'TATA',
  CURRENT_DATE - INTERVAL '8 days'
),
(
  'test-batch-003',
  'B102', 
  'test-material-001',
  1200.0,
  1200.0,
  'A',
  'active',
  'HT003',
  'SAIL',
  CURRENT_DATE - INTERVAL '6 days'
),
(
  'test-batch-004',
  'B103',
  'test-material-001', 
  1800.0,
  1800.0,
  'A',
  'active',
  'HT004',
  'SAIL',
  CURRENT_DATE - INTERVAL '4 days'
);

-- Ensure we have a test customer
INSERT INTO public.customers (
  id,
  name,
  contact_person,
  phone,
  email,
  address,
  gst_number,
  credit_days,
  credit_limit,
  is_active
) VALUES (
  'test-customer-001',
  'ABC Construction Ltd',
  'John Smith',
  '+91-9876543210',
  'john@abcconstruction.com',
  '123 Industrial Area, Mumbai - 400001',
  '27ABCDE1234F1Z5',
  30,
  500000.00,
  true
) ON CONFLICT (id) DO NOTHING;