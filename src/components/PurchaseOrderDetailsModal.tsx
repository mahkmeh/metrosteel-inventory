
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { FileText, Package, Calendar, User, DollarSign } from "lucide-react";

interface PurchaseOrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onStatusChange: (orderId: string, status: string) => void;
}

export const PurchaseOrderDetailsModal = ({ 
  open, 
  onOpenChange, 
  order,
  onStatusChange 
}: PurchaseOrderDetailsModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || "");

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

  const handleStatusUpdate = () => {
    if (selectedStatus !== order.status) {
      onStatusChange(order.id, selectedStatus);
      onOpenChange(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Purchase Order Details - {order.po_number}
          </DialogTitle>
          <DialogDescription>
            View and manage purchase order information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    PO Number
                  </div>
                  <div className="font-medium">{order.po_number}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Supplier
                  </div>
                  <div className="font-medium">{order.suppliers?.name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Total Amount
                  </div>
                  <div className="font-medium">₹{order.total_amount?.toLocaleString()}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Order Date
                  </div>
                  <div className="font-medium">
                    {format(new Date(order.order_date), "dd/MM/yyyy")}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Expected Delivery
                  </div>
                  <div className="font-medium">
                    {order.expected_delivery 
                      ? format(new Date(order.expected_delivery), "dd/MM/yyyy")
                      : "Not specified"
                    }
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Created</div>
                  <div className="font-medium">
                    {format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}
                  </div>
                </div>
              </div>

              {order.notes && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Notes</div>
                    <div className="text-sm bg-muted p-3 rounded">{order.notes}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              {order.purchase_order_items && order.purchase_order_items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Line Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.purchase_order_items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.materials?.name || "Unknown Material"}
                        </TableCell>
                        <TableCell>{item.materials?.sku || "N/A"}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{item.unit_price?.toLocaleString()}</TableCell>
                        <TableCell>₹{item.line_total?.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No items found for this order</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Update Status</label>
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleStatusUpdate}
                  disabled={selectedStatus === order.status}
                  className="mt-6"
                >
                  Update Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
