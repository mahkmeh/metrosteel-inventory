import { useState } from "react";
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
import { Plus, Edit, ArrowUpDown, ChevronDown, ChevronRight, X, Search, Clock, TrendingUp, AlertCircle, Truck, Bell, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OrderTimeline } from "@/components/OrderTimeline";
import { StatusWorkflow } from "@/components/StatusWorkflow";
import { ProductSelectionModal } from "@/components/ProductSelectionModal";
import { KpiCard } from "@/components/KpiCard";
import { useSalesKpis } from "@/hooks/useSalesKpis";

const Sales = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [formData, setFormData] = useState({
    so_number: "",
    customer_id: "",
    quotation_id: "",
    total_amount: "",
    status: "pending",
    order_date: "",
    delivery_date: "",
    notes: "",
    gst_rate: "18",
    freight_charges: "0",
    packing_charges: "0",
    other_charges: "0",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch KPI data
  const { data: kpiData } = useSalesKpis();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", sortField, sortDirection],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_orders")
        .select(`
          *,
          customers (
            name,
            contact_person
          ),
          quotations (
            quotation_number
          )
        `)
        .order(sortField, { ascending: sortDirection === "asc" });

      if (error) throw error;
      return data;
    },
  });

  const { data: customers } = useQuery({
    queryKey: ["customers-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const { data: quotations } = useQuery({
    queryKey: ["quotations-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotations")
        .select("id, quotation_number, customer_id")
        .eq("status", "won")
        .order("quotation_number");

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

  const filteredMaterials = materials?.filter(material =>
    material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const totalAmount = orderItems.reduce((sum, item) => sum + item.line_total, 0);
      
      // Remove fields that don't exist in sales_orders table and handle empty UUIDs
      const { freight_charges, packing_charges, other_charges, gst_rate, ...cleanOrderData } = orderData;
      
      // Convert empty string UUIDs to null
      if (cleanOrderData.quotation_id === "") {
        cleanOrderData.quotation_id = null;
      }
      
      const orderWithTotal = { ...cleanOrderData, total_amount: totalAmount };

      if (editingOrder) {
        const { error } = await supabase
          .from("sales_orders")
          .update(orderWithTotal)
          .eq("id", editingOrder.id);
        if (error) throw error;

        await supabase
          .from("sales_order_items")
          .delete()
          .eq("sales_order_id", editingOrder.id);

        const itemsWithOrderId = orderItems.map(item => ({
          ...item,
          sales_order_id: editingOrder.id
        }));
        
        const { error: itemsError } = await supabase
          .from("sales_order_items")
          .insert(itemsWithOrderId);
        if (itemsError) throw itemsError;
      } else {
        const { data: newOrder, error } = await supabase
          .from("sales_orders")
          .insert([orderWithTotal])
          .select()
          .single();
        if (error) throw error;

        const itemsWithOrderId = orderItems.map(item => ({
          ...item,
          sales_order_id: newOrder.id
        }));
        
        const { error: itemsError } = await supabase
          .from("sales_order_items")
          .insert(itemsWithOrderId);
        if (itemsError) throw itemsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Success",
        description: `Order ${editingOrder ? "updated" : "created"} successfully`,
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${editingOrder ? "update" : "create"} order: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      so_number: "",
      customer_id: "",
      quotation_id: "",
      total_amount: "",
      status: "pending",
      order_date: "",
      delivery_date: "",
      notes: "",
      gst_rate: "18",
      freight_charges: "0",
      packing_charges: "0",
      other_charges: "0",
    });
    setOrderItems([]);
    setSearchQuery("");
    setEditingOrder(null);
    setIsDialogOpen(false);
  };

  const addMaterialToOrder = (material: any) => {
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
      quantity: 1,
      unit_price: material.base_price || 0,
      line_total: material.base_price || 0,
      notes: "",
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

  const calculateTotalWithCharges = () => {
    const itemsTotal = getTotalAmount();
    const gstAmount = (itemsTotal * parseFloat(formData.gst_rate || "0")) / 100;
    const freightCharges = parseFloat(formData.freight_charges || "0");
    const packingCharges = parseFloat(formData.packing_charges || "0");
    const otherCharges = parseFloat(formData.other_charges || "0");
    
    return {
      itemsTotal,
      gstAmount,
      freightCharges,
      packingCharges,
      otherCharges,
      grandTotal: itemsTotal + gstAmount + freightCharges + packingCharges + otherCharges
    };
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the order",
        variant: "destructive",
      });
      return;
    }
    const { grandTotal } = calculateTotalWithCharges();
    createOrderMutation.mutate({ ...formData, total_amount: grandTotal });
  };

  const handleEdit = (order: any) => {
    setEditingOrder(order);
    setFormData({
      so_number: order.so_number || "",
      customer_id: order.customer_id || "",
      quotation_id: order.quotation_id || "",
      total_amount: order.total_amount?.toString() || "",
      status: order.status || "pending",
      order_date: order.order_date || "",
      delivery_date: order.delivery_date || "",
      notes: order.notes || "",
      gst_rate: "18",
      freight_charges: "0",
      packing_charges: "0",
      other_charges: "0",
    });
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
      processing: "outline",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const filteredQuotations = quotations?.filter(q => 
    !formData.customer_id || q.customer_id === formData.customer_id
  );

  const toggleRowExpansion = (orderId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(orderId)) {
      newExpandedRows.delete(orderId);
    } else {
      newExpandedRows.add(orderId);
    }
    setExpandedRows(newExpandedRows);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading orders...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sales Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and deliveries</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingOrder(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Sales Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">
                {editingOrder ? "Edit Sales Order" : "Create Sales Order"}
              </DialogTitle>
              <DialogDescription className="text-center">
                {editingOrder ? "Update sales order information and items" : "Create a new sales order with line items"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Header Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="so_number">Order Number *</Label>
                      <Input
                        id="so_number"
                        value={formData.so_number}
                        onChange={(e) => setFormData({ ...formData, so_number: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_id">Customer *</Label>
                      <Select
                        value={formData.customer_id}
                        onValueChange={(value) => setFormData({ ...formData, customer_id: value, quotation_id: "" })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers?.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="quotation_id">Quotation (Optional)</Label>
                      <Select
                        value={formData.quotation_id}
                        onValueChange={(value) => setFormData({ ...formData, quotation_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select quotation" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredQuotations?.map((quotation) => (
                            <SelectItem key={quotation.id} value={quotation.id}>
                              {quotation.quotation_number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                      <Label htmlFor="delivery_date">Delivery Date</Label>
                      <Input
                        id="delivery_date"
                        type="date"
                        value={formData.delivery_date}
                        onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
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
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Items Section */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Search materials by name or SKU..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowProductModal(true)}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Browse
                      </Button>
                    </div>

                    {/* Search Results */}
                    {searchQuery && filteredMaterials && filteredMaterials.length > 0 && (
                      <div className="border rounded-lg max-h-48 overflow-y-auto">
                        {filteredMaterials.slice(0, 5).map((material) => {
                          const stockInfo = getStockInfo(material);
                          return (
                            <div
                              key={material.id}
                              className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors"
                              onClick={() => addMaterialToOrder(material)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium">{material.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    SKU: {material.sku} • {material.unit}
                                  </div>
                                </div>
                                <div className="text-right space-y-1">
                                  <div className="font-medium">₹{material.base_price || 0}</div>
                                  <Badge className={stockInfo.color}>
                                    {stockInfo.text}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Order Items List */}
                  {orderItems.length > 0 && (
                    <div className="space-y-3">
                      {orderItems.map((item, index) => (
                        <Card key={index} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">{item.material_name}</div>
                                  <div className="text-sm text-muted-foreground">SKU: {item.material_sku}</div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOrderItem(index)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <Label>Quantity</Label>
                                  <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={item.quantity}
                                    onChange={(e) => updateOrderItem(index, "quantity", parseFloat(e.target.value) || 0)}
                                  />
                                </div>
                                <div>
                                  <Label>Unit Price</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unit_price}
                                    onChange={(e) => updateOrderItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                                  />
                                </div>
                                <div>
                                  <Label>Line Total</Label>
                                  <Input
                                    value={`₹${item.line_total.toFixed(2)}`}
                                    disabled
                                    className="bg-muted"
                                  />
                                </div>
                              </div>

                              <div>
                                <Label>Notes</Label>
                                <Input
                                  value={item.notes}
                                  onChange={(e) => updateOrderItem(index, "notes", e.target.value)}
                                  placeholder="Optional notes for this item"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {/* Summary Section */}
                      <div className="pt-4 border-t space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label htmlFor="gst_rate">GST Rate (%)</Label>
                            <Input
                              id="gst_rate"
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={formData.gst_rate}
                              onChange={(e) => setFormData({ ...formData, gst_rate: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="freight_charges">Freight Charges</Label>
                            <Input
                              id="freight_charges"
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.freight_charges}
                              onChange={(e) => setFormData({ ...formData, freight_charges: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="packing_charges">Packing Charges</Label>
                            <Input
                              id="packing_charges"
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.packing_charges}
                              onChange={(e) => setFormData({ ...formData, packing_charges: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="other_charges">Other Charges</Label>
                            <Input
                              id="other_charges"
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.other_charges}
                              onChange={(e) => setFormData({ ...formData, other_charges: e.target.value })}
                            />
                          </div>
                        </div>
                        
                        {/* Order Summary */}
                        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Items Total:</span>
                            <span>₹{calculateTotalWithCharges().itemsTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>GST ({formData.gst_rate}%):</span>
                            <span>₹{calculateTotalWithCharges().gstAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Freight Charges:</span>
                            <span>₹{calculateTotalWithCharges().freightCharges.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Packing Charges:</span>
                            <span>₹{calculateTotalWithCharges().packingCharges.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Other Charges:</span>
                            <span>₹{calculateTotalWithCharges().otherCharges.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Grand Total:</span>
                            <span>₹{calculateTotalWithCharges().grandTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {orderItems.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No items added. Search and add materials above.
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createOrderMutation.isPending || orderItems.length === 0}>
                  {createOrderMutation.isPending ? "Saving..." : editingOrder ? "Update Order" : "Create Order"}
                </Button>
              </div>
            </form>
          </DialogContent>

          <ProductSelectionModal
            open={showProductModal}
            onOpenChange={setShowProductModal}
            onSelectMaterial={addMaterialToOrder}
            materials={materials || []}
          />
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
          <CardDescription>All sales orders</CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {/* Mobile Card View */}
          <div className="block md:hidden">
            {orders?.map((order) => (
              <div key={order.id} className="border-b last:border-b-0">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-base">{order.so_number}</div>
                      <div className="text-sm text-muted-foreground">{order.customers?.name || "-"}</div>
                      {order.quotations?.quotation_number && (
                        <div className="text-xs text-muted-foreground">
                          Ref: {order.quotations.quotation_number}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(order.total_amount || 0)}</div>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Order: </span>
                      {order.order_date ? new Date(order.order_date).toLocaleDateString() : "-"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Delivery: </span>
                      {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : "-"}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRowExpansion(order.id)}
                      className="p-2"
                    >
                      {expandedRows.has(order.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="ml-1 text-xs">Details</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(order)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Collapsible content for mobile */}
                <Collapsible open={expandedRows.has(order.id)} onOpenChange={() => toggleRowExpansion(order.id)}>
                  <CollapsibleContent className="px-4 pb-4 bg-muted/30 space-y-4">
                    <div className="p-3 bg-background rounded-lg">
                      <h4 className="font-semibold mb-2">Order Timeline</h4>
                      <p className="text-sm text-muted-foreground">Order tracking coming soon...</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg">
                      <h4 className="font-semibold mb-2">Status: {order.status}</h4>
                      <p className="text-sm text-muted-foreground">Status workflow coming soon...</p>
                    </div>
                    {order.notes && (
                      <div className="p-3 bg-background rounded-lg">
                        <Label className="text-sm font-medium">Notes:</Label>
                        <p className="text-sm text-muted-foreground mt-1">{order.notes}</p>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("so_number")}>
                  <div className="flex items-center">
                    Order #
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Quotation</TableHead>
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
                <TableHead>Delivery Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order) => (
                <Collapsible key={order.id} open={expandedRows.has(order.id)} onOpenChange={() => toggleRowExpansion(order.id)}>
                  <TableRow className="border-b-0">
                    <TableCell>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          {expandedRows.has(order.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </TableCell>
                    <TableCell className="font-medium">{order.so_number}</TableCell>
                    <TableCell>{order.customers?.name || "-"}</TableCell>
                    <TableCell>{order.quotations?.quotation_number || "-"}</TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {order.order_date
                        ? new Date(order.order_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {order.delivery_date
                        ? new Date(order.delivery_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(order)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <CollapsibleContent asChild>
                    <TableRow>
                      <TableCell colSpan={9} className="p-0">
                        <div className="p-6 bg-muted/50 border-t">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Order Details</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Order Number:</span>
                                    <span className="font-medium">{order.so_number}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Customer:</span>
                                    <span>{order.customers?.name || "-"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Amount:</span>
                                    <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                                  </div>
                                  {order.quotations?.quotation_number && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Quotation:</span>
                                      <span>{order.quotations.quotation_number}</span>
                                    </div>
                                  )}
                                  {order.notes && (
                                    <div className="pt-2">
                                      <span className="text-muted-foreground">Notes:</span>
                                      <p className="mt-1 text-sm">{order.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                             <div className="space-y-6">
                               <OrderTimeline 
                                 status={order.status} 
                                 orderDate={order.order_date}
                                 deliveryDate={order.delivery_date}
                               />
                               <StatusWorkflow 
                                 currentStatus={order.status}
                                 onStatusChange={(newStatus) => {
                                   // Here you could add a status update mutation
                                   console.log(`Change status from ${order.status} to ${newStatus}`);
                                 }}
                               />
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;