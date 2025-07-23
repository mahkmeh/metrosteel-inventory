
-- First, let's clear the existing incorrect data
DELETE FROM public.sales_returns;
DELETE FROM public.receivables;

-- Insert corrected Sales Returns data with exact customer names
INSERT INTO public.sales_returns (
  return_number, customer_id, sales_order_id, sales_invoice_id, return_date, 
  credit_note_date, credit_note_number, total_return_amount, return_reason, 
  status, notes
) VALUES
-- Return from ABC Construction Ltd
('SR-2025-001', 
 (SELECT id FROM customers WHERE name = 'ABC Construction Ltd' LIMIT 1),
 (SELECT id FROM sales_orders WHERE so_number = 'SO-2025-001' LIMIT 1),
 (SELECT id FROM sales_invoices WHERE invoice_number = 'SI-2025-001' LIMIT 1),
 '2025-01-15', '2025-01-16', 'CN-2025-001', 15000.00, 
 'Damaged goods received', 'processed', 'Credit note issued for damaged materials'),

-- Return from XYZ Infrastructure Pvt Ltd
('SR-2025-002', 
 (SELECT id FROM customers WHERE name = 'XYZ Infrastructure Pvt Ltd' LIMIT 1),
 (SELECT id FROM sales_orders WHERE so_number = 'SO-2025-002' LIMIT 1),
 (SELECT id FROM sales_invoices WHERE invoice_number = 'SI-2025-002' LIMIT 1),
 '2025-01-18', NULL, NULL, 25000.00, 
 'Quality issues with steel sheets', 'approved', 'Approved for return, credit note pending'),

-- Return from Global Engineering Works
('SR-2025-003', 
 (SELECT id FROM customers WHERE name = 'Global Engineering Works' LIMIT 1),
 (SELECT id FROM sales_orders WHERE so_number = 'SO-2025-003' LIMIT 1),
 (SELECT id FROM sales_invoices WHERE invoice_number = 'SI-2025-003' LIMIT 1),
 '2025-01-20', '2025-01-21', 'CN-2025-003', 18000.00, 
 'Wrong specifications delivered', 'processed', 'Full credit issued for specification mismatch'),

-- Return from Modern Fabricators
('SR-2025-004', 
 (SELECT id FROM customers WHERE name = 'Modern Fabricators' LIMIT 1),
 (SELECT id FROM sales_orders WHERE so_number = 'SO-2025-004' LIMIT 1),
 (SELECT id FROM sales_invoices WHERE invoice_number = 'SI-2025-004' LIMIT 1),
 '2025-01-22', NULL, NULL, 12000.00, 
 'Excess quantity delivered', 'pending', 'Return request under review'),

-- Return from Prime Steel Traders
('SR-2025-005', 
 (SELECT id FROM customers WHERE name = 'Prime Steel Traders' LIMIT 1),
 (SELECT id FROM sales_orders WHERE so_number = 'SO-2025-005' LIMIT 1),
 (SELECT id FROM sales_invoices WHERE invoice_number = 'SI-2025-005' LIMIT 1),
 '2025-01-25', '2025-01-26', 'CN-2025-005', 8500.00, 
 'Late delivery - customer cancelled order', 'processed', 'Credit note processed for cancellation');

-- Insert corrected Receivables data from unpaid invoices
INSERT INTO public.receivables (
  customer_id, sales_invoice_id, original_amount, paid_amount, 
  outstanding_amount, due_date, status, notes
) VALUES
-- From pending invoices
((SELECT customer_id FROM sales_invoices WHERE invoice_number = 'SI-2025-003' LIMIT 1),
 (SELECT id FROM sales_invoices WHERE invoice_number = 'SI-2025-003' LIMIT 1),
 147200.00, 0.00, 147200.00, '2025-02-10', 'outstanding', 'Payment pending from Global Engineering Works'),

((SELECT customer_id FROM sales_invoices WHERE invoice_number = 'SI-2025-004' LIMIT 1),
 (SELECT id FROM sales_invoices WHERE invoice_number = 'SI-2025-004' LIMIT 1),
 94400.00, 0.00, 94400.00, '2025-02-12', 'outstanding', 'Follow up required for payment'),

((SELECT customer_id FROM sales_invoices WHERE invoice_number = 'SI-2025-005' LIMIT 1),
 (SELECT id FROM sales_invoices WHERE invoice_number = 'SI-2025-005' LIMIT 1),
 188800.00, 0.00, 188800.00, '2025-02-15', 'outstanding', 'Large outstanding amount - priority collection'),

((SELECT customer_id FROM sales_invoices WHERE invoice_number = 'SI-2025-006' LIMIT 1),
 (SELECT id FROM sales_invoices WHERE invoice_number = 'SI-2025-006' LIMIT 1),
 108200.00, 0.00, 108200.00, '2025-02-18', 'outstanding', 'Customer requested extended payment terms'),

((SELECT customer_id FROM sales_invoices WHERE invoice_number = 'SI-2025-007' LIMIT 1),
 (SELECT id FROM sales_invoices WHERE invoice_number = 'SI-2025-007' LIMIT 1),
 141600.00, 0.00, 141600.00, '2025-02-20', 'outstanding', 'Payment commitment received'),

((SELECT customer_id FROM sales_invoices WHERE invoice_number = 'SI-2025-008' LIMIT 1),
 (SELECT id FROM sales_invoices WHERE invoice_number = 'SI-2025-008' LIMIT 1),
 165000.00, 0.00, 165000.00, '2025-02-22', 'outstanding', 'Regular customer - payment expected on time'),

-- From overdue invoice
((SELECT customer_id FROM sales_invoices WHERE invoice_number = 'SI-2025-010' LIMIT 1),
 (SELECT id FROM sales_invoices WHERE invoice_number = 'SI-2025-010' LIMIT 1),
 232600.00, 0.00, 232600.00, '2025-01-28', 'overdue', 'URGENT: Payment overdue - immediate follow up required'),

-- Partial payment example
((SELECT customer_id FROM sales_invoices WHERE invoice_number = 'SI-2025-009' LIMIT 1),
 (SELECT id FROM sales_invoices WHERE invoice_number = 'SI-2025-009' LIMIT 1),
 176800.00, 88400.00, 88400.00, '2025-02-25', 'partial_paid', 'Partial payment received - balance pending');
