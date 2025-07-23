
-- Add missing foreign key constraints for sales_invoices table
ALTER TABLE public.sales_invoices 
ADD CONSTRAINT fk_sales_invoices_customer 
FOREIGN KEY (customer_id) REFERENCES public.customers(id);

ALTER TABLE public.sales_invoices 
ADD CONSTRAINT fk_sales_invoices_sales_order 
FOREIGN KEY (sales_order_id) REFERENCES public.sales_orders(id);

-- Add missing foreign key constraints for sales_returns table
ALTER TABLE public.sales_returns 
ADD CONSTRAINT fk_sales_returns_customer 
FOREIGN KEY (customer_id) REFERENCES public.customers(id);

ALTER TABLE public.sales_returns 
ADD CONSTRAINT fk_sales_returns_sales_order 
FOREIGN KEY (sales_order_id) REFERENCES public.sales_orders(id);

ALTER TABLE public.sales_returns 
ADD CONSTRAINT fk_sales_returns_sales_invoice 
FOREIGN KEY (sales_invoice_id) REFERENCES public.sales_invoices(id);

-- Add missing foreign key constraints for receivables table
ALTER TABLE public.receivables 
ADD CONSTRAINT fk_receivables_customer 
FOREIGN KEY (customer_id) REFERENCES public.customers(id);

ALTER TABLE public.receivables 
ADD CONSTRAINT fk_receivables_sales_invoice 
FOREIGN KEY (sales_invoice_id) REFERENCES public.sales_invoices(id);

-- Add indexes for better query performance
CREATE INDEX idx_sales_invoices_customer_id ON public.sales_invoices(customer_id);
CREATE INDEX idx_sales_invoices_sales_order_id ON public.sales_invoices(sales_order_id);
CREATE INDEX idx_sales_invoices_status ON public.sales_invoices(status);
CREATE INDEX idx_sales_invoices_invoice_date ON public.sales_invoices(invoice_date);

CREATE INDEX idx_sales_returns_customer_id ON public.sales_returns(customer_id);
CREATE INDEX idx_sales_returns_sales_order_id ON public.sales_returns(sales_order_id);
CREATE INDEX idx_sales_returns_sales_invoice_id ON public.sales_returns(sales_invoice_id);
CREATE INDEX idx_sales_returns_status ON public.sales_returns(status);
CREATE INDEX idx_sales_returns_return_date ON public.sales_returns(return_date);

CREATE INDEX idx_receivables_customer_id ON public.receivables(customer_id);
CREATE INDEX idx_receivables_sales_invoice_id ON public.receivables(sales_invoice_id);
CREATE INDEX idx_receivables_status ON public.receivables(status);
CREATE INDEX idx_receivables_due_date ON public.receivables(due_date);

-- Add indexes for customer name searches (text search optimization)
CREATE INDEX idx_customers_name_trgm ON public.customers USING gin(name gin_trgm_ops);
