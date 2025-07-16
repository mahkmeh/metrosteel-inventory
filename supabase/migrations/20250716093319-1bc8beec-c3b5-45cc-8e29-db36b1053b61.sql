-- Insert mock customers
INSERT INTO public.customers (name, email, phone, contact_person, address, gst_number, credit_limit, credit_days) VALUES
('Steel Works Ltd', 'contact@steelworks.com', '+91-9876543210', 'Rajesh Kumar', '123 Industrial Area, Mumbai, Maharashtra 400001', '27AAAAA0000A1Z5', 500000, 30),
('Metro Construction', 'admin@metroconstruction.com', '+91-9876543211', 'Priya Sharma', '456 Construction Plaza, Delhi, Delhi 110001', '07BBBBB0000B2Y4', 750000, 45),
('Prime Builders', 'info@primebuilders.com', '+91-9876543212', 'Amit Singh', '789 Builder Street, Bangalore, Karnataka 560001', '29CCCCC0000C3X3', 300000, 15),
('Tech Infrastructure', 'contact@techinfra.com', '+91-9876543213', 'Sunita Patel', '321 Tech Park, Pune, Maharashtra 411001', '27DDDDD0000D4W2', 1000000, 60),
('Urban Developers', 'hello@urbandev.com', '+91-9876543214', 'Vikram Gupta', '654 Urban Complex, Chennai, Tamil Nadu 600001', '33EEEEE0000E5V1', 600000, 30);

-- Insert mock quotations
INSERT INTO public.quotations (quotation_number, customer_id, total_amount, tax_amount, grand_total, status, valid_until, terms_conditions) 
SELECT 
  'QT-' || LPAD((ROW_NUMBER() OVER())::TEXT, 4, '0'),
  c.id,
  CASE 
    WHEN ROW_NUMBER() OVER() = 1 THEN 125000
    WHEN ROW_NUMBER() OVER() = 2 THEN 89500
    WHEN ROW_NUMBER() OVER() = 3 THEN 156000
    WHEN ROW_NUMBER() OVER() = 4 THEN 234000
    WHEN ROW_NUMBER() OVER() = 5 THEN 78000
  END,
  CASE 
    WHEN ROW_NUMBER() OVER() = 1 THEN 22500
    WHEN ROW_NUMBER() OVER() = 2 THEN 16110
    WHEN ROW_NUMBER() OVER() = 3 THEN 28080
    WHEN ROW_NUMBER() OVER() = 4 THEN 42120
    WHEN ROW_NUMBER() OVER() = 5 THEN 14040
  END,
  CASE 
    WHEN ROW_NUMBER() OVER() = 1 THEN 147500
    WHEN ROW_NUMBER() OVER() = 2 THEN 105610
    WHEN ROW_NUMBER() OVER() = 3 THEN 184080
    WHEN ROW_NUMBER() OVER() = 4 THEN 276120
    WHEN ROW_NUMBER() OVER() = 5 THEN 92040
  END,
  CASE 
    WHEN ROW_NUMBER() OVER() % 3 = 0 THEN 'sent'
    WHEN ROW_NUMBER() OVER() % 3 = 1 THEN 'draft'
    ELSE 'approved'
  END,
  CURRENT_DATE + INTERVAL '30 days',
  'Payment within 30 days. Delivery charges extra. Prices valid for 30 days.'
FROM (SELECT id FROM public.customers ORDER BY created_at LIMIT 5) c;

-- Insert mock sales orders
INSERT INTO public.sales_orders (so_number, customer_id, quotation_id, total_amount, status, order_date, delivery_date, notes)
SELECT 
  'SO-' || LPAD((ROW_NUMBER() OVER())::TEXT, 4, '0'),
  q.customer_id,
  q.id,
  q.grand_total,
  CASE 
    WHEN ROW_NUMBER() OVER() % 4 = 0 THEN 'delivered'
    WHEN ROW_NUMBER() OVER() % 4 = 1 THEN 'pending'
    WHEN ROW_NUMBER() OVER() % 4 = 2 THEN 'processing'
    ELSE 'shipped'
  END,
  CURRENT_DATE - INTERVAL '15 days',
  CURRENT_DATE + INTERVAL '7 days',
  'Rush order. Handle with priority.'
FROM public.quotations q WHERE q.status = 'approved' LIMIT 3;