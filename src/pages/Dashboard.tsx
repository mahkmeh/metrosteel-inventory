import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Package, Warehouse, TrendingUp, AlertTriangle, Plus, ArrowUpRight, Activity, Users, Target } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [animatedValues, setAnimatedValues] = useState({
    totalMaterials: 0,
    totalStock: 0,
    availableStock: 0,
    lowStock: 0
  });

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

  const { data: chartData } = useQuery({
    queryKey: ["dashboard-charts"],
    queryFn: async () => {
      const [categoriesRes, transactionsRes, quotationsRes, topMaterialsRes] = await Promise.all([
        supabase.from("materials").select("category").eq("is_active", true),
        supabase.from("transactions").select("quantity, transaction_type, created_at").gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("quotations").select("status"),
        supabase.from("inventory").select("quantity, unit_cost, materials!inner(name, category)").order("quantity", { ascending: false }).limit(5)
      ]);

      // Process category data
      const categoryStats = categoriesRes.data?.reduce((acc: any, material: any) => {
        acc[material.category] = (acc[material.category] || 0) + 1;
        return acc;
      }, {}) || {};

      const categoryData = Object.entries(categoryStats).map(([name, value]) => ({
        name,
        value: value as number
      }));

      // Process transactions for timeline
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const transactionData = last7Days.map(date => {
        const dayTransactions = transactionsRes.data?.filter((t: any) => 
          t.created_at.startsWith(date)
        ) || [];
        
        const inQuantity = dayTransactions.filter((t: any) => t.transaction_type === 'in').reduce((sum: number, t: any) => sum + (t.quantity || 0), 0);
        const outQuantity = dayTransactions.filter((t: any) => t.transaction_type === 'out').reduce((sum: number, t: any) => sum + (t.quantity || 0), 0);
        
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          stockIn: inQuantity,
          stockOut: outQuantity
        };
      });

      // Process quotation status
      const quotationStats = quotationsRes.data?.reduce((acc: any, quotation: any) => {
        acc[quotation.status] = (acc[quotation.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const quotationData = Object.entries(quotationStats).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: value as number
      }));

      // Process top materials
      const topMaterials = topMaterialsRes.data?.map((item: any) => ({
        name: item.materials.name,
        value: (item.quantity || 0) * (item.unit_cost || 0),
        quantity: item.quantity || 0
      })) || [];

      return {
        categoryData,
        transactionData,
        quotationData,
        topMaterials
      };
    }
  });

  // Animate counters
  useEffect(() => {
    if (stats) {
      const duration = 1000;
      const steps = 60;
      const stepTime = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        setAnimatedValues({
          totalMaterials: Math.floor(stats.totalMaterials * easeOutQuart),
          totalStock: stats.totalStock * easeOutQuart,
          availableStock: stats.availableStock * easeOutQuart,
          lowStock: Math.floor(stats.lowStock * easeOutQuart)
        });

        if (step >= steps) {
          clearInterval(timer);
          setAnimatedValues({
            totalMaterials: stats.totalMaterials,
            totalStock: stats.totalStock,
            availableStock: stats.availableStock,
            lowStock: stats.lowStock
          });
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [stats]);

  const statCards = [
    {
      title: "Total Materials",
      value: animatedValues.totalMaterials,
      description: "Active materials in catalog",
      icon: Package,
      color: "text-primary",
      progress: stats ? (animatedValues.totalMaterials / stats.totalMaterials) * 100 : 0
    },
    {
      title: "Total Stock",
      value: `${animatedValues.totalStock.toFixed(2)} MT`,
      description: "Total inventory quantity",
      icon: Warehouse,
      color: "text-primary",
      progress: stats ? (animatedValues.totalStock / stats.totalStock) * 100 : 0
    },
    {
      title: "Available Stock",
      value: `${animatedValues.availableStock.toFixed(2)} MT`,
      description: "Available for sale",
      icon: TrendingUp,
      color: "text-primary",
      progress: stats ? (animatedValues.availableStock / stats.availableStock) * 100 : 0
    },
    {
      title: "Low Stock Items",
      value: animatedValues.lowStock,
      description: "Items below 10 units",
      icon: AlertTriangle,
      color: "text-destructive",
      progress: stats ? (animatedValues.lowStock / (stats.lowStock || 1)) * 100 : 0
    }
  ];

  const chartColors = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))", "hsl(var(--destructive))"];

  const chartConfig = {
    value: {
      label: "Value",
      color: "hsl(var(--primary))",
    },
    stockIn: {
      label: "Stock In",
      color: "hsl(var(--primary))",
    },
    stockOut: {
      label: "Stock Out", 
      color: "hsl(var(--destructive))",
    },
  };

  return (
    <div className="px-4 sm:px-0 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Steel trading inventory command center</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Material
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Activity className="h-4 w-4" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-primary/10 ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold text-foreground animate-fade-in">{stat.value}</div>
                <Progress value={stat.progress} className="h-1" />
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Materials by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Materials by Category
            </CardTitle>
            <CardDescription>Distribution of materials across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData?.categoryData && chartData.categoryData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Movement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Stock Movement (7 Days)
            </CardTitle>
            <CardDescription>Inbound vs outbound inventory trends</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData?.transactionData && chartData.transactionData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.transactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="stockIn" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      name="Stock In"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="stockOut" 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth={3}
                      name="Stock Out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No transaction data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quotation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Quotation Pipeline
            </CardTitle>
            <CardDescription>Current quotation status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData?.quotationData && chartData.quotationData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.quotationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No quotation data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Materials by Value */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Top Materials by Value
            </CardTitle>
            <CardDescription>Highest value inventory items</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData?.topMaterials && chartData.topMaterials.length > 0 ? (
              <div className="space-y-4">
                {chartData.topMaterials.map((material: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">{material.name}</p>
                      <p className="text-sm text-muted-foreground">{material.quantity} units</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">₹{material.value.toFixed(2)}</Badge>
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No material data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {stats?.lowStockItems && stats.lowStockItems.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Critical Stock Alert
            </CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {stats.lowStockItems.map((item: any) => (
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;