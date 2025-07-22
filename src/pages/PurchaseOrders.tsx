
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Search, Eye, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { PurchaseOrderModal } from "@/components/PurchaseOrderModal";
import { PurchaseOrderDetailsModal } from "@/components/PurchaseOrderDetailsModal";

const PurchaseOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editingOrder, setEditingOrder] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select(`
          *,
          suppliers(name, contact_person),
          purchase_order_items(
            id,
            quantity,
            unit_price,
            line_total,
            materials(name, sku)
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const filteredOrders = orders.filter((order: any) =>
    order.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.suppliers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "sent": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "confirmed": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "received": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from("purchase_orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatus.mutate({ orderId, status: newStatus });
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleEdit = (order: any) => {
    setEditingOrder(order);
    setShowCreateModal(true);
  };

  const handleCreate = () => {
    setEditingOrder(null);
    setShowCreateModal(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Purchase Orders
          </h1>
          <p className="text-muted-foreground">Manage purchase orders and track delivery status</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Purchase Order
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search purchase orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>
            Track and manage all purchase orders from suppliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading purchase orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Purchase Orders Found</h3>
              <p className="text-sm">No purchase orders match your search criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.po_number}</TableCell>
                    <TableCell>{order.suppliers?.name}</TableCell>
                    <TableCell>{format(new Date(order.order_date), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      {order.expected_delivery 
                        ? format(new Date(order.expected_delivery), "dd/MM/yyyy")
                        : "-"
                      }
                    </TableCell>
                    <TableCell>₹{order.total_amount?.toLocaleString()}</TableCell>
                    <TableCell>{order.purchase_order_items?.length || 0}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(order)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PurchaseOrderModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        editingOrder={editingOrder}
      />

      <PurchaseOrderDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default PurchaseOrders;
