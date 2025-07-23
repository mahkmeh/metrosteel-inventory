-- Create sales_invoices table
CREATE TABLE public.sales_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  customer_id UUID NOT NULL,
  sales_order_id UUID NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal_amount NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sales_invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for sales_invoices
CREATE POLICY "Allow all operations on sales_invoices" 
ON public.sales_invoices 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create sales_returns table
CREATE TABLE public.sales_returns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  return_number TEXT NOT NULL,
  customer_id UUID NOT NULL,
  sales_order_id UUID NOT NULL,
  sales_invoice_id UUID NOT NULL,
  return_date DATE NOT NULL DEFAULT CURRENT_DATE,
  credit_note_date DATE,
  credit_note_number TEXT,
  total_return_amount NUMERIC NOT NULL DEFAULT 0,
  return_reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sales_returns ENABLE ROW LEVEL SECURITY;

-- Create policies for sales_returns
CREATE POLICY "Allow all operations on sales_returns" 
ON public.sales_returns 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create receivables table
CREATE TABLE public.receivables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  sales_invoice_id UUID NOT NULL,
  original_amount NUMERIC NOT NULL DEFAULT 0,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  outstanding_amount NUMERIC NOT NULL DEFAULT 0,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'outstanding',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;

-- Create policies for receivables
CREATE POLICY "Allow all operations on receivables" 
ON public.receivables 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_sales_invoices_updated_at
BEFORE UPDATE ON public.sales_invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_returns_updated_at
BEFORE UPDATE ON public.sales_returns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_receivables_updated_at
BEFORE UPDATE ON public.receivables
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();