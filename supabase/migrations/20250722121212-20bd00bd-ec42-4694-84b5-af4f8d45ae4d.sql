-- Remove all mock data from the database
-- Delete in correct order to avoid foreign key violations

-- First, disable foreign key constraints temporarily
SET session_replication_role = replica;

-- Delete all data from tables
DELETE FROM public.payables;
DELETE FROM public.purchase_return_items;
DELETE FROM public.purchase_returns;
DELETE FROM public.purchase_invoices;
DELETE FROM public.batch_inventory;
DELETE FROM public.transactions;
DELETE FROM public.batches;
DELETE FROM public.purchase_order_items;
DELETE FROM public.purchase_orders;
DELETE FROM public.sales_order_items;
DELETE FROM public.sales_orders;
DELETE FROM public.quotation_items;
DELETE FROM public.quotation_reminders;
DELETE FROM public.quotations;
DELETE FROM public.inventory;
DELETE FROM public.job_work_transformations;
DELETE FROM public.materials;
DELETE FROM public.suppliers;
DELETE FROM public.customers;
DELETE FROM public.locations;

-- Re-enable foreign key constraints
SET session_replication_role = DEFAULT;