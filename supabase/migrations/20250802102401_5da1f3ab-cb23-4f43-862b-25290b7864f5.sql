-- Create business_calendar_events table
CREATE TABLE public.business_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  event_type TEXT NOT NULL CHECK (event_type IN ('sales', 'collection', 'meeting', 'job_work', 'purchase', 'follow_up', 'review')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'rescheduled')),
  customer_id UUID REFERENCES public.customers(id),
  sales_order_id UUID REFERENCES public.sales_orders(id),
  quotation_id UUID REFERENCES public.quotations(id),
  purchase_order_id UUID REFERENCES public.purchase_orders(id),
  is_auto_generated BOOLEAN NOT NULL DEFAULT false,
  source_table TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on business_calendar_events" 
ON public.business_calendar_events 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_business_calendar_events_date ON public.business_calendar_events(event_date);
CREATE INDEX idx_business_calendar_events_type ON public.business_calendar_events(event_type);
CREATE INDEX idx_business_calendar_events_customer ON public.business_calendar_events(customer_id);

-- Create function to auto-generate events from sales orders
CREATE OR REPLACE FUNCTION public.generate_sales_order_events()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create function to auto-generate events from quotations
CREATE OR REPLACE FUNCTION public.generate_quotation_events()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER auto_generate_sales_order_events
  AFTER INSERT ON public.sales_orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_sales_order_events();

CREATE TRIGGER auto_generate_quotation_events
  AFTER INSERT OR UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.generate_quotation_events();

-- Create trigger for updated_at
CREATE TRIGGER update_business_calendar_events_updated_at
  BEFORE UPDATE ON public.business_calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample events for demonstration
INSERT INTO public.business_calendar_events (title, description, event_date, event_type, priority, is_auto_generated) VALUES
('Team Weekly Review', 'Review weekly performance and targets', CURRENT_DATE + INTERVAL '1 day', 'review', 'medium', false),
('Client Meeting - New Project', 'Discuss upcoming steel requirements', CURRENT_DATE + INTERVAL '3 days', 'meeting', 'high', false),
('Market Analysis Review', 'Analyze current market trends', CURRENT_DATE + INTERVAL '5 days', 'review', 'low', false),
('Inventory Audit', 'Monthly inventory checking', CURRENT_DATE + INTERVAL '7 days', 'review', 'medium', false),
('Supplier Payment Due', 'Process payments to suppliers', CURRENT_DATE + INTERVAL '2 days', 'collection', 'high', false);