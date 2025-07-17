import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerKpis = () => {
  return useQuery({
    queryKey: ["customer-kpis"],
    queryFn: async () => {
      const today = new Date();
      const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [customersRes, salesOrdersRes] = await Promise.all([
        supabase.from("customers").select("*").eq("is_active", true),
        supabase.from("sales_orders").select("*, customers!inner(name)").order("created_at", { ascending: false })
      ]);

      if (customersRes.error) throw customersRes.error;
      if (salesOrdersRes.error) throw salesOrdersRes.error;

      const customers = customersRes.data || [];
      const salesOrders = salesOrdersRes.data || [];

      // 1. Credit Limit Breaches - Count of customers + excess amount
      const creditBreaches = customers.filter(customer => {
        const customerOrders = salesOrders.filter(order => 
          order.customer_id === customer.id && order.status === 'pending'
        );
        const pendingAmount = customerOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        return pendingAmount > (customer.credit_limit || 0);
      });

      const excessAmount = creditBreaches.reduce((sum, customer) => {
        const customerOrders = salesOrders.filter(order => 
          order.customer_id === customer.id && order.status === 'pending'
        );
        const pendingAmount = customerOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        return sum + Math.max(0, pendingAmount - (customer.credit_limit || 0));
      }, 0);

      // 2. Payment Overdue - Count of customers + total amount + aging
      const paymentOverdue = salesOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        const customer = customers.find(c => c.id === order.customer_id);
        const creditDays = customer?.credit_days || 30;
        const dueDate = new Date(orderDate.getTime() + creditDays * 24 * 60 * 60 * 1000);
        return dueDate < today && order.status !== 'paid';
      });

      const overdueAmount = paymentOverdue.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const uniqueOverdueCustomers = [...new Set(paymentOverdue.map(order => order.customer_id))].length;

      // Calculate aging (average days overdue)
      const totalOverdueDays = paymentOverdue.reduce((sum, order) => {
        const orderDate = new Date(order.created_at);
        const customer = customers.find(c => c.id === order.customer_id);
        const creditDays = customer?.credit_days || 30;
        const dueDate = new Date(orderDate.getTime() + creditDays * 24 * 60 * 60 * 1000);
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + Math.max(0, daysOverdue);
      }, 0);
      const avgAging = paymentOverdue.length > 0 ? Math.round(totalOverdueDays / paymentOverdue.length) : 0;

      // 3. Inactive Customers - Count with no orders >90 days
      const inactiveCustomers = customers.filter(customer => {
        const lastOrder = salesOrders
          .filter(order => order.customer_id === customer.id)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        
        if (!lastOrder) return true; // No orders at all
        return new Date(lastOrder.created_at) < ninetyDaysAgo;
      });

      // 4. High Value Customers at Risk - Count with declining orders
      const highValueCustomersAtRisk = customers.filter(customer => {
        const customerOrders = salesOrders.filter(order => order.customer_id === customer.id);
        const recentOrders = customerOrders.filter(order => new Date(order.created_at) > thirtyDaysAgo);
        const olderOrders = customerOrders.filter(order => new Date(order.created_at) <= thirtyDaysAgo);
        
        const recentTotal = recentOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const olderAvg = olderOrders.length > 0 ? 
          olderOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / Math.max(1, olderOrders.length) : 0;
        
        // High value customer with declining orders
        return olderAvg > 100000 && recentTotal < olderAvg * 0.5;
      });

      return {
        creditBreaches: {
          count: creditBreaches.length,
          excessAmount
        },
        paymentOverdue: {
          count: uniqueOverdueCustomers,
          amount: overdueAmount,
          avgAging
        },
        inactiveCustomers: inactiveCustomers.length,
        highValueCustomersAtRisk: highValueCustomersAtRisk.length
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};