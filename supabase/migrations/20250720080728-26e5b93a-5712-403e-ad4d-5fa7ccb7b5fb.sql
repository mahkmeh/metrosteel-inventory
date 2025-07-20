-- Add missing foreign key constraints for proper table relationships

-- Add foreign key constraint for purchase_invoices to suppliers
ALTER TABLE public.purchase_invoices 
ADD CONSTRAINT fk_purchase_invoices_supplier 
FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);

-- Add foreign key constraint for purchase_invoices to purchase_orders  
ALTER TABLE public.purchase_invoices 
ADD CONSTRAINT fk_purchase_invoices_purchase_order 
FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id);

-- Add foreign key constraint for purchase_returns to suppliers
ALTER TABLE public.purchase_returns 
ADD CONSTRAINT fk_purchase_returns_supplier 
FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);

-- Add foreign key constraint for purchase_returns to purchase_invoices
ALTER TABLE public.purchase_returns 
ADD CONSTRAINT fk_purchase_returns_invoice 
FOREIGN KEY (purchase_invoice_id) REFERENCES public.purchase_invoices(id);

-- Add foreign key constraint for purchase_returns to purchase_orders
ALTER TABLE public.purchase_returns 
ADD CONSTRAINT fk_purchase_returns_purchase_order 
FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id);

-- Add foreign key constraint for purchase_return_items to purchase_returns
ALTER TABLE public.purchase_return_items 
ADD CONSTRAINT fk_purchase_return_items_return 
FOREIGN KEY (purchase_return_id) REFERENCES public.purchase_returns(id);

-- Add foreign key constraint for purchase_return_items to materials
ALTER TABLE public.purchase_return_items 
ADD CONSTRAINT fk_purchase_return_items_material 
FOREIGN KEY (material_id) REFERENCES public.materials(id);

-- Add foreign key constraint for purchase_return_items to batches
ALTER TABLE public.purchase_return_items 
ADD CONSTRAINT fk_purchase_return_items_batch 
FOREIGN KEY (batch_id) REFERENCES public.batches(id);

-- Add foreign key constraint for payables to suppliers
ALTER TABLE public.payables 
ADD CONSTRAINT fk_payables_supplier 
FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);

-- Add foreign key constraint for payables to purchase_invoices
ALTER TABLE public.payables 
ADD CONSTRAINT fk_payables_invoice 
FOREIGN KEY (purchase_invoice_id) REFERENCES public.purchase_invoices(id);