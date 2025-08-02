-- Fix security issues by updating the functions with proper search path
CREATE OR REPLACE FUNCTION public.generate_sales_order_events()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Add dispatch reminder (order_date + 2 days)
  INSERT INTO public.business_calendar_events (
    title, description, event_date, event_type, priority, 
    sales_order_id, customer_id, is_auto_generated, source_table
  )
  VALUES (
    'Dispatch Reminder - SO: ' || NEW.so_number,
    'Prepare and dispatch sales order',
    NEW.order_date + INTERVAL '2 days',
    'sales',
    'high',
    NEW.id,
    NEW.customer_id,
    true,
    'sales_orders'
  );
  
  -- Add collection reminder (delivery_date + credit_days from customer)
  INSERT INTO public.business_calendar_events (
    title, description, event_date, event_type, priority,
    sales_order_id, customer_id, is_auto_generated, source_table
  )
  SELECT 
    'Payment Collection - SO: ' || NEW.so_number,
    'Follow up on payment collection',
    COALESCE(NEW.delivery_date, NEW.order_date) + INTERVAL '1 day' * COALESCE(c.credit_days, 30),
    'collection',
    'medium',
    NEW.id,
    NEW.customer_id,
    true,
    'sales_orders'
  FROM public.customers c
  WHERE c.id = NEW.customer_id;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_quotation_events()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Add follow-up reminder (created_at + 7 days)
  IF NEW.status = 'sent' THEN
    INSERT INTO public.business_calendar_events (
      title, description, event_date, event_type, priority,
      quotation_id, customer_id, is_auto_generated, source_table
    )
    VALUES (
      'Follow-up Quotation - ' || NEW.quotation_number,
      'Follow up on quotation response',
      CURRENT_DATE + INTERVAL '7 days',
      'follow_up',
      'medium',
      NEW.id,
      NEW.customer_id,
      true,
      'quotations'
    );
  END IF;
  
  RETURN NEW;
END;
$$;