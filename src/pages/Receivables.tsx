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
import { CalendarIcon, Plus, Search, Edit, DollarSign, AlertTriangle, Calendar as CalendarIcon2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Receivable {
  id: string;
  customer_id: string;
  sales_invoice_id: string;
  original_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  due_date?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customers?: { name: string } | null;
  sales_invoices?: { invoice_number: string } | null;
}

interface Customer {
  id: string;
  name: string;
}

interface SalesInvoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  total_amount: number;
}

interface PaymentFormData {
  receivable_id: string;
  payment_amount: number;
  payment_date: Date;
  payment_method: string;
  notes: string;
}

export default function Receivables() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    customer_id: "",
    sales_invoice_id: "",
    original_amount: 0,
    paid_amount: 0,
    outstanding_amount: 0,
    due_date: null as Date | null,
    status: "outstanding",
    notes: "",
  });

  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    receivable_id: "",
    payment_amount: 0,
    payment_date: new Date(),
    payment_method: "cash",
    notes: "",
  });

  const queryClient = useQueryClient();

  const { data: receivables, isLoading } = useQuery({
    queryKey: ["receivables", searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("receivables")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch customers and sales_invoices separately
      const customerIds = [...new Set(data?.map(r => r.customer_id))];
      const invoiceIds = [...new Set(data?.map(r => r.sales_invoice_id))];

      const [customersData, invoicesData] = await Promise.all([
        customerIds.length > 0 ? supabase
          .from("customers")
          .select("id, name")
          .in("id", customerIds) : Promise.resolve({ data: [] }),
        invoiceIds.length > 0 ? supabase
          .from("sales_invoices")
          .select("id, invoice_number")
          .in("id", invoiceIds) : Promise.resolve({ data: [] })
      ]);

      // Combine the data with proper typing
      const customersMap = new Map<string, { id: string; name: string }>();
      const invoicesMap = new Map<string, { id: string; invoice_number: string }>();
      
      customersData.data?.forEach(c => customersMap.set(c.id, c));
      invoicesData.data?.forEach(i => invoicesMap.set(i.id, i));

      const enrichedData = data?.map(receivable => ({
        ...receivable,
        customers: customersMap.get(receivable.customer_id) || null,
        sales_invoices: invoicesMap.get(receivable.sales_invoice_id) || null
      })) || [];

      // Apply search filter if provided
      if (searchTerm) {
        return enrichedData.filter(r => 
          r.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return enrichedData;
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

  const { data: salesInvoices } = useQuery({
    queryKey: ["sales-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_invoices")
        .select("id, invoice_number, customer_id, total_amount")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("receivables")
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
      toast.success("Receivable created successfully");
      resetForm();
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Error creating receivable: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("receivables")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
      toast.success("Receivable updated successfully");
      resetForm();
      setEditingReceivable(null);
    },
    onError: (error: any) => {
      toast.error(`Error updating receivable: ${error.message}`);
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (payment: PaymentFormData) => {
      const receivable = receivables?.find(r => r.id === payment.receivable_id);
      if (!receivable) throw new Error("Receivable not found");

      const newPaidAmount = receivable.paid_amount + payment.payment_amount;
      const newOutstandingAmount = receivable.original_amount - newPaidAmount;
      
      let newStatus = receivable.status;
      if (newOutstandingAmount <= 0) {
        newStatus = "paid";
      } else if (newPaidAmount > 0) {
        newStatus = "partial_paid";
      }

      const { error } = await supabase
        .from("receivables")
        .update({
          paid_amount: newPaidAmount,
          outstanding_amount: newOutstandingAmount,
          status: newStatus,
          notes: `${receivable.notes || ""}\n\nPayment of ₹${payment.payment_amount} received on ${format(payment.payment_date, "PPP")} via ${payment.payment_method}. ${payment.notes}`.trim()
        })
        .eq("id", payment.receivable_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
      toast.success("Payment recorded successfully");
      setIsPaymentDialogOpen(false);
      setSelectedReceivable(null);
      setPaymentData({
        receivable_id: "",
        payment_amount: 0,
        payment_date: new Date(),
        payment_method: "cash",
        notes: "",
      });
    },
    onError: (error: any) => {
      toast.error(`Error recording payment: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      customer_id: "",
      sales_invoice_id: "",
      original_amount: 0,
      paid_amount: 0,
      outstanding_amount: 0,
      due_date: null,
      status: "outstanding",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      due_date: formData.due_date ? format(formData.due_date, "yyyy-MM-dd") : null,
    };

    if (editingReceivable) {
      updateMutation.mutate({ id: editingReceivable.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivable) return;
    
    paymentMutation.mutate(paymentData);
  };

  const handleEdit = (receivable: Receivable) => {
    setEditingReceivable(receivable);
    setFormData({
      customer_id: receivable.customer_id,
      sales_invoice_id: receivable.sales_invoice_id,
      original_amount: receivable.original_amount,
      paid_amount: receivable.paid_amount,
      outstanding_amount: receivable.outstanding_amount,
      due_date: receivable.due_date ? new Date(receivable.due_date) : null,
      status: receivable.status,
      notes: receivable.notes || "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleRecordPayment = (receivable: Receivable) => {
    setSelectedReceivable(receivable);
    setPaymentData({
      receivable_id: receivable.id,
      payment_amount: 0,
      payment_date: new Date(),
      payment_method: "cash",
      notes: "",
    });
    setIsPaymentDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      outstanding: { label: "Outstanding", className: "bg-orange-100 text-orange-800" },
      partial_paid: { label: "Partial Paid", className: "bg-blue-100 text-blue-800" },
      paid: { label: "Paid", className: "bg-green-100 text-green-800" },
      overdue: { label: "Overdue", className: "bg-red-100 text-red-800" },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.outstanding;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getUrgencyBadge = (receivable: Receivable) => {
    if (!receivable.due_date) return null;
    
    const dueDate = new Date(receivable.due_date);
    const today = new Date();
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysOverdue > 0) {
      return <Badge className="bg-red-100 text-red-800 ml-2">Overdue by {daysOverdue} days</Badge>;
    } else if (daysOverdue > -7) {
      return <Badge className="bg-yellow-100 text-yellow-800 ml-2">Due soon</Badge>;
    }
    return null;
  };

  const filteredSalesInvoices = salesInvoices?.filter(invoice => 
    !formData.customer_id || invoice.customer_id === formData.customer_id
  );

  const totalOutstanding = receivables?.reduce((sum, r) => sum + r.outstanding_amount, 0) || 0;
  const overdueCount = receivables?.filter(r => r.status === "overdue").length || 0;
  const totalReceivables = receivables?.length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Receivables</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Receivable
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReceivable ? "Edit Receivable" : "Create Receivable"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_id">Customer</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => setFormData({...formData, customer_id: value, sales_invoice_id: ""})}
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
                  <Label htmlFor="sales_invoice_id">Sales Invoice</Label>
                  <Select
                    value={formData.sales_invoice_id}
                    onValueChange={(value) => {
                      const invoice = filteredSalesInvoices?.find(i => i.id === value);
                      setFormData({
                        ...formData, 
                        sales_invoice_id: value,
                        original_amount: invoice?.total_amount || 0,
                        outstanding_amount: invoice?.total_amount || 0
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSalesInvoices?.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoice_number} - ₹{(invoice.total_amount || 0).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="original_amount">Original Amount</Label>
                  <Input
                    id="original_amount"
                    type="number"
                    step="0.01"
                    value={formData.original_amount}
                    onChange={(e) => {
                      const original = parseFloat(e.target.value) || 0;
                      setFormData({
                        ...formData, 
                        original_amount: original,
                        outstanding_amount: original - formData.paid_amount
                      });
                    }}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="paid_amount">Paid Amount</Label>
                  <Input
                    id="paid_amount"
                    type="number"
                    step="0.01"
                    value={formData.paid_amount}
                    onChange={(e) => {
                      const paid = parseFloat(e.target.value) || 0;
                      setFormData({
                        ...formData, 
                        paid_amount: paid,
                        outstanding_amount: formData.original_amount - paid
                      });
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="outstanding_amount">Outstanding Amount</Label>
                  <Input
                    id="outstanding_amount"
                    type="number"
                    step="0.01"
                    value={formData.outstanding_amount}
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="outstanding">Outstanding</SelectItem>
                      <SelectItem value="partial_paid">Partial Paid</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
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
                  {editingReceivable ? "Update" : "Create"} Receivable
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {totalReceivables} receivables
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Accounts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Days Outstanding</CardTitle>
            <CalendarIcon2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">
              Days on average
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Receivables</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="outstanding">Outstanding</SelectItem>
                  <SelectItem value="partial_paid">Partial Paid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Original Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivables?.map((receivable) => (
                  <TableRow key={receivable.id}>
                    <TableCell className="font-medium">{receivable.customers?.name}</TableCell>
                    <TableCell>{receivable.sales_invoices?.invoice_number}</TableCell>
                    <TableCell>₹{(receivable.original_amount || 0).toLocaleString()}</TableCell>
                    <TableCell>₹{(receivable.paid_amount || 0).toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">₹{(receivable.outstanding_amount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {receivable.due_date ? format(new Date(receivable.due_date), "PPP") : "-"}
                        {getUrgencyBadge(receivable)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(receivable.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(receivable)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {receivable.outstanding_amount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRecordPayment(receivable)}
                          >
                            <DollarSign className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {receivables?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No receivables found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Recording Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div>
              <Label>Customer: {selectedReceivable?.customers?.name}</Label>
              <Label>Outstanding: ₹{(selectedReceivable?.outstanding_amount || 0).toLocaleString()}</Label>
            </div>
            
            <div>
              <Label htmlFor="payment_amount">Payment Amount</Label>
              <Input
                id="payment_amount"
                type="number"
                step="0.01"
                max={selectedReceivable?.outstanding_amount}
                value={paymentData.payment_amount}
                onChange={(e) => setPaymentData({...paymentData, payment_amount: parseFloat(e.target.value) || 0})}
                required
              />
            </div>

            <div>
              <Label>Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(paymentData.payment_date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={paymentData.payment_date}
                    onSelect={(date) => date && setPaymentData({...paymentData, payment_date: date})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={paymentData.payment_method}
                onValueChange={(value) => setPaymentData({...paymentData, payment_method: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="online">Online Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_notes">Notes</Label>
              <Textarea
                id="payment_notes"
                value={paymentData.notes}
                onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={paymentMutation.isPending}>
                Record Payment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}