import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useQuotationKpis = () => {
  return useQuery({
    queryKey: ["quotation-kpis"],
    queryFn: async () => {
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
      const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

      const { data: quotations, error } = await supabase
        .from("quotations")
        .select("*, customers!inner(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 1. Follow-Up Required - Count of quotes >7 days old
      const followUpRequired = quotations.filter(quote => {
        const createdDate = new Date(quote.created_at);
        return createdDate < sevenDaysAgo && quote.status === 'sent';
      });

      // 2. Expiring Soon - Count expiring in 3 days
      const expiringSoon = quotations.filter(quote => {
        if (!quote.valid_until) return false;
        const validDate = new Date(quote.valid_until);
        const daysDiff = (validDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 3 && daysDiff >= 0 && quote.status === 'sent';
      });

      // 3. High Value Pending - Count >₹5L pending
      const highValuePending = quotations.filter(quote => 
        quote.status === 'sent' && (quote.grand_total || 0) > 500000
      );
      const highValueTotal = highValuePending.reduce((sum, quote) => sum + (quote.grand_total || 0), 0);

      // 4. Conversion Overdue - Count in "Sent" status >14 days
      const conversionOverdue = quotations.filter(quote => {
        const createdDate = new Date(quote.created_at);
        return createdDate < fourteenDaysAgo && quote.status === 'sent';
      });

      return {
        followUpRequired: followUpRequired.length,
        expiringSoon: expiringSoon.length,
        highValuePending: {
          count: highValuePending.length,
          total: highValueTotal
        },
        conversionOverdue: conversionOverdue.length
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};