-- Create sales_order_batch_allocations table to track batch allocations for sales orders
CREATE TABLE public.sales_order_batch_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sales_order_item_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  allocated_quantity_kg NUMERIC(12,3) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sales_order_batch_allocations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on sales_order_batch_allocations" 
ON public.sales_order_batch_allocations 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_sales_order_batch_allocations_item_id ON public.sales_order_batch_allocations(sales_order_item_id);
CREATE INDEX idx_sales_order_batch_allocations_batch_id ON public.sales_order_batch_allocations(batch_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sales_order_batch_allocations_updated_at
BEFORE UPDATE ON public.sales_order_batch_allocations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();