-- Create test material with proper UUID
INSERT INTO public.materials (
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

-- Get the material ID that was just created
DO $$
DECLARE
    test_material_id UUID;
    existing_customer_id UUID;
BEGIN
    -- Get the material ID
    SELECT id INTO test_material_id FROM public.materials WHERE sku = 'MS-PLA-6x4';
    
    -- Create 4 test batches for this material
    INSERT INTO public.batches (
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
      'B100',
      test_material_id,
      1500.0,
      1500.0,
      'A',
      'active',
      'HT001',
      'TATA',
      CURRENT_DATE - INTERVAL '10 days'
    ),
    (
      'B101',
      test_material_id,
      2000.0,
      2000.0,
      'A',
      'active',
      'HT002',
      'TATA',
      CURRENT_DATE - INTERVAL '8 days'
    ),
    (
      'B102', 
      test_material_id,
      1200.0,
      1200.0,
      'A',
      'active',
      'HT003',
      'SAIL',
      CURRENT_DATE - INTERVAL '6 days'
    ),
    (
      'B103',
      test_material_id, 
      1800.0,
      1800.0,
      'A',
      'active',
      'HT004',
      'SAIL',
      CURRENT_DATE - INTERVAL '4 days'
    );
    
    -- Check if customer already exists
    SELECT id INTO existing_customer_id FROM public.customers WHERE name = 'ABC Construction Ltd';
    
    -- Only insert if customer doesn't exist
    IF existing_customer_id IS NULL THEN
        INSERT INTO public.customers (
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
          'ABC Construction Ltd',
          'John Smith',
          '+91-9876543210',
          'john@abcconstruction.com',
          '123 Industrial Area, Mumbai - 400001',
          '27ABCDE1234F1Z5',
          30,
          500000.00,
          true
        );
    END IF;
END $$;