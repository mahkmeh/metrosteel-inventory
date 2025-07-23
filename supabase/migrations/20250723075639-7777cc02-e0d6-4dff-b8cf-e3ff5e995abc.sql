
-- Create sample job work transformations with realistic data
INSERT INTO public.job_work_transformations (
  job_work_number,
  contractor_id,
  input_batch_id,
  input_weight_kg,
  input_sku_id,
  output_sku_id,
  expected_output_weight_kg,
  actual_output_weight_kg,
  output_batch_id,
  process_type,
  process_description,
  sent_date,
  expected_return_date,
  actual_return_date,
  status,
  processing_cost_per_kg,
  total_processing_cost
) VALUES
-- JW-2025-001: Cutting service (completed)
(
  'JW-2025-001',
  (SELECT id FROM suppliers WHERE name = 'Precision Cutting Services' LIMIT 1),
  (SELECT id FROM batches WHERE batch_code = 'B001' LIMIT 1),
  500.00,
  (SELECT id FROM materials WHERE sku = 'MS-SHE-10x4' LIMIT 1),
  (SELECT id FROM materials WHERE sku = 'MS-SHE-8x4' LIMIT 1),
  490.00,
  485.00,
  NULL, -- Will be created later
  'cutting',
  'Precision cutting of MS sheets to 8mm thickness',
  CURRENT_DATE - INTERVAL '15 days',
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE - INTERVAL '3 days',
  'completed',
  85.00,
  42500.00
),
-- JW-2025-002: Welding service (processing)
(
  'JW-2025-002',
  (SELECT id FROM suppliers WHERE name = 'Advanced Welding Works' LIMIT 1),
  (SELECT id FROM batches WHERE batch_code = 'B002' LIMIT 1),
  350.00,
  (SELECT id FROM materials WHERE sku = 'MS-PIP-25R' LIMIT 1),
  (SELECT id FROM materials WHERE sku = 'MS-PIP-50R' LIMIT 1),
  340.00,
  NULL,
  NULL,
  'welding',
  'Welding and joining of MS pipes to create larger diameter pipes',
  CURRENT_DATE - INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '2 days',
  NULL,
  'processing',
  125.00,
  43750.00
),
-- JW-2025-003: Bending service (sent)
(
  'JW-2025-003',
  (SELECT id FROM suppliers WHERE name = 'Metal Bending Solutions' LIMIT 1),
  (SELECT id FROM batches WHERE available_weight_kg > 200 LIMIT 1),
  250.00,
  (SELECT id FROM materials WHERE sku = 'MS-BAR-16R' LIMIT 1),
  (SELECT id FROM materials WHERE sku = 'MS-ANG-50x50' LIMIT 1),
  245.00,
  NULL,
  NULL,
  'bending',
  'Bending MS round bars to create angular sections',
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '5 days',
  NULL,
  'sent',
  95.00,
  23750.00
),
-- JW-2025-004: Quality processing (completed)
(
  'JW-2025-004',
  (SELECT id FROM suppliers WHERE name = 'Quality Processing Unit' LIMIT 1),
  (SELECT id FROM batches WHERE available_weight_kg > 150 LIMIT 1 OFFSET 1),
  180.00,
  (SELECT id FROM materials WHERE sku = 'SS304-SHE-2x4' LIMIT 1),
  (SELECT id FROM materials WHERE sku = 'SS304-SHE-3x4' LIMIT 1),
  175.00,
  170.00,
  NULL,
  'forming',
  'Cold forming of SS304 sheets to increase thickness',
  CURRENT_DATE - INTERVAL '20 days',
  CURRENT_DATE - INTERVAL '10 days',
  CURRENT_DATE - INTERVAL '8 days',
  'completed',
  150.00,
  27000.00
),
-- JW-2025-005: Machining service (processing)
(
  'JW-2025-005',
  (SELECT id FROM suppliers WHERE name = 'Precision Cutting Services' LIMIT 1),
  (SELECT id FROM batches WHERE available_weight_kg > 300 LIMIT 1 OFFSET 2),
  400.00,
  (SELECT id FROM materials WHERE sku = 'MS-PLA-20' LIMIT 1),
  (SELECT id FROM materials WHERE sku = 'MS-PLA-25' LIMIT 1),
  380.00,
  NULL,
  NULL,
  'machining',
  'Precision machining and thickness adjustment of MS plates',
  CURRENT_DATE - INTERVAL '12 days',
  CURRENT_DATE + INTERVAL '3 days',
  NULL,
  'processing',
  110.00,
  44000.00
),
-- JW-2025-006: Surface treatment (sent)
(
  'JW-2025-006',
  (SELECT id FROM suppliers WHERE name = 'Advanced Welding Works' LIMIT 1),
  (SELECT id FROM batches WHERE available_weight_kg > 100 LIMIT 1 OFFSET 3),
  150.00,
  (SELECT id FROM materials WHERE sku = 'SS304-BAR-12R' LIMIT 1),
  (SELECT id FROM materials WHERE sku = 'SS304-BAR-16R' LIMIT 1),
  145.00,
  NULL,
  NULL,
  'surface_treatment',
  'Polishing and surface finishing of SS304 bars',
  CURRENT_DATE - INTERVAL '3 days',
  CURRENT_DATE + INTERVAL '7 days',
  NULL,
  'sent',
  175.00,
  26250.00
),
-- JW-2025-007: Cutting and shaping (completed)
(
  'JW-2025-007',
  (SELECT id FROM suppliers WHERE name = 'Metal Bending Solutions' LIMIT 1),
  (SELECT id FROM batches WHERE available_weight_kg > 200 LIMIT 1 OFFSET 4),
  300.00,
  (SELECT id FROM materials WHERE sku = 'AL-SHE-3x4' LIMIT 1),
  (SELECT id FROM materials WHERE sku = 'AL-BAR-20R' LIMIT 1),
  285.00,
  280.00,
  NULL,
  'cutting',
  'Cutting aluminum sheets and forming into bar sections',
  CURRENT_DATE - INTERVAL '18 days',
  CURRENT_DATE - INTERVAL '8 days',
  CURRENT_DATE - INTERVAL '6 days',
  'completed',
  200.00,
  60000.00
),
-- JW-2025-008: Pipe fabrication (processing)
(
  'JW-2025-008',
  (SELECT id FROM suppliers WHERE name = 'Quality Processing Unit' LIMIT 1),
  (SELECT id FROM batches WHERE available_weight_kg > 250 LIMIT 1 OFFSET 5),
  320.00,
  (SELECT id FROM materials WHERE sku = 'SS304-PIP-25R' LIMIT 1),
  (SELECT id FROM materials WHERE sku = 'SS304-PIP-50R' LIMIT 1),
  310.00,
  NULL,
  NULL,
  'fabrication',
  'Fabrication and welding of SS304 pipes to larger diameter',
  CURRENT_DATE - INTERVAL '8 days',
  CURRENT_DATE + INTERVAL '4 days',
  NULL,
  'processing',
  135.00,
  43200.00
),
-- JW-2025-009: Heat treatment (sent)
(
  'JW-2025-009',
  (SELECT id FROM suppliers WHERE name = 'Advanced Welding Works' LIMIT 1),
  (SELECT id FROM batches WHERE available_weight_kg > 150 LIMIT 1 OFFSET 6),
  200.00,
  (SELECT id FROM materials WHERE sku = 'MS-BAR-12R' LIMIT 1),
  (SELECT id FROM materials WHERE sku = 'MS-BAR-16R' LIMIT 1),
  195.00,
  NULL,
  NULL,
  'heat_treatment',
  'Heat treatment and hardening of MS round bars',
  CURRENT_DATE - INTERVAL '2 days',
  CURRENT_DATE + INTERVAL '10 days',
  NULL,
  'sent',
  90.00,
  18000.00
),
-- JW-2025-010: Precision cutting (completed)
(
  'JW-2025-010',
  (SELECT id FROM suppliers WHERE name = 'Precision Cutting Services' LIMIT 1),
  (SELECT id FROM batches WHERE available_weight_kg > 100 LIMIT 1 OFFSET 7),
  120.00,
  (SELECT id FROM materials WHERE sku = 'SS316-SHE-2x4' LIMIT 1),
  (SELECT id FROM materials WHERE sku = 'SS304-SHE-2x4' LIMIT 1),
  115.00,
  112.00,
  NULL,
  'cutting',
  'Precision cutting and grade conversion of stainless steel sheets',
  CURRENT_DATE - INTERVAL '25 days',
  CURRENT_DATE - INTERVAL '15 days',
  CURRENT_DATE - INTERVAL '13 days',
  'completed',
  180.00,
  21600.00
),
-- JW-2025-011: Forming service (processing)
(
  'JW-2025-011',
  (SELECT id FROM suppliers WHERE name = 'Metal Bending Solutions' LIMIT 1),
  (SELECT id FROM batches WHERE available_weight_kg > 180 LIMIT 1 OFFSET 8),
  220.00,
  (SELECT id FROM materials WHERE sku = 'MS-SHE-12x4' LIMIT 1),
  (SELECT id FROM materials WHERE sku = 'MS-PLA-20' LIMIT 1),
  210.00,
  NULL,
  NULL,
  'forming',
  'Cold forming of MS sheets into plate sections',
  CURRENT_DATE - INTERVAL '7 days',
  CURRENT_DATE + INTERVAL '5 days',
  NULL,
  'processing',
  105.00,
  23100.00
),
-- JW-2025-012: Assembly service (sent)
(
  'JW-2025-012',
  (SELECT id FROM suppliers WHERE name = 'Quality Processing Unit' LIMIT 1),
  (SELECT id FROM batches WHERE available_weight_kg > 160 LIMIT 1 OFFSET 9),
  180.00,
  (SELECT id FROM materials WHERE sku = 'MS-PIP-25S' LIMIT 1),
  (SELECT id FROM materials WHERE sku = 'MS-ANG-75x75' LIMIT 1),
  175.00,
  NULL,
  NULL,
  'assembly',
  'Assembly and welding of square pipes into angle sections',
  CURRENT_DATE - INTERVAL '1 day',
  CURRENT_DATE + INTERVAL '12 days',
  NULL,
  'sent',
  115.00,
  20700.00
);

-- Create output batches for completed job work transformations
INSERT INTO public.batches (
  batch_code,
  sku_id,
  supplier_id,
  total_weight_kg,
  available_weight_kg,
  quality_grade,
  received_date,
  status,
  notes
) VALUES
-- Output batch for JW-2025-001
(
  'JW001-OUT',
  (SELECT output_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-001'),
  (SELECT contractor_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-001'),
  485.00,
  485.00,
  'A',
  CURRENT_DATE - INTERVAL '3 days',
  'active',
  'Processed from job work JW-2025-001 - Precision cutting'
),
-- Output batch for JW-2025-004
(
  'JW004-OUT',
  (SELECT output_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-004'),
  (SELECT contractor_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-004'),
  170.00,
  170.00,
  'A',
  CURRENT_DATE - INTERVAL '8 days',
  'active',
  'Processed from job work JW-2025-004 - Cold forming'
),
-- Output batch for JW-2025-007
(
  'JW007-OUT',
  (SELECT output_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-007'),
  (SELECT contractor_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-007'),
  280.00,
  280.00,
  'A',
  CURRENT_DATE - INTERVAL '6 days',
  'active',
  'Processed from job work JW-2025-007 - Aluminum cutting and shaping'
),
-- Output batch for JW-2025-010
(
  'JW010-OUT',
  (SELECT output_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-010'),
  (SELECT contractor_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-010'),
  112.00,
  112.00,
  'A',
  CURRENT_DATE - INTERVAL '13 days',
  'active',
  'Processed from job work JW-2025-010 - Precision cutting and grade conversion'
);

-- Update job work transformations to link output batches
UPDATE public.job_work_transformations 
SET output_batch_id = (SELECT id FROM batches WHERE batch_code = 'JW001-OUT')
WHERE job_work_number = 'JW-2025-001';

UPDATE public.job_work_transformations 
SET output_batch_id = (SELECT id FROM batches WHERE batch_code = 'JW004-OUT')
WHERE job_work_number = 'JW-2025-004';

UPDATE public.job_work_transformations 
SET output_batch_id = (SELECT id FROM batches WHERE batch_code = 'JW007-OUT')
WHERE job_work_number = 'JW-2025-007';

UPDATE public.job_work_transformations 
SET output_batch_id = (SELECT id FROM batches WHERE batch_code = 'JW010-OUT')
WHERE job_work_number = 'JW-2025-010';

-- Create batch inventory for output batches
INSERT INTO public.batch_inventory (
  batch_id,
  location_id,
  quantity_kg,
  unit_cost_per_kg
) VALUES
-- JW001-OUT batch inventory
(
  (SELECT id FROM batches WHERE batch_code = 'JW001-OUT'),
  (SELECT id FROM locations LIMIT 1),
  485.00,
  143.50 -- Original cost + processing cost
),
-- JW004-OUT batch inventory
(
  (SELECT id FROM batches WHERE batch_code = 'JW004-OUT'),
  (SELECT id FROM locations LIMIT 1),
  170.00,
  335.00 -- Original cost + processing cost
),
-- JW007-OUT batch inventory
(
  (SELECT id FROM batches WHERE batch_code = 'JW007-OUT'),
  (SELECT id FROM locations LIMIT 1),
  280.00,
  445.00 -- Original cost + processing cost
),
-- JW010-OUT batch inventory
(
  (SELECT id FROM batches WHERE batch_code = 'JW010-OUT'),
  (SELECT id FROM locations LIMIT 1),
  112.00,
  425.00 -- Original cost + processing cost
);

-- Create outward transactions for all job work transformations
INSERT INTO public.transactions (
  transaction_type,
  material_id,
  location_id,
  quantity,
  weight_kg,
  quality_grade,
  unit_cost,
  batch_id,
  transformation_id,
  reference_type,
  reference_id,
  notes,
  created_at
) VALUES
-- Outward transactions for each job work
((SELECT 'out'), (SELECT input_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-001'), (SELECT id FROM locations LIMIT 1), 500.00, 500.00, 'A', 58.50, (SELECT input_batch_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-001'), (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-001'), 'job_work_outward', (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-001'), 'Job work outward - JW-2025-001', CURRENT_DATE - INTERVAL '15 days'),
((SELECT 'out'), (SELECT input_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-002'), (SELECT id FROM locations LIMIT 1), 350.00, 350.00, 'A', 68.50, (SELECT input_batch_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-002'), (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-002'), 'job_work_outward', (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-002'), 'Job work outward - JW-2025-002', CURRENT_DATE - INTERVAL '10 days'),
((SELECT 'out'), (SELECT input_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-003'), (SELECT id FROM locations LIMIT 1), 250.00, 250.00, 'A', 57.20, (SELECT input_batch_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-003'), (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-003'), 'job_work_outward', (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-003'), 'Job work outward - JW-2025-003', CURRENT_DATE - INTERVAL '5 days'),
((SELECT 'out'), (SELECT input_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-004'), (SELECT id FROM locations LIMIT 1), 180.00, 180.00, 'A', 185.00, (SELECT input_batch_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-004'), (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-004'), 'job_work_outward', (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-004'), 'Job work outward - JW-2025-004', CURRENT_DATE - INTERVAL '20 days'),
((SELECT 'out'), (SELECT input_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-005'), (SELECT id FROM locations LIMIT 1), 400.00, 400.00, 'A', 61.50, (SELECT input_batch_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-005'), (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-005'), 'job_work_outward', (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-005'), 'Job work outward - JW-2025-005', CURRENT_DATE - INTERVAL '12 days'),
((SELECT 'out'), (SELECT input_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-006'), (SELECT id FROM locations LIMIT 1), 150.00, 150.00, 'A', 175.00, (SELECT input_batch_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-006'), (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-006'), 'job_work_outward', (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-006'), 'Job work outward - JW-2025-006', CURRENT_DATE - INTERVAL '3 days'),
((SELECT 'out'), (SELECT input_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-007'), (SELECT id FROM locations LIMIT 1), 300.00, 300.00, 'A', 245.00, (SELECT input_batch_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-007'), (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-007'), 'job_work_outward', (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-007'), 'Job work outward - JW-2025-007', CURRENT_DATE - INTERVAL '18 days'),
((SELECT 'out'), (SELECT input_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-008'), (SELECT id FROM locations LIMIT 1), 320.00, 320.00, 'A', 195.00, (SELECT input_batch_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-008'), (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-008'), 'job_work_outward', (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-008'), 'Job work outward - JW-2025-008', CURRENT_DATE - INTERVAL '8 days'),
((SELECT 'out'), (SELECT input_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-009'), (SELECT id FROM locations LIMIT 1), 200.00, 200.00, 'A', 56.50, (SELECT input_batch_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-009'), (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-009'), 'job_work_outward', (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-009'), 'Job work outward - JW-2025-009', CURRENT_DATE - INTERVAL '2 days'),
((SELECT 'out'), (SELECT input_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-010'), (SELECT id FROM locations LIMIT 1), 120.00, 120.00, 'A', 245.00, (SELECT input_batch_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-010'), (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-010'), 'job_work_outward', (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-010'), 'Job work outward - JW-2025-010', CURRENT_DATE - INTERVAL '25 days'),
((SELECT 'out'), (SELECT input_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-011'), (SELECT id FROM locations LIMIT 1), 220.00, 220.00, 'A', 60.10, (SELECT input_batch_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-011'), (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-011'), 'job_work_outward', (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-011'), 'Job work outward - JW-2025-011', CURRENT_DATE - INTERVAL '7 days'),
((SELECT 'out'), (SELECT input_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-012'), (SELECT id FROM locations LIMIT 1), 180.00, 180.00, 'A', 70.00, (SELECT input_batch_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-012'), (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-012'), 'job_work_outward', (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-012'), 'Job work outward - JW-2025-012', CURRENT_DATE - INTERVAL '1 day');

-- Create inward transactions for completed job work transformations
INSERT INTO public.transactions (
  transaction_type,
  material_id,
  location_id,
  quantity,
  weight_kg,
  quality_grade,
  unit_cost,
  batch_id,
  transformation_id,
  reference_type,
  reference_id,
  notes,
  created_at
) VALUES
-- Inward transactions for completed job work
((SELECT 'in'), (SELECT output_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-001'), (SELECT id FROM locations LIMIT 1), 485.00, 485.00, 'A', 143.50, (SELECT output_batch_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-001'), (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-001'), 'job_work_inward', (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-001'), 'Job work inward - JW-2025-001', CURRENT_DATE - INTERVAL '3 days'),
((SELECT 'in'), (SELECT output_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-004'), (SELECT id FROM locations LIMIT 1), 170.00, 170.00, 'A', 335.00, (SELECT output_batch_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-004'), (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-004'), 'job_work_inward', (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-004'), 'Job work inward - JW-2025-004', CURRENT_DATE - INTERVAL '8 days'),
((SELECT 'in'), (SELECT output_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-007'), (SELECT id FROM locations LIMIT 1), 280.00, 280.00, 'A', 445.00, (SELECT output_batch_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-007'), (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-007'), 'job_work_inward', (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-007'), 'Job work inward - JW-2025-007', CURRENT_DATE - INTERVAL '6 days'),
((SELECT 'in'), (SELECT output_sku_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-010'), (SELECT id FROM locations LIMIT 1), 112.00, 112.00, 'A', 425.00, (SELECT output_batch_id FROM job_work_transformations WHERE job_work_number = 'JW-2025-010'), (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-010'), 'job_work_inward', (SELECT id FROM job_work_transformations WHERE job_work_number = 'JW-2025-010'), 'Job work inward - JW-2025-010', CURRENT_DATE - INTERVAL '13 days');
