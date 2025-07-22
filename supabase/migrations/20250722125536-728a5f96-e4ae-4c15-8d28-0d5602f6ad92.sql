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