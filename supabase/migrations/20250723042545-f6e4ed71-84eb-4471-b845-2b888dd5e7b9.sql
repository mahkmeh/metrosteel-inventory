
-- Create sample purchase orders with realistic data
INSERT INTO purchase_orders (id, po_number, supplier_id, total_amount, status, order_date, expected_delivery, notes)
VALUES 
  (
    gen_random_uuid(),
    'PO-2025-001',
    (SELECT id FROM suppliers WHERE name LIKE '%Tata%' LIMIT 1),
    850000.00,
    'confirmed',
    '2025-01-15',
    '2025-02-15',
    'Bulk order for SS sheets and pipes'
  ),
  (
    gen_random_uuid(),
    'PO-2025-002', 
    (SELECT id FROM suppliers WHERE name LIKE '%Jindal%' LIMIT 1),
    425000.00,
    'received',
    '2025-01-10',
    '2025-01-25',
    'Regular stock replenishment'
  ),
  (
    gen_random_uuid(),
    'PO-2025-003',
    (SELECT id FROM suppliers WHERE name LIKE '%JSW%' LIMIT 1),
    320000.00,
    'sent',
    '2025-01-20',
    '2025-02-20',
    'Custom order for specific grades'
  );

-- Create purchase order items for the orders
INSERT INTO purchase_order_items (id, purchase_order_id, material_id, quantity, unit_price, line_total, order_type, notes)
VALUES 
  -- Items for PO-2025-001
  (
    gen_random_uuid(),
    (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-001'),
    (SELECT id FROM materials WHERE sku LIKE '%SS%' AND category = 'sheet' LIMIT 1),
    5000.00,
    85.00,
    425000.00,
    'stock',
    'SS 304 sheets - 1mm thickness'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-001'),
    (SELECT id FROM materials WHERE sku LIKE '%SS%' AND category = 'pipe' LIMIT 1),
    2500.00,
    170.00,
    425000.00,
    'stock',
    'SS 316 pipes - 2 inch diameter'
  ),
  -- Items for PO-2025-002
  (
    gen_random_uuid(),
    (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-002'),
    (SELECT id FROM materials WHERE sku LIKE '%MS%' LIMIT 1),
    3000.00,
    142.00,
    425000.00,
    'stock',
    'MS plates - standard grade'
  ),
  -- Items for PO-2025-003
  (
    gen_random_uuid(),
    (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-003'),
    (SELECT id FROM materials WHERE grade = 'A' LIMIT 1),
    2000.00,
    160.00,
    320000.00,
    'stock',
    'Premium grade material'
  );

-- Create purchase invoices for received orders
INSERT INTO purchase_invoices (id, invoice_number, supplier_id, purchase_order_id, invoice_date, due_date, subtotal_amount, tax_amount, total_amount, status, received_date, notes)
VALUES 
  (
    gen_random_uuid(),
    'INV-JINDAL-2025-001',
    (SELECT id FROM suppliers WHERE name LIKE '%Jindal%' LIMIT 1),
    (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-002'),
    '2025-01-25',
    '2025-02-25',
    360169.49,
    64830.51,
    425000.00,
    'received',
    '2025-01-25',
    'Invoice for PO-2025-002 - Full delivery'
  ),
  (
    gen_random_uuid(),
    'INV-TATA-2025-001',
    (SELECT id FROM suppliers WHERE name LIKE '%Tata%' LIMIT 1),
    (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-001'),
    '2025-01-18',
    '2025-02-18',
    360169.49,
    64830.51,
    425000.00,
    'received',
    '2025-01-18',
    'Partial delivery - First batch'
  );

-- Create purchase returns for quality issues
INSERT INTO purchase_returns (id, return_number, supplier_id, purchase_invoice_id, purchase_order_id, return_date, total_return_amount, return_reason, status, notes)
VALUES 
  (
    gen_random_uuid(),
    'RET-2025-001',
    (SELECT id FROM suppliers WHERE name LIKE '%Jindal%' LIMIT 1),
    (SELECT id FROM purchase_invoices WHERE invoice_number = 'INV-JINDAL-2025-001'),
    (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-002'),
    '2025-01-28',
    42500.00,
    'quality_issues',
    'approved',
    'Surface defects found in 10% of material - returned for replacement'
  );

-- Create purchase return items
INSERT INTO purchase_return_items (id, purchase_return_id, material_id, quantity_returned, unit_price, line_total, return_reason, notes)
VALUES 
  (
    gen_random_uuid(),
    (SELECT id FROM purchase_returns WHERE return_number = 'RET-2025-001'),
    (SELECT id FROM materials WHERE sku LIKE '%MS%' LIMIT 1),
    300.00,
    142.00,
    42500.00,
    'quality_issues',
    'Surface scratches and dents - not suitable for customer requirements'
  );

-- Create payables for the invoices
INSERT INTO payables (id, supplier_id, purchase_invoice_id, original_amount, paid_amount, outstanding_amount, due_date, status, notes)
VALUES 
  (
    gen_random_uuid(),
    (SELECT id FROM suppliers WHERE name LIKE '%Jindal%' LIMIT 1),
    (SELECT id FROM purchase_invoices WHERE invoice_number = 'INV-JINDAL-2025-001'),
    425000.00,
    212500.00,
    212500.00,
    '2025-02-25',
    'partial',
    'Partial payment made - Balance due after return processing'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM suppliers WHERE name LIKE '%Tata%' LIMIT 1),
    (SELECT id FROM purchase_invoices WHERE invoice_number = 'INV-TATA-2025-001'),
    425000.00,
    0.00,
    425000.00,
    '2025-02-18',
    'outstanding',
    'Full payment pending - awaiting complete delivery'
  );

-- Create batches for received materials
INSERT INTO batches (id, batch_code, sku_id, supplier_id, purchase_order_id, total_weight_kg, available_weight_kg, heat_number, make, quality_grade, manufactured_date, received_date, status, notes)
VALUES 
  (
    gen_random_uuid(),
    'B101',
    (SELECT id FROM materials WHERE sku LIKE '%MS%' LIMIT 1),
    (SELECT id FROM suppliers WHERE name LIKE '%Jindal%' LIMIT 1),
    (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-002'),
    2700.00,
    2700.00,
    'HT456789',
    'Jindal Steel',
    'A',
    '2025-01-15',
    '2025-01-25',
    'active',
    'Received batch after 10% return - Net 2700 KG from 3000 KG'
  ),
  (
    gen_random_uuid(),
    'B102',
    (SELECT id FROM materials WHERE sku LIKE '%SS%' AND category = 'sheet' LIMIT 1),
    (SELECT id FROM suppliers WHERE name LIKE '%Tata%' LIMIT 1),
    (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-001'),
    2500.00,
    2500.00,
    'HT789012',
    'Tata Steel',
    'A',
    '2025-01-10',
    '2025-01-18',
    'active',
    'First batch delivery - SS 304 sheets'
  );

-- Create batch inventory records
INSERT INTO batch_inventory (batch_id, location_id, quantity_kg, unit_cost_per_kg)
VALUES 
  (
    (SELECT id FROM batches WHERE batch_code = 'B101'),
    (SELECT id FROM locations LIMIT 1),
    2700.00,
    142.00
  ),
  (
    (SELECT id FROM batches WHERE batch_code = 'B102'),
    (SELECT id FROM locations LIMIT 1),
    2500.00,
    85.00
  );

-- Create transaction records for purchase receipts
INSERT INTO transactions (material_id, location_id, transaction_type, quantity, weight_kg, quality_grade, unit_cost, batch_id, reference_type, reference_id, notes)
VALUES 
  (
    (SELECT id FROM materials WHERE sku LIKE '%MS%' LIMIT 1),
    (SELECT id FROM locations LIMIT 1),
    'in',
    2700.00,
    2700.00,
    'A',
    142.00,
    (SELECT id FROM batches WHERE batch_code = 'B101'),
    'purchase_order',
    (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-002'),
    'Purchase receipt - MS plates from Jindal Steel'
  ),
  (
    (SELECT id FROM materials WHERE sku LIKE '%SS%' AND category = 'sheet' LIMIT 1),
    (SELECT id FROM locations LIMIT 1),
    'in',
    2500.00,
    2500.00,
    'A',
    85.00,
    (SELECT id FROM batches WHERE batch_code = 'B102'),
    'purchase_order',
    (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-001'),
    'Purchase receipt - SS 304 sheets from Tata Steel'
  ),
  (
    (SELECT id FROM materials WHERE sku LIKE '%MS%' LIMIT 1),
    (SELECT id FROM locations LIMIT 1),
    'out',
    300.00,
    300.00,
    'B',
    142.00,
    (SELECT id FROM batches WHERE batch_code = 'B101'),
    'purchase_return',
    (SELECT id FROM purchase_returns WHERE return_number = 'RET-2025-001'),
    'Purchase return - Quality issues'
  );
