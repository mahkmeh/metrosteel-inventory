import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Search, Edit } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SalesReturn {
  id: string;
  return_number: string;
  customer_id: string;
  sales_order_id: string;
  sales_invoice_id: string;
  return_date: string;
  credit_note_date?: string;
  credit_note_number?: string;
  total_return_amount: number;
  return_reason?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Customer {
  id: string;
  name: string;
}

interface SalesOrder {
  id: string;
  so_number: string;
  customer_id: string;
}

interface SalesInvoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  sales_order_id: string;
}

export default function SalesReturn() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingReturn, setEditingReturn] = useState<SalesReturn | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    return_number: "",
    customer_id: "",
    sales_order_id: "",
    sales_invoice_id: "",
    return_date: new Date(),
    credit_note_date: null as Date | null,
    credit_note_number: "",
    total_return_amount: 0,
    return_reason: "",
    status: "pending",
    notes: "",
  });

  const queryClient = useQueryClient();

  const { data: returns, isLoading } = useQuery({
    queryKey: ["sales-returns", searchTerm, statusFilter],
    queryFn: async () => {
      // Temporary: Use purchase_returns as placeholder until types are updated
      let query = supabase
        .from("purchase_returns")
        .select(`*`)
        .order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return [];
    },
  });

  const { data: customers } = useQuery({
    queryKey: ["customers"],
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

  const { data: salesOrders } = useQuery({
    queryKey: ["sales-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_orders")
        .select("id, so_number, customer_id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: salesInvoices } = useQuery({
    queryKey: ["sales-invoices"],
    queryFn: async () => {
      // Temporary: Return empty array until types are updated
      return [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Temporary: Disable creation until types are updated
      throw new Error("Sales returns will be available after database types update");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-returns"] });
      toast.success("Sales return created successfully");
      resetForm();
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Error creating sales return: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Temporary: Disable updates until types are updated
      throw new Error("Sales returns will be available after database types update");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-returns"] });
      toast.success("Sales return updated successfully");
      resetForm();
      setEditingReturn(null);
    },
    onError: (error: any) => {
      toast.error(`Error updating sales return: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      return_number: "",
      customer_id: "",
      sales_order_id: "",
      sales_invoice_id: "",
      return_date: new Date(),
      credit_note_date: null,
      credit_note_number: "",
      total_return_amount: 0,
      return_reason: "",
      status: "pending",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      return_date: format(formData.return_date, "yyyy-MM-dd"),
      credit_note_date: formData.credit_note_date ? format(formData.credit_note_date, "yyyy-MM-dd") : null,
    };

    if (editingReturn) {
      updateMutation.mutate({ id: editingReturn.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (returnItem: SalesReturn) => {
    setEditingReturn(returnItem);
    setFormData({
      return_number: returnItem.return_number,
      customer_id: returnItem.customer_id,
      sales_order_id: returnItem.sales_order_id,
      sales_invoice_id: returnItem.sales_invoice_id,
      return_date: new Date(returnItem.return_date),
      credit_note_date: returnItem.credit_note_date ? new Date(returnItem.credit_note_date) : null,
      credit_note_number: returnItem.credit_note_number || "",
      total_return_amount: returnItem.total_return_amount,
      return_reason: returnItem.return_reason || "",
      status: returnItem.status,
      notes: returnItem.notes || "",
    });
    setIsCreateDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Approved", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
      processed: { label: "Processed", className: "bg-blue-100 text-blue-800" },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredSalesOrders = salesOrders?.filter(order => 
    !formData.customer_id || order.customer_id === formData.customer_id
  );

  const filteredSalesInvoices = salesInvoices?.filter(invoice => 
    !formData.sales_order_id || invoice.sales_order_id === formData.sales_order_id
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sales Returns</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Return
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReturn ? "Edit Sales Return" : "Create Sales Return"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="return_number">Return Number</Label>
                  <Input
                    id="return_number"
                    value={formData.return_number}
                    onChange={(e) => setFormData({...formData, return_number: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_id">Customer</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => setFormData({...formData, customer_id: value, sales_order_id: "", sales_invoice_id: ""})}
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
                <div>
                  <Label htmlFor="sales_order_id">Sales Order</Label>
                  <Select
                    value={formData.sales_order_id}
                    onValueChange={(value) => setFormData({...formData, sales_order_id: value, sales_invoice_id: ""})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sales order" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSalesOrders?.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.so_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="sales_invoice_id">Sales Invoice</Label>
                <Select
                  value={formData.sales_invoice_id}
                  onValueChange={(value) => setFormData({...formData, sales_invoice_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sales invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSalesInvoices?.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.invoice_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Return Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.return_date, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.return_date}
                        onSelect={(date) => date && setFormData({...formData, return_date: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Credit Note Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.credit_note_date ? format(formData.credit_note_date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.credit_note_date}
                        onSelect={(date) => setFormData({...formData, credit_note_date: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="credit_note_number">Credit Note Number</Label>
                  <Input
                    id="credit_note_number"
                    value={formData.credit_note_number}
                    onChange={(e) => setFormData({...formData, credit_note_number: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="total_return_amount">Total Return Amount</Label>
                  <Input
                    id="total_return_amount"
                    type="number"
                    step="0.01"
                    value={formData.total_return_amount}
                    onChange={(e) => setFormData({...formData, total_return_amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="return_reason">Return Reason</Label>
                <Textarea
                  id="return_reason"
                  value={formData.return_reason}
                  onChange={(e) => setFormData({...formData, return_reason: e.target.value})}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingReturn ? "Update" : "Create"} Return
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Sales Returns</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search returns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Return Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Sales Order</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Return Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns?.map((returnItem: any) => (
                  <TableRow key={returnItem.id}>
                    <TableCell className="font-medium">{returnItem.return_number}</TableCell>
                    <TableCell>{returnItem.customers?.name}</TableCell>
                    <TableCell>{returnItem.sales_orders?.so_number}</TableCell>
                    <TableCell>{format(new Date(returnItem.return_date), "PPP")}</TableCell>
                    <TableCell>₹{returnItem.total_return_amount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(returnItem.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(returnItem)}
                        >
                          <Edit className="w-4 h-4" />
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
    </div>
  );
}