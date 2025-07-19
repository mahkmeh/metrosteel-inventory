
-- Create purchase_invoices table
CREATE TABLE public.purchase_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  purchase_order_id UUID NOT NULL,
  supplier_id UUID NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal_amount NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  received_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Create purchase_returns table
CREATE TABLE public.purchase_returns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  return_number TEXT NOT NULL UNIQUE,
  purchase_invoice_id UUID NOT NULL,
  purchase_order_id UUID NOT NULL,
  supplier_id UUID NOT NULL,
  return_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_return_amount NUMERIC NOT NULL DEFAULT 0,
  return_reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  credit_note_number TEXT,
  credit_note_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Create purchase_return_items table
CREATE TABLE public.purchase_return_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_return_id UUID NOT NULL,
  material_id UUID NOT NULL,
  batch_id UUID,
  quantity_returned NUMERIC NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  line_total NUMERIC NOT NULL DEFAULT 0,
  return_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Create payables table
CREATE TABLE public.payables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL,
  purchase_invoice_id UUID NOT NULL,
  original_amount NUMERIC NOT NULL DEFAULT 0,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  outstanding_amount NUMERIC NOT NULL DEFAULT 0,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'outstanding',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS on all new tables
ALTER TABLE public.purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payables ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now)
CREATE POLICY "Allow all operations on purchase_invoices" ON public.purchase_invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on purchase_returns" ON public.purchase_returns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on purchase_return_items" ON public.purchase_return_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on payables" ON public.payables FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at triggers
CREATE TRIGGER update_purchase_invoices_updated_at BEFORE UPDATE ON public.purchase_invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchase_returns_updated_at BEFORE UPDATE ON public.purchase_returns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payables_updated_at BEFORE UPDATE ON public.payables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Now create the complete mock transaction data
-- First, ensure we have the supplier and material
INSERT INTO suppliers (id, name, contact_person, phone, email, address, gst_number, payment_terms, is_active)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Jindal Steel & Power',
  'Rajesh Kumar',
  '+91-9876543210',
  'rajesh.kumar@jindalsteel.com',
  'Jindal Steel Complex, Raigarh, Chhattisgarh - 496001',
  '22AAAAA0000A1Z5',
  'Net 30 days',
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  contact_person = EXCLUDED.contact_person,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  address = EXCLUDED.address,
  gst_number = EXCLUDED.gst_number,
  payment_terms = EXCLUDED.payment_terms;

-- Create Purchase Order
INSERT INTO purchase_orders (id, po_number, supplier_id, total_amount, status, order_date, expected_delivery, notes)
VALUES (
  'po-12345678-1234-5678-9012-123456789012',
  'PO-2025-001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  425000.00,
  'received',
  '2025-01-01',
  '2025-01-31',
  'Mock transaction for SKU: 20G2 - SS Sheet 1.0mm 304 PC_Mirror'
) ON CONFLICT (id) DO UPDATE SET
  po_number = EXCLUDED.po_number,
  supplier_id = EXCLUDED.supplier_id,
  total_amount = EXCLUDED.total_amount,
  status = EXCLUDED.status,
  order_date = EXCLUDED.order_date,
  expected_delivery = EXCLUDED.expected_delivery,
  notes = EXCLUDED.notes;

-- Create Purchase Order Item
INSERT INTO purchase_order_items (id, purchase_order_id, material_id, quantity, unit_price, line_total, order_type, notes)
VALUES (
  'poi-12345678-1234-5678-9012-123456789012',
  'po-12345678-1234-5678-9012-123456789012',
  (SELECT id FROM materials WHERE sku = '20G2' LIMIT 1),
  5000.00,
  85.00,
  425000.00,
  'stock',
  'Initial order for 5000 KG'
) ON CONFLICT (id) DO UPDATE SET
  purchase_order_id = EXCLUDED.purchase_order_id,
  material_id = EXCLUDED.material_id,
  quantity = EXCLUDED.quantity,
  unit_price = EXCLUDED.unit_price,
  line_total = EXCLUDED.line_total,
  order_type = EXCLUDED.order_type,
  notes = EXCLUDED.notes;

-- Create Batches
INSERT INTO batches (id, batch_code, sku_id, supplier_id, purchase_order_id, total_weight_kg, available_weight_kg, heat_number, make, quality_grade, manufactured_date, received_date, status, notes)
VALUES 
(
  'batch-001-1234-5678-9012-123456789012',
  'B001',
  (SELECT id FROM materials WHERE sku = '20G2' LIMIT 1),
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'po-12345678-1234-5678-9012-123456789012',
  2500.00,
  2500.00,
  'HT789456',
  'Jindal Steel & Power',
  'A',
  '2024-12-15',
  '2025-01-15',
  'active',
  'First delivery - Supplier batch: JND2024A123'
),
(
  'batch-002-1234-5678-9012-123456789012',
  'B002',
  (SELECT id FROM materials WHERE sku = '20G2' LIMIT 1),
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'po-12345678-1234-5678-9012-123456789012',
  2500.00,
  2000.00,
  'HT789457',
  'Jindal Steel & Power',
  'A',
  '2024-12-20',
  '2025-01-29',
  'active',
  'Second delivery - Supplier batch: JND2024A124'
) ON CONFLICT (id) DO UPDATE SET
  batch_code = EXCLUDED.batch_code,
  sku_id = EXCLUDED.sku_id,
  supplier_id = EXCLUDED.supplier_id,
  purchase_order_id = EXCLUDED.purchase_order_id,
  total_weight_kg = EXCLUDED.total_weight_kg,
  available_weight_kg = EXCLUDED.available_weight_kg,
  heat_number = EXCLUDED.heat_number,
  make = EXCLUDED.make,
  quality_grade = EXCLUDED.quality_grade,
  manufactured_date = EXCLUDED.manufactured_date,
  received_date = EXCLUDED.received_date,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes;

-- Create Purchase Invoices
INSERT INTO purchase_invoices (id, invoice_number, purchase_order_id, supplier_id, invoice_date, due_date, subtotal_amount, tax_amount, total_amount, status, received_date, notes)
VALUES 
(
  'inv-001-1234-5678-9012-123456789012',
  'INV-JND-001',
  'po-12345678-1234-5678-9012-123456789012',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '2025-01-15',
  '2025-02-14',
  212500.00,
  38250.00,
  250750.00,
  'received',
  '2025-01-15',
  'First delivery invoice for 2500 KG - Batch B001'
),
(
  'inv-002-1234-5678-9012-123456789012',
  'INV-JND-002',
  'po-12345678-1234-5678-9012-123456789012',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '2025-01-29',
  '2025-02-28',
  212500.00,
  38250.00,
  250750.00,
  'received',
  '2025-01-29',
  'Second delivery invoice for 2500 KG - Batch B002'
);

-- Create Purchase Return
INSERT INTO purchase_returns (id, return_number, purchase_invoice_id, purchase_order_id, supplier_id, return_date, total_return_amount, return_reason, status, credit_note_number, credit_note_date, notes)
VALUES (
  'ret-001-1234-5678-9012-123456789012',
  'RET-JND-001',
  'inv-002-1234-5678-9012-123456789012',
  'po-12345678-1234-5678-9012-123456789012',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '2025-02-05',
  50150.00,
  'Quality defects - Surface scratches and dimensional variations',
  'approved',
  'CN-JND-001',
  '2025-02-06',
  'Returned 500 KG due to quality issues - 10% rejection rate'
);

-- Create Purchase Return Items
INSERT INTO purchase_return_items (id, purchase_return_id, material_id, batch_id, quantity_returned, unit_price, line_total, return_reason, notes)
VALUES (
  'reti-001-1234-5678-9012-123456789012',
  'ret-001-1234-5678-9012-123456789012',
  (SELECT id FROM materials WHERE sku = '20G2' LIMIT 1),
  'batch-002-1234-5678-9012-123456789012',
  500.00,
  85.00,
  42500.00,
  'Quality defects - Surface scratches',
  'Defective material from batch B002'
);

-- Create Payables
INSERT INTO payables (id, supplier_id, purchase_invoice_id, original_amount, paid_amount, outstanding_amount, due_date, status, notes)
VALUES 
(
  'pay-001-1234-5678-9012-123456789012',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'inv-001-1234-5678-9012-123456789012',
  250750.00,
  0.00,
  250750.00,
  '2025-02-14',
  'outstanding',
  'Payment due for first delivery'
),
(
  'pay-002-1234-5678-9012-123456789012',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'inv-002-1234-5678-9012-123456789012',
  250750.00,
  0.00,
  200600.00,
  '2025-02-28',
  'outstanding',
  'Payment due for second delivery (adjusted for return credit)'
);

-- Create Transactions
INSERT INTO transactions (id, material_id, location_id, transaction_type, quantity, weight_kg, quality_grade, unit_cost, batch_id, reference_type, reference_id, notes)
VALUES 
(
  'txn-001-1234-5678-9012-123456789012',
  (SELECT id FROM materials WHERE sku = '20G2' LIMIT 1),
  (SELECT id FROM locations LIMIT 1),
  'in',
  2500.00,
  2500.00,
  'A',
  85.00,
  'batch-001-1234-5678-9012-123456789012',
  'purchase_invoice',
  'inv-001-1234-5678-9012-123456789012',
  'First delivery receipt - Invoice: INV-JND-001'
),
(
  'txn-002-1234-5678-9012-123456789012',
  (SELECT id FROM materials WHERE sku = '20G2' LIMIT 1),
  (SELECT id FROM locations LIMIT 1),
  'in',
  2500.00,
  2500.00,
  'A',
  85.00,
  'batch-002-1234-5678-9012-123456789012',
  'purchase_invoice',
  'inv-002-1234-5678-9012-123456789012',
  'Second delivery receipt - Invoice: INV-JND-002'
),
(
  'txn-003-1234-5678-9012-123456789012',
  (SELECT id FROM materials WHERE sku = '20G2' LIMIT 1),
  (SELECT id FROM locations LIMIT 1),
  'out',
  500.00,
  500.00,
  'B',
  85.00,
  'batch-002-1234-5678-9012-123456789012',
  'purchase_return',
  'ret-001-1234-5678-9012-123456789012',
  'Quality rejection - 500 KG returned from Batch B002'
) ON CONFLICT (id) DO UPDATE SET
  material_id = EXCLUDED.material_id,
  location_id = EXCLUDED.location_id,
  transaction_type = EXCLUDED.transaction_type,
  quantity = EXCLUDED.quantity,
  weight_kg = EXCLUDED.weight_kg,
  quality_grade = EXCLUDED.quality_grade,
  unit_cost = EXCLUDED.unit_cost,
  batch_id = EXCLUDED.batch_id,
  reference_type = EXCLUDED.reference_type,
  reference_id = EXCLUDED.reference_id,
  notes = EXCLUDED.notes;
