
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Search } from "lucide-react";
import * as z from "zod";

const orderSchema = z.object({
  po_number: z.string().min(1, "PO number is required"),
  supplier_id: z.string().min(1, "Supplier is required"),
  order_date: z.string().min(1, "Order date is required"),
  expected_delivery: z.string().optional(),
  status: z.enum(["draft", "sent", "confirmed", "received", "cancelled"]),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderItem {
  material_id: string;
  material_name: string;
  material_sku: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface PurchaseOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOrder?: any;
}

export const PurchaseOrderModal = ({ open, onOpenChange, editingOrder }: PurchaseOrderModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [materialSearch, setMaterialSearch] = useState("");

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      po_number: "",
      supplier_id: "",
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery: "",
      status: "draft",
      notes: "",
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
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

  const { data: materials = [] } = useQuery({
    queryKey: ["materials-for-po"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("id, name, sku, base_price")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const filteredMaterials = materials.filter((material: any) =>
    material.name.toLowerCase().includes(materialSearch.toLowerCase()) ||
    material.sku.toLowerCase().includes(materialSearch.toLowerCase())
  );

  // Generate PO number
  const generatePoNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_po_number');
      if (error) throw error;
      form.setValue('po_number', data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate PO number: " + error.message,
        variant: "destructive",
      });
    }
  };

  // Load editing order data
  useEffect(() => {
    if (editingOrder && open) {
      form.reset({
        po_number: editingOrder.po_number,
        supplier_id: editingOrder.supplier_id,
        order_date: editingOrder.order_date,
        expected_delivery: editingOrder.expected_delivery || "",
        status: editingOrder.status,
        notes: editingOrder.notes || "",
      });
      
      // Load order items if editing
      if (editingOrder.purchase_order_items) {
        const items = editingOrder.purchase_order_items.map((item: any) => ({
          material_id: item.materials?.id || item.material_id,
          material_name: item.materials?.name || "Unknown Material",
          material_sku: item.materials?.sku || "N/A",
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total,
        }));
        setOrderItems(items);
      }
    } else if (open && !editingOrder) {
      // Reset for new order
      form.reset({
        po_number: "",
        supplier_id: "",
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery: "",
        status: "draft",
        notes: "",
      });
      setOrderItems([]);
      generatePoNumber();
    }
  }, [editingOrder, open, form]);

  const createOrder = useMutation({
    mutationFn: async (values: OrderFormValues) => {
      const totalAmount = orderItems.reduce((sum, item) => sum + item.line_total, 0);
      
      if (editingOrder) {
        // Update existing order
        const { error } = await supabase
          .from("purchase_orders")
          .update({
            ...values,
            total_amount: totalAmount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingOrder.id);
        
        if (error) throw error;

        // Delete existing items and create new ones
        await supabase
          .from("purchase_order_items")
          .delete()
          .eq("purchase_order_id", editingOrder.id);

        if (orderItems.length > 0) {
          const { error: itemsError } = await supabase
            .from("purchase_order_items")
            .insert(
              orderItems.map(item => ({
                purchase_order_id: editingOrder.id,
                material_id: item.material_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                line_total: item.line_total,
                order_type: "stock",
              }))
            );
          
          if (itemsError) throw itemsError;
        }
      } else {
        // Create new order
        const { data: newOrder, error } = await supabase
          .from("purchase_orders")
          .insert({
            ...values,
            total_amount: totalAmount,
          })
          .select()
          .single();

        if (error) throw error;

        // Create order items
        if (orderItems.length > 0) {
          const { error: itemsError } = await supabase
            .from("purchase_order_items")
            .insert(
              orderItems.map(item => ({
                purchase_order_id: newOrder.id,
                material_id: item.material_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                line_total: item.line_total,
                order_type: "stock",
              }))
            );
          
          if (itemsError) throw itemsError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast({
        title: "Success",
        description: `Purchase order ${editingOrder ? "updated" : "created"} successfully`,
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingOrder ? "update" : "create"} purchase order`,
        variant: "destructive",
      });
    },
  });

  const addMaterial = (material: any) => {
    const existingItem = orderItems.find(item => item.material_id === material.id);
    if (existingItem) {
      toast({
        title: "Material already added",
        description: "This material is already in the order",
        variant: "destructive",
      });
      return;
    }

    const newItem: OrderItem = {
      material_id: material.id,
      material_name: material.name,
      material_sku: material.sku,
      quantity: 1,
      unit_price: material.base_price || 0,
      line_total: material.base_price || 0,
    };

    setOrderItems([...orderItems, newItem]);
    setMaterialSearch("");
  };

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
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

  const onSubmit = (values: OrderFormValues) => {
    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one material to the order",
        variant: "destructive",
      });
      return;
    }
    createOrder.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingOrder ? "Edit Purchase Order" : "Create Purchase Order"}
          </DialogTitle>
          <DialogDescription>
            {editingOrder ? "Update purchase order details" : "Create a new purchase order for supplier materials"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="po_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Number</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={editingOrder} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="order_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expected_delivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Delivery</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Materials Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Material Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search materials to add..."
                    value={materialSearch}
                    onChange={(e) => setMaterialSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Search Results */}
                {materialSearch && filteredMaterials.length > 0 && (
                  <div className="border rounded-lg max-h-40 overflow-y-auto">
                    {filteredMaterials.slice(0, 5).map((material) => (
                      <div
                        key={material.id}
                        className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                        onClick={() => addMaterial(material)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{material.name}</div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {material.sku}
                            </div>
                          </div>
                          <Badge variant="outline">₹{material.base_price || 0}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order Items */}
                {orderItems.length > 0 && (
                  <div className="space-y-3">
                    {orderItems.map((item, index) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-medium">{item.material_name}</div>
                              <div className="text-sm text-muted-foreground">SKU: {item.material_sku}</div>
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

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-sm font-medium">Quantity</label>
                              <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={item.quantity}
                                onChange={(e) => updateOrderItem(index, "quantity", parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Unit Price</label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => updateOrderItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Line Total</label>
                              <Input
                                value={`₹${item.line_total.toFixed(2)}`}
                                disabled
                                className="bg-muted"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {orderItems.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No items added. Search and add materials above.</p>
                  </div>
                )}

                {orderItems.length > 0 && (
                  <div className="flex justify-end pt-4 border-t">
                    <div className="text-xl font-bold">
                      Total: ₹{getTotalAmount().toFixed(2)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Additional notes..." rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createOrder.isPending}>
                {createOrder.isPending 
                  ? (editingOrder ? "Updating..." : "Creating...") 
                  : (editingOrder ? "Update Order" : "Create Order")
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
