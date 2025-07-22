-- Remove all mock data from the database
-- Delete in reverse dependency order to avoid foreign key violations

-- Delete transactions first (references many tables)
DELETE FROM public.transactions;

-- Delete purchase return items
DELETE FROM public.purchase_return_items;

-- Delete purchase returns
DELETE FROM public.purchase_returns;

-- Delete purchase invoices
DELETE FROM public.purchase_invoices;

-- Delete payables
DELETE FROM public.payables;

-- Delete batch inventory
DELETE FROM public.batch_inventory;

-- Delete batches
DELETE FROM public.batches;

-- Delete purchase order items
DELETE FROM public.purchase_order_items;

-- Delete purchase orders
DELETE FROM public.purchase_orders;

-- Delete sales order items
DELETE FROM public.sales_order_items;

-- Delete sales orders
DELETE FROM public.sales_orders;

-- Delete quotation items
DELETE FROM public.quotation_items;

-- Delete quotation reminders
DELETE FROM public.quotation_reminders;

-- Delete quotations
DELETE FROM public.quotations;

-- Delete inventory
DELETE FROM public.inventory;

-- Delete job work transformations
DELETE FROM public.job_work_transformations;

-- Delete materials
DELETE FROM public.materials;

-- Delete suppliers
DELETE FROM public.suppliers;

-- Delete customers
DELETE FROM public.customers;

-- Delete locations
DELETE FROM public.locations;