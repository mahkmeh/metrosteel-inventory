import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, MessageSquare, Phone, Send, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ReminderManagementProps {
  quotationId: string;
}

export function ReminderManagement({ quotationId }: ReminderManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [reminderType, setReminderType] = useState<'reminder_1' | 'reminder_2' | 'reminder_3'>('reminder_1');
  const [sentDate, setSentDate] = useState<Date>(new Date());
  const [method, setMethod] = useState<'whatsapp' | 'email' | 'call'>('email');
  const [notes, setNotes] = useState('');

  // Fetch existing reminders for this quotation
  const { data: reminders = [] } = useQuery({
    queryKey: ['quotation-reminders', quotationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotation_reminders')
        .select('*')
        .eq('quotation_id', quotationId)
        .order('sent_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create reminder mutation
  const createReminderMutation = useMutation({
    mutationFn: async (reminderData: {
      quotation_id: string;
      reminder_type: string;
      sent_date: string;
      method: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('quotation_reminders')
        .insert(reminderData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation-reminders', quotationId] });
      toast({ title: 'Reminder added successfully' });
      resetForm();
      setOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: 'Error adding reminder', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const resetForm = () => {
    setReminderType('reminder_1');
    setSentDate(new Date());
    setMethod('email');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReminderMutation.mutate({
      quotation_id: quotationId,
      reminder_type: reminderType,
      sent_date: format(sentDate, 'yyyy-MM-dd'),
      method,
      notes: notes.trim() || undefined,
    });
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'whatsapp':
        return <MessageSquare className="h-3 w-3" />;
      case 'call':
        return <Phone className="h-3 w-3" />;
      case 'email':
        return <Send className="h-3 w-3" />;
      default:
        return <Send className="h-3 w-3" />;
    }
  };

  const getMethodBadgeVariant = (method: string) => {
    switch (method) {
      case 'whatsapp':
        return 'default';
      case 'call':
        return 'secondary';
      case 'email':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case 'reminder_1':
        return 'R1';
      case 'reminder_2':
        return 'R2';
      case 'reminder_3':
        return 'R3';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-2">
      {/* Reminder History */}
      <div className="flex flex-wrap gap-1">
        {reminders.map((reminder) => (
          <Badge
            key={reminder.id}
            variant={getMethodBadgeVariant(reminder.method)}
            className="text-xs flex items-center gap-1"
          >
            {getMethodIcon(reminder.method)}
            {getReminderTypeLabel(reminder.reminder_type)} - {format(new Date(reminder.sent_date), 'MMM dd')}
          </Badge>
        ))}
      </div>

      {/* Add Reminder Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Add Reminder
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Reminder</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Reminder Type</label>
                <Select value={reminderType} onValueChange={(value: any) => setReminderType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reminder_1">Reminder 1</SelectItem>
                    <SelectItem value="reminder_2">Reminder 2</SelectItem>
                    <SelectItem value="reminder_3">Reminder 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Method</label>
                <Select value={method} onValueChange={(value: any) => setMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date Sent</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !sentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {sentDate ? format(sentDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={sentDate}
                    onSelect={(date) => date && setSentDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this reminder..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createReminderMutation.isPending}>
                {createReminderMutation.isPending ? 'Adding...' : 'Add Reminder'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}