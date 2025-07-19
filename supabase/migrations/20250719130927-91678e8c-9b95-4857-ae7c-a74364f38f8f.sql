
-- Add batch_id column to purchase_order_items table
ALTER TABLE public.purchase_order_items 
ADD COLUMN batch_id UUID;

-- Add index for better performance on batch_id lookups
CREATE INDEX idx_purchase_order_items_batch_id ON public.purchase_order_items(batch_id);

-- Add foreign key constraint to link to batches table (optional but recommended)
ALTER TABLE public.purchase_order_items 
ADD CONSTRAINT fk_purchase_order_items_batch_id 
FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE SET NULL;
