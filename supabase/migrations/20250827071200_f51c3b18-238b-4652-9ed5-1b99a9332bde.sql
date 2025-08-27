-- Add batch_selection_status to sales_order_items table
ALTER TABLE public.sales_order_items 
ADD COLUMN batch_selection_status text NOT NULL DEFAULT 'pending' 
CHECK (batch_selection_status IN ('selected', 'pending', 'not_required'));