-- Add new contact fields to customers table
ALTER TABLE public.customers 
ADD COLUMN md_name text,
ADD COLUMN md_mobile text,
ADD COLUMN purchaser_name text,
ADD COLUMN purchaser_mobile text,
ADD COLUMN accountant_name text,
ADD COLUMN accountant_mobile text;

-- Note: contact_person and phone columns are kept for backward compatibility but won't be used in the new form