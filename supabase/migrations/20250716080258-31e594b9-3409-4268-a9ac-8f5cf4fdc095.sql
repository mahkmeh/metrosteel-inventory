-- Insert mock locations
INSERT INTO public.locations (name, address, is_active) VALUES
('Main Warehouse Mumbai', 'Plot 123, Industrial Area, Andheri East, Mumbai - 400069', true),
('Delhi Distribution Center', 'Sector 45, Industrial Area, Gurgaon, Delhi - 122003', true),
('Chennai Branch', 'No. 67, Industrial Estate, Guindy, Chennai - 600032', true),
('Pune Storage Facility', 'Survey No. 89, Hinjewadi Industrial Area, Pune - 411057', true),
('Kolkata Depot', 'Plot 234, Salt Lake Industrial Complex, Kolkata - 700091', true);

-- Insert mock customers
INSERT INTO public.customers (name, contact_person, phone, email, address, gst_number, credit_days, credit_limit, is_active) VALUES
('Tata Steel Processing Ltd', 'Rajesh Kumar', '+91-9876543210', 'rajesh@tataprocessing.com', 'Industrial Area, Jamshedpur - 831001', '20AABCT1234C1Z5', 30, 5000000.00, true),
('Jindal Fabricators Pvt Ltd', 'Priya Sharma', '+91-9876543211', 'priya@jindalfab.com', 'Plot 45, Industrial Estate, Hisar - 125001', '06AABCJ5678D1Z8', 45, 3000000.00, true),
('Mumbai Steel Works', 'Amit Patel', '+91-9876543212', 'amit@mumbaisteel.com', 'Wadala Industrial Area, Mumbai - 400037', '27AABCM9012E1Z3', 30, 2500000.00, true),
('Chennai Metal Industries', 'Lakshmi Nair', '+91-9876543213', 'lakshmi@chennaimetals.com', 'Ambattur Industrial Estate, Chennai - 600058', '33AABCC3456F1Z7', 60, 4000000.00, true),
('Bangalore Auto Components', 'Suresh Reddy', '+91-9876543214', 'suresh@bangaloreauto.com', 'Peenya Industrial Area, Bangalore - 560058', '29AABCB7890G1Z2', 30, 1500000.00, true),
('Delhi Construction Corp', 'Vikram Singh', '+91-9876543215', 'vikram@delhiconstruction.com', 'Mayapuri Industrial Area, Delhi - 110064', '07AABCD2345H1Z6', 45, 3500000.00, true),
('Hyderabad Engineering', 'Ravi Chandra', '+91-9876543216', 'ravi@hydengg.com', 'IDA Bollaram, Hyderabad - 502325', '36AABCH6789I1Z1', 30, 2000000.00, true),
('Pune Automotive Ltd', 'Sneha Joshi', '+91-9876543217', 'sneha@puneauto.com', 'Aurangabad Road, Pune - 411003', '27AABCP1234J1Z4', 60, 2800000.00, true),
('Gujarat Steel Traders', 'Kiran Patel', '+91-9876543218', 'kiran@gujaratsteel.com', 'GIDC Vatva, Ahmedabad - 382445', '24AABCG5678K1Z9', 30, 4500000.00, true),
('Kolkata Industrial Supply', 'Debraj Mukherjee', '+91-9876543219', 'debraj@kolkataindustrial.com', 'Dankuni Industrial Area, Kolkata - 712311', '19AABCK9012L1Z5', 45, 1800000.00, true);

-- Insert mock suppliers
INSERT INTO public.suppliers (name, contact_person, phone, email, address, gst_number, payment_terms, is_active) VALUES
('JSW Steel Limited', 'Mohan Das', '+91-8765432109', 'mohan@jswsteel.com', 'JSW Centre, Bandra Kurla Complex, Mumbai - 400051', '27AABCJ1234M1Z8', 'Net 30 days', true),
('Tata Steel Limited', 'Sunita Agarwal', '+91-8765432108', 'sunita@tatasteel.com', 'Bombay House, 24 Homi Mody Street, Mumbai - 400001', '27AABCT5678N1Z3', 'Net 45 days', true),
('Steel Authority of India', 'Ramesh Gupta', '+91-8765432107', 'ramesh@sail.in', 'Ispat Bhawan, Lodi Road, New Delhi - 110003', '07AABCS9012O1Z7', 'Net 30 days', true),
('Jindal Steel & Power', 'Kavita Singh', '+91-8765432106', 'kavita@jindalsteel.com', 'Jindal Centre, 12 Bhikaji Cama Place, Delhi - 110066', '07AABCJ3456P1Z2', 'Net 60 days', true),
('Essar Steel Limited', 'Arjun Mehta', '+91-8765432105', 'arjun@essarsteel.com', 'Essar House, 11 Keshavrao Khadye Marg, Mumbai - 400020', '27AABCE7890Q1Z6', 'Net 30 days', true),
('Rashtriya Ispat Nigam', 'Padma Rao', '+91-8765432104', 'padma@rinl.co.in', 'Ukkunagaram, Visakhapatnam - 530031', '37AABCR2345R1Z1', 'Net 45 days', true),
('Kalyani Steels Limited', 'Mahesh Patil', '+91-8765432103', 'mahesh@kalyanisteels.com', 'Mundhwa, Pune - 411036', '27AABCK6789S1Z5', 'Net 30 days', true),
('Usha Martin Limited', 'Ritu Sharma', '+91-8765432102', 'ritu@ushamartin.com', 'Usha Martin Tower, Ranchi - 834002', '20AABCU1234T1Z9', 'Net 60 days', true),
('Vizag Steel Plant', 'Ganesh Kumar', '+91-8765432101', 'ganesh@vizagsteel.com', 'Sector 1, Ukkunagaram, Visakhapatnam - 530031', '37AABCV5678U1Z4', 'Net 30 days', true),
('Bhushan Steel Limited', 'Anita Jain', '+91-8765432100', 'anita@bhushansteel.com', 'DLF City Court, MG Road, Gurgaon - 122002', '06AABCB9012V1Z8', 'Net 45 days', true);

-- Insert mock materials with auto-generated SKUs
INSERT INTO public.materials (sku, name, grade, category, thickness, width, length, finish, unit, base_price, description, is_active) VALUES
-- SS304 Sheets
('304-SHE-1.5x1219x2438', 'SS304 Sheet 1.5mm', '304', 'Sheet', 1.500, 1219.000, 2438.000, '2B', 'SQM', 450.00, 'Standard stainless steel sheet for general applications', true),
('304-SHE-2.0x1219x2438', 'SS304 Sheet 2.0mm', '304', 'Sheet', 2.000, 1219.000, 2438.000, '2B', 'SQM', 520.00, 'Medium thickness SS304 sheet', true),
('304-SHE-3.0x1219x2438', 'SS304 Sheet 3.0mm', '304', 'Sheet', 3.000, 1219.000, 2438.000, '2B', 'SQM', 680.00, 'Heavy duty SS304 sheet', true),
('304-SHE-1.0x1000x2000', 'SS304 Sheet 1.0mm', '304', 'Sheet', 1.000, 1000.000, 2000.000, 'BA', 'SQM', 420.00, 'Bright annealed finish SS304 sheet', true),
('304-SHE-1.5x1500x3000', 'SS304 Sheet 1.5mm Large', '304', 'Sheet', 1.500, 1500.000, 3000.000, 'HL', 'SQM', 485.00, 'Hair line finish large format sheet', true),

-- SS316 Sheets
('316-SHE-1.5x1219x2438', 'SS316 Sheet 1.5mm', '316', 'Sheet', 1.500, 1219.000, 2438.000, '2B', 'SQM', 650.00, 'Marine grade stainless steel sheet', true),
('316-SHE-2.0x1219x2438', 'SS316 Sheet 2.0mm', '316', 'Sheet', 2.000, 1219.000, 2438.000, '2B', 'SQM', 750.00, 'Corrosion resistant SS316 sheet', true),
('316-SHE-2.5x1219x2438', 'SS316 Sheet 2.5mm', '316', 'Sheet', 2.500, 1219.000, 2438.000, 'BA', 'SQM', 890.00, 'High grade marine steel sheet', true),
('316L-SHE-1.2x1219x2438', 'SS316L Sheet 1.2mm', '316L', 'Sheet', 1.200, 1219.000, 2438.000, '2B', 'SQM', 680.00, 'Low carbon marine grade sheet', true),
('316L-SHE-3.0x1219x2438', 'SS316L Sheet 3.0mm', '316L', 'Sheet', 3.000, 1219.000, 2438.000, 'NO.4', 'SQM', 980.00, 'Brushed finish heavy duty sheet', true),

-- SS202 Sheets
('202-SHE-1.0x1219x2438', 'SS202 Sheet 1.0mm', '202', 'Sheet', 1.000, 1219.000, 2438.000, '2B', 'SQM', 280.00, 'Economical stainless steel sheet', true),
('202-SHE-1.5x1219x2438', 'SS202 Sheet 1.5mm', '202', 'Sheet', 1.500, 1219.000, 2438.000, '2B', 'SQM', 320.00, 'Cost effective SS sheet', true),
('202-SHE-2.0x1219x2438', 'SS202 Sheet 2.0mm', '202', 'Sheet', 2.000, 1219.000, 2438.000, 'HL', 'SQM', 380.00, 'Hair line finish economical sheet', true),

-- Pipes
('304-PIP-25.4x2.0', 'SS304 Pipe 1" x 2mm', '304', 'Pipe', 2.000, 25.400, NULL, 'Bright', 'MTR', 185.00, '1 inch diameter SS304 pipe', true),
('304-PIP-50.8x3.0', 'SS304 Pipe 2" x 3mm', '304', 'Pipe', 3.000, 50.800, NULL, 'Bright', 'MTR', 420.00, '2 inch diameter SS304 pipe', true),
('316-PIP-25.4x2.0', 'SS316 Pipe 1" x 2mm', '316', 'Pipe', 2.000, 25.400, NULL, 'Bright', 'MTR', 285.00, '1 inch diameter SS316 pipe', true),
('316-PIP-76.2x3.0', 'SS316 Pipe 3" x 3mm', '316', 'Pipe', 3.000, 76.200, NULL, 'Pickled', 'MTR', 680.00, '3 inch diameter SS316 pipe', true),

-- Rods
('304-ROD-6', 'SS304 Rod 6mm', '304', 'Rod', NULL, 6.000, NULL, 'Bright', 'MTR', 85.00, '6mm diameter SS304 round rod', true),
('304-ROD-8', 'SS304 Rod 8mm', '304', 'Rod', NULL, 8.000, NULL, 'Bright', 'MTR', 125.00, '8mm diameter SS304 round rod', true),
('304-ROD-10', 'SS304 Rod 10mm', '304', 'Rod', NULL, 10.000, NULL, 'Bright', 'MTR', 180.00, '10mm diameter SS304 round rod', true),
('316-ROD-12', 'SS316 Rod 12mm', '316', 'Rod', NULL, 12.000, NULL, 'Bright', 'MTR', 285.00, '12mm diameter SS316 round rod', true),

-- Bars
('304-BAR-20x20', 'SS304 Square Bar 20x20mm', '304', 'Bar', NULL, 20.000, NULL, 'Bright', 'MTR', 195.00, '20x20mm SS304 square bar', true),
('304-BAR-25x25', 'SS304 Square Bar 25x25mm', '304', 'Bar', NULL, 25.000, NULL, 'Bright', 'MTR', 285.00, '25x25mm SS304 square bar', true),
('316-BAR-30x30', 'SS316 Square Bar 30x30mm', '316', 'Bar', NULL, 30.000, NULL, 'Bright', 'MTR', 485.00, '30x30mm SS316 square bar', true),

-- Coils
('304-COI-1.0x1219', 'SS304 Coil 1.0mm x 1219mm', '304', 'Coil', 1.000, 1219.000, NULL, '2B', 'MT', 165000.00, 'SS304 coil for fabrication', true),
('316-COI-1.5x1219', 'SS316 Coil 1.5mm x 1219mm', '316', 'Coil', 1.500, 1219.000, NULL, '2B', 'MT', 245000.00, 'SS316 coil marine grade', true),
('202-COI-0.8x1000', 'SS202 Coil 0.8mm x 1000mm', '202', 'Coil', 0.800, 1000.000, NULL, '2B', 'MT', 125000.00, 'Economical SS202 coil', true),

-- More specialized items
('430-SHE-1.2x1219x2438', 'SS430 Sheet 1.2mm', '430', 'Sheet', 1.200, 1219.000, 2438.000, '2B', 'SQM', 185.00, 'Ferritic stainless steel sheet', true),
('409-SHE-1.5x1219x2438', 'SS409 Sheet 1.5mm', '409', 'Sheet', 1.500, 1219.000, 2438.000, '2B', 'SQM', 165.00, 'Titanium stabilized steel sheet', true),
('201-SHE-1.0x1219x2438', 'SS201 Sheet 1.0mm', '201', 'Sheet', 1.000, 1219.000, 2438.000, '2B', 'SQM', 250.00, 'Manganese series stainless sheet', true),

-- Additional pipes and fittings
('304-PIP-12.7x1.5', 'SS304 Pipe 1/2" x 1.5mm', '304', 'Pipe', 1.500, 12.700, NULL, 'Bright', 'MTR', 125.00, 'Half inch SS304 pipe', true),
('316-PIP-101.6x3.0', 'SS316 Pipe 4" x 3mm', '316', 'Pipe', 3.000, 101.600, NULL, 'Pickled', 'MTR', 950.00, '4 inch SS316 heavy duty pipe', true),

-- Plates
('304-PLA-5.0x1500x6000', 'SS304 Plate 5mm', '304', 'Plate', 5.000, 1500.000, 6000.000, '2B', 'MT', 185000.00, 'Heavy duty SS304 plate', true),
('316-PLA-8.0x2000x6000', 'SS316 Plate 8mm', '316', 'Plate', 8.000, 2000.000, 6000.000, 'Pickled', 'MT', 285000.00, 'Marine grade heavy plate', true),
('304-PLA-6.0x1500x3000', 'SS304 Plate 6mm', '304', 'Plate', 6.000, 1500.000, 3000.000, 'NO.4', 'MT', 195000.00, 'Brushed finish SS304 plate', true);

-- Insert inventory data for various locations and materials
INSERT INTO public.inventory (material_id, location_id, quantity, quality_grade, unit_cost, reserved_quantity) 
SELECT 
    m.id as material_id,
    l.id as location_id,
    CASE 
        WHEN m.unit = 'MT' THEN (RANDOM() * 50 + 5)::DECIMAL(12,3)
        WHEN m.unit = 'SQM' THEN (RANDOM() * 500 + 50)::DECIMAL(12,3)
        WHEN m.unit = 'MTR' THEN (RANDOM() * 1000 + 100)::DECIMAL(12,3)
        ELSE (RANDOM() * 100 + 10)::DECIMAL(12,3)
    END as quantity,
    CASE 
        WHEN RANDOM() < 0.7 THEN 'A'
        WHEN RANDOM() < 0.9 THEN 'B'
        ELSE 'Rejection'
    END as quality_grade,
    m.base_price * (0.8 + RANDOM() * 0.4) as unit_cost,
    CASE 
        WHEN RANDOM() < 0.3 THEN (RANDOM() * 10)::DECIMAL(12,3)
        ELSE 0
    END as reserved_quantity
FROM public.materials m
CROSS JOIN public.locations l
WHERE RANDOM() < 0.6; -- Only create inventory for 60% of material-location combinations

-- Insert some sample quotations
INSERT INTO public.quotations (quotation_number, customer_id, total_amount, tax_amount, grand_total, valid_until, terms_conditions, status)
SELECT 
    'QT' || LPAD((ROW_NUMBER() OVER())::TEXT, 6, '0') as quotation_number,
    c.id as customer_id,
    (RANDOM() * 500000 + 50000)::DECIMAL(12,2) as total_amount,
    0 as tax_amount, -- Will be calculated
    0 as grand_total, -- Will be calculated
    CURRENT_DATE + INTERVAL '30 days' as valid_until,
    'Payment: Net ' || c.credit_days || ' days. Delivery: Ex-works. Price: Inclusive of packing.' as terms_conditions,
    CASE 
        WHEN RANDOM() < 0.4 THEN 'draft'
        WHEN RANDOM() < 0.7 THEN 'sent'
        WHEN RANDOM() < 0.9 THEN 'accepted'
        ELSE 'expired'
    END as status
FROM public.customers c
WHERE RANDOM() < 0.8; -- Create quotations for 80% of customers

-- Update quotation totals
UPDATE public.quotations 
SET 
    tax_amount = total_amount * 0.18,
    grand_total = total_amount * 1.18;