import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  event_type: 'sales' | 'collection' | 'meeting' | 'job_work' | 'purchase' | 'follow_up' | 'review';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'cancelled' | 'rescheduled';
  customer_id?: string;
  sales_order_id?: string;
  quotation_id?: string;
  purchase_order_id?: string;
  is_auto_generated: boolean;
  source_table?: string;
  created_at: string;
  updated_at: string;
  customers?: {
    name: string;
  };
}

export const useCalendarEvents = (startDate?: Date, endDate?: Date, eventTypes?: string[]) => {
  return useQuery({
    queryKey: ['calendar-events', startDate, endDate, eventTypes],
    queryFn: async () => {
      let query = supabase
        .from('business_calendar_events')
        .select(`
          *,
          customers:customer_id(name)
        `)
        .order('event_date', { ascending: true });

      if (startDate) {
        query = query.gte('event_date', format(startDate, 'yyyy-MM-dd'));
      }
      
      if (endDate) {
        query = query.lte('event_date', format(endDate, 'yyyy-MM-dd'));
      }

      if (eventTypes && eventTypes.length > 0) {
        query = query.in('event_type', eventTypes);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as CalendarEvent[];
    },
  });
};

export const useUpdateEventStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CalendarEvent['status'] }) => {
      const { data, error } = await supabase
        .from('business_calendar_events')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('business_calendar_events')
        .insert(event)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
};