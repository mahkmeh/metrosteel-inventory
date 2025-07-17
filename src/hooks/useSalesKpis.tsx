import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSalesKpis = () => {
  return useQuery({
    queryKey: ["sales-kpis"],
    queryFn: async () => {
      const today = new Date();
      const fiveDaysAgo = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);

      const { data: salesOrders, error } = await supabase
        .from("sales_orders")
        .select("*, customers!inner(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 1. Orders to Dispatch - Count ready for shipping
      const ordersToDispatch = salesOrders.filter(order => 
        order.status === 'pending' || order.status === 'processing'
      );

      // 2. Delayed Orders - Count overdue >5 days
      const delayedOrders = salesOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate < fiveDaysAgo && order.status === 'pending';
      });

      // 3. Payment Collection Due - Amount overdue + customer count (simulated)
      const paymentCollectionDue = salesOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orderDate < thirtyDaysAgo && order.status !== 'paid' && order.status === 'completed';
      });
      const paymentAmount = paymentCollectionDue.reduce((sum, order) => sum + (order.total_amount || 0), 0);

      // 4. Delivery Confirmations Pending - Count shipped but not confirmed
      const deliveryConfirmationsPending = salesOrders.filter(order => 
        order.status === 'shipped'
      );

      return {
        ordersToDispatch: ordersToDispatch.length,
        delayedOrders: delayedOrders.length,
        paymentCollectionDue: {
          amount: paymentAmount,
          count: paymentCollectionDue.length
        },
        deliveryConfirmationsPending: deliveryConfirmationsPending.length
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};