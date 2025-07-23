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
import { CalendarIcon, Plus, Search, Edit, CreditCard } from "lucide-react";
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

export default function Receivables() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null);
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

  const [paymentData, setPaymentData] = useState({
    payment_amount: 0,
    payment_date: new Date(),
    payment_method: "bank_transfer",
    reference_number: "",
    notes: "",
  });

  const queryClient = useQueryClient();

  const { data: receivables, isLoading } = useQuery({
    queryKey: ["receivables", searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("receivables")
        .select(`
          *,
          customers(name),
          sales_invoices(invoice_number)
        `)
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`customers.name.ilike.%${searchTerm}%,sales_invoices.invoice_number.ilike.%${searchTerm}%`);
      }
      
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
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
      const { error } = await supabase.from("receivables").insert([data]);
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

  const recordPaymentMutation = useMutation({
    mutationFn: async ({ id, payment }: { id: string; payment: any }) => {
      const receivable = receivables?.find(r => r.id === id);
      if (!receivable) throw new Error("Receivable not found");

      const newPaidAmount = receivable.paid_amount + payment.payment_amount;
      const newOutstandingAmount = receivable.original_amount - newPaidAmount;
      const newStatus = newOutstandingAmount <= 0 ? "paid" : "partial";

      const { error } = await supabase
        .from("receivables")
        .update({
          paid_amount: newPaidAmount,
          outstanding_amount: newOutstandingAmount,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      
      if (error) throw error;

      // Here you would also create a payment record in a payments table
      // For now, we'll just update the receivable
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
      toast.success("Payment recorded successfully");
      setPaymentData({
        payment_amount: 0,
        payment_date: new Date(),
        payment_method: "bank_transfer",
        reference_number: "",
        notes: "",
      });
      setIsPaymentDialogOpen(false);
      setEditingReceivable(null);
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
      outstanding_amount: formData.original_amount - formData.paid_amount,
    };

    if (editingReceivable) {
      updateMutation.mutate({ id: editingReceivable.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReceivable) {
      recordPaymentMutation.mutate({
        id: editingReceivable.id,
        payment: paymentData,
      });
    }
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

  const handleRecordPaymentClick = (receivable: Receivable) => {
    setEditingReceivable(receivable);
    setPaymentData({
      payment_amount: 0,
      payment_date: new Date(),
      payment_method: "bank_transfer",
      reference_number: "",
      notes: "",
    });
    setIsPaymentDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      outstanding: { label: "Outstanding", className: "bg-red-100 text-red-800" },
      partial: { label: "Partial", className: "bg-yellow-100 text-yellow-800" },
      paid: { label: "Paid", className: "bg-green-100 text-green-800" },
      overdue: { label: "Overdue", className: "bg-red-100 text-red-800" },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.outstanding;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredSalesInvoices = salesInvoices?.filter(invoice => 
    !formData.customer_id || invoice.customer_id === formData.customer_id
  );

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = salesInvoices?.find(inv => inv.id === invoiceId);
    if (invoice) {
      setFormData({
        ...formData,
        sales_invoice_id: invoiceId,
        original_amount: invoice.total_amount,
        outstanding_amount: invoice.total_amount - formData.paid_amount,
      });
    }
  };

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
                    onValueChange={handleInvoiceSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sales invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSalesInvoices?.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoice_number} - ₹{invoice.total_amount.toLocaleString()}
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
                      <SelectItem value="partial">Partial</SelectItem>
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

        {/* Payment Recording Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <Label htmlFor="payment_amount">Payment Amount</Label>
                <Input
                  id="payment_amount"
                  type="number"
                  step="0.01"
                  value={paymentData.payment_amount}
                  onChange={(e) => setPaymentData({...paymentData, payment_amount: parseFloat(e.target.value) || 0})}
                  max={editingReceivable?.outstanding_amount}
                  required
                />
                {editingReceivable && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Outstanding: ₹{editingReceivable.outstanding_amount.toLocaleString()}
                  </p>
                )}
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
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reference_number">Reference Number</Label>
                <Input
                  id="reference_number"
                  value={paymentData.reference_number}
                  onChange={(e) => setPaymentData({...paymentData, reference_number: e.target.value})}
                />
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
                <Button type="submit" disabled={recordPaymentMutation.isPending}>
                  Record Payment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Receivables</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search receivables..."
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
                  <SelectItem value="outstanding">Outstanding</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
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
                  <TableHead>Outstanding Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivables?.map((receivable: any) => (
                  <TableRow key={receivable.id}>
                    <TableCell>{receivable.customers?.name}</TableCell>
                    <TableCell>{receivable.sales_invoices?.invoice_number}</TableCell>
                    <TableCell>₹{receivable.original_amount.toLocaleString()}</TableCell>
                    <TableCell>₹{receivable.paid_amount.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">₹{receivable.outstanding_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {receivable.due_date ? format(new Date(receivable.due_date), "PPP") : "-"}
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
                        {receivable.status !== "paid" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRecordPaymentClick(receivable)}
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>
                        )}
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