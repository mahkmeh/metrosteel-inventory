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
import { Plus, Edit, ArrowUpDown, CreditCard, DollarSign, UserX, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { KpiCard } from "@/components/KpiCard";
import { useCustomerKpis } from "@/hooks/useCustomerKpis";

const Customers = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    contact_person: "",
    address: "",
    gst_number: "",
    credit_limit: "",
    credit_days: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: kpiData, isLoading: kpiLoading } = useCustomerKpis();

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers", sortField, sortDirection],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("is_active", true)
        .order(sortField, { ascending: sortDirection === "asc" });

      if (error) throw error;
      return data;
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      if (editingCustomer) {
        const { error } = await supabase
          .from("customers")
          .update(customerData)
          .eq("id", editingCustomer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("customers").insert([customerData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "Success",
        description: `Customer ${editingCustomer ? "updated" : "created"} successfully`,
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${editingCustomer ? "update" : "create"} customer: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      contact_person: "",
      address: "",
      gst_number: "",
      credit_limit: "",
      credit_days: "",
    });
    setEditingCustomer(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomerMutation.mutate({
      ...formData,
      credit_limit: formData.credit_limit ? parseFloat(formData.credit_limit) : 0,
      credit_days: formData.credit_days ? parseInt(formData.credit_days) : 0,
    });
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      contact_person: customer.contact_person || "",
      address: customer.address || "",
      gst_number: customer.gst_number || "",
      credit_limit: customer.credit_limit?.toString() || "",
      credit_days: customer.credit_days?.toString() || "",
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

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading customers...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Credit Limit Breaches"
          value={kpiData?.creditBreaches.count || 0}
          subtitle={`₹${(kpiData?.creditBreaches.excessAmount || 0).toLocaleString('en-IN')} excess`}
          status="critical"
          icon={CreditCard}
          actionLabel="Review Limits"
          onAction={() => toast({ title: "Review Limits", description: "Opening credit limit review" })}
        />
        <KpiCard
          title="Payment Overdue"
          value={kpiData?.paymentOverdue.count || 0}
          subtitle={`₹${(kpiData?.paymentOverdue.amount || 0).toLocaleString('en-IN')} • ${kpiData?.paymentOverdue.avgAging || 0}d avg`}
          status="critical"
          icon={DollarSign}
          actionLabel="Collection Call"
          onAction={() => toast({ title: "Collection Call", description: "Opening collection workflow" })}
        />
        <KpiCard
          title="Inactive Customers"
          value={kpiData?.inactiveCustomers || 0}
          subtitle="no orders >90 days"
          status="warning"
          icon={UserX}
          actionLabel="Re-engage"
          onAction={() => toast({ title: "Re-engage", description: "Opening customer re-engagement" })}
        />
        <KpiCard
          title="High Value at Risk"
          value={kpiData?.highValueCustomersAtRisk || 0}
          subtitle="declining orders"
          status="warning"
          icon={TrendingDown}
          actionLabel="Retention Call"
          onAction={() => toast({ title: "Retention Call", description: "Opening retention workflow" })}
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage your customer relationships</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCustomer(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
              <DialogDescription>
                {editingCustomer ? "Update customer information" : "Enter customer details to add them to your system"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="gst_number">GST Number</Label>
                  <Input
                    id="gst_number"
                    value={formData.gst_number}
                    onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="credit_limit">Credit Limit</Label>
                  <Input
                    id="credit_limit"
                    type="number"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="credit_days">Credit Days</Label>
                  <Input
                    id="credit_days"
                    type="number"
                    value={formData.credit_days}
                    onChange={(e) => setFormData({ ...formData, credit_days: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCustomerMutation.isPending}>
                  {createCustomerMutation.isPending ? "Saving..." : editingCustomer ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>All registered customers</CardDescription>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            {/* Mobile Card View */}
            <div className="block md:hidden">
              {customers?.map((customer) => (
                <div key={customer.id} className="p-4 border-b last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-base">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">{customer.contact_person || "-"}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant={customer.is_active ? "default" : "secondary"}>
                        {customer.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Email: </span>
                      {customer.email || "-"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone: </span>
                      {customer.phone || "-"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Credit: </span>
                      {formatCurrency(customer.credit_limit || 0)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Days: </span>
                      {customer.credit_days || 0} days
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(customer)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                      <div className="flex items-center">
                        Company Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("contact_person")}>
                      <div className="flex items-center">
                        Contact Person
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("credit_limit")}>
                      <div className="flex items-center">
                        Credit Limit
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Credit Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers?.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.contact_person || "-"}</TableCell>
                      <TableCell>{customer.email || "-"}</TableCell>
                      <TableCell>{customer.phone || "-"}</TableCell>
                      <TableCell>{formatCurrency(customer.credit_limit || 0)}</TableCell>
                      <TableCell>{customer.credit_days || 0} days</TableCell>
                      <TableCell>
                        <Badge variant={customer.is_active ? "default" : "secondary"}>
                          {customer.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default Customers;