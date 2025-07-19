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

-- Now insert mock transaction data with proper UUIDs
-- First, get existing data IDs
DO $$
DECLARE
    jindal_supplier_id UUID;
    material_20g2_id UUID;
    first_location_id UUID;
    new_po_id UUID := gen_random_uuid();
    new_poi_id UUID := gen_random_uuid();
    batch_001_id UUID := gen_random_uuid();
    batch_002_id UUID := gen_random_uuid();
    invoice_001_id UUID := gen_random_uuid();
    invoice_002_id UUID := gen_random_uuid();
    return_001_id UUID := gen_random_uuid();
    return_item_001_id UUID := gen_random_uuid();
    payable_001_id UUID := gen_random_uuid();
    payable_002_id UUID := gen_random_uuid();
    txn_001_id UUID := gen_random_uuid();
    txn_002_id UUID := gen_random_uuid();
    txn_003_id UUID := gen_random_uuid();
BEGIN
    -- Get existing supplier ID
    SELECT id INTO jindal_supplier_id FROM suppliers WHERE name = 'Jindal Steel & Power' LIMIT 1;
    
    -- Get existing material ID  
    SELECT id INTO material_20g2_id FROM materials WHERE sku = '20G2' LIMIT 1;
    
    -- Get first location ID
    SELECT id INTO first_location_id FROM locations LIMIT 1;

    -- Create Purchase Order
    INSERT INTO purchase_orders (id, po_number, supplier_id, total_amount, status, order_date, expected_delivery, notes)
    VALUES (
        new_po_id,
        'PO-2025-001',
        jindal_supplier_id,
        425000.00,
        'received',
        '2025-01-01',
        '2025-01-31',
        'Mock transaction for SKU: 20G2 - SS Sheet 1.0mm 304 PC_Mirror'
    );

    -- Create Purchase Order Item
    INSERT INTO purchase_order_items (id, purchase_order_id, material_id, quantity, unit_price, line_total, order_type, notes)
    VALUES (
        new_poi_id,
        new_po_id,
        material_20g2_id,
        5000.00,
        85.00,
        425000.00,
        'stock',
        'Initial order for 5000 KG'
    );

    -- Create Batches
    INSERT INTO batches (id, batch_code, sku_id, supplier_id, purchase_order_id, total_weight_kg, available_weight_kg, heat_number, make, quality_grade, manufactured_date, received_date, status, notes)
    VALUES 
    (
        batch_001_id,
        'B001',
        material_20g2_id,
        jindal_supplier_id,
        new_po_id,
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
        batch_002_id,
        'B002',
        material_20g2_id,
        jindal_supplier_id,
        new_po_id,
        2500.00,
        2000.00,
        'HT789457',
        'Jindal Steel & Power',
        'A',
        '2024-12-20',
        '2025-01-29',
        'active',
        'Second delivery - Supplier batch: JND2024A124'
    );

    -- Create Purchase Invoices
    INSERT INTO purchase_invoices (id, invoice_number, purchase_order_id, supplier_id, invoice_date, due_date, subtotal_amount, tax_amount, total_amount, status, received_date, notes)
    VALUES 
    (
        invoice_001_id,
        'INV-JND-001',
        new_po_id,
        jindal_supplier_id,
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
        invoice_002_id,
        'INV-JND-002',
        new_po_id,
        jindal_supplier_id,
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
        return_001_id,
        'RET-JND-001',
        invoice_002_id,
        new_po_id,
        jindal_supplier_id,
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
        return_item_001_id,
        return_001_id,
        material_20g2_id,
        batch_002_id,
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
        payable_001_id,
        jindal_supplier_id,
        invoice_001_id,
        250750.00,
        0.00,
        250750.00,
        '2025-02-14',
        'outstanding',
        'Payment due for first delivery'
    ),
    (
        payable_002_id,
        jindal_supplier_id,
        invoice_002_id,
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
        txn_001_id,
        material_20g2_id,
        first_location_id,
        'in',
        2500.00,
        2500.00,
        'A',
        85.00,
        batch_001_id,
        'purchase_invoice',
        invoice_001_id,
        'First delivery receipt - Invoice: INV-JND-001'
    ),
    (
        txn_002_id,
        material_20g2_id,
        first_location_id,
        'in',
        2500.00,
        2500.00,
        'A',
        85.00,
        batch_002_id,
        'purchase_invoice',
        invoice_002_id,
        'Second delivery receipt - Invoice: INV-JND-002'
    ),
    (
        txn_003_id,
        material_20g2_id,
        first_location_id,
        'out',
        500.00,
        500.00,
        'B',
        85.00,
        batch_002_id,
        'purchase_return',
        return_001_id,
        'Quality rejection - 500 KG returned from Batch B002'
    );
END $$;