
-- Create WhatsApp messages table
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('sent', 'received')),
  message_content TEXT NOT NULL,
  message_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT false,
  attachment_url TEXT,
  attachment_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create phone call logs table
CREATE TABLE public.phone_call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  call_type TEXT NOT NULL CHECK (call_type IN ('incoming', 'outgoing', 'missed')),
  call_duration INTEGER, -- in seconds
  call_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  call_notes TEXT,
  follow_up_required BOOLEAN NOT NULL DEFAULT false,
  follow_up_date DATE,
  call_outcome TEXT CHECK (call_outcome IN ('interested', 'not_interested', 'callback_requested', 'quotation_requested', 'order_placed', 'no_answer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead activities table for unified timeline
CREATE TABLE public.lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('quotation_created', 'quotation_sent', 'whatsapp_message', 'phone_call', 'email_sent', 'meeting_scheduled')),
  activity_title TEXT NOT NULL,
  activity_description TEXT,
  activity_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reference_id UUID, -- Can reference whatsapp_messages, phone_call_logs, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on whatsapp_messages" 
ON public.whatsapp_messages 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on phone_call_logs" 
ON public.phone_call_logs 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on lead_activities" 
ON public.lead_activities 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_whatsapp_messages_updated_at
BEFORE UPDATE ON public.whatsapp_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_phone_call_logs_updated_at
BEFORE UPDATE ON public.phone_call_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_whatsapp_messages_customer_id ON public.whatsapp_messages(customer_id);
CREATE INDEX idx_whatsapp_messages_quotation_id ON public.whatsapp_messages(quotation_id);
CREATE INDEX idx_whatsapp_messages_timestamp ON public.whatsapp_messages(message_timestamp);

CREATE INDEX idx_phone_call_logs_customer_id ON public.phone_call_logs(customer_id);
CREATE INDEX idx_phone_call_logs_quotation_id ON public.phone_call_logs(quotation_id);
CREATE INDEX idx_phone_call_logs_date ON public.phone_call_logs(call_date);

CREATE INDEX idx_lead_activities_customer_id ON public.lead_activities(customer_id);
CREATE INDEX idx_lead_activities_quotation_id ON public.lead_activities(quotation_id);
CREATE INDEX idx_lead_activities_date ON public.lead_activities(activity_date);

-- Insert mock data for WhatsApp messages
INSERT INTO public.whatsapp_messages (customer_id, quotation_id, message_type, message_content, message_timestamp, is_read) VALUES
-- Messages with ABC Construction Ltd
((SELECT id FROM customers WHERE name = 'ABC Construction Ltd' LIMIT 1), 
 (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-001' LIMIT 1), 
 'received', 'Hi, I need a quotation for steel sheets for my construction project', '2025-01-10 09:30:00', true),

((SELECT id FROM customers WHERE name = 'ABC Construction Ltd' LIMIT 1), 
 (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-001' LIMIT 1), 
 'sent', 'Hello! Thank you for contacting us. I''ll prepare a quotation for you. Could you please share the specifications?', '2025-01-10 09:32:00', true),

((SELECT id FROM customers WHERE name = 'ABC Construction Ltd' LIMIT 1), 
 (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-001' LIMIT 1), 
 'received', 'I need 500 sheets of MS steel, 2mm thickness, 4x8 feet', '2025-01-10 09:35:00', true),

((SELECT id FROM customers WHERE name = 'ABC Construction Ltd' LIMIT 1), 
 (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-001' LIMIT 1), 
 'sent', 'Perfect! I''ve prepared the quotation QT-2025-001 for you. Please check and let me know if you need any modifications.', '2025-01-10 10:15:00', true),

((SELECT id FROM customers WHERE name = 'ABC Construction Ltd' LIMIT 1), 
 (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-001' LIMIT 1), 
 'received', 'Thanks! The quotation looks good. When can you deliver?', '2025-01-10 14:20:00', true),

-- Messages with XYZ Infrastructure
((SELECT id FROM customers WHERE name = 'XYZ Infrastructure Pvt Ltd' LIMIT 1), 
 (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-002' LIMIT 1), 
 'received', 'We need structural steel for our upcoming project. Can you provide a quote?', '2025-01-12 11:00:00', true),

((SELECT id FROM customers WHERE name = 'XYZ Infrastructure Pvt Ltd' LIMIT 1), 
 (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-002' LIMIT 1), 
 'sent', 'Absolutely! I''d be happy to help. Could you share the detailed requirements?', '2025-01-12 11:05:00', true),

((SELECT id FROM customers WHERE name = 'XYZ Infrastructure Pvt Ltd' LIMIT 1), 
 (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-002' LIMIT 1), 
 'received', 'We need various sizes of steel beams and plates. I''ll send you the detailed list.', '2025-01-12 11:10:00', true),

-- Messages with Global Engineering Works
((SELECT id FROM customers WHERE name = 'Global Engineering Works' LIMIT 1), 
 NULL, 
 'received', 'Hi, do you have TMT bars in stock?', '2025-01-15 16:30:00', true),

((SELECT id FROM customers WHERE name = 'Global Engineering Works' LIMIT 1), 
 NULL, 
 'sent', 'Yes, we have TMT bars available. What sizes do you need?', '2025-01-15 16:32:00', true),

((SELECT id FROM customers WHERE name = 'Global Engineering Works' LIMIT 1), 
 NULL, 
 'received', 'I need 10mm, 12mm, and 16mm TMT bars. About 50 tons in total.', '2025-01-15 16:35:00', true),

((SELECT id FROM customers WHERE name = 'Global Engineering Works' LIMIT 1), 
 NULL, 
 'sent', 'Great! Let me prepare a quotation for you with current prices.', '2025-01-15 16:37:00', true);

-- Insert mock data for phone call logs
INSERT INTO public.phone_call_logs (customer_id, quotation_id, call_type, call_duration, call_date, call_notes, follow_up_required, follow_up_date, call_outcome) VALUES
-- Calls with ABC Construction Ltd
((SELECT id FROM customers WHERE name = 'ABC Construction Ltd' LIMIT 1), 
 (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-001' LIMIT 1), 
 'outgoing', 420, '2025-01-10 15:30:00', 'Discussed delivery timeline. Customer confirmed order placement. Delivery scheduled for Jan 20th.', true, '2025-01-18', 'order_placed'),

((SELECT id FROM customers WHERE name = 'ABC Construction Ltd' LIMIT 1), 
 (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-001' LIMIT 1), 
 'incoming', 180, '2025-01-18 10:15:00', 'Customer called to confirm delivery address and timing. All details confirmed.', false, NULL, 'interested'),

-- Calls with XYZ Infrastructure
((SELECT id FROM customers WHERE name = 'XYZ Infrastructure Pvt Ltd' LIMIT 1), 
 (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-002' LIMIT 1), 
 'outgoing', 600, '2025-01-13 14:00:00', 'Detailed discussion about project requirements. Explained different steel grades and pricing. Customer seemed interested.', true, '2025-01-20', 'interested'),

((SELECT id FROM customers WHERE name = 'XYZ Infrastructure Pvt Ltd' LIMIT 1), 
 (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-002' LIMIT 1), 
 'incoming', 240, '2025-01-20 09:30:00', 'Customer called to negotiate pricing. Discussed bulk discount options. Waiting for final decision.', true, '2025-01-25', 'callback_requested'),

-- Calls with Global Engineering Works
((SELECT id FROM customers WHERE name = 'Global Engineering Works' LIMIT 1), 
 NULL, 
 'outgoing', 0, '2025-01-16 11:00:00', 'Called to follow up on TMT bar inquiry. No answer. Left voicemail.', true, '2025-01-17', 'no_answer'),

((SELECT id FROM customers WHERE name = 'Global Engineering Works' LIMIT 1), 
 NULL, 
 'incoming', 300, '2025-01-17 15:45:00', 'Customer returned call. Discussed TMT bar specifications and pricing. Requested formal quotation.', false, NULL, 'quotation_requested'),

-- Calls with Modern Fabricators
((SELECT id FROM customers WHERE name = 'Modern Fabricators' LIMIT 1), 
 NULL, 
 'incoming', 150, '2025-01-19 13:20:00', 'New customer inquiry about steel pipes. Took down requirements and contact details.', true, '2025-01-22', 'quotation_requested'),

((SELECT id FROM customers WHERE name = 'Modern Fabricators' LIMIT 1), 
 NULL, 
 'missed', 0, '2025-01-21 16:30:00', 'Missed call from customer. Need to call back.', true, '2025-01-22', 'callback_requested');

-- Insert mock data for lead activities
INSERT INTO public.lead_activities (customer_id, quotation_id, activity_type, activity_title, activity_description, activity_date) VALUES
-- Activities for ABC Construction Ltd
((SELECT id FROM customers WHERE name = 'ABC Construction Ltd' LIMIT 1), 
 (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-001' LIMIT 1), 
 'quotation_created', 'Quotation Created', 'Quotation QT-2025-001 created for MS steel sheets', '2025-01-10 10:15:00'),

((SELECT id FROM customers WHERE name = 'ABC Construction Ltd' LIMIT 1), 
 (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-001' LIMIT 1), 
 'quotation_sent', 'Quotation Sent', 'Quotation QT-2025-001 sent to customer via WhatsApp', '2025-01-10 10:16:00'),

((SELECT id FROM customers WHERE name = 'ABC Construction Ltd' LIMIT 1), 
 (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-001' LIMIT 1), 
 'phone_call', 'Order Confirmation Call', 'Customer confirmed order placement during phone call', '2025-01-10 15:30:00'),

-- Activities for XYZ Infrastructure
((SELECT id FROM customers WHERE name = 'XYZ Infrastructure Pvt Ltd' LIMIT 1), 
 (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-002' LIMIT 1), 
 'quotation_created', 'Quotation Created', 'Quotation QT-2025-002 created for structural steel', '2025-01-12 16:30:00'),

((SELECT id FROM customers WHERE name = 'XYZ Infrastructure Pvt Ltd' LIMIT 1), 
 (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-002' LIMIT 1), 
 'phone_call', 'Requirements Discussion', 'Detailed discussion about project requirements and specifications', '2025-01-13 14:00:00'),

((SELECT id FROM customers WHERE name = 'XYZ Infrastructure Pvt Ltd' LIMIT 1), 
 (SELECT id FROM quotations WHERE quotation_number = 'QT-2025-002' LIMIT 1), 
 'phone_call', 'Pricing Negotiation', 'Customer called to negotiate pricing and discuss bulk discounts', '2025-01-20 09:30:00'),

-- Activities for Global Engineering Works
((SELECT id FROM customers WHERE name = 'Global Engineering Works' LIMIT 1), 
 NULL, 
 'whatsapp_message', 'TMT Bar Inquiry', 'Customer inquired about TMT bar availability via WhatsApp', '2025-01-15 16:30:00'),

((SELECT id FROM customers WHERE name = 'Global Engineering Works' LIMIT 1), 
 NULL, 
 'phone_call', 'Follow-up Call', 'Follow-up call for TMT bar inquiry - customer requested quotation', '2025-01-17 15:45:00'),

-- Activities for Modern Fabricators
((SELECT id FROM customers WHERE name = 'Modern Fabricators' LIMIT 1), 
 NULL, 
 'phone_call', 'New Customer Inquiry', 'New customer called inquiring about steel pipes', '2025-01-19 13:20:00');
