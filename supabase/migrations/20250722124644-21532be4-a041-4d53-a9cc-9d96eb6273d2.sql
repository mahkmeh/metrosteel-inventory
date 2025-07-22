
-- Insert Locations (Warehouses)
INSERT INTO public.locations (name, address, is_active) VALUES
('Main Warehouse', 'Industrial Area Phase 1, Sector 15, Gurgaon - 122001', true),
('Secondary Warehouse', 'Plot No. 45, Industrial Estate, Faridabad - 121003', true),
('Processing Unit', 'Manufacturing Hub, Manesar - 122051', true),
('Quality Control Center', 'Lab Complex, Sector 18, Gurgaon - 122015', true);

-- Insert Suppliers (Vendors/Contractors)
INSERT INTO public.suppliers (name, contact_person, phone, email, address, gst_number, payment_terms, is_active) VALUES
('Steel Authority of India Ltd', 'Rajesh Kumar', '+91-9876543210', 'rajesh@sail.co.in', 'Steel Plant, Bhilai, Chhattisgarh - 490001', '27AABCS1234F1Z5', 'Net 30 days', true),
('Tata Steel Limited', 'Priya Sharma', '+91-9876543211', 'priya@tatasteel.com', 'Jamshedpur Works, Jharkhand - 831001', '20AABCT1234G1Z6', 'Net 45 days', true),
('JSW Steel Limited', 'Amit Patel', '+91-9876543212', 'amit@jswsteel.in', 'Vijayanagar Works, Karnataka - 583275', '29AABCJ1234H1Z7', 'Net 30 days', true),
('Jindal Steel & Power', 'Sunita Gupta', '+91-9876543213', 'sunita@jindalsteel.com', 'Raigarh Plant, Chhattisgarh - 496001', '22AABCJ1234I1Z8', 'Net 60 days', true),
('Precision Cutting Services', 'Manoj Singh', '+91-9876543214', 'manoj@precisioncut.com', 'Industrial Area, Gurgaon - 122016', '06AABCP1234J1Z9', 'Net 15 days', true),
('Advanced Welding Works', 'Deepika Rao', '+91-9876543215', 'deepika@advwelding.com', 'Sector 20, Faridabad - 121002', '06AABCA1234K1A0', 'Net 30 days', true),
('Metal Bending Solutions', 'Vikram Joshi', '+91-9876543216', 'vikram@metalbend.com', 'Phase 2, Manesar - 122052', '06AABCM1234L1A1', 'Net 21 days', true),
('Quality Processing Unit', 'Neha Agarwal', '+91-9876543217', 'neha@qualityprocess.com', 'Industrial Hub, Rewari - 123401', '06AABCQ1234M1A2', 'Net 30 days', true),
('Supreme Steel Suppliers', 'Karan Malhotra', '+91-9876543218', 'karan@supremesteel.com', 'Steel Market, Delhi - 110007', '07AABCS1234N1A3', 'Net 45 days', true),
('Metro Steel Trading', 'Anjali Verma', '+91-9876543219', 'anjali@metrosteel.com', 'Industrial Complex, Noida - 201301', '09AABCM1234O1A4', 'Net 30 days', true);

-- Insert Customers
INSERT INTO public.customers (name, contact_person, phone, email, address, gst_number, credit_days, credit_limit, is_active) VALUES
('ABC Construction Ltd', 'Rohit Sharma', '+91-9876501001', 'rohit@abcconstruction.com', 'Building No. 12, Cyber City, Gurgaon - 122002', '06AABCA1234A1Z5', 30, 500000.00, true),
('XYZ Infrastructure Pvt Ltd', 'Meera Reddy', '+91-9876501002', 'meera@xyzinfra.com', 'Tower B, Sector 44, Noida - 201303', '09AABCX1234B1Z6', 45, 750000.00, true),
('Global Engineering Works', 'Arjun Kapoor', '+91-9876501003', 'arjun@globaleng.com', 'Industrial Plot 23, Faridabad - 121004', '06AABCG1234C1Z7', 60, 1000000.00, true),
('Modern Fabricators', 'Sanjana Iyer', '+91-9876501004', 'sanjana@modernfab.com', 'Workshop 15, Manesar - 122053', '06AABCM1234D1Z8', 30, 300000.00, true),
('Prime Steel Traders', 'Rajesh Gupta', '+91-9876501005', 'rajesh@primesteel.com', 'Market Complex, Delhi - 110008', '07AABCP1234E1Z9', 21, 400000.00, true),
('Elite Manufacturing Co', 'Kavya Nair', '+91-9876501006', 'kavya@elitemfg.com', 'Sector 8, Gurgaon - 122001', '06AABCE1234F1A0', 45, 600000.00, true),
('Tech Structures Ltd', 'Ankit Jain', '+91-9876501007', 'ankit@techstruct.com', 'IT Park, Sector 62, Noida - 201309', '09AABCT1234G1A1', 30, 800000.00, true),
('Industrial Solutions Inc', 'Pooja Malhotra', '+91-9876501008', 'pooja@indsolutions.com', 'Phase 3, Industrial Area, Gurgaon - 122016', '06AABCI1234H1A2', 60, 1200000.00, true),
('Quality Builders', 'Varun Thakur', '+91-9876501009', 'varun@qualitybuilders.com', 'Sector 15, Faridabad - 121007', '06AABCQ1234I1A3', 30, 350000.00, true),
('Metro Projects', 'Ritu Singh', '+91-9876501010', 'ritu@metroprojects.com', 'Commercial Complex, Rewari - 123401', '06AABCM1234J1A4', 45, 550000.00, true),
('Skyline Constructions', 'Ashish Agarwal', '+91-9876501011', 'ashish@skylineconst.com', 'Tower C, Sector 18, Noida - 201301', '09AABCS1234K1A5', 30, 700000.00, true),
('Apex Engineering', 'Divya Chauhan', '+91-9876501012', 'divya@apexeng.com', 'Industrial Zone, Panipat - 132103', '06AABCA1234L1A6', 21, 450000.00, true),
('Royal Fabrications', 'Manish Kumar', '+91-9876501013', 'manish@royalfab.com', 'Sector 37, Gurgaon - 122001', '06AABCR1234M1A7', 45, 380000.00, true),
('Diamond Industries', 'Shreya Patel', '+91-9876501014', 'shreya@diamondind.com', 'Plot 67, Industrial Estate, Faridabad - 121003', '06AABCD1234N1A8', 30, 650000.00, true),
('Supreme Contractors', 'Nitin Yadav', '+91-9876501015', 'nitin@supremecontr.com', 'Phase 1, Manesar - 122050', '06AABCS1234O1A9', 60, 900000.00, true);

-- Insert Materials (Steel Products)
INSERT INTO public.materials (sku, name, grade, category, thickness, width, length, finish, unit, base_price, description, is_active) VALUES
-- MS Sheets
('MS-SHE-8x4', 'MS Sheet 8mm x 4ft', 'MS', 'Sheet', 8.00, 1220.00, 2440.00, '2B', 'KG', 58.50, '8mm thick MS sheet 4x8 feet', true),
('MS-SHE-10x4', 'MS Sheet 10mm x 4ft', 'MS', 'Sheet', 10.00, 1220.00, 2440.00, '2B', 'KG', 59.20, '10mm thick MS sheet 4x8 feet', true),
('MS-SHE-12x4', 'MS Sheet 12mm x 4ft', 'MS', 'Sheet', 12.00, 1220.00, 2440.00, '2B', 'KG', 60.10, '12mm thick MS sheet 4x8 feet', true),
-- SS Sheets
('SS304-SHE-2x4', 'SS304 Sheet 2mm x 4ft', '304', 'Sheet', 2.00, 1220.00, 2440.00, 'BA', 'KG', 185.00, '2mm thick SS304 sheet 4x8 feet', true),
('SS304-SHE-3x4', 'SS304 Sheet 3mm x 4ft', '304', 'Sheet', 3.00, 1220.00, 2440.00, 'BA', 'KG', 187.50, '3mm thick SS304 sheet 4x8 feet', true),
('SS316-SHE-2x4', 'SS316 Sheet 2mm x 4ft', '316', 'Sheet', 2.00, 1220.00, 2440.00, 'HL', 'KG', 245.00, '2mm thick SS316 sheet 4x8 feet', true),
-- MS Pipes
('MS-PIP-25R', 'MS Round Pipe 25mm', 'MS', 'Pipe', 2.00, 25.00, 6000.00, 'Black', 'KG', 68.50, '25mm diameter MS round pipe', true),
('MS-PIP-50R', 'MS Round Pipe 50mm', 'MS', 'Pipe', 3.00, 50.00, 6000.00, 'Black', 'KG', 69.20, '50mm diameter MS round pipe', true),
('MS-PIP-25S', 'MS Square Pipe 25x25mm', 'MS', 'Pipe', 2.00, 25.00, 6000.00, 'Black', 'KG', 70.00, '25x25mm MS square pipe', true),
-- SS Pipes
('SS304-PIP-25R', 'SS304 Round Pipe 25mm', '304', 'Pipe', 2.00, 25.00, 6000.00, 'Mirror', 'KG', 195.00, '25mm diameter SS304 round pipe', true),
('SS304-PIP-50R', 'SS304 Round Pipe 50mm', '304', 'Pipe', 3.00, 50.00, 6000.00, 'Mirror', 'KG', 198.50, '50mm diameter SS304 round pipe', true),
-- MS Bars
('MS-BAR-12R', 'MS Round Bar 12mm', 'MS', 'Bar', NULL, 12.00, 6000.00, 'Black', 'KG', 56.50, '12mm diameter MS round bar', true),
('MS-BAR-16R', 'MS Round Bar 16mm', 'MS', 'Bar', NULL, 16.00, 6000.00, 'Black', 'KG', 57.20, '16mm diameter MS round bar', true),
('MS-BAR-20S', 'MS Square Bar 20x20mm', 'MS', 'Bar', NULL, 20.00, 6000.00, 'Black', 'KG', 58.00, '20x20mm MS square bar', true),
-- SS Bars
('SS304-BAR-12R', 'SS304 Round Bar 12mm', '304', 'Bar', NULL, 12.00, 6000.00, 'Bright', 'KG', 175.00, '12mm diameter SS304 round bar', true),
('SS304-BAR-16R', 'SS304 Round Bar 16mm', '304', 'Bar', NULL, 16.00, 6000.00, 'Bright', 'KG', 178.50, '16mm diameter SS304 round bar', true),
-- MS Angles
('MS-ANG-50x50', 'MS Angle 50x50x5mm', 'MS', 'Angle', 5.00, 50.00, 6000.00, 'Black', 'KG', 59.50, '50x50x5mm MS angle', true),
('MS-ANG-75x75', 'MS Angle 75x75x6mm', 'MS', 'Angle', 6.00, 75.00, 6000.00, 'Black', 'KG', 60.20, '75x75x6mm MS angle', true),
-- SS Angles
('SS304-ANG-50x50', 'SS304 Angle 50x50x5mm', '304', 'Angle', 5.00, 50.00, 6000.00, 'Pickled', 'KG', 185.00, '50x50x5mm SS304 angle', true),
-- MS Plates
('MS-PLA-20', 'MS Plate 20mm', 'MS', 'Plate', 20.00, 1500.00, 3000.00, 'Mill', 'KG', 61.50, '20mm thick MS plate', true),
('MS-PLA-25', 'MS Plate 25mm', 'MS', 'Plate', 25.00, 1500.00, 3000.00, 'Mill', 'KG', 62.20, '25mm thick MS plate', true),
-- SS Plates
('SS304-PLA-15', 'SS304 Plate 15mm', '304', 'Plate', 15.00, 1500.00, 3000.00, '2B', 'KG', 192.00, '15mm thick SS304 plate', true),
-- Aluminum
('AL-SHE-3x4', 'Aluminum Sheet 3mm x 4ft', '6061', 'Sheet', 3.00, 1220.00, 2440.00, 'Mill', 'KG', 245.00, '3mm thick Aluminum sheet 4x8 feet', true),
('AL-BAR-20R', 'Aluminum Round Bar 20mm', '6061', 'Bar', NULL, 20.00, 6000.00, 'Bright', 'KG', 235.00, '20mm diameter Aluminum round bar', true);

-- Insert Batches with realistic data
INSERT INTO public.batches (batch_code, sku_id, supplier_id, total_weight_kg, available_weight_kg, quality_grade, heat_number, manufactured_date, received_date, status, notes, make) 
SELECT 
  'B' || LPAD((ROW_NUMBER() OVER())::TEXT, 3, '0'),
  m.id,
  s.id,
  CASE 
    WHEN m.category = 'Sheet' THEN ROUND((RANDOM() * 2000 + 500)::numeric, 2)
    WHEN m.category = 'Pipe' THEN ROUND((RANDOM() * 1500 + 300)::numeric, 2)
    WHEN m.category = 'Bar' THEN ROUND((RANDOM() * 1200 + 200)::numeric, 2)
    WHEN m.category = 'Angle' THEN ROUND((RANDOM() * 1000 + 200)::numeric, 2)
    WHEN m.category = 'Plate' THEN ROUND((RANDOM() * 3000 + 1000)::numeric, 2)
    ELSE ROUND((RANDOM() * 1000 + 100)::numeric, 2)
  END as total_weight,
  CASE 
    WHEN m.category = 'Sheet' THEN ROUND((RANDOM() * 2000 + 500)::numeric, 2)
    WHEN m.category = 'Pipe' THEN ROUND((RANDOM() * 1500 + 300)::numeric, 2)
    WHEN m.category = 'Bar' THEN ROUND((RANDOM() * 1200 + 200)::numeric, 2)
    WHEN m.category = 'Angle' THEN ROUND((RANDOM() * 1000 + 200)::numeric, 2)
    WHEN m.category = 'Plate' THEN ROUND((RANDOM() * 3000 + 1000)::numeric, 2)
    ELSE ROUND((RANDOM() * 1000 + 100)::numeric, 2)
  END as available_weight,
  CASE (RANDOM() * 3)::INT
    WHEN 0 THEN 'A'
    WHEN 1 THEN 'B'
    ELSE 'A'
  END,
  CASE 
    WHEN m.grade LIKE 'SS%' THEN 'SS' || (RANDOM() * 9999 + 1000)::INT || 'L' || (RANDOM() * 99 + 10)::INT
    WHEN m.grade = 'MS' THEN 'MS' || (RANDOM() * 9999 + 1000)::INT || 'H' || (RANDOM() * 99 + 10)::INT
    ELSE 'AL' || (RANDOM() * 9999 + 1000)::INT || 'T' || (RANDOM() * 99 + 10)::INT
  END,
  CURRENT_DATE - (RANDOM() * 90)::INT,
  CURRENT_DATE - (RANDOM() * 60)::INT,
  'active',
  CASE (RANDOM() * 4)::INT
    WHEN 0 THEN 'Premium quality batch'
    WHEN 1 THEN 'Standard industrial grade'
    WHEN 2 THEN 'Export quality material'
    ELSE 'Mill test certificate available'
  END,
  CASE (RANDOM() * 4)::INT
    WHEN 0 THEN s.name
    WHEN 1 THEN 'SAIL'
    WHEN 2 THEN 'TATA'
    ELSE 'JSW'
  END
FROM 
  materials m
CROSS JOIN 
  (SELECT id FROM suppliers ORDER BY RANDOM() LIMIT 1) s
WHERE m.is_active = true;

-- Update batches to have different suppliers for variety
WITH numbered_batches AS (
  SELECT b.id, s.id as supplier_id, 
         ROW_NUMBER() OVER (ORDER BY b.created_at) as rn,
         COUNT(*) OVER () as total_batches
  FROM batches b
  CROSS JOIN (SELECT id FROM suppliers WHERE is_active = true) s
)
UPDATE batches 
SET supplier_id = nb.supplier_id
FROM numbered_batches nb
WHERE batches.id = nb.id 
AND nb.rn % (SELECT COUNT(*) FROM suppliers WHERE is_active = true) = (nb.supplier_id::text::hash() % (SELECT COUNT(*) FROM suppliers WHERE is_active = true));

-- Generate Purchase Orders
INSERT INTO public.purchase_orders (po_number, supplier_id, total_amount, status, order_date, expected_delivery, notes)
SELECT 
  'PO-2025-' || LPAD(generate_series::TEXT, 3, '0'),
  (SELECT id FROM suppliers ORDER BY RANDOM() LIMIT 1),
  ROUND((RANDOM() * 200000 + 50000)::numeric, 2),
  CASE (RANDOM() * 4)::INT
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'confirmed'
    WHEN 2 THEN 'received'
    ELSE 'pending'
  END,
  CURRENT_DATE - (RANDOM() * 60)::INT,
  CURRENT_DATE + (RANDOM() * 30 + 7)::INT,
  CASE (RANDOM() * 3)::INT
    WHEN 0 THEN 'Urgent delivery required'
    WHEN 1 THEN 'Quality inspection mandatory'
    ELSE 'Standard delivery terms'
  END
FROM generate_series(1, 18);

-- Generate Purchase Order Items
INSERT INTO public.purchase_order_items (purchase_order_id, material_id, quantity, unit_price, line_total, order_type, notes)
SELECT 
  po.id,
  m.id,
  ROUND((RANDOM() * 1000 + 100)::numeric, 2),
  ROUND((m.base_price * (0.8 + RANDOM() * 0.4))::numeric, 2),
  0, -- Will be updated below
  CASE (RANDOM() * 2)::INT
    WHEN 0 THEN 'stock'
    ELSE 'direct'
  END,
  'Purchase order item for ' || m.name
FROM purchase_orders po
CROSS JOIN LATERAL (
  SELECT id, name, base_price 
  FROM materials 
  WHERE is_active = true 
  ORDER BY RANDOM() 
  LIMIT (1 + (RANDOM() * 3)::INT)
) m;

-- Update line totals for purchase order items
UPDATE purchase_order_items 
SET line_total = quantity * unit_price;

-- Update purchase order totals
UPDATE purchase_orders 
SET total_amount = (
  SELECT COALESCE(SUM(line_total), 0) 
  FROM purchase_order_items 
  WHERE purchase_order_id = purchase_orders.id
);

-- Generate Quotations
INSERT INTO public.quotations (quotation_number, customer_id, total_amount, tax_amount, grand_total, valid_until, status, requirement_source, customer_need, terms_conditions, concerned_person)
SELECT 
  'QT-2025-' || LPAD(generate_series::TEXT, 4, '0'),
  (SELECT id FROM customers ORDER BY RANDOM() LIMIT 1),
  0, -- Will be calculated
  0, -- Will be calculated  
  0, -- Will be calculated
  CURRENT_DATE + (RANDOM() * 30 + 15)::INT,
  CASE (RANDOM() * 5)::INT
    WHEN 0 THEN 'draft'
    WHEN 1 THEN 'sent'
    WHEN 2 THEN 'accepted'
    WHEN 3 THEN 'rejected'
    ELSE 'expired'
  END,
  CASE (RANDOM() * 4)::INT
    WHEN 0 THEN 'email'
    WHEN 1 THEN 'whatsapp'
    WHEN 2 THEN 'phone'
    ELSE 'walk_in'
  END,
  CASE (RANDOM() * 3)::INT
    WHEN 0 THEN 'for_quotation'
    WHEN 1 THEN 'for_stock'
    ELSE 'for_project'
  END,
  'Standard payment terms: Net 30 days. Delivery: Ex-works. Validity: 30 days.',
  CASE (RANDOM() * 3)::INT
    WHEN 0 THEN 'Sales Manager'
    WHEN 1 THEN 'Project Engineer'
    ELSE 'Purchase Head'
  END
FROM generate_series(1, 25);

-- Generate Quotation Items
INSERT INTO public.quotation_items (quotation_id, material_id, quantity, unit_price, line_total, notes)
SELECT 
  q.id,
  m.id,
  ROUND((RANDOM() * 500 + 50)::numeric, 2),
  ROUND((m.base_price * (1.1 + RANDOM() * 0.3))::numeric, 2), -- 10-40% markup
  0, -- Will be updated below
  'Quotation item for ' || m.name
FROM quotations q
CROSS JOIN LATERAL (
  SELECT id, name, base_price 
  FROM materials 
  WHERE is_active = true 
  ORDER BY RANDOM() 
  LIMIT (1 + (RANDOM() * 4)::INT)
) m;

-- Update quotation item line totals
UPDATE quotation_items 
SET line_total = quantity * unit_price;

-- Update quotation totals
UPDATE quotations 
SET total_amount = subquery.total,
    tax_amount = ROUND((subquery.total * 0.18)::numeric, 2),
    grand_total = ROUND((subquery.total * 1.18)::numeric, 2)
FROM (
  SELECT quotation_id, COALESCE(SUM(line_total), 0) as total
  FROM quotation_items 
  GROUP BY quotation_id
) subquery
WHERE quotations.id = subquery.quotation_id;

-- Generate Sales Orders from accepted quotations
INSERT INTO public.sales_orders (so_number, customer_id, quotation_id, total_amount, status, order_date, delivery_date, notes)
SELECT 
  'SO-2025-' || LPAD((ROW_NUMBER() OVER())::TEXT, 4, '0'),
  q.customer_id,
  q.id,
  q.grand_total,
  CASE (RANDOM() * 3)::INT
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'confirmed'
    ELSE 'delivered'
  END,
  CURRENT_DATE - (RANDOM() * 30)::INT,
  CURRENT_DATE + (RANDOM() * 15 + 5)::INT,
  'Sales order converted from quotation ' || q.quotation_number
FROM quotations q
WHERE q.status = 'accepted'
ORDER BY RANDOM()
LIMIT 15;

-- Generate Sales Order Items from quotation items
INSERT INTO public.sales_order_items (sales_order_id, material_id, quotation_item_id, quantity, unit_price, line_total, notes)
SELECT 
  so.id,
  qi.material_id,
  qi.id,
  qi.quantity,
  qi.unit_price,
  qi.line_total,
  'Converted from quotation item'
FROM sales_orders so
JOIN quotation_items qi ON qi.quotation_id = so.quotation_id;

-- Generate Purchase Invoices for received POs
INSERT INTO public.purchase_invoices (invoice_number, supplier_id, purchase_order_id, invoice_date, due_date, subtotal_amount, tax_amount, total_amount, status, notes)
SELECT 
  'PI-2025-' || LPAD((ROW_NUMBER() OVER())::TEXT, 4, '0'),
  po.supplier_id,
  po.id,
  po.order_date + (RANDOM() * 10 + 5)::INT,
  po.order_date + (RANDOM() * 10 + 5)::INT + (s.payment_terms::INTEGER),
  po.total_amount,
  ROUND((po.total_amount * 0.18)::numeric, 2),
  ROUND((po.total_amount * 1.18)::numeric, 2),
  CASE (RANDOM() * 3)::INT
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'approved'
    ELSE 'paid'
  END,
  'Invoice for PO: ' || po.po_number
FROM purchase_orders po
JOIN suppliers s ON s.id = po.supplier_id
WHERE po.status = 'received'
ORDER BY RANDOM()
LIMIT 12;

-- Generate Payables for unpaid invoices
INSERT INTO public.payables (supplier_id, purchase_invoice_id, original_amount, outstanding_amount, due_date, status, notes)
SELECT 
  pi.supplier_id,
  pi.id,
  pi.total_amount,
  CASE 
    WHEN pi.status = 'paid' THEN 0
    ELSE pi.total_amount * (0.3 + RANDOM() * 0.7) -- Partial payments
  END,
  pi.due_date,
  CASE 
    WHEN pi.status = 'paid' THEN 'paid'
    WHEN pi.due_date < CURRENT_DATE THEN 'overdue'
    ELSE 'outstanding'
  END,
  'Payment for invoice: ' || pi.invoice_number
FROM purchase_invoices pi;

-- Generate Job Work Transformations
INSERT INTO public.job_work_transformations (
  job_work_number, contractor_id, input_batch_id, input_weight_kg, input_sku_id, 
  output_sku_id, expected_output_weight_kg, process_type, process_description,
  sent_date, expected_return_date, status, processing_cost_per_kg, total_processing_cost
)
SELECT 
  'JW' || (1000000000 + (ROW_NUMBER() OVER())::BIGINT),
  (SELECT id FROM suppliers WHERE name LIKE '%Cutting%' OR name LIKE '%Welding%' OR name LIKE '%Bending%' OR name LIKE '%Processing%' ORDER BY RANDOM() LIMIT 1),
  b.id,
  ROUND((RANDOM() * 500 + 100)::numeric, 2),
  b.sku_id,
  (SELECT id FROM materials WHERE category != (SELECT category FROM materials WHERE id = b.sku_id) ORDER BY RANDOM() LIMIT 1),
  ROUND((RANDOM() * 450 + 80)::numeric, 2), -- Slight weight loss in processing
  CASE (RANDOM() * 4)::INT
    WHEN 0 THEN 'cutting'
    WHEN 1 THEN 'bending'
    WHEN 2 THEN 'welding'
    ELSE 'machining'
  END,
  CASE (RANDOM() * 4)::INT
    WHEN 0 THEN 'Precision cutting to custom dimensions'
    WHEN 1 THEN 'CNC bending as per drawing specifications'
    WHEN 2 THEN 'TIG welding for structural assembly'
    ELSE 'CNC machining for finished components'
  END,
  CURRENT_DATE - (RANDOM() * 45)::INT,
  CURRENT_DATE - (RANDOM() * 45)::INT + (RANDOM() * 21 + 7)::INT,
  CASE (RANDOM() * 3)::INT
    WHEN 0 THEN 'sent'
    WHEN 1 THEN 'completed'
    ELSE 'in_progress'
  END,
  ROUND((RANDOM() * 15 + 5)::numeric, 2),
  0 -- Will be calculated
FROM batches b
ORDER BY RANDOM()
LIMIT 15;

-- Update total processing cost
UPDATE job_work_transformations 
SET total_processing_cost = input_weight_kg * processing_cost_per_kg;

-- Complete some job work transformations (add actual output data)
UPDATE job_work_transformations 
SET actual_output_weight_kg = expected_output_weight_kg * (0.9 + RANDOM() * 0.15),
    actual_return_date = expected_return_date + (RANDOM() * 5 - 2)::INT,
    status = 'completed'
WHERE status = 'completed';

-- Generate Inventory from batches
INSERT INTO public.inventory (material_id, location_id, quantity, quality_grade, unit_cost, total_value)
SELECT 
  b.sku_id,
  (SELECT id FROM locations ORDER BY RANDOM() LIMIT 1),
  b.available_weight_kg,
  b.quality_grade,
  m.base_price * (0.9 + RANDOM() * 0.2),
  b.available_weight_kg * m.base_price * (0.9 + RANDOM() * 0.2)
FROM batches b
JOIN materials m ON m.id = b.sku_id
WHERE b.status = 'active';

-- Generate Batch Inventory
INSERT INTO public.batch_inventory (batch_id, location_id, quantity_kg, unit_cost_per_kg, total_value)
SELECT 
  b.id,
  (SELECT id FROM locations ORDER BY RANDOM() LIMIT 1),
  b.available_weight_kg,
  m.base_price * (0.9 + RANDOM() * 0.2),
  b.available_weight_kg * m.base_price * (0.9 + RANDOM() * 0.2)
FROM batches b
JOIN materials m ON m.id = b.sku_id
WHERE b.status = 'active';

-- Generate Purchase Returns
INSERT INTO public.purchase_returns (
  return_number, supplier_id, purchase_order_id, purchase_invoice_id, 
  return_date, total_return_amount, return_reason, status, notes
)
SELECT 
  'PR-2025-' || LPAD((ROW_NUMBER() OVER())::TEXT, 3, '0'),
  pi.supplier_id,
  pi.purchase_order_id,
  pi.id,
  pi.invoice_date + (RANDOM() * 15 + 1)::INT,
  ROUND((pi.total_amount * (0.05 + RANDOM() * 0.15))::numeric, 2),
  CASE (RANDOM() * 4)::INT
    WHEN 0 THEN 'quality_issue'
    WHEN 1 THEN 'wrong_specification'
    WHEN 2 THEN 'damage_in_transit'
    ELSE 'excess_quantity'
  END,
  CASE (RANDOM() * 3)::INT
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'approved'
    ELSE 'completed'
  END,
  'Return of defective/excess materials'
FROM purchase_invoices pi
ORDER BY RANDOM()
LIMIT 5;

-- Generate Purchase Return Items
INSERT INTO public.purchase_return_items (
  purchase_return_id, material_id, batch_id, quantity_returned, 
  unit_price, line_total, return_reason, notes
)
SELECT 
  pr.id,
  poi.material_id,
  (SELECT id FROM batches WHERE sku_id = poi.material_id ORDER BY RANDOM() LIMIT 1),
  ROUND((poi.quantity * 0.1 * (0.5 + RANDOM() * 0.5))::numeric, 2),
  poi.unit_price,
  0, -- Will be calculated
  pr.return_reason,
  'Returned item: ' || (SELECT name FROM materials WHERE id = poi.material_id)
FROM purchase_returns pr
JOIN purchase_order_items poi ON poi.purchase_order_id = pr.purchase_order_id
ORDER BY RANDOM()
LIMIT 8;

-- Update return item line totals
UPDATE purchase_return_items 
SET line_total = quantity_returned * unit_price;

-- Generate Transactions for inventory movements
INSERT INTO public.transactions (
  transaction_type, material_id, location_id, quantity, weight_kg, 
  unit_cost, batch_id, reference_type, reference_id, notes
)
-- Purchase receipts
SELECT 
  'in',
  poi.material_id,
  (SELECT id FROM locations ORDER BY RANDOM() LIMIT 1),
  poi.quantity,
  poi.quantity,
  poi.unit_price,
  (SELECT id FROM batches WHERE sku_id = poi.material_id ORDER BY RANDOM() LIMIT 1),
  'purchase_order',
  poi.purchase_order_id,
  'Stock receipt from PO: ' || po.po_number
FROM purchase_order_items poi
JOIN purchase_orders po ON po.id = poi.purchase_order_id
WHERE po.status = 'received'

UNION ALL

-- Sales dispatches  
SELECT 
  'out',
  soi.material_id,
  (SELECT id FROM locations ORDER BY RANDOM() LIMIT 1),
  soi.quantity,
  soi.quantity,
  soi.unit_price,
  (SELECT id FROM batches WHERE sku_id = soi.material_id ORDER BY RANDOM() LIMIT 1),
  'sales_order',
  soi.sales_order_id,
  'Stock dispatch for SO: ' || so.so_number
FROM sales_order_items soi
JOIN sales_orders so ON so.id = soi.sales_order_id
WHERE so.status = 'delivered'

UNION ALL

-- Job work outward
SELECT 
  'out',
  jwt.input_sku_id,
  (SELECT id FROM locations ORDER BY RANDOM() LIMIT 1),
  jwt.input_weight_kg,
  jwt.input_weight_kg,
  NULL,
  jwt.input_batch_id,
  'job_work_outward',
  jwt.id,
  'Job work outward: ' || jwt.job_work_number
FROM job_work_transformations jwt

UNION ALL

-- Job work inward (for completed jobs)
SELECT 
  'in',
  jwt.output_sku_id,
  (SELECT id FROM locations ORDER BY RANDOM() LIMIT 1),
  jwt.actual_output_weight_kg,
  jwt.actual_output_weight_kg,
  NULL,
  jwt.output_batch_id,
  'job_work_inward',
  jwt.id,
  'Job work inward: ' || jwt.job_work_number
FROM job_work_transformations jwt
WHERE jwt.status = 'completed' AND jwt.actual_output_weight_kg IS NOT NULL;

-- Generate Quotation Reminders
INSERT INTO public.quotation_reminders (quotation_id, reminder_type, method, sent_date, notes)
SELECT 
  q.id,
  CASE (RANDOM() * 3)::INT
    WHEN 0 THEN 'follow_up'
    WHEN 1 THEN 'final_reminder'
    ELSE 'price_update'
  END,
  CASE (RANDOM() * 4)::INT
    WHEN 0 THEN 'email'
    WHEN 1 THEN 'phone'
    WHEN 2 THEN 'whatsapp'
    ELSE 'sms'
  END,
  CURRENT_DATE - (RANDOM() * 15)::INT,
  'Reminder sent to customer for quotation follow-up'
FROM quotations q
WHERE q.status IN ('sent', 'expired')
ORDER BY RANDOM()
LIMIT 12;
