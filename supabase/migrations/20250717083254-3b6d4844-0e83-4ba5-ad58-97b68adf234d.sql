-- Insert mock customers
INSERT INTO public.customers (name, contact_person, phone, email, address, gst_number, credit_limit, credit_days) VALUES
('Bangalore Auto Components', 'Raj Kumar', '+91-9876543210', 'raj@bangaloreauto.com', '12, Industrial Area, Bangalore-560001', '29ABCDE1234F1Z5', 500000, 30),
('Chennai Metal Industries', 'Priya Sharma', '+91-9876543211', 'priya@chennaimetals.com', '45, Steel Complex, Chennai-600001', '33FGHIJ5678K2L9', 750000, 45),
('Mumbai Steel Works', 'Amit Patel', '+91-9876543212', 'amit@mumbaisteels.com', '78, Andheri East, Mumbai-400069', '27MNOPQ9012R3S6', 1000000, 60),
('Delhi Engineering Co', 'Neha Singh', '+91-9876543213', 'neha@delhiengineering.com', '23, Okhla Industrial Area, Delhi-110020', '07TUVWX3456Y4Z1', 300000, 30),
('Hyderabad Alloys Ltd', 'Kiran Reddy', '+91-9876543214', 'kiran@hyderabadalloys.com', '56, HITEC City, Hyderabad-500081', '36ABCDE7890F5G2', 600000, 45);

-- Insert mock suppliers
INSERT INTO public.suppliers (name, contact_person, phone, email, address, gst_number, payment_terms) VALUES
('JSW Steel Limited', 'Rohit Agarwal', '+91-9876543220', 'rohit@jswsteel.com', 'JSW Centre, Bandra Kurla Complex, Mumbai-400051', '27JSWST1234E1Z5', 'Net 30 days'),
('Tata Steel Limited', 'Sunita Mehta', '+91-9876543221', 'sunita@tatasteel.com', 'Bombay House, Mumbai-400001', '27TATAS5678T2L9', 'Net 45 days'),
('SAIL Steel Plant', 'Rajesh Kumar', '+91-9876543222', 'rajesh@sail.co.in', 'Lopamudra Building, New Delhi-110003', '07SAILP9012S3T6', 'Net 60 days'),
('Essar Steel Ltd', 'Kavya Reddy', '+91-9876543223', 'kavya@essarsteel.com', 'Essar House, Mumbai-400020', '27ESSAR3456E4R1', 'Net 30 days'),
('Jindal Steel Works', 'Arjun Gupta', '+91-9876543224', 'arjun@jindalsteel.com', 'Jindal Centre, Haryana-125005', '06JINDL7890J5K2', 'Net 45 days');

-- Insert mock quotations with different priority levels
INSERT INTO public.quotations (quotation_number, customer_id, total_amount, tax_amount, grand_total, status, valid_until, terms_conditions) VALUES
('QUO-2024-001', (SELECT id FROM customers WHERE name = 'Bangalore Auto Components' LIMIT 1), 850000, 153000, 1003000, 'sent', '2024-02-15', 'Payment: 30 days from delivery. Warranty: 12 months.'),
('QUO-2024-002', (SELECT id FROM customers WHERE name = 'Chennai Metal Industries' LIMIT 1), 450000, 81000, 531000, 'draft', '2024-02-20', 'Payment: 45 days from delivery. Installation included.'),
('QUO-2024-003', (SELECT id FROM customers WHERE name = 'Mumbai Steel Works' LIMIT 1), 1250000, 225000, 1475000, 'approved', '2024-02-25', 'Payment: 60 days from delivery. Free transportation.'),
('QUO-2024-004', (SELECT id FROM customers WHERE name = 'Delhi Engineering Co' LIMIT 1), 75000, 13500, 88500, 'sent', '2024-02-18', 'Payment: 30 days from delivery. 5% advance required.'),
('QUO-2024-005', (SELECT id FROM customers WHERE name = 'Hyderabad Alloys Ltd' LIMIT 1), 650000, 117000, 767000, 'approved', '2024-02-22', 'Payment: 45 days from delivery. Quality certification included.'),
('QUO-2024-006', (SELECT id FROM customers WHERE name = 'Bangalore Auto Components' LIMIT 1), 25000, 4500, 29500, 'rejected', '2024-02-10', 'Payment: 30 days from delivery.'),
('QUO-2024-007', (SELECT id FROM customers WHERE name = 'Chennai Metal Industries' LIMIT 1), 1800000, 324000, 2124000, 'sent', '2024-02-28', 'Payment: 45 days from delivery. Bulk discount applied.'),
('QUO-2024-008', (SELECT id FROM customers WHERE name = 'Mumbai Steel Works' LIMIT 1), 350000, 63000, 413000, 'draft', '2024-03-05', 'Payment: 60 days from delivery.');

-- Insert mock sales orders
INSERT INTO public.sales_orders (so_number, customer_id, quotation_id, total_amount, status, order_date, delivery_date, notes) VALUES
('SO-2024-001', (SELECT id FROM customers WHERE name = 'Mumbai Steel Works' LIMIT 1), (SELECT id FROM quotations WHERE quotation_number = 'QUO-2024-003' LIMIT 1), 1475000, 'processing', '2024-01-15', '2024-02-15', 'Priority order - rush delivery required'),
('SO-2024-002', (SELECT id FROM customers WHERE name = 'Hyderabad Alloys Ltd' LIMIT 1), (SELECT id FROM quotations WHERE quotation_number = 'QUO-2024-005' LIMIT 1), 767000, 'shipped', '2024-01-18', '2024-02-18', 'Standard delivery terms'),
('SO-2024-003', (SELECT id FROM customers WHERE name = 'Bangalore Auto Components' LIMIT 1), NULL, 890000, 'pending', '2024-01-20', '2024-02-20', 'Direct order without quotation'),
('SO-2024-004', (SELECT id FROM customers WHERE name = 'Chennai Metal Industries' LIMIT 1), NULL, 425000, 'delivered', '2024-01-12', '2024-02-12', 'Completed successfully'),
('SO-2024-005', (SELECT id FROM customers WHERE name = 'Delhi Engineering Co' LIMIT 1), NULL, 156000, 'cancelled', '2024-01-25', '2024-02-25', 'Cancelled due to specification changes'),
('SO-2024-006', (SELECT id FROM customers WHERE name = 'Mumbai Steel Works' LIMIT 1), NULL, 675000, 'processing', '2024-01-22', '2024-02-22', 'Second order this month'),
('SO-2024-007', (SELECT id FROM customers WHERE name = 'Bangalore Auto Components' LIMIT 1), NULL, 234000, 'shipped', '2024-01-28', '2024-02-28', 'Express delivery requested'),
('SO-2024-008', (SELECT id FROM customers WHERE name = 'Chennai Metal Industries' LIMIT 1), NULL, 789000, 'pending', '2024-01-30', '2024-03-01', 'Waiting for final approval');

-- Insert mock purchase orders
INSERT INTO public.purchase_orders (po_number, supplier_id, total_amount, status, order_date, expected_delivery, notes) VALUES
('PO-2024-001', (SELECT id FROM suppliers WHERE name = 'JSW Steel Limited' LIMIT 1), 2500000, 'ordered', '2024-01-10', '2024-02-10', 'Bulk steel order for Q1 inventory'),
('PO-2024-002', (SELECT id FROM suppliers WHERE name = 'Tata Steel Limited' LIMIT 1), 1875000, 'received', '2024-01-12', '2024-02-12', 'Premium grade materials'),
('PO-2024-003', (SELECT id FROM suppliers WHERE name = 'SAIL Steel Plant' LIMIT 1), 3200000, 'pending', '2024-01-15', '2024-02-15', 'Large infrastructure project materials'),
('PO-2024-004', (SELECT id FROM suppliers WHERE name = 'Essar Steel Ltd' LIMIT 1), 890000, 'approved', '2024-01-18', '2024-02-18', 'Standard quality grade'),
('PO-2024-005', (SELECT id FROM suppliers WHERE name = 'Jindal Steel Works' LIMIT 1), 1450000, 'ordered', '2024-01-20', '2024-02-20', 'Special alloy requirements'),
('PO-2024-006', (SELECT id FROM suppliers WHERE name = 'JSW Steel Limited' LIMIT 1), 675000, 'received', '2024-01-22', '2024-02-22', 'Quick delivery order'),
('PO-2024-007', (SELECT id FROM suppliers WHERE name = 'Tata Steel Limited' LIMIT 1), 2100000, 'cancelled', '2024-01-25', '2024-02-25', 'Cancelled due to price changes'),
('PO-2024-008', (SELECT id FROM suppliers WHERE name = 'SAIL Steel Plant' LIMIT 1), 1230000, 'pending', '2024-01-28', '2024-02-28', 'Awaiting management approval'),
('PO-2024-009', (SELECT id FROM suppliers WHERE name = 'Essar Steel Ltd' LIMIT 1), 567000, 'approved', '2024-01-30', '2024-03-01', 'Rush order for urgent requirement'),
('PO-2024-010', (SELECT id FROM suppliers WHERE name = 'Jindal Steel Works' LIMIT 1), 1890000, 'ordered', '2024-02-01', '2024-03-03', 'Monthly replenishment order');