-- Create quotation_reminders table
CREATE TABLE public.quotation_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('reminder_1', 'reminder_2', 'reminder_3')),
  sent_date DATE NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('whatsapp', 'email', 'call')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on quotation_reminders
ALTER TABLE public.quotation_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for quotation_reminders
CREATE POLICY "Users can view all reminders" 
ON public.quotation_reminders 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create reminders" 
ON public.quotation_reminders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update reminders" 
ON public.quotation_reminders 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete reminders" 
ON public.quotation_reminders 
FOR DELETE 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_quotation_reminders_updated_at
BEFORE UPDATE ON public.quotation_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update quotations table status to include new statuses
ALTER TABLE public.quotations 
DROP CONSTRAINT IF EXISTS quotations_status_check;

ALTER TABLE public.quotations 
ADD CONSTRAINT quotations_status_check 
CHECK (status IN ('draft', 'sent', 'pending', 'discussion', 'won', 'lost'));

-- Add indexes for better search performance
CREATE INDEX idx_quotations_search ON public.quotations USING gin(
  to_tsvector('english', COALESCE(quotation_number, '') || ' ' || COALESCE(concerned_person, ''))
);

CREATE INDEX idx_quotation_reminders_quotation_id ON public.quotation_reminders(quotation_id);
CREATE INDEX idx_quotation_reminders_sent_date ON public.quotation_reminders(sent_date);