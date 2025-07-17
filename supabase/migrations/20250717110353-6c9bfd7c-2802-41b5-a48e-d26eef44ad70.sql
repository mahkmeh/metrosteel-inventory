-- Add customer_need column to quotations table
ALTER TABLE public.quotations 
ADD COLUMN IF NOT EXISTS customer_need TEXT DEFAULT 'for_quotation';