import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Warehouse, TrendingUp, AlertTriangle } from "lucide-react";

const Dashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [materialsRes, inventoryRes, lowStockRes] = await Promise.all([
        supabase.from("materials").select("id").eq("is_active", true),
        supabase.from("inventory").select("quantity, available_quantity"),
        supabase.from("inventory").select("*, materials!inner(name, sku)").lt("available_quantity", 10)
      ]);

      const totalMaterials = materialsRes.data?.length || 0;
      const totalStock = inventoryRes.data?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      const availableStock = inventoryRes.data?.reduce((sum, item) => sum + (item.available_quantity || 0), 0) || 0;
      const lowStock = lowStockRes.data?.length || 0;

      return {
        totalMaterials,
        totalStock,
        availableStock,
        lowStock,
        lowStockItems: lowStockRes.data || []
      };
    }
  });

  const statCards = [
    {
      title: "Total Materials",
      value: stats?.totalMaterials || 0,
      description: "Active materials in catalog",
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Total Stock",
      value: `${stats?.totalStock?.toFixed(2) || 0} MT`,
      description: "Total inventory quantity",
      icon: Warehouse,
      color: "text-green-600"
    },
    {
      title: "Available Stock",
      value: `${stats?.availableStock?.toFixed(2) || 0} MT`,
      description: "Available for sale",
      icon: TrendingUp,
      color: "text-emerald-600"
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStock || 0,
      description: "Items below 10 units",
      icon: AlertTriangle,
      color: "text-red-600"
    }
  ];

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Steel trading inventory overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {stats?.lowStockItems && stats.lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Items that need immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.lowStockItems.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{item.materials.name}</p>
                    <p className="text-sm text-muted-foreground">SKU: {item.materials.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{item.available_quantity} units</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;