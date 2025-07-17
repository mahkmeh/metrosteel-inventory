import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePurchaseKpis = () => {
  return useQuery({
    queryKey: ["purchase-kpis"],
    queryFn: async () => {
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      const { data: purchaseOrders, error } = await supabase
        .from("purchase_orders")
        .select("*, suppliers!inner(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 1. Overdue Deliveries - Count from suppliers + days late
      const overdueDeliveries = purchaseOrders.filter(po => {
        if (!po.expected_delivery) return false;
        const expectedDate = new Date(po.expected_delivery);
        return expectedDate < today && po.status !== 'received';
      });

      // Calculate average days late
      const totalDaysLate = overdueDeliveries.reduce((sum, po) => {
        const expectedDate = new Date(po.expected_delivery!);
        const daysLate = Math.floor((today.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + daysLate;
      }, 0);
      const avgDaysLate = overdueDeliveries.length > 0 ? Math.round(totalDaysLate / overdueDeliveries.length) : 0;

      // 2. Pending Approvals - Count awaiting approval
      const pendingApprovals = purchaseOrders.filter(po => po.status === 'pending');
      const pendingApprovalsValue = pendingApprovals.reduce((sum, po) => sum + (po.total_amount || 0), 0);

      // 3. Payment Due Today/Tomorrow - Amount due + supplier count
      const paymentsDueToday = purchaseOrders.filter(po => {
        const orderDate = new Date(po.created_at);
        const thirtyDaysAfterOrder = new Date(orderDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        return thirtyDaysAfterOrder <= tomorrow && po.status === 'received';
      });
      const paymentsDueAmount = paymentsDueToday.reduce((sum, po) => sum + (po.total_amount || 0), 0);
      const uniqueSuppliers = [...new Set(paymentsDueToday.map(po => po.supplier_id))].length;

      // 4. Quality Issues - Simulated count of materials with issues
      const qualityIssues = Math.floor(Math.random() * 3); // Simulated for demo

      return {
        overdueDeliveries: {
          count: overdueDeliveries.length,
          avgDaysLate
        },
        pendingApprovals: {
          count: pendingApprovals.length,
          value: pendingApprovalsValue
        },
        paymentsDue: {
          amount: paymentsDueAmount,
          suppliers: uniqueSuppliers
        },
        qualityIssues
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};