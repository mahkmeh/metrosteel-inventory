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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, ArrowUpDown, Download, Eye, Mail, MessageCircle, MapPin, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Quotations = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<any>(null);
  const [previewQuotation, setPreviewQuotation] = useState<any>(null);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [formData, setFormData] = useState({
    quotation_number: "",
    customer_id: "",
    requirement_source: "email",
    total_amount: "",
    tax_amount: "",
    handling_charges: "",
    freight_charges: "",
    packing_charges: "",
    grand_total: "",
    status: "draft",
    valid_until: "",
    payment_terms: "",
    terms_conditions: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quotations, isLoading } = useQuery({
    queryKey: ["quotations", sortField, sortDirection],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotations")
        .select(`
          *,
          customers (
            name,
            contact_person
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

  const { data: materials } = useQuery({
    queryKey: ["materials-list"],
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

  const createQuotationMutation = useMutation({
    mutationFn: async (quotationData: any) => {
      if (editingQuotation) {
        const { error } = await supabase
          .from("quotations")
          .update(quotationData)
          .eq("id", editingQuotation.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("quotations").insert([quotationData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast({
        title: "Success",
        description: `Quotation ${editingQuotation ? "updated" : "created"} successfully`,
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${editingQuotation ? "update" : "create"} quotation: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      quotation_number: "",
      customer_id: "",
      requirement_source: "email",
      total_amount: "",
      tax_amount: "",
      handling_charges: "",
      freight_charges: "",
      packing_charges: "",
      grand_total: "",
      status: "draft",
      valid_until: "",
      payment_terms: "",
      terms_conditions: "",
    });
    setEditingQuotation(null);
    setIsDialogOpen(false);
  };

  const calculateGrandTotal = () => {
    const total = parseFloat(formData.total_amount) || 0;
    const tax = parseFloat(formData.tax_amount) || 0;
    const handling = parseFloat(formData.handling_charges) || 0;
    const freight = parseFloat(formData.freight_charges) || 0;
    const packing = parseFloat(formData.packing_charges) || 0;
    
    const grandTotal = total + tax + handling + freight + packing;
    setFormData(prev => ({ ...prev, grand_total: grandTotal.toString() }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateGrandTotal();
    createQuotationMutation.mutate({
      ...formData,
      total_amount: parseFloat(formData.total_amount) || 0,
      tax_amount: parseFloat(formData.tax_amount) || 0,
      handling_charges: parseFloat(formData.handling_charges) || 0,
      freight_charges: parseFloat(formData.freight_charges) || 0,
      packing_charges: parseFloat(formData.packing_charges) || 0,
      grand_total: parseFloat(formData.grand_total) || 0,
    });
  };

  const handleEdit = (quotation: any) => {
    setEditingQuotation(quotation);
    setFormData({
      quotation_number: quotation.quotation_number || "",
      customer_id: quotation.customer_id || "",
      requirement_source: quotation.requirement_source || "email",
      total_amount: quotation.total_amount?.toString() || "",
      tax_amount: quotation.tax_amount?.toString() || "",
      handling_charges: quotation.handling_charges?.toString() || "",
      freight_charges: quotation.freight_charges?.toString() || "",
      packing_charges: quotation.packing_charges?.toString() || "",
      grand_total: quotation.grand_total?.toString() || "",
      status: quotation.status || "draft",
      valid_until: quotation.valid_until || "",
      payment_terms: quotation.payment_terms || "",
      terms_conditions: quotation.terms_conditions || "",
    });
    setIsDialogOpen(true);
  };

  const handlePreview = (quotation: any) => {
    setPreviewQuotation(quotation);
    setIsPreviewOpen(true);
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
      draft: "secondary",
      sent: "outline",
      approved: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getPriorityBadge = (grandTotal: number) => {
    if (grandTotal >= 1000000) {
      return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />High</Badge>;
    } else if (grandTotal >= 100000) {
      return <Badge variant="default" className="bg-green-600">Regular</Badge>;
    } else {
      return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getRequirementIcon = (source: string) => {
    switch (source) {
      case "email": return <Mail className="h-4 w-4" />;
      case "whatsapp": return <MessageCircle className="h-4 w-4" />;
      case "walk_in": return <MapPin className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const downloadQuotation = (quotation: any) => {
    // Create a simple HTML template for JPEG conversion
    const quotationHTML = `
      <div style="padding: 40px; font-family: Arial, sans-serif; background: white; width: 800px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">Steel Trading Company</h1>
          <p style="margin: 5px 0;">Industrial Area, Phase 1, City - 560001</p>
          <p style="margin: 5px 0;">Phone: +91-9876543210 | Email: info@steeltrading.com</p>
        </div>
        
        <div style="border-top: 2px solid #2563eb; padding-top: 20px;">
          <h2 style="color: #1e40af;">QUOTATION</h2>
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <p><strong>Quotation No:</strong> ${quotation.quotation_number}</p>
              <p><strong>Date:</strong> ${new Date(quotation.created_at).toLocaleDateString()}</p>
              <p><strong>Valid Until:</strong> ${quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p><strong>Customer:</strong> ${quotation.customers?.name || 'N/A'}</p>
              <p><strong>Contact:</strong> ${quotation.customers?.contact_person || 'N/A'}</p>
              <p><strong>Requirement Source:</strong> ${quotation.requirement_source?.charAt(0).toUpperCase() + quotation.requirement_source?.slice(1) || 'Email'}</p>
            </div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f1f5f9;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Description</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Amount</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px;">Materials & Services</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${formatCurrency(quotation.total_amount)}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px;">Tax Amount (GST)</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${formatCurrency(quotation.tax_amount)}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px;">Handling Charges</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${formatCurrency(quotation.handling_charges || 0)}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px;">Freight Charges</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${formatCurrency(quotation.freight_charges || 0)}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px;">Packing Charges</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${formatCurrency(quotation.packing_charges || 0)}</td>
            </tr>
            <tr style="background: #f1f5f9; font-weight: bold;">
              <td style="border: 1px solid #ddd; padding: 10px;">Grand Total</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${formatCurrency(quotation.grand_total)}</td>
            </tr>
          </table>
          
          <div style="margin-top: 30px;">
            <h3>Payment Terms:</h3>
            <p>${quotation.payment_terms || 'Net 30 days'}</p>
            
            <h3>Terms & Conditions:</h3>
            <p>${quotation.terms_conditions || 'Standard terms and conditions apply.'}</p>
          </div>
          
          <div style="margin-top: 40px; text-align: center; color: #64748b;">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    `;

    // Create a new window with the HTML content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(quotationHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading quotations...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quotations</h1>
          <p className="text-muted-foreground">Manage customer quotations and proposals</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingQuotation(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Quotation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingQuotation ? "Edit Quotation" : "Add New Quotation"}</DialogTitle>
              <DialogDescription>
                {editingQuotation ? "Update quotation information" : "Create a new quotation for a customer"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing & Charges</TabsTrigger>
                  <TabsTrigger value="terms">Terms & Products</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quotation_number">Quotation Number *</Label>
                      <Input
                        id="quotation_number"
                        value={formData.quotation_number}
                        onChange={(e) => setFormData({ ...formData, quotation_number: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_id">Customer *</Label>
                      <Select
                        value={formData.customer_id}
                        onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
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

                  <div>
                    <Label>Requirement Received Via</Label>
                    <div className="flex gap-6 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.requirement_source === "email"}
                          onCheckedChange={() => setFormData({ ...formData, requirement_source: "email" })}
                        />
                        <Label className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.requirement_source === "whatsapp"}
                          onCheckedChange={() => setFormData({ ...formData, requirement_source: "whatsapp" })}
                        />
                        <Label className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.requirement_source === "walk_in"}
                          onCheckedChange={() => setFormData({ ...formData, requirement_source: "walk_in" })}
                        />
                        <Label className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Walk-in
                        </Label>
                      </div>
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
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="valid_until">Valid Until</Label>
                      <Input
                        id="valid_until"
                        type="date"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="total_amount">Base Amount</Label>
                      <Input
                        id="total_amount"
                        type="number"
                        step="0.01"
                        value={formData.total_amount}
                        onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax_amount">GST Amount</Label>
                      <Input
                        id="tax_amount"
                        type="number"
                        step="0.01"
                        value={formData.tax_amount}
                        onChange={(e) => setFormData({ ...formData, tax_amount: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="handling_charges">Handling Charges</Label>
                      <Input
                        id="handling_charges"
                        type="number"
                        step="0.01"
                        value={formData.handling_charges}
                        onChange={(e) => setFormData({ ...formData, handling_charges: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="freight_charges">Freight Charges</Label>
                      <Input
                        id="freight_charges"
                        type="number"
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
                        step="0.01"
                        value={formData.packing_charges}
                        onChange={(e) => setFormData({ ...formData, packing_charges: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="grand_total">Grand Total</Label>
                    <Input
                      id="grand_total"
                      type="number"
                      step="0.01"
                      value={formData.grand_total}
                      onChange={(e) => setFormData({ ...formData, grand_total: e.target.value })}
                    />
                    <Button type="button" className="mt-2" onClick={calculateGrandTotal}>
                      Calculate Total
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="terms" className="space-y-4">
                  <div>
                    <Label htmlFor="payment_terms">Payment Terms</Label>
                    <Select
                      value={formData.payment_terms}
                      onValueChange={(value) => setFormData({ ...formData, payment_terms: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Net 15 days">Net 15 days</SelectItem>
                        <SelectItem value="Net 30 days">Net 30 days</SelectItem>
                        <SelectItem value="Net 45 days">Net 45 days</SelectItem>
                        <SelectItem value="Net 60 days">Net 60 days</SelectItem>
                        <SelectItem value="Advance payment">Advance payment</SelectItem>
                        <SelectItem value="50% advance, 50% on delivery">50% advance, 50% on delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="terms_conditions">Terms & Conditions</Label>
                    <Textarea
                      id="terms_conditions"
                      value={formData.terms_conditions}
                      onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                      rows={4}
                      placeholder="Enter terms and conditions..."
                    />
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Available Materials (for reference)</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {materials?.slice(0, 10).map((material) => (
                        <div key={material.id} className="text-sm">
                          <span className="font-medium">{material.name}</span> ({material.sku})
                          {material.base_price && <span className="text-muted-foreground"> - {formatCurrency(material.base_price)}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createQuotationMutation.isPending}>
                  {createQuotationMutation.isPending ? "Saving..." : editingQuotation ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quotation List</CardTitle>
          <CardDescription>All customer quotations with priority indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("quotation_number")}>
                  <div className="flex items-center">
                    Quotation #
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("grand_total")}>
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
                <TableHead>Valid Until</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations?.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">{quotation.quotation_number}</TableCell>
                  <TableCell>{quotation.customers?.name || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRequirementIcon(quotation.requirement_source)}
                      <span className="capitalize">{quotation.requirement_source?.replace("_", "-") || "email"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(quotation.grand_total)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(quotation.grand_total)}</TableCell>
                  <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                  <TableCell>
                    {quotation.valid_until
                      ? new Date(quotation.valid_until).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(quotation)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(quotation)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadQuotation(quotation)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quotation Preview</DialogTitle>
            <DialogDescription>Preview of quotation {previewQuotation?.quotation_number}</DialogDescription>
          </DialogHeader>
          {previewQuotation && (
            <div className="space-y-6 p-6 bg-background border rounded-lg">
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold text-primary">Steel Trading Company</h2>
                <p className="text-muted-foreground">Industrial Area, Phase 1, City - 560001</p>
                <p className="text-muted-foreground">Phone: +91-9876543210 | Email: info@steeltrading.com</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Quotation Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Quotation No:</span> {previewQuotation.quotation_number}</p>
                    <p><span className="font-medium">Date:</span> {new Date(previewQuotation.created_at).toLocaleDateString()}</p>
                    <p><span className="font-medium">Valid Until:</span> {previewQuotation.valid_until ? new Date(previewQuotation.valid_until).toLocaleDateString() : 'N/A'}</p>
                    <p><span className="font-medium">Priority:</span> {getPriorityBadge(previewQuotation.grand_total)}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Customer Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Customer:</span> {previewQuotation.customers?.name || 'N/A'}</p>
                    <p><span className="font-medium">Contact:</span> {previewQuotation.customers?.contact_person || 'N/A'}</p>
                    <p><span className="font-medium">Requirement Source:</span> {previewQuotation.requirement_source?.charAt(0).toUpperCase() + previewQuotation.requirement_source?.slice(1) || 'Email'}</p>
                    <p><span className="font-medium">Status:</span> {getStatusBadge(previewQuotation.status)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Pricing Breakdown</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Materials & Services</TableCell>
                      <TableCell className="text-right">{formatCurrency(previewQuotation.total_amount)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Tax Amount (GST)</TableCell>
                      <TableCell className="text-right">{formatCurrency(previewQuotation.tax_amount)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Handling Charges</TableCell>
                      <TableCell className="text-right">{formatCurrency(previewQuotation.handling_charges || 0)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Freight Charges</TableCell>
                      <TableCell className="text-right">{formatCurrency(previewQuotation.freight_charges || 0)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Packing Charges</TableCell>
                      <TableCell className="text-right">{formatCurrency(previewQuotation.packing_charges || 0)}</TableCell>
                    </TableRow>
                    <TableRow className="border-t-2 font-bold">
                      <TableCell>Grand Total</TableCell>
                      <TableCell className="text-right text-lg">{formatCurrency(previewQuotation.grand_total)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Payment Terms</h3>
                  <p className="text-muted-foreground">{previewQuotation.payment_terms || 'Net 30 days'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Terms & Conditions</h3>
                  <p className="text-muted-foreground">{previewQuotation.terms_conditions || 'Standard terms and conditions apply.'}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button onClick={() => downloadQuotation(previewQuotation)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Quotations;