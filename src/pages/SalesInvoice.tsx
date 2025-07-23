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
import { CalendarIcon, Plus, Search, MoreHorizontal, Edit, Eye } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SalesInvoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  sales_order_id: string;
  invoice_date: string;
  due_date?: string;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
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

export default function SalesInvoice() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<SalesInvoice | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    invoice_number: "",
    customer_id: "",
    sales_order_id: "",
    invoice_date: new Date(),
    due_date: null as Date | null,
    subtotal_amount: 0,
    tax_amount: 0,
    total_amount: 0,
    status: "pending",
    notes: "",
  });

  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["sales-invoices", searchTerm, statusFilter],
    queryFn: async () => {
      // Fetch sales invoices
      let query = supabase
        .from("sales_invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data: invoicesData, error: invoicesError } = await query;
      if (invoicesError) throw invoicesError;

      if (!invoicesData || invoicesData.length === 0) {
        return [];
      }

      // Fetch customers
      const customerIds = [...new Set(invoicesData.map(inv => inv.customer_id))];
      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("id, name")
        .in("id", customerIds);
      
      if (customersError) throw customersError;

      // Fetch sales orders
      const salesOrderIds = [...new Set(invoicesData.map(inv => inv.sales_order_id))];
      const { data: salesOrdersData, error: salesOrdersError } = await supabase
        .from("sales_orders")
        .select("id, so_number")
        .in("id", salesOrderIds);
      
      if (salesOrdersError) throw salesOrdersError;

      // Create lookup maps
      const customersMap = new Map(customersData?.map(c => [c.id, c]) || []);
      const salesOrdersMap = new Map(salesOrdersData?.map(so => [so.id, so]) || []);

      // Join the data
      const joinedData = invoicesData.map(invoice => ({
        ...invoice,
        customers: customersMap.get(invoice.customer_id) || null,
        sales_orders: salesOrdersMap.get(invoice.sales_order_id) || null,
      }));

      // Apply search filter after joining
      if (searchTerm) {
        return joinedData.filter(invoice => 
          invoice.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return joinedData;
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

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("sales_invoices")
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] });
      toast.success("Sales invoice created successfully");
      resetForm();
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Error creating sales invoice: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("sales_invoices")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] });
      toast.success("Sales invoice updated successfully");
      resetForm();
      setEditingInvoice(null);
    },
    onError: (error: any) => {
      toast.error(`Error updating sales invoice: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      invoice_number: "",
      customer_id: "",
      sales_order_id: "",
      invoice_date: new Date(),
      due_date: null,
      subtotal_amount: 0,
      tax_amount: 0,
      total_amount: 0,
      status: "pending",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      invoice_date: format(formData.invoice_date, "yyyy-MM-dd"),
      due_date: formData.due_date ? format(formData.due_date, "yyyy-MM-dd") : null,
    };

    if (editingInvoice) {
      updateMutation.mutate({ id: editingInvoice.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (invoice: SalesInvoice) => {
    setEditingInvoice(invoice);
    setFormData({
      invoice_number: invoice.invoice_number,
      customer_id: invoice.customer_id,
      sales_order_id: invoice.sales_order_id,
      invoice_date: new Date(invoice.invoice_date),
      due_date: invoice.due_date ? new Date(invoice.due_date) : null,
      subtotal_amount: invoice.subtotal_amount,
      tax_amount: invoice.tax_amount,
      total_amount: invoice.total_amount,
      status: invoice.status,
      notes: invoice.notes || "",
    });
    setIsCreateDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      paid: { label: "Paid", className: "bg-green-100 text-green-800" },
      overdue: { label: "Overdue", className: "bg-red-100 text-red-800" },
      cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-800" },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredSalesOrders = salesOrders?.filter(order => 
    !formData.customer_id || order.customer_id === formData.customer_id
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sales Invoices</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingInvoice ? "Edit Sales Invoice" : "Create Sales Invoice"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice_number">Invoice Number</Label>
                  <Input
                    id="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
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
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_id">Customer</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => setFormData({...formData, customer_id: value, sales_order_id: ""})}
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
                    onValueChange={(value) => setFormData({...formData, sales_order_id: value})}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.invoice_date, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.invoice_date}
                        onSelect={(date) => date && setFormData({...formData, invoice_date: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.due_date ? format(formData.due_date, "PPP") : "Select due date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.due_date}
                        onSelect={(date) => setFormData({...formData, due_date: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="subtotal_amount">Subtotal Amount</Label>
                  <Input
                    id="subtotal_amount"
                    type="number"
                    step="0.01"
                    value={formData.subtotal_amount}
                    onChange={(e) => {
                      const subtotal = parseFloat(e.target.value) || 0;
                      const total = subtotal + formData.tax_amount;
                      setFormData({...formData, subtotal_amount: subtotal, total_amount: total});
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="tax_amount">Tax Amount</Label>
                  <Input
                    id="tax_amount"
                    type="number"
                    step="0.01"
                    value={formData.tax_amount}
                    onChange={(e) => {
                      const tax = parseFloat(e.target.value) || 0;
                      const total = formData.subtotal_amount + tax;
                      setFormData({...formData, tax_amount: tax, total_amount: total});
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="total_amount">Total Amount</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    value={formData.total_amount}
                    readOnly
                  />
                </div>
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
                  {editingInvoice ? "Update" : "Create"} Invoice
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Sales Invoices</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
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
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Sales Order</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices?.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.customers?.name}</TableCell>
                    <TableCell>{invoice.sales_orders?.so_number}</TableCell>
                    <TableCell>{format(new Date(invoice.invoice_date), "PPP")}</TableCell>
                    <TableCell>
                      {invoice.due_date ? format(new Date(invoice.due_date), "PPP") : "-"}
                    </TableCell>
                    <TableCell>₹{invoice.total_amount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(invoice)}
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