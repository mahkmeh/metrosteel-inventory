import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Edit, ArrowUpDown, ChevronDown, ChevronRight, Truck, Package, X, Search, AlertTriangle, DollarSign, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EnhancedProductSelectionModal } from "@/components/EnhancedProductSelectionModal";
import { KpiCard } from "@/components/KpiCard";
import { usePurchaseKpis } from "@/hooks/usePurchaseKpis";
import { useDebounce } from "@/hooks/useDebounce";

const Purchase = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [poNumberValidation, setPoNumberValidation] = useState<{
    isValid: boolean;
    isChecking: boolean;
    message?: string;
  }>({ isValid: true, isChecking: false });
  const [formData, setFormData] = useState({
    po_number: "",
    supplier_id: "",
    total_amount: "",
    status: "pending",
    order_date: "",
    expected_delivery: "",
    notes: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: kpiData, isLoading: kpiLoading } = usePurchaseKpis();

  // Debounce PO number for validation
  const debouncedPoNumber = useDebounce(formData.po_number, 500);

  // Auto-generate PO number when dialog opens for new orders
  useEffect(() => {
    if (isDialogOpen && !editingOrder && !formData.po_number) {
      generatePoNumber();
    }
  }, [isDialogOpen, editingOrder]);

  // Validate PO number in real-time
  useEffect(() => {
    if (debouncedPoNumber && !editingOrder) {
      validatePoNumber(debouncedPoNumber);
    } else {
      setPoNumberValidation({ isValid: true, isChecking: false });
    }
  }, [debouncedPoNumber, editingOrder]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["purchase-orders", sortField, sortDirection],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select(`
          *,
          suppliers (
            name,
            contact_person
          )
        `)
        .order(sortField, { ascending: sortDirection === "asc" });

      if (error) throw error;
      return data;
    },
  });

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const { data: materials } = useQuery({
    queryKey: ["materials-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select(`
          id, name, sku, unit, base_price, category, grade,
          inventory (
            quantity,
            available_quantity
          )
        `)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const { data: salesOrders } = useQuery({
    queryKey: ["sales-orders-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_orders")
        .select(`
          id, so_number,
          customers (
            name
          )
        `)
        .eq("status", "pending")
        .order("so_number");

      if (error) throw error;
      return data;
    },
  });

  const filteredMaterials = materials?.filter(material =>
    material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const totalAmount = orderItems.reduce((sum, item) => sum + item.line_total, 0);
      const orderWithTotal = { ...orderData, total_amount: totalAmount };

      if (editingOrder) {
        const { error } = await supabase
          .from("purchase_orders")
          .update(orderWithTotal)
          .eq("id", editingOrder.id);
        if (error) throw error;

        await supabase
          .from("purchase_order_items")
          .delete()
          .eq("purchase_order_id", editingOrder.id);

        const itemsWithOrderId = orderItems.map(item => ({
          material_id: item.material_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total,
          order_type: item.order_type,
          linked_sales_order_id: item.linked_sales_order_id,
          notes: item.notes,
          purchase_order_id: editingOrder.id,
          batch_selections: item.batch_selections || null,
          batch_id: null
        }));
        
        const { error: itemsError } = await supabase
          .from("purchase_order_items")
          .insert(itemsWithOrderId);
        if (itemsError) throw itemsError;
      } else {
        const { data: newOrder, error } = await supabase
          .from("purchase_orders")
          .insert([orderWithTotal])
          .select()
          .single();
        if (error) throw error;

        const itemsWithOrderId = orderItems.map(item => ({
          material_id: item.material_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total,
          order_type: item.order_type,
          linked_sales_order_id: item.linked_sales_order_id,
          notes: item.notes,
          purchase_order_id: newOrder.id,
          batch_selections: item.batch_selections || null,
          batch_id: null
        }));
        
        const { error: itemsError } = await supabase
          .from("purchase_order_items")
          .insert(itemsWithOrderId);
        if (itemsError) throw itemsError;

        // Link batches to the purchase order
        for (const item of orderItems) {
          if (item.batch_selections && item.batch_selections.length > 0) {
            for (const bs of item.batch_selections) {
              await supabase
                .from("batches")
                .update({ 
                  purchase_order_id: newOrder.id,
                  supplier_id: orderWithTotal.supplier_id,
                  reserved_weight_kg: bs.quantity
                })
                .eq("id", bs.batch.id);
            }
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast({
        title: "Success",
        description: `Purchase order ${editingOrder ? "updated" : "created"} successfully`,
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to ${editingOrder ? "update" : "create"} purchase order: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Generate PO number
  const generatePoNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_po_number');
      if (error) throw error;
      setFormData(prev => ({ ...prev, po_number: data }));
      setPoNumberValidation({ isValid: true, isChecking: false });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate PO number: " + error.message,
        variant: "destructive",
      });
    }
  };

  // Validate PO number
  const validatePoNumber = async (poNumber: string) => {
    if (!poNumber.trim()) {
      setPoNumberValidation({ isValid: true, isChecking: false });
      return;
    }

    setPoNumberValidation({ isValid: true, isChecking: true });
    
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('id')
        .eq('po_number', poNumber.trim())
        .limit(1);
      
      if (error) throw error;
      
      const isDuplicate = data && data.length > 0;
      setPoNumberValidation({
        isValid: !isDuplicate,
        isChecking: false,
        message: isDuplicate ? 'This PO number already exists' : undefined
      });
    } catch (error: any) {
      setPoNumberValidation({
        isValid: false,
        isChecking: false,
        message: 'Error checking PO number: ' + error.message
      });
    }
  };

  const resetForm = () => {
    setFormData({
      po_number: "",
      supplier_id: "",
      total_amount: "",
      status: "pending",
      order_date: "",
      expected_delivery: "",
      notes: "",
    });
    setOrderItems([]);
    setSearchQuery("");
    setEditingOrder(null);
    setIsDialogOpen(false);
    setPoNumberValidation({ isValid: true, isChecking: false });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!poNumberValidation.isValid) {
      toast({
        title: "Error",
        description: poNumberValidation.message || "Please fix the PO number",
        variant: "destructive",
      });
      return;
    }
    
    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the order",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.po_number.trim()) {
      toast({
        title: "Error",
        description: "Please enter a PO number",
        variant: "destructive",
      });
      return;
    }
    
    createOrderMutation.mutate(formData);
  };

  const handleEdit = (order: any) => {
    setEditingOrder(order);
    setFormData({
      po_number: order.po_number || "",
      supplier_id: order.supplier_id || "",
      total_amount: order.total_amount?.toString() || "",
      status: order.status || "pending",
      order_date: order.order_date || "",
      expected_delivery: order.expected_delivery || "",
      notes: order.notes || "",
    });
    setOrderItems([]);
    setIsDialogOpen(true);
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "outline", 
      ordered: "default",
      received: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const toggleRowExpansion = (orderId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(orderId)) {
      newExpandedRows.delete(orderId);
    } else {
      newExpandedRows.add(orderId);
    }
    setExpandedRows(newExpandedRows);
  };

  const addMaterialToOrder = (material: any, orderQuantity: number, batchSelections: any[]) => {
    const existingItem = orderItems.find(item => item.material_id === material.id);
    if (existingItem) {
      toast({
        title: "Material already added",
        description: "This material is already in the order",
        variant: "destructive",
      });
      return;
    }

    const newItem = {
      material_id: material.id,
      material_name: material.name,
      material_sku: material.sku,
      quantity: orderQuantity,
      unit_price: material.base_price || 0,
      line_total: (material.base_price || 0) * orderQuantity,
      order_type: "stock",
      linked_sales_order_id: null,
      notes: "",
      batch_selections: batchSelections,
      selected_batches: batchSelections.map(bs => bs.batch),
    };

    setOrderItems([...orderItems, newItem]);
    setSearchQuery("");
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === "quantity" || field === "unit_price") {
      updatedItems[index].line_total = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    setOrderItems(updatedItems);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const getTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + item.line_total, 0);
  };

  const getStockInfo = (material: any) => {
    const totalStock = material.inventory?.reduce((sum: number, inv: any) => sum + (inv.available_quantity || 0), 0) || 0;
    
    if (totalStock === 0) {
      return { status: "out-of-stock", text: "Out of Stock", color: "bg-destructive/10 text-destructive" };
    } else if (totalStock < 10) {
      return { status: "low-stock", text: `Low Stock (${totalStock})`, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" };
    } else {
      return { status: "in-stock", text: `In Stock (${totalStock})`, color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" };
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading purchase orders...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Overdue Deliveries"
          value={typeof kpiData?.overdueDeliveries === 'object' ? kpiData.overdueDeliveries.count || 0 : kpiData?.overdueDeliveries || 0}
          subtitle={`${kpiData?.overdueDeliveries?.avgDaysLate || 0} days late avg`}
          status="critical"
          icon={Package}
          actionLabel="Contact Supplier"
          onAction={() => toast({ title: "Contact Supplier", description: "Opening supplier contact view" })}
        />
        <KpiCard
          title="Pending Approvals"
          value={kpiData?.pendingApprovals.count || 0}
          subtitle={`₹${(kpiData?.pendingApprovals.value || 0).toLocaleString('en-IN')}`}
          status="warning"
          icon={AlertTriangle}
          actionLabel="Approve"
          onAction={() => toast({ title: "Approve", description: "Opening approval workflow" })}
        />
        <KpiCard
          title="Payment Due Today/Tomorrow"
          value={`₹${(kpiData?.paymentsDue.amount || 0).toLocaleString('en-IN')}`}
          subtitle={`${kpiData?.paymentsDue.suppliers || 0} suppliers`}
          status="critical"
          icon={DollarSign}
          actionLabel="Process Payment"
          onAction={() => toast({ title: "Process Payment", description: "Opening payment processing" })}
        />
        <KpiCard
          title="Quality Issues"
          value={kpiData?.qualityIssues || 0}
          subtitle="materials on hold"
          status="warning"
          icon={AlertCircle}
          actionLabel="Resolve"
          onAction={() => toast({ title: "Resolve", description: "Opening quality management" })}
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Truck className="h-8 w-8" />
            Purchase Orders
          </h1>
          <p className="text-muted-foreground">Manage supplier orders and inventory procurement</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingOrder(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl">
                    {editingOrder ? "Edit Purchase Order" : "Create Purchase Order"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingOrder ? "Update purchase order details" : "Create a new purchase order with advanced batch tracking"}
                  </DialogDescription>
                </div>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </DialogHeader>
            
            <div className="flex h-[calc(90vh-200px)] overflow-hidden">
              <div className="flex-1 overflow-y-auto pr-6">
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="po_number">PO Number</Label>
                          <div className="flex gap-2">
                            <Input
                              id="po_number"
                              value={formData.po_number}
                              onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
                              placeholder="Enter PO number"
                              className={!poNumberValidation.isValid ? "border-destructive" : ""}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={generatePoNumber}
                              disabled={editingOrder !== null}
                              title="Generate PO Number"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                          {poNumberValidation.isChecking && (
                            <p className="text-xs text-muted-foreground mt-1">Checking availability...</p>
                          )}
                          {!poNumberValidation.isValid && poNumberValidation.message && (
                            <p className="text-xs text-destructive mt-1">{poNumberValidation.message}</p>
                          )}
                          {poNumberValidation.isValid && formData.po_number && !poNumberValidation.isChecking && !editingOrder && (
                            <p className="text-xs text-green-600 mt-1">PO number is available</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="supplier_id">Supplier</Label>
                          <Select
                            value={formData.supplier_id}
                            onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select supplier" />
                            </SelectTrigger>
                            <SelectContent>
                              {suppliers?.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id}>
                                  {supplier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="order_date">Order Date</Label>
                          <Input
                            id="order_date"
                            type="date"
                            value={formData.order_date}
                            onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="expected_delivery">Expected Delivery</Label>
                          <Input
                            id="expected_delivery"
                            type="date"
                            value={formData.expected_delivery}
                            onChange={(e) => setFormData({ ...formData, expected_delivery: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="ordered">Ordered</SelectItem>
                            <SelectItem value="received">Received</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          rows={3}
                          placeholder="Order notes"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Materials */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Materials</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search materials by name or SKU..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setShowProductModal(true)}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Browse Products
                        </Button>
                      </div>

                      {/* Search Results */}
                      {searchQuery && filteredMaterials && filteredMaterials.length > 0 && (
                        <div className="border rounded-lg max-h-40 overflow-y-auto">
                          {filteredMaterials.slice(0, 5).map((material) => {
                            const stockInfo = getStockInfo(material);
                            return (
                              <div
                                key={material.id}
                                className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors"
                                onClick={() => addMaterialToOrder(material, 1, [])}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-medium">{material.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      SKU: {material.sku} • ₹{material.base_price || 0}
                                    </div>
                                  </div>
                                  <Badge className={stockInfo.color}>
                                    {stockInfo.text}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Selected Materials */}
                      {orderItems.length > 0 && (
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {orderItems.map((item, index) => (
                            <Card key={index} className="border-l-4 border-l-primary">
                              <CardContent className="p-3">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <div className="font-medium text-sm">{item.material_name}</div>
                                    <div className="text-xs text-muted-foreground">SKU: {item.material_sku}</div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOrderItem(index)}
                                    className="h-6 w-6 p-0 text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mb-3">
                                  <div>
                                    <Label className="text-xs">Quantity</Label>
                                    <Input
                                      type="number"
                                      min="0.01"
                                      step="0.01"
                                      value={item.quantity}
                                      onChange={(e) => updateOrderItem(index, "quantity", parseFloat(e.target.value) || 0)}
                                      className="h-8"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Unit Price</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={item.unit_price}
                                      onChange={(e) => updateOrderItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                                      className="h-8"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Total</Label>
                                    <Input
                                      value={`₹${item.line_total.toFixed(2)}`}
                                      disabled
                                      className="h-8 bg-muted text-xs"
                                    />
                                  </div>
                                </div>

                                {/* Batch Information Display */}
                                {item.batch_selections && item.batch_selections.length > 0 && (
                                  <div className="mt-3 p-2 bg-muted/20 rounded">
                                    <div className="text-xs font-medium mb-1">Allocated Batches:</div>
                                    <div className="space-y-1">
                                      {item.batch_selections.map((bs: any, bsIndex: number) => (
                                        <div key={bsIndex} className="flex justify-between text-xs">
                                          <span>{bs.batch.batch_code}</span>
                                          <span>{bs.quantity} KG</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-2 mt-3">
                                  <div>
                                    <Label className="text-xs">Order Type</Label>
                                    <RadioGroup
                                      value={item.order_type}
                                      onValueChange={(value) => updateOrderItem(index, "order_type", value)}
                                      className="flex gap-4"
                                    >
                                      <div className="flex items-center space-x-1">
                                        <RadioGroupItem value="stock" id={`stock-${index}`} className="h-3 w-3" />
                                        <Label htmlFor={`stock-${index}`} className="text-xs">Stock</Label>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <RadioGroupItem value="customer_order" id={`customer-${index}`} className="h-3 w-3" />
                                        <Label htmlFor={`customer-${index}`} className="text-xs">Customer Order</Label>
                                      </div>
                                    </RadioGroup>
                                  </div>

                                  {item.order_type === "customer_order" && (
                                    <div>
                                      <Label className="text-xs">Sales Order</Label>
                                      <Select
                                        value={item.linked_sales_order_id || ""}
                                        onValueChange={(value) => updateOrderItem(index, "linked_sales_order_id", value || null)}
                                      >
                                        <SelectTrigger className="h-8">
                                          <SelectValue placeholder="Select sales order" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {salesOrders?.map((order) => (
                                            <SelectItem key={order.id} value={order.id}>
                                              {order.so_number} - {order.customers?.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {orderItems.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                          No materials added. Search and add materials above.
                        </div>
                      )}

                      {orderItems.length > 0 && (
                        <div className="flex justify-end pt-3 border-t">
                          <div className="text-lg font-bold">
                            Total: ₹{getTotalAmount().toFixed(2)}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={
                        createOrderMutation.isPending || 
                        orderItems.length === 0 || 
                        !poNumberValidation.isValid ||
                        poNumberValidation.isChecking ||
                        !formData.po_number.trim()
                      }
                    >
                      {createOrderMutation.isPending ? "Saving..." : editingOrder ? "Update Order" : "Create Order"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Right Side - Batch Management */}
              <div className="w-80 border-l pl-6">
                <div className="sticky top-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Batch Management</h3>
                    <p className="text-sm text-muted-foreground">Select or create batches for each material</p>
                  </div>

                  {orderItems.length > 0 ? (
                    <div className="space-y-4 max-h-[calc(90vh-300px)] overflow-y-auto">
                      <div className="text-center text-muted-foreground text-sm">
                        Use the product selection modal to manage batches.
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Add materials to manage batches
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>

          <EnhancedProductSelectionModal
            open={showProductModal}
            onOpenChange={setShowProductModal}
            onSelectMaterial={addMaterialToOrder}
            materials={materials || []}
          />
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Purchase Orders List
          </CardTitle>
          <CardDescription>All purchase orders from suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("po_number")}>
                  <div className="flex items-center">
                    PO #
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("total_amount")}>
                  <div className="flex items-center">
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                  <div className="flex items-center">
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order) => (
                <Collapsible key={order.id} open={expandedRows.has(order.id)} onOpenChange={() => toggleRowExpansion(order.id)}>
                  <CollapsibleTrigger asChild>
                    <TableRow className="border-b-0 cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          {expandedRows.has(order.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{order.po_number}</TableCell>
                      <TableCell>{order.suppliers?.name || "-"}</TableCell>
                      <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {order.order_date
                          ? new Date(order.order_date).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {order.expected_delivery
                          ? new Date(order.expected_delivery).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(order);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <TableRow>
                      <TableCell colSpan={8} className="p-0">
                        <div className="p-6 bg-muted/50 border-t">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Purchase Order Details</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">PO Number:</span>
                                    <span className="font-medium">{order.po_number}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Supplier:</span>
                                    <span>{order.suppliers?.name || "-"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Amount:</span>
                                    <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status:</span>
                                    <span>{getStatusBadge(order.status)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Order Date:</span>
                                    <span>{order.order_date ? new Date(order.order_date).toLocaleDateString() : "-"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Expected Delivery:</span>
                                    <span>{order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : "-"}</span>
                                  </div>
                                </div>
                              </div>
                              {order.notes && (
                                <div className="mt-4">
                                  <span className="text-sm text-muted-foreground">Notes:</span>
                                  <p className="text-sm mt-1 p-2 bg-background rounded border">{order.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Purchase;
