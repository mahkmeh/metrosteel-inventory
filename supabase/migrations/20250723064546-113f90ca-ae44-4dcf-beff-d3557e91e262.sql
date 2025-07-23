-- Create sample purchase orders using actual material IDs
INSERT INTO public.purchase_orders (po_number, supplier_id, total_amount, order_date, expected_delivery, status, notes) VALUES
('PO-2025-001', (SELECT id FROM suppliers WHERE name = 'Steel Authority of India Ltd'), 485000.00, '2025-01-15', '2025-01-25', 'pending', 'Initial order for Q1 requirements'),
('PO-2025-002', (SELECT id FROM suppliers WHERE name = 'Tata Steel Limited'), 325000.00, '2025-01-18', '2025-01-28', 'received', 'Steel plates for construction project'),
('PO-2025-003', (SELECT id FROM suppliers WHERE name = 'JSW Steel Limited'), 275000.00, '2025-01-20', '2025-01-30', 'confirmed', 'Specialty grades for automotive parts');

-- Create sample purchase order items using existing material IDs
INSERT INTO public.purchase_order_items (purchase_order_id, material_id, quantity, unit_price, line_total, notes) VALUES
((SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-001'), 'acc0e577-8f63-4096-a96a-ad0cfbf46bf5', 50.00, 3200.00, 160000.00, 'MS Sheet 8mm'),
((SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-001'), '88fd0398-30c9-4462-9934-32199474c674', 100.00, 2500.00, 250000.00, 'MS Sheet 10mm'),
((SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-001'), '8379911a-ae7d-4436-8090-e4fc41adb892', 25.00, 3000.00, 75000.00, 'SS304 Sheet 2mm'),
((SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-002'), 'd7db9976-5d0a-4fb1-93c3-9a8f46c9d975', 40.00, 4200.00, 168000.00, 'SS316 Sheet 2mm'),
((SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-002'), 'dffa136e-3981-4259-8055-b388a8fe936d', 60.00, 2616.67, 157000.00, 'MS Sheet 12mm'),
((SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-003'), 'a6e4fb44-bcb6-4a12-9ecc-49018be46665', 30.00, 3100.00, 93000.00, 'MS Round Pipe 25mm'),
((SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-003'), '27ac1763-a0c0-4ba1-9028-1b44a5f5ccdf', 35.00, 5200.00, 182000.00, 'SS304 Round Pipe 25mm');

-- Create sample purchase invoices
INSERT INTO public.purchase_invoices (invoice_number, supplier_id, purchase_order_id, invoice_date, due_date, subtotal_amount, tax_amount, total_amount, status) VALUES
('INV-2025-001', (SELECT id FROM suppliers WHERE name = 'Tata Steel Limited'), (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-002'), '2025-01-25', '2025-02-24', 325000.00, 58500.00, 383500.00, 'paid'),
('INV-2025-002', (SELECT id FROM suppliers WHERE name = 'Steel Authority of India Ltd'), (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-001'), '2025-01-22', '2025-02-21', 485000.00, 87300.00, 572300.00, 'pending'),
('INV-2025-003', (SELECT id FROM suppliers WHERE name = 'JSW Steel Limited'), (SELECT id FROM purchase_orders WHERE po_number = 'PO-2025-003'), '2025-01-28', '2025-02-27', 275000.00, 49500.00, 324500.00, 'overdue');

-- Create sample payables
INSERT INTO public.payables (supplier_id, purchase_invoice_id, original_amount, paid_amount, outstanding_amount, due_date, status) VALUES
((SELECT id FROM suppliers WHERE name = 'Steel Authority of India Ltd'), (SELECT id FROM purchase_invoices WHERE invoice_number = 'INV-2025-002'), 572300.00, 0.00, 572300.00, '2025-02-21', 'outstanding'),
((SELECT id FROM suppliers WHERE name = 'Tata Steel Limited'), (SELECT id FROM purchase_invoices WHERE invoice_number = 'INV-2025-001'), 383500.00, 383500.00, 0.00, '2025-02-24', 'paid'),
((SELECT id FROM suppliers WHERE name = 'JSW Steel Limited'), (SELECT id FROM purchase_invoices WHERE invoice_number = 'INV-2025-003'), 324500.00, 100000.00, 224500.00, '2025-02-27', 'partial');