-- Create the missing purchase module tables
CREATE TABLE IF NOT EXISTS public.purchase_invoices (
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

CREATE TABLE IF NOT EXISTS public.purchase_returns (
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

CREATE TABLE IF NOT EXISTS public.purchase_return_items (
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

CREATE TABLE IF NOT EXISTS public.payables (
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

-- Enable RLS on all tables
ALTER TABLE public.purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payables ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now)
DROP POLICY IF EXISTS "Allow all operations on purchase_invoices" ON public.purchase_invoices;
DROP POLICY IF EXISTS "Allow all operations on purchase_returns" ON public.purchase_returns;
DROP POLICY IF EXISTS "Allow all operations on purchase_return_items" ON public.purchase_return_items;
DROP POLICY IF EXISTS "Allow all operations on payables" ON public.payables;

CREATE POLICY "Allow all operations on purchase_invoices" ON public.purchase_invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on purchase_returns" ON public.purchase_returns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on purchase_return_items" ON public.purchase_return_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on payables" ON public.payables FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at triggers if they don't exist
DROP TRIGGER IF EXISTS update_purchase_invoices_updated_at ON public.purchase_invoices;
DROP TRIGGER IF EXISTS update_purchase_returns_updated_at ON public.purchase_returns;
DROP TRIGGER IF EXISTS update_payables_updated_at ON public.payables;

CREATE TRIGGER update_purchase_invoices_updated_at BEFORE UPDATE ON public.purchase_invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchase_returns_updated_at BEFORE UPDATE ON public.purchase_returns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payables_updated_at BEFORE UPDATE ON public.payables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();