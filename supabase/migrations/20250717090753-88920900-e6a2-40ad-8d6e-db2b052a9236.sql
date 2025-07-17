-- Add new columns to quotations table for enhanced functionality
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS requirement_source TEXT DEFAULT 'email'; -- email, whatsapp, walk_in
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS handling_charges NUMERIC DEFAULT 0;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS freight_charges NUMERIC DEFAULT 0;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS packing_charges NUMERIC DEFAULT 0;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS company_name TEXT DEFAULT 'Steel Trading Company';
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS company_address TEXT DEFAULT 'Industrial Area, Phase 1, City - 560001';
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS company_phone TEXT DEFAULT '+91-9876543210';
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS company_email TEXT DEFAULT 'info@steeltrading.com';

-- Update existing quotations to have mock data for new fields
UPDATE public.quotations SET 
  requirement_source = CASE 
    WHEN MOD(EXTRACT(MICROSECONDS FROM created_at)::INTEGER, 3) = 0 THEN 'email'
    WHEN MOD(EXTRACT(MICROSECONDS FROM created_at)::INTEGER, 3) = 1 THEN 'whatsapp'
    ELSE 'walk_in'
  END,
  handling_charges = grand_total * 0.02, -- 2% handling
  freight_charges = grand_total * 0.03,  -- 3% freight
  packing_charges = grand_total * 0.01,  -- 1% packing
  payment_terms = CASE 
    WHEN customer_id IN (SELECT id FROM customers WHERE credit_days = 30) THEN 'Net 30 days'
    WHEN customer_id IN (SELECT id FROM customers WHERE credit_days = 45) THEN 'Net 45 days'
    WHEN customer_id IN (SELECT id FROM customers WHERE credit_days = 60) THEN 'Net 60 days'
    ELSE 'Net 30 days'
  END;