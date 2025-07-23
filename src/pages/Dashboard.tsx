import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  CreditCard, 
  Clock, 
  Package2, 
  Truck, 
  Ban, 
  Calendar, 
  TrendingDown,
  AlertCircle,
  DollarSign,
  RefreshCw,
  Eye,
  Send,
  Phone,
  CheckCircle,
  ArrowRight,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KpiCard } from "@/components/KpiCard";
import { useToast } from "@/hooks/use-toast";
import { PaymentReminderModal } from "@/components/PaymentReminderModal";
import { SupplierContactModal } from "@/components/SupplierContactModal";
import { QuotationExtensionModal } from "@/components/QuotationExtensionModal";

const Dashboard = () => {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [paymentReminderOpen, setPaymentReminderOpen] = useState(false);
  const [supplierContactOpen, setSupplierContactOpen] = useState(false);
  const [quotationExtensionOpen, setQuotationExtensionOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Comprehensive KPI Data Query
  const { data: kpiData, isLoading } = useQuery({
    queryKey: ["kpi-dashboard"],
    queryFn: async () => {
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

      const [
        lowStockRes,
        quotationsRes,
        salesOrdersRes,
        purchaseOrdersRes,
        customersRes,
        inventoryRes
      ] = await Promise.all([
        // Low Stock Items
        supabase.from("inventory").select("*, materials!inner(name, sku)")
          .lt("available_quantity", 10),
        
        // All Quotations with dates
        supabase.from("quotations").select("*, customers!inner(name)")
          .order("created_at", { ascending: false }),
        
        // Sales Orders
        supabase.from("sales_orders").select("*, customers!inner(name)")
          .order("created_at", { ascending: false }),
        
        // Purchase Orders
        supabase.from("purchase_orders").select("*, suppliers!inner(name)")
          .order("created_at", { ascending: false }),
        
        // Customers for credit analysis
        supabase.from("customers").select("*"),
        
        // Inventory for stock analysis
        supabase.from("inventory").select("*, materials!inner(name, base_price)")
          .order("quantity", { ascending: false })
      ]);

      // Calculate KPIs
      const lowStockItems = lowStockRes.data || [];
      const quotations = quotationsRes.data || [];
      const salesOrders = salesOrdersRes.data || [];
      const purchaseOrders = purchaseOrdersRes.data || [];
      const customers = customersRes.data || [];
      const inventory = inventoryRes.data || [];

      // 1. Low Stock Alerts
      const lowStockCount = lowStockItems.length;

      // 2. Overdue Payments (simulated based on sales orders + credit days)
      const overduePayments = salesOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        const customer = customers.find(c => c.id === order.customer_id);
        const creditDays = customer?.credit_days || 30;
        const dueDate = new Date(orderDate.getTime() + creditDays * 24 * 60 * 60 * 1000);
        return dueDate < today && order.status !== 'paid';
      });
      const overdueAmount = overduePayments.reduce((sum, order) => sum + order.total_amount, 0);

      // 3. High Value Quotations Pending >7 Days
      const highValueOldQuotes = quotations.filter(quote => {
        const createdDate = new Date(quote.created_at);
        const daysDiff = (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff > 7 && quote.status === 'sent' && quote.total_amount > 500000;
      });
      const highValueQuoteAmount = highValueOldQuotes.reduce((sum, quote) => sum + quote.total_amount, 0);

      // 4. Orders Received but Not Dispatched
      const unDispatchedOrders = salesOrders.filter(order => 
        order.status === 'pending' || order.status === 'processing'
      );
      const unDispatchedValue = unDispatchedOrders.reduce((sum, order) => sum + order.total_amount, 0);

      // 5. Purchase Orders Overdue from Suppliers
      const overduePOs = purchaseOrders.filter(po => {
        if (!po.expected_delivery) return false;
        const expectedDate = new Date(po.expected_delivery);
        return expectedDate < today && po.status !== 'received';
      });

      // 6. Credit Limit Breaches (simulated)
      const creditBreaches = customers.filter(customer => {
        const customerOrders = salesOrders.filter(order => 
          order.customer_id === customer.id && order.status === 'pending'
        );
        const pendingAmount = customerOrders.reduce((sum, order) => sum + order.total_amount, 0);
        return pendingAmount > (customer.credit_limit || 0);
      });
      const excessAmount = creditBreaches.reduce((sum, customer) => {
        const customerOrders = salesOrders.filter(order => 
          order.customer_id === customer.id && order.status === 'pending'
        );
        const pendingAmount = customerOrders.reduce((sum, order) => sum + order.total_amount, 0);
        return sum + Math.max(0, pendingAmount - (customer.credit_limit || 0));
      }, 0);

      // 7. Quotations Expiring in 3 Days
      const expiringQuotes = quotations.filter(quote => {
        if (!quote.valid_until) return false;
        const validDate = new Date(quote.valid_until);
        const daysDiff = (validDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 3 && daysDiff >= 0 && quote.status === 'sent';
      });
      const expiringQuoteValue = expiringQuotes.reduce((sum, quote) => sum + quote.total_amount, 0);

      // 8. Stock Above Maximum Level (simulated as >1000 units)
      const excessStockItems = inventory.filter(item => item.quantity > 1000);
      const excessStockValue = excessStockItems.reduce((sum, item) => 
        sum + (item.quantity - 1000) * (item.materials?.base_price || 0), 0);

      // 9. Customer Orders Delayed >5 Days
      const delayedOrders = salesOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        const daysDiff = (today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff > 5 && order.status === 'pending';
      });

      // 10. Urgent Supplier Payments Due (simulated)
      const urgentPayments = purchaseOrders.filter(po => {
        const orderDate = new Date(po.created_at);
        const daysDiff = (today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff >= 30 && po.status === 'received'; // Assuming 30-day payment terms
      });
      const urgentPaymentAmount = urgentPayments.reduce((sum, po) => sum + po.total_amount, 0);

      return {
        lowStockCount,
        lowStockItems: lowStockItems.slice(0, 5),
        overduePayments: overduePayments.length,
        overdueAmount,
        highValueOldQuotes: highValueOldQuotes.length,
        highValueQuoteAmount,
        unDispatchedOrders: unDispatchedOrders.length,
        unDispatchedValue,
        overduePOs: overduePOs.length,
        overduePOSuppliers: [...new Set(overduePOs.map(po => po.suppliers?.name))].slice(0, 3),
        creditBreaches: creditBreaches.length,
        excessAmount,
        expiringQuotes: expiringQuotes.length,
        expiringQuoteValue,
        excessStockItems: excessStockItems.length,
        excessStockValue,
        delayedOrders: delayedOrders.length,
        urgentPayments: urgentPayments.length,
        urgentPaymentAmount
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Action handlers for KPI cards
  const handleLowStockAction = () => {
    navigate("/materials?filter=low-stock");
    toast({
      title: "Navigating to Materials",
      description: "Showing items with low stock levels",
    });
  };

  const handleOverduePaymentsAction = () => {
    setPaymentReminderOpen(true);
  };

  const handlePendingQuotesAction = () => {
    navigate("/leads/quotations?filter=follow-up");
    toast({
      title: "Navigating to Quotations",
      description: "Showing quotes requiring follow-up",
    });
  };

  const handleOrdersToShipAction = () => {
    navigate("/sales/orders?filter=pending");
    toast({
      title: "Navigating to Sales Orders",
      description: "Showing orders ready for dispatch",
    });
  };

  const handleLateSuppliersAction = () => {
    setSupplierContactOpen(true);
  };

  const handleCreditBreachesAction = () => {
    navigate("/sales/customers?filter=credit-breach");
    toast({
      title: "Navigating to Customers",
      description: "Showing customers with credit limit breaches",
    });
  };

  const handleExpiringQuotesAction = () => {
    setQuotationExtensionOpen(true);
  };

  const handleExcessStockAction = () => {
    navigate("/materials?filter=excess-stock");
    toast({
      title: "Navigating to Materials",
      description: "Showing items with excess stock",
    });
  };

  const handleDelayedOrdersAction = () => {
    navigate("/sales/orders?filter=delayed");
    toast({
      title: "Navigating to Sales Orders",
      description: "Showing delayed orders requiring attention",
    });
  };

  const handleUrgentPaymentsAction = () => {
    navigate("/purchase/payables?filter=urgent");
    toast({
      title: "Navigating to Payables",
      description: "Showing urgent payments due",
    });
  };

  // Define KPI Cards with actions
  const kpiCards = [
    // Row 1: Critical Operations
    {
      id: "lowStock",
      title: "Low Stock Alerts",
      value: kpiData?.lowStockCount || 0,
      subtitle: "Items below 10 units",
      status: (kpiData?.lowStockCount || 0) > 5 ? "critical" : (kpiData?.lowStockCount || 0) > 0 ? "warning" : "good",
      icon: AlertTriangle,
      actionLabel: "View Details",
      onAction: handleLowStockAction,
      details: `${kpiData?.lowStockItems?.length || 0} items need restocking`
    },
    {
      id: "overduePayments", 
      title: "Overdue Payments",
      value: `₹${((kpiData?.overdueAmount || 0) / 100000).toFixed(1)}L`,
      subtitle: `${kpiData?.overduePayments || 0} customers`,
      status: (kpiData?.overdueAmount || 0) > 1000000 ? "critical" : (kpiData?.overdueAmount || 0) > 0 ? "warning" : "good",
      icon: CreditCard,
      actionLabel: "Send Reminders",
      onAction: handleOverduePaymentsAction,
      details: `${Math.ceil((kpiData?.overdueAmount || 0) / 100000)} lakhs pending`
    },
    {
      id: "pendingQuotes",
      title: "High Value Quotes >7 Days", 
      value: kpiData?.highValueOldQuotes || 0,
      subtitle: `₹${((kpiData?.highValueQuoteAmount || 0) / 100000).toFixed(1)}L total`,
      status: (kpiData?.highValueOldQuotes || 0) > 3 ? "critical" : (kpiData?.highValueOldQuotes || 0) > 0 ? "warning" : "good",
      icon: Clock,
      actionLabel: "Follow Up",
      onAction: handlePendingQuotesAction,
      details: "High value quotations pending"
    },
    {
      id: "ordersToShip",
      title: "Orders to Ship",
      value: kpiData?.unDispatchedOrders || 0,
      subtitle: `₹${((kpiData?.unDispatchedValue || 0) / 100000).toFixed(1)}L value`,
      status: (kpiData?.unDispatchedOrders || 0) > 10 ? "critical" : (kpiData?.unDispatchedOrders || 0) > 0 ? "warning" : "good",
      icon: Package2,
      actionLabel: "Process Orders",
      onAction: handleOrdersToShipAction,
      details: "Ready for dispatch"
    },
    // Row 2: Supply Chain & Credit
    {
      id: "lateSuppliers",
      title: "Late Suppliers",
      value: kpiData?.overduePOs || 0,
      subtitle: kpiData?.overduePOSuppliers?.join(", ") || "None",
      status: (kpiData?.overduePOs || 0) > 3 ? "critical" : (kpiData?.overduePOs || 0) > 0 ? "warning" : "good",
      icon: Truck,
      actionLabel: "Contact Suppliers",
      onAction: handleLateSuppliersAction,
      details: "Purchase orders overdue"
    },
    {
      id: "creditBreaches",
      title: "Credit Breaches", 
      value: kpiData?.creditBreaches || 0,
      subtitle: `₹${((kpiData?.excessAmount || 0) / 100000).toFixed(1)}L excess`,
      status: (kpiData?.creditBreaches || 0) > 0 ? "critical" : "good",
      icon: Ban,
      actionLabel: "Review Credit",
      onAction: handleCreditBreachesAction,
      details: "Credit limits exceeded"
    },
    {
      id: "expiringQuotes",
      title: "Expiring Quotes",
      value: kpiData?.expiringQuotes || 0,
      subtitle: `₹${((kpiData?.expiringQuoteValue || 0) / 100000).toFixed(1)}L at risk`,
      status: (kpiData?.expiringQuotes || 0) > 2 ? "critical" : (kpiData?.expiringQuotes || 0) > 0 ? "warning" : "good",
      icon: Calendar,
      actionLabel: "Extend Validity",
      onAction: handleExpiringQuotesAction,
      details: "Expiring in 3 days"
    },
    {
      id: "excessStock",
      title: "Excess Stock",
      value: kpiData?.excessStockItems || 0,
      subtitle: `₹${((kpiData?.excessStockValue || 0) / 100000).toFixed(1)}L dead stock`,
      status: (kpiData?.excessStockItems || 0) > 5 ? "warning" : "good",
      icon: TrendingDown,
      actionLabel: "Optimize Stock",
      onAction: handleExcessStockAction,
      details: "Above maximum levels"
    },
    // Row 3: Customer Operations
    {
      id: "delayedOrders",
      title: "Delayed Orders",
      value: kpiData?.delayedOrders || 0,
      subtitle: "Orders >5 days pending",
      status: (kpiData?.delayedOrders || 0) > 5 ? "critical" : (kpiData?.delayedOrders || 0) > 0 ? "warning" : "good",
      icon: AlertCircle,
      actionLabel: "Escalate Orders",
      onAction: handleDelayedOrdersAction,
      details: "Require immediate attention"
    },
    {
      id: "urgentPayments",
      title: "Urgent Payments Due",
      value: `₹${((kpiData?.urgentPaymentAmount || 0) / 100000).toFixed(1)}L`,
      subtitle: `${kpiData?.urgentPayments || 0} suppliers`,
      status: (kpiData?.urgentPaymentAmount || 0) > 500000 ? "critical" : (kpiData?.urgentPaymentAmount || 0) > 0 ? "warning" : "good",
      icon: DollarSign,
      actionLabel: "Process Payments",
      onAction: handleUrgentPaymentsAction,
      details: "Due today/tomorrow"
    }
  ];

  if (isLoading) {
    return (
      <div className="px-4 sm:px-0 space-y-8 animate-pulse">
        <div className="h-32 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="h-40 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Business Intelligence Dashboard</h1>
          <p className="text-muted-foreground">Real-time KPI monitoring for steel trading operations</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => {
              setLastRefresh(new Date());
              window.location.reload();
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <span className="text-xs text-muted-foreground self-center">
            Updated: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid - 4-4-2 Layout */}
      
      {/* Row 1: Critical Operations */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Critical Operations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpiCards.slice(0, 4).map((kpi) => (
            <KpiCard
              key={kpi.id}
              title={kpi.title}
              value={kpi.value}
              subtitle={kpi.subtitle}
              status={kpi.status as "critical" | "warning" | "good" | "info"}
              icon={kpi.icon}
              actionLabel={kpi.actionLabel}
              onAction={kpi.onAction}
              details={kpi.details}
            />
          ))}
        </div>
      </div>

      {/* Row 2: Supply Chain & Credit */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          Supply Chain & Credit Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpiCards.slice(4, 8).map((kpi) => (
            <KpiCard
              key={kpi.id}
              title={kpi.title}
              value={kpi.value}
              subtitle={kpi.subtitle}
              status={kpi.status as "critical" | "warning" | "good" | "info"}
              icon={kpi.icon}
              actionLabel={kpi.actionLabel}
              onAction={kpi.onAction}
              details={kpi.details}
            />
          ))}
        </div>
      </div>

      {/* Row 3: Customer Operations */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Customer Operations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {kpiCards.slice(8, 10).map((kpi) => (
            <KpiCard
              key={kpi.id}
              title={kpi.title}
              value={kpi.value}
              subtitle={kpi.subtitle}
              status={kpi.status as "critical" | "warning" | "good" | "info"}
              icon={kpi.icon}
              actionLabel={kpi.actionLabel}
              onAction={kpi.onAction}
              details={kpi.details}
            />
          ))}
        </div>
      </div>

      {/* Low Stock Alert Details */}
      {kpiData?.lowStockItems && kpiData.lowStockItems.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Critical Stock Alert - Immediate Action Required
            </CardTitle>
            <CardDescription>Items requiring urgent restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {kpiData.lowStockItems.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-card rounded-lg border border-destructive/20">
                  <div>
                    <p className="font-medium text-foreground">{item.materials.name}</p>
                    <p className="text-sm text-muted-foreground">SKU: {item.materials.sku}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">{item.available_quantity} units</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Available</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button className="w-full gap-2" onClick={handleLowStockAction}>
                <Eye className="h-4 w-4" />
                View All Low Stock Items ({kpiData.lowStockCount})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <PaymentReminderModal
        open={paymentReminderOpen}
        onOpenChange={setPaymentReminderOpen}
        overduePayments={kpiData?.overduePayments || 0}
        overdueAmount={kpiData?.overdueAmount || 0}
      />

      <SupplierContactModal
        open={supplierContactOpen}
        onOpenChange={setSupplierContactOpen}
        suppliers={kpiData?.overduePOSuppliers || []}
        overdueCount={kpiData?.overduePOs || 0}
      />

      <QuotationExtensionModal
        open={quotationExtensionOpen}
        onOpenChange={setQuotationExtensionOpen}
        expiringQuotes={kpiData?.expiringQuotes || 0}
        expiringValue={kpiData?.expiringQuoteValue || 0}
      />
    </div>
  );
};

export default Dashboard;
