
-- Insert 10 dummy quotations with realistic data
INSERT INTO public.quotations (quotation_number, customer_id, total_amount, tax_amount, grand_total, status, valid_until, requirement_source, customer_need, terms_conditions, concerned_person, handling_charges, freight_charges, packing_charges, payment_terms) VALUES
('QT-2025-001', (SELECT id FROM customers WHERE name = 'ABC Construction Ltd' LIMIT 1), 125000.00, 22500.00, 147500.00, 'sent', CURRENT_DATE + INTERVAL '30 days', 'email', 'for_project', 'Payment within 30 days. Delivery charges included.', 'Sales Manager', 2500.00, 3750.00, 1250.00, 'Net 30 days'),
('QT-2025-002', (SELECT id FROM customers WHERE name = 'XYZ Infrastructure Pvt Ltd' LIMIT 1), 89500.00, 16110.00, 105610.00, 'approved', CURRENT_DATE + INTERVAL '45 days', 'whatsapp', 'for_stock', 'Bulk discount applied. Installation support included.', 'Project Engineer', 1790.00, 2685.00, 895.00, 'Net 45 days'),
('QT-2025-003', (SELECT id FROM customers WHERE name = 'Global Engineering Works' LIMIT 1), 156000.00, 28080.00, 184080.00, 'draft', CURRENT_DATE + INTERVAL '30 days', 'walk_in', 'for_quotation', 'Premium quality materials. Warranty included.', 'Purchase Head', 3120.00, 4680.00, 1560.00, 'Net 60 days'),
('QT-2025-004', (SELECT id FROM customers WHERE name = 'Modern Fabricators' LIMIT 1), 67500.00, 12150.00, 79650.00, 'sent', CURRENT_DATE + INTERVAL '35 days', 'email', 'for_project', 'Express delivery available. Quality certified.', 'Technical Manager', 1350.00, 2025.00, 675.00, 'Net 30 days'),
('QT-2025-005', (SELECT id FROM customers WHERE name = 'Prime Steel Traders' LIMIT 1), 198000.00, 35640.00, 233640.00, 'approved', CURRENT_DATE + INTERVAL '40 days', 'phone', 'for_stock', 'Volume pricing applied. Free transportation.', 'Sales Manager', 3960.00, 5940.00, 1980.00, 'Net 21 days'),
('QT-2025-006', (SELECT id FROM customers WHERE name = 'Elite Manufacturing Co' LIMIT 1), 78000.00, 14040.00, 92040.00, 'rejected', CURRENT_DATE + INTERVAL '25 days', 'email', 'for_quotation', 'Competitive pricing. Quick delivery.', 'Purchase Manager', 1560.00, 2340.00, 780.00, 'Net 45 days'),
('QT-2025-007', (SELECT id FROM customers WHERE name = 'Tech Structures Ltd' LIMIT 1), 234000.00, 42120.00, 276120.00, 'sent', CURRENT_DATE + INTERVAL '30 days', 'whatsapp', 'for_project', 'Engineering support included. Premium grade.', 'Project Head', 4680.00, 7020.00, 2340.00, 'Net 30 days'),
('QT-2025-008', (SELECT id FROM customers WHERE name = 'Industrial Solutions Inc' LIMIT 1), 145000.00, 26100.00, 171100.00, 'approved', CURRENT_DATE + INTERVAL '50 days', 'email', 'for_stock', 'Bulk order pricing. Extended warranty.', 'Procurement Manager', 2900.00, 4350.00, 1450.00, 'Net 60 days'),
('QT-2025-009', (SELECT id FROM customers WHERE name = 'Quality Builders' LIMIT 1), 56000.00, 10080.00, 66080.00, 'draft', CURRENT_DATE + INTERVAL '30 days', 'walk_in', 'for_quotation', 'Standard terms. Quality assured.', 'Site Engineer', 1120.00, 1680.00, 560.00, 'Net 30 days'),
('QT-2025-010', (SELECT id FROM customers WHERE name = 'Metro Projects' LIMIT 1), 187000.00, 33660.00, 220660.00, 'sent', CURRENT_DATE + INTERVAL '35 days', 'phone', 'for_project', 'Priority delivery. Technical support.', 'Operations Manager', 3740.00, 5610.00, 1870.00, 'Net 45 days');

-- Insert quotation items for each quotation (2-4 items per quotation)
INSERT INTO public.quotation_items (quotation_id, material_id, quantity, unit_price, line_total, notes) VALUES
-- QT-2025-001 items
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-001'), (SELECT id FROM materials WHERE sku = 'MS-SHE-8x4' LIMIT 1), 150.00, 65.00, 9750.00, 'MS Sheet 8mm for structural work'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-001'), (SELECT id FROM materials WHERE sku = 'MS-BAR-16R' LIMIT 1), 200.00, 62.00, 12400.00, 'MS Round Bar 16mm'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-001'), (SELECT id FROM materials WHERE sku = 'MS-ANG-50x50' LIMIT 1), 180.00, 68.00, 12240.00, 'MS Angle 50x50x5mm'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-001'), (SELECT id FROM materials WHERE sku = 'MS-PIP-25R' LIMIT 1), 120.00, 75.00, 9000.00, 'MS Round Pipe 25mm'),

-- QT-2025-002 items
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-002'), (SELECT id FROM materials WHERE sku = 'SS304-SHE-2x4' LIMIT 1), 80.00, 205.00, 16400.00, 'SS304 Sheet 2mm premium quality'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-002'), (SELECT id FROM materials WHERE sku = 'SS304-PIP-25R' LIMIT 1), 60.00, 215.00, 12900.00, 'SS304 Round Pipe 25mm'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-002'), (SELECT id FROM materials WHERE sku = 'AL-SHE-3x4' LIMIT 1), 45.00, 270.00, 12150.00, 'Aluminum Sheet 3mm'),

-- QT-2025-003 items
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-003'), (SELECT id FROM materials WHERE sku = 'SS316-SHE-2x4' LIMIT 1), 70.00, 270.00, 18900.00, 'SS316 Sheet 2mm marine grade'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-003'), (SELECT id FROM materials WHERE sku = 'MS-PLA-20' LIMIT 1), 100.00, 68.00, 6800.00, 'MS Plate 20mm thickness'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-003'), (SELECT id FROM materials WHERE sku = 'SS304-BAR-16R' LIMIT 1), 90.00, 196.00, 17640.00, 'SS304 Round Bar 16mm'),

-- QT-2025-004 items
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-004'), (SELECT id FROM materials WHERE sku = 'MS-SHE-10x4' LIMIT 1), 120.00, 66.00, 7920.00, 'MS Sheet 10mm standard quality'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-004'), (SELECT id FROM materials WHERE sku = 'MS-PIP-50R' LIMIT 1), 85.00, 76.00, 6460.00, 'MS Round Pipe 50mm'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-004'), (SELECT id FROM materials WHERE sku = 'MS-BAR-12R' LIMIT 1), 150.00, 62.00, 9300.00, 'MS Round Bar 12mm'),

-- QT-2025-005 items
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-005'), (SELECT id FROM materials WHERE sku = 'SS304-SHE-3x4' LIMIT 1), 90.00, 207.00, 18630.00, 'SS304 Sheet 3mm high grade'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-005'), (SELECT id FROM materials WHERE sku = 'MS-PLA-25' LIMIT 1), 110.00, 69.00, 7590.00, 'MS Plate 25mm thickness'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-005'), (SELECT id FROM materials WHERE sku = 'AL-BAR-20R' LIMIT 1), 75.00, 260.00, 19500.00, 'Aluminum Round Bar 20mm'),

-- QT-2025-006 items
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-006'), (SELECT id FROM materials WHERE sku = 'MS-SHE-12x4' LIMIT 1), 100.00, 67.00, 6700.00, 'MS Sheet 12mm standard'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-006'), (SELECT id FROM materials WHERE sku = 'MS-PIP-25S' LIMIT 1), 80.00, 77.00, 6160.00, 'MS Square Pipe 25x25mm'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-006'), (SELECT id FROM materials WHERE sku = 'MS-ANG-75x75' LIMIT 1), 75.00, 66.00, 4950.00, 'MS Angle 75x75x6mm'),

-- QT-2025-007 items
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-007'), (SELECT id FROM materials WHERE sku = 'SS304-PLA-15' LIMIT 1), 85.00, 212.00, 18020.00, 'SS304 Plate 15mm premium'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-007'), (SELECT id FROM materials WHERE sku = 'SS304-PIP-50R' LIMIT 1), 65.00, 219.00, 14235.00, 'SS304 Round Pipe 50mm'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-007'), (SELECT id FROM materials WHERE sku = 'MS-BAR-20S' LIMIT 1), 130.00, 64.00, 8320.00, 'MS Square Bar 20x20mm'),

-- QT-2025-008 items
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-008'), (SELECT id FROM materials WHERE sku = 'SS304-ANG-50x50' LIMIT 1), 70.00, 204.00, 14280.00, 'SS304 Angle 50x50x5mm'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-008'), (SELECT id FROM materials WHERE sku = 'MS-PLA-20' LIMIT 1), 95.00, 68.00, 6460.00, 'MS Plate 20mm industrial grade'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-008'), (SELECT id FROM materials WHERE sku = 'AL-SHE-3x4' LIMIT 1), 50.00, 270.00, 13500.00, 'Aluminum Sheet 3mm aerospace grade'),

-- QT-2025-009 items
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-009'), (SELECT id FROM materials WHERE sku = 'MS-SHE-8x4' LIMIT 1), 80.00, 65.00, 5200.00, 'MS Sheet 8mm construction grade'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-009'), (SELECT id FROM materials WHERE sku = 'MS-PIP-25R' LIMIT 1), 60.00, 75.00, 4500.00, 'MS Round Pipe 25mm standard'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-009'), (SELECT id FROM materials WHERE sku = 'MS-BAR-12R' LIMIT 1), 90.00, 62.00, 5580.00, 'MS Round Bar 12mm'),

-- QT-2025-010 items
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-010'), (SELECT id FROM materials WHERE sku = 'SS304-BAR-12R' LIMIT 1), 110.00, 193.00, 21230.00, 'SS304 Round Bar 12mm precision'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-010'), (SELECT id FROM materials WHERE sku = 'MS-ANG-50x50' LIMIT 1), 140.00, 68.00, 9520.00, 'MS Angle 50x50x5mm structural'),
((SELECT id FROM quotations WHERE quotation_number = 'QT-2025-010'), (SELECT id FROM materials WHERE sku = 'AL-BAR-20R' LIMIT 1), 65.00, 260.00, 16900.00, 'Aluminum Round Bar 20mm precision');

-- Insert 10 sales orders (5 linked to approved quotations, 5 standalone)
INSERT INTO public.sales_orders (so_number, customer_id, quotation_id, total_amount, status, order_date, delivery_date, notes) VALUES
('SO-2025-001', (SELECT customer_id FROM quotations WHERE quotation_number = 'QT-2025-002'), (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-002'), 105610.00, 'processing', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', 'Converted from quotation QT-2025-002'),
('SO-2025-002', (SELECT customer_id FROM quotations WHERE quotation_number = 'QT-2025-005'), (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-005'), 233640.00, 'shipped', CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE + INTERVAL '5 days', 'Converted from quotation QT-2025-005'),
('SO-2025-003', (SELECT customer_id FROM quotations WHERE quotation_number = 'QT-2025-008'), (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-008'), 171100.00, 'delivered', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '2 days', 'Converted from quotation QT-2025-008'),
('SO-2025-004', (SELECT id FROM customers WHERE name = 'Skyline Constructions' LIMIT 1), NULL, 156780.00, 'pending', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '12 days', 'Direct order - urgent requirement'),
('SO-2025-005', (SELECT id FROM customers WHERE name = 'Apex Engineering' LIMIT 1), NULL, 89650.00, 'processing', CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE + INTERVAL '8 days', 'Repeat customer - standard order'),
('SO-2025-006', (SELECT id FROM customers WHERE name = 'Royal Fabrications' LIMIT 1), NULL, 198400.00, 'confirmed', CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE + INTERVAL '15 days', 'Large volume order - priority processing'),
('SO-2025-007', (SELECT id FROM customers WHERE name = 'Diamond Industries' LIMIT 1), NULL, 127500.00, 'shipped', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '3 days', 'Export order - quality inspection done'),
('SO-2025-008', (SELECT id FROM customers WHERE name = 'Supreme Contractors' LIMIT 1), NULL, 245600.00, 'pending', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '20 days', 'Project specific materials'),
('SO-2025-009', (SELECT id FROM customers WHERE name = 'ABC Construction Ltd' LIMIT 1), NULL, 78900.00, 'delivered', CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE - INTERVAL '1 day', 'Emergency order - fast delivery'),
('SO-2025-010', (SELECT id FROM customers WHERE name = 'Tech Structures Ltd' LIMIT 1), NULL, 189300.00, 'processing', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '14 days', 'Custom specifications - engineering support');

-- Insert sales order items for quotation-linked orders
INSERT INTO public.sales_order_items (sales_order_id, material_id, quotation_item_id, quantity, unit_price, line_total, notes) VALUES
-- SO-2025-001 (from QT-2025-002)
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-001'), (SELECT material_id FROM quotation_items WHERE quotation_id = (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-002') LIMIT 1 OFFSET 0), (SELECT id FROM quotation_items WHERE quotation_id = (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-002') LIMIT 1 OFFSET 0), 80.00, 205.00, 16400.00, 'As per quotation QT-2025-002'),
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-001'), (SELECT material_id FROM quotation_items WHERE quotation_id = (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-002') LIMIT 1 OFFSET 1), (SELECT id FROM quotation_items WHERE quotation_id = (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-002') LIMIT 1 OFFSET 1), 60.00, 215.00, 12900.00, 'As per quotation QT-2025-002'),
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-001'), (SELECT material_id FROM quotation_items WHERE quotation_id = (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-002') LIMIT 1 OFFSET 2), (SELECT id FROM quotation_items WHERE quotation_id = (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-002') LIMIT 1 OFFSET 2), 45.00, 270.00, 12150.00, 'As per quotation QT-2025-002'),

-- SO-2025-002 (from QT-2025-005)
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-002'), (SELECT material_id FROM quotation_items WHERE quotation_id = (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-005') LIMIT 1 OFFSET 0), (SELECT id FROM quotation_items WHERE quotation_id = (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-005') LIMIT 1 OFFSET 0), 90.00, 207.00, 18630.00, 'As per quotation QT-2025-005'),
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-002'), (SELECT material_id FROM quotation_items WHERE quotation_id = (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-005') LIMIT 1 OFFSET 1), (SELECT id FROM quotation_items WHERE quotation_id = (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-005') LIMIT 1 OFFSET 1), 110.00, 69.00, 7590.00, 'As per quotation QT-2025-005'),
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-002'), (SELECT material_id FROM quotation_items WHERE quotation_id = (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-005') LIMIT 1 OFFSET 2), (SELECT id FROM quotation_items WHERE quotation_id = (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-005') LIMIT 1 OFFSET 2), 75.00, 260.00, 19500.00, 'As per quotation QT-2025-005'),

-- SO-2025-003 (from QT-2025-008)
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-003'), (SELECT material_id FROM quotation_items WHERE quotation_id = (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-008') LIMIT 1 OFFSET 0), (SELECT id FROM quotation_items WHERE quotation_id = (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-008') LIMIT 1 OFFSET 0), 70.00, 204.00, 14280.00, 'As per quotation QT-2025-008'),
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-003'), (SELECT material_id FROM quotation_items WHERE quotation_id = (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-008') LIMIT 1 OFFSET 1), (SELECT id FROM quotation_items WHERE quotation_id = (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-008') LIMIT 1 OFFSET 1), 95.00, 68.00, 6460.00, 'As per quotation QT-2025-008'),
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-003'), (SELECT material_id FROM quotation_items WHERE quotation_id = (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-008') LIMIT 1 OFFSET 2), (SELECT id FROM quotation_items WHERE quotation_id = (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-008') LIMIT 1 OFFSET 2), 50.00, 270.00, 13500.00, 'As per quotation QT-2025-008');

-- Insert sales order items for standalone orders
INSERT INTO public.sales_order_items (sales_order_id, material_id, quantity, unit_price, line_total, notes) VALUES
-- SO-2025-004 (Skyline Constructions)
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-004'), (SELECT id FROM materials WHERE sku = 'MS-SHE-10x4' LIMIT 1), 180.00, 66.00, 11880.00, 'MS Sheet 10mm for construction'),
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-004'), (SELECT id FROM materials WHERE sku = 'MS-PIP-50R' LIMIT 1), 120.00, 76.00, 9120.00, 'MS Round Pipe 50mm'),
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-004'), (SELECT id FROM materials WHERE sku = 'MS-ANG-75x75' LIMIT 1), 160.00, 66.00, 10560.00, 'MS Angle 75x75x6mm'),

-- SO-2025-005 (Apex Engineering)
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-005'), (SELECT id FROM materials WHERE sku = 'SS304-SHE-2x4' LIMIT 1), 60.00, 205.00, 12300.00, 'SS304 Sheet 2mm precision'),
((SELECT id FROM materials WHERE sku = 'SS304-BAR-12R' LIMIT 1), 80.00, 193.00, 15440.00, 'SS304 Round Bar 12mm'),

-- SO-2025-006 (Royal Fabrications)
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-006'), (SELECT id FROM materials WHERE sku = 'MS-PLA-25' LIMIT 1), 140.00, 69.00, 9660.00, 'MS Plate 25mm heavy duty'),
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-006'), (SELECT id FROM materials WHERE sku = 'SS316-SHE-2x4' LIMIT 1), 85.00, 270.00, 22950.00, 'SS316 Sheet 2mm marine grade'),
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-006'), (SELECT id FROM materials WHERE sku = 'AL-SHE-3x4' LIMIT 1), 70.00, 270.00, 18900.00, 'Aluminum Sheet 3mm aerospace'),

-- SO-2025-007 (Diamond Industries)
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-007'), (SELECT id FROM materials WHERE sku = 'SS304-PIP-25R' LIMIT 1), 90.00, 215.00, 19350.00, 'SS304 Round Pipe 25mm export quality'),
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-007'), (SELECT id FROM materials WHERE sku = 'MS-BAR-16R' LIMIT 1), 130.00, 62.00, 8060.00, 'MS Round Bar 16mm'),

-- SO-2025-008 (Supreme Contractors)
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-008'), (SELECT id FROM materials WHERE sku = 'SS304-PLA-15' LIMIT 1), 100.00, 212.00, 21200.00, 'SS304 Plate 15mm premium'),
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-008'), (SELECT id FROM materials WHERE sku = 'MS-SHE-12x4' LIMIT 1), 150.00, 67.00, 10050.00, 'MS Sheet 12mm structural'),
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-008'), (SELECT id FROM materials WHERE sku = 'AL-BAR-20R' LIMIT 1), 95.00, 260.00, 24700.00, 'Aluminum Round Bar 20mm precision'),

-- SO-2025-009 (ABC Construction Ltd)
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-009'), (SELECT id FROM materials WHERE sku = 'MS-SHE-8x4' LIMIT 1), 110.00, 65.00, 7150.00, 'MS Sheet 8mm emergency supply'),
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-009'), (SELECT id FROM materials WHERE sku = 'MS-PIP-25R' LIMIT 1), 85.00, 75.00, 6375.00, 'MS Round Pipe 25mm fast delivery'),

-- SO-2025-010 (Tech Structures Ltd)
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-010'), (SELECT id FROM materials WHERE sku = 'SS304-ANG-50x50' LIMIT 1), 120.00, 204.00, 24480.00, 'SS304 Angle 50x50x5mm custom'),
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-010'), (SELECT id FROM materials WHERE sku = 'MS-PLA-20' LIMIT 1), 180.00, 68.00, 12240.00, 'MS Plate 20mm engineering grade'),
((SELECT id FROM sales_orders WHERE so_number = 'SO-2025-010'), (SELECT id FROM materials WHERE sku = 'SS304-PIP-50R' LIMIT 1), 75.00, 219.00, 16425.00, 'SS304 Round Pipe 50mm precision');
