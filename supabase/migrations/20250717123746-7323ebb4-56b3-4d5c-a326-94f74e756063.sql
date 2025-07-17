-- Create purchase order items table
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL,
  material_id UUID NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  line_total NUMERIC NOT NULL DEFAULT 0,
  order_type TEXT NOT NULL DEFAULT 'stock' CHECK (order_type IN ('stock', 'customer_order')),
  linked_sales_order_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales order items table
CREATE TABLE public.sales_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sales_order_id UUID NOT NULL,
  material_id UUID NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  line_total NUMERIC NOT NULL DEFAULT 0,
  quotation_item_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for purchase_order_items
CREATE POLICY "Allow all operations on purchase_order_items" 
ON public.purchase_order_items 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create RLS policies for sales_order_items
CREATE POLICY "Allow all operations on sales_order_items" 
ON public.sales_order_items 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_purchase_order_items_updated_at
BEFORE UPDATE ON public.purchase_order_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_order_items_updated_at
BEFORE UPDATE ON public.sales_order_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_purchase_order_items_po_id ON public.purchase_order_items(purchase_order_id);
CREATE INDEX idx_purchase_order_items_material_id ON public.purchase_order_items(material_id);
CREATE INDEX idx_purchase_order_items_linked_so_id ON public.purchase_order_items(linked_sales_order_id);

CREATE INDEX idx_sales_order_items_so_id ON public.sales_order_items(sales_order_id);
CREATE INDEX idx_sales_order_items_material_id ON public.sales_order_items(material_id);
CREATE INDEX idx_sales_order_items_quotation_item_id ON public.sales_order_items(quotation_item_id);