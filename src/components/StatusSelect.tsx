import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface StatusSelectProps {
  quotationId: string;
  currentStatus: string;
  compact?: boolean;
}

export function StatusSelect({ quotationId, currentStatus, compact = false }: StatusSelectProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
    sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
    pending: { label: 'Pending', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
    discussion: { label: 'Discussion', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
    won: { label: 'Won', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
    lost: { label: 'Lost', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
  };

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { data, error } = await supabase
        .from('quotations')
        .update({ status: newStatus })
        .eq('id', quotationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({ title: 'Status updated successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error updating status', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== currentStatus) {
      updateStatusMutation.mutate(newStatus);
    }
  };

  if (compact) {
    return (
      <Badge className={statusConfig[currentStatus as keyof typeof statusConfig]?.color || statusConfig.draft.color}>
        {statusConfig[currentStatus as keyof typeof statusConfig]?.label || currentStatus}
      </Badge>
    );
  }

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-32">
        <SelectValue>
          <Badge className={statusConfig[currentStatus as keyof typeof statusConfig]?.color || statusConfig.draft.color}>
            {statusConfig[currentStatus as keyof typeof statusConfig]?.label || currentStatus}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(statusConfig).map(([status, config]) => (
          <SelectItem key={status} value={status}>
            <Badge className={config.color}>
              {config.label}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}