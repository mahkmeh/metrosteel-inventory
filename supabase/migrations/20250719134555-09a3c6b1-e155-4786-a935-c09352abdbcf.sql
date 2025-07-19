
-- Step 1: Create Purchase Order
INSERT INTO purchase_orders (id, po_number, supplier_id, total_amount, status, order_date, expected_delivery, notes)
VALUES (
  gen_random_uuid(),
  'PO-2025-001',
  (SELECT id FROM suppliers WHERE name = 'Jindal Steel & Power' LIMIT 1),
  425000.00,
  'confirmed',
  '2025-01-01',
  '2025-01-31',
  'Mock transaction for SKU: 20G2 - SS Sheet 1.0mm 304 PC_Mirror'
);

-- Step 2: Create Purchase Order Item
INSERT INTO purchase_order_items (id, purchase_order_id, material_id, quantity, unit_price, line_total, order_type, notes)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-001'),
  (SELECT id FROM materials WHERE sku = '20G2'),
  5000.00,
  85.00,
  425000.00,
  'stock',
  'Initial order for 5000 KG'
);

-- Step 3: Create First Batch (B001) - First Delivery
INSERT INTO batches (id, batch_code, sku_id, supplier_id, purchase_order_id, total_weight_kg, available_weight_kg, heat_number, make, quality_grade, manufactured_date, received_date, status, notes)
VALUES (
  gen_random_uuid(),
  'B001',
  (SELECT id FROM materials WHERE sku = '20G2'),
  (SELECT id FROM suppliers WHERE name = 'Jindal Steel & Power' LIMIT 1),
  (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-001'),
  2500.00,
  2500.00,
  'HT789456',
  'Jindal Steel & Power',
  'A',
  '2024-12-15',
  '2025-01-15',
  'active',
  'First delivery - Supplier batch: JND2024A123'
);

-- Step 4: Create Second Batch (B002) - Second Delivery  
INSERT INTO batches (id, batch_code, sku_id, supplier_id, purchase_order_id, total_weight_kg, available_weight_kg, heat_number, make, quality_grade, manufactured_date, received_date, status, notes)
VALUES (
  gen_random_uuid(),
  'B002',
  (SELECT id FROM materials WHERE sku = '20G2'),
  (SELECT id FROM suppliers WHERE name = 'Jindal Steel & Power' LIMIT 1),
  (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-001'),
  2000.00,
  2000.00,
  'HT789457',
  'Jindal Steel & Power',
  'A',
  '2024-12-20',
  '2025-01-29',
  'active',
  'Second delivery - Supplier batch: JND2024A124 (500 KG returned due to quality issues)'
);

-- Step 5: Create Batch Inventory Records
INSERT INTO batch_inventory (batch_id, location_id, quantity_kg, unit_cost_per_kg)
VALUES 
(
  (SELECT id FROM batches WHERE batch_code = 'B001'),
  (SELECT id FROM locations LIMIT 1),
  2500.00,
  85.00
),
(
  (SELECT id FROM batches WHERE batch_code = 'B002'),
  (SELECT id FROM locations LIMIT 1),
  2000.00,
  85.00
);

-- Step 6: Create Receipt Transactions
INSERT INTO transactions (material_id, location_id, transaction_type, quantity, weight_kg, quality_grade, unit_cost, batch_id, reference_type, reference_id, notes)
VALUES 
(
  (SELECT id FROM materials WHERE sku = '20G2'),
  (SELECT id FROM locations LIMIT 1),
  'in',
  2500.00,
  2500.00,
  'A',
  85.00,
  (SELECT id FROM batches WHERE batch_code = 'B001'),
  'purchase_order',
  (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-001'),
  'First delivery receipt - Invoice: INV-JND-001 for ₹2,12,500'
),
(
  (SELECT id FROM materials WHERE sku = '20G2'),
  (SELECT id FROM locations LIMIT 1),
  'in',
  2500.00,
  2500.00,
  'A',
  85.00,
  (SELECT id FROM batches WHERE batch_code = 'B002'),
  'purchase_order',
  (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-001'),
  'Second delivery receipt - Invoice: INV-JND-002 for ₹2,12,500'
);

-- Step 7: Create Purchase Return Transaction (10% rejection from B002)
INSERT INTO transactions (material_id, location_id, transaction_type, quantity, weight_kg, quality_grade, unit_cost, batch_id, reference_type, reference_id, notes)
VALUES (
  (SELECT id FROM materials WHERE sku = '20G2'),
  (SELECT id FROM locations LIMIT 1),
  'out',
  500.00,
  500.00,
  'B',
  85.00,
  (SELECT id FROM batches WHERE batch_code = 'B002'),
  'purchase_return',
  (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-001'),
  'Quality rejection - 10% defective material returned. Credit note: CN-JND-001 for ₹42,500'
);

-- Step 8: Update Batch B002 available weight after return
UPDATE batches 
SET available_weight_kg = 2000.00,
    notes = 'Second delivery - Supplier batch: JND2024A124 (500 KG returned due to quality issues)'
WHERE batch_code = 'B002';

-- Step 9: Update Batch Inventory for B002 after return
UPDATE batch_inventory 
SET quantity_kg = 2000.00
WHERE batch_id = (SELECT id FROM batches WHERE batch_code = 'B002');

-- Step 10: Update Purchase Order status to received
UPDATE purchase_orders 
SET status = 'received',
    notes = 'Mock transaction completed - Net received: 4500 KG (500 KG returned due to quality issues). Net payment: ₹3,82,500'
WHERE po_number = 'PO-2025-001';
