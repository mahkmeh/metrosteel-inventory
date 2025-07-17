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

const Dashboard = () => {
  const [lastRefresh, setLastRefresh] = useState(new Date());

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

  // Define KPI Cards with proper color coding
  const kpiCards = [
    // Row 1: Critical Operations
    {
      id: "lowStock",
      title: "Low Stock Alerts",
      value: kpiData?.lowStockCount || 0,
      subtitle: "Items below 10 units",
      status: (kpiData?.lowStockCount || 0) > 5 ? "critical" : (kpiData?.lowStockCount || 0) > 0 ? "warning" : "good",
      icon: AlertTriangle,
      action: "View Details",
      details: `${kpiData?.lowStockItems?.length || 0} items need restocking`
    },
    {
      id: "overduePayments", 
      title: "Overdue Payments",
      value: `₹${((kpiData?.overdueAmount || 0) / 100000).toFixed(1)}L`,
      subtitle: `${kpiData?.overduePayments || 0} customers`,
      status: (kpiData?.overdueAmount || 0) > 1000000 ? "critical" : (kpiData?.overdueAmount || 0) > 0 ? "warning" : "good",
      icon: CreditCard,
      action: "Send Reminders",
      details: `${Math.ceil((kpiData?.overdueAmount || 0) / 100000)} lakhs pending`
    },
    {
      id: "pendingQuotes",
      title: "High Value Quotes >7 Days", 
      value: kpiData?.highValueOldQuotes || 0,
      subtitle: `₹${((kpiData?.highValueQuoteAmount || 0) / 100000).toFixed(1)}L total`,
      status: (kpiData?.highValueOldQuotes || 0) > 3 ? "critical" : (kpiData?.highValueOldQuotes || 0) > 0 ? "warning" : "good",
      icon: Clock,
      action: "Follow Up", 
      details: "High value quotations pending"
    },
    {
      id: "ordersToShip",
      title: "Orders to Ship",
      value: kpiData?.unDispatchedOrders || 0,
      subtitle: `₹${((kpiData?.unDispatchedValue || 0) / 100000).toFixed(1)}L value`,
      status: (kpiData?.unDispatchedOrders || 0) > 10 ? "critical" : (kpiData?.unDispatchedOrders || 0) > 0 ? "warning" : "good",
      icon: Package2,
      action: "Process Orders",
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
      action: "Contact Suppliers",
      details: "Purchase orders overdue"
    },
    {
      id: "creditBreaches",
      title: "Credit Breaches", 
      value: kpiData?.creditBreaches || 0,
      subtitle: `₹${((kpiData?.excessAmount || 0) / 100000).toFixed(1)}L excess`,
      status: (kpiData?.creditBreaches || 0) > 0 ? "critical" : "good",
      icon: Ban,
      action: "Review Credit",
      details: "Credit limits exceeded"
    },
    {
      id: "expiringQuotes",
      title: "Expiring Quotes",
      value: kpiData?.expiringQuotes || 0,
      subtitle: `₹${((kpiData?.expiringQuoteValue || 0) / 100000).toFixed(1)}L at risk`,
      status: (kpiData?.expiringQuotes || 0) > 2 ? "critical" : (kpiData?.expiringQuotes || 0) > 0 ? "warning" : "good",
      icon: Calendar,
      action: "Extend Validity",
      details: "Expiring in 3 days"
    },
    {
      id: "excessStock",
      title: "Excess Stock",
      value: kpiData?.excessStockItems || 0,
      subtitle: `₹${((kpiData?.excessStockValue || 0) / 100000).toFixed(1)}L dead stock`,
      status: (kpiData?.excessStockItems || 0) > 5 ? "warning" : "good",
      icon: TrendingDown,
      action: "Optimize Stock",
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
      action: "Escalate Orders",
      details: "Require immediate attention"
    },
    {
      id: "urgentPayments",
      title: "Urgent Payments Due",
      value: `₹${((kpiData?.urgentPaymentAmount || 0) / 100000).toFixed(1)}L`,
      subtitle: `${kpiData?.urgentPayments || 0} suppliers`,
      status: (kpiData?.urgentPaymentAmount || 0) > 500000 ? "critical" : (kpiData?.urgentPaymentAmount || 0) > 0 ? "warning" : "good",
      icon: DollarSign,
      action: "Process Payments",
      details: "Due today/tomorrow"
    }
  ];

  // Helper function to get status colors
  const getStatusColors = (status: string) => {
    switch (status) {
      case "critical":
        return {
          bg: "bg-destructive/10 border-destructive/30",
          text: "text-destructive",
          icon: "text-destructive",
          badge: "bg-destructive text-destructive-foreground"
        };
      case "warning":
        return {
          bg: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800",
          text: "text-yellow-800 dark:text-yellow-200",
          icon: "text-yellow-600 dark:text-yellow-400",
          badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        };
      case "good":
        return {
          bg: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
          text: "text-green-800 dark:text-green-200",
          icon: "text-green-600 dark:text-green-400",
          badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        };
      default:
        return {
          bg: "bg-muted/50 border-border",
          text: "text-muted-foreground",
          icon: "text-muted-foreground",
          badge: "bg-muted text-muted-foreground"
        };
    }
  };

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
          {kpiCards.slice(0, 4).map((kpi) => {
            const Icon = kpi.icon;
            const colors = getStatusColors(kpi.status);
            
            return (
              <Card key={kpi.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${colors.bg}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-background/50 ${colors.icon}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {kpi.value}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{kpi.subtitle}</p>
                  <div className="flex items-center justify-between">
                    <Button size="sm" variant="outline" className="gap-2 text-xs h-8">
                      <Eye className="h-3 w-3" />
                      {kpi.action}
                    </Button>
                    <Badge variant="secondary" className={`text-xs ${colors.badge}`}>
                      {kpi.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{kpi.details}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Row 2: Supply Chain & Credit */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          Supply Chain & Credit Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpiCards.slice(4, 8).map((kpi) => {
            const Icon = kpi.icon;
            const colors = getStatusColors(kpi.status);
            
            return (
              <Card key={kpi.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${colors.bg}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-background/50 ${colors.icon}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {kpi.value}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground truncate">{kpi.subtitle}</p>
                  <div className="flex items-center justify-between">
                    <Button size="sm" variant="outline" className="gap-2 text-xs h-8">
                      {kpi.id === 'lateSuppliers' && <Phone className="h-3 w-3" />}
                      {kpi.id === 'creditBreaches' && <CheckCircle className="h-3 w-3" />}
                      {kpi.id === 'expiringQuotes' && <Send className="h-3 w-3" />}
                      {kpi.id === 'excessStock' && <ArrowRight className="h-3 w-3" />}
                      {kpi.action}
                    </Button>
                    <Badge variant="secondary" className={`text-xs ${colors.badge}`}>
                      {kpi.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{kpi.details}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Row 3: Customer Operations */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Customer Operations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {kpiCards.slice(8, 10).map((kpi) => {
            const Icon = kpi.icon;
            const colors = getStatusColors(kpi.status);
            
            return (
              <Card key={kpi.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${colors.bg}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-background/50 ${colors.icon}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {kpi.value}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{kpi.subtitle}</p>
                  <div className="flex items-center justify-between">
                    <Button size="sm" variant="outline" className="gap-2 text-xs h-8">
                      <ArrowRight className="h-3 w-3" />
                      {kpi.action}
                    </Button>
                    <Badge variant="secondary" className={`text-xs ${colors.badge}`}>
                      {kpi.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{kpi.details}</p>
                </CardContent>
              </Card>
            );
          })}
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
              <Button className="w-full gap-2">
                <Eye className="h-4 w-4" />
                View All Low Stock Items ({kpiData.lowStockCount})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;