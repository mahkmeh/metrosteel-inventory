import { useState, useMemo } from "react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, ArrowUpDown, Download, Eye, Mail, MessageCircle, MapPin, AlertTriangle, Trash2, ChevronDown, Calculator, Search, Package, Clock, TrendingUp, AlertCircle, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductSelectionModal } from "@/components/ProductSelectionModal";
import { ReminderManagement } from "@/components/ReminderManagement";
import { StatusSelect } from "@/components/StatusSelect";

const Quotations = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<any>(null);
  const [previewQuotation, setPreviewQuotation] = useState<any>(null);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Search and filter states
  const [globalSearch, setGlobalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    quotation_number: "",
    customer_id: "",
    concerned_person: "",
    customer_need: "for_quotation",
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
  
  const [quotationItems, setQuotationItems] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isProductSelectionOpen, setIsProductSelectionOpen] = useState(false);
  const [quickAddData, setQuickAddData] = useState({
    name: "",
    category: "",
    grade: "",
    sku: "",
    base_price: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch quotations with related data
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
          ),
          quotation_items (
            *,
            materials (
              name,
              sku,
              category,
              grade
            )
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
        .select("id, name, sku, base_price, batch_no, category, grade")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Advanced filtering with search across multiple fields
  const filteredQuotations = useMemo(() => {
    if (!quotations) return [];

    return quotations.filter(quotation => {
      // Global search across customer, products, and quotation details
      const searchLower = globalSearch.toLowerCase();
      const matchesSearch = !globalSearch || 
        quotation.customers?.name?.toLowerCase().includes(searchLower) ||
        quotation.concerned_person?.toLowerCase().includes(searchLower) ||
        quotation.quotation_items?.some((item: any) => 
          item.materials?.name?.toLowerCase().includes(searchLower) ||
          item.materials?.sku?.toLowerCase().includes(searchLower) ||
          item.materials?.category?.toLowerCase().includes(searchLower)
        );

      // Status filter
      const matchesStatus = statusFilter === "all" || quotation.status === statusFilter;

      // Priority filter (based on grand total)
      let matchesPriority = true;
      if (priorityFilter !== "all") {
        const total = quotation.grand_total || 0;
        if (priorityFilter === "high" && total < 100000) matchesPriority = false;
        if (priorityFilter === "medium" && (total < 50000 || total >= 100000)) matchesPriority = false;
        if (priorityFilter === "low" && total >= 50000) matchesPriority = false;
      }

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [quotations, globalSearch, statusFilter, priorityFilter]);

  // Filter materials based on search
  const filteredMaterials = materials?.filter(material =>
    material.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    material.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
    (material.batch_no && material.batch_no.toLowerCase().includes(productSearch.toLowerCase()))
  ) || [];

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
      concerned_person: "",
      customer_need: "for_quotation",
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
    setQuotationItems([]);
    setEditingQuotation(null);
    setIsDialogOpen(false);
  };

  const calculateTotals = () => {
    const itemsTotal = quotationItems.reduce((sum, item) => sum + (item.line_total || 0), 0);
    const taxAmount = parseFloat(formData.tax_amount) || 0;
    const handlingCharges = parseFloat(formData.handling_charges) || 0;
    const freightCharges = parseFloat(formData.freight_charges) || 0;
    const packingCharges = parseFloat(formData.packing_charges) || 0;
    
    const grandTotal = itemsTotal + taxAmount + handlingCharges + freightCharges + packingCharges;
    
    setFormData(prev => ({
      ...prev,
      total_amount: itemsTotal.toString(),
      grand_total: grandTotal.toString()
    }));
  };

  const addQuotationItem = () => {
    setQuotationItems([...quotationItems, {
      material_id: "",
      quantity: "",
      unit_price: "",
      line_total: "",
      notes: ""
    }]);
  };

  const updateQuotationItem = (index: number, field: string, value: any) => {
    const updatedItems = [...quotationItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === "quantity" || field === "unit_price") {
      const quantity = parseFloat(updatedItems[index].quantity) || 0;
      const unitPrice = parseFloat(updatedItems[index].unit_price) || 0;
      updatedItems[index].line_total = (quantity * unitPrice).toString();
    }
    
    setQuotationItems(updatedItems);
  };

  const removeQuotationItem = (index: number) => {
    const updatedItems = quotationItems.filter((_, i) => i !== index);
    setQuotationItems(updatedItems);
  };

  const toggleCharge = (chargeType: string, defaultValue: number) => {
    const currentValue = parseFloat(formData[chargeType as keyof typeof formData] as string) || 0;
    setFormData(prev => ({
      ...prev,
      [chargeType]: currentValue > 0 ? "0" : defaultValue.toString()
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateTotals();
    
    const submissionData = {
      ...formData,
      valid_until: formData.valid_until || null,
      total_amount: parseFloat(formData.total_amount) || 0,
      tax_amount: parseFloat(formData.tax_amount) || 0,
      handling_charges: parseFloat(formData.handling_charges) || 0,
      freight_charges: parseFloat(formData.freight_charges) || 0,
      packing_charges: parseFloat(formData.packing_charges) || 0,
      grand_total: parseFloat(formData.grand_total) || 0,
    };
    
    createQuotationMutation.mutate(submissionData);
  };

  const handleEdit = (quotation: any) => {
    setEditingQuotation(quotation);
    setFormData({
      quotation_number: quotation.quotation_number || "",
      customer_id: quotation.customer_id || "",
      concerned_person: quotation.concerned_person || "",
      customer_need: quotation.customer_need || "for_quotation",
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
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityBadge = (grandTotal: number) => {
    if (grandTotal >= 100000) {
      return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
    } else if (grandTotal >= 50000) {
      return <Badge variant="default" className="text-xs">Medium Priority</Badge>;
    } else {
      return <Badge variant="secondary" className="text-xs">Low Priority</Badge>;
    }
  };

  const getRequirementIcon = (source: string) => {
    switch (source) {
      case "email":
        return <Mail className="h-3 w-3" />;
      case "whatsapp":
        return <MessageCircle className="h-3 w-3" />;
      case "phone":
        return <Package className="h-3 w-3" />;
      default:
        return <AlertTriangle className="h-3 w-3" />;
    }
  };

  const downloadQuotation = (quotation: any) => {
    const quotationContent = `
      <html>
        <head>
          <title>Quotation ${quotation.quotation_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .details { margin-bottom: 20px; }
            .items { width: 100%; border-collapse: collapse; }
            .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>QUOTATION</h1>
            <h2>${quotation.quotation_number}</h2>
          </div>
          
          <div class="details">
            <p><strong>Customer:</strong> ${quotation.customers?.name || 'N/A'}</p>
            <p><strong>Contact Person:</strong> ${quotation.concerned_person || 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date(quotation.created_at).toLocaleDateString()}</p>
            <p><strong>Valid Until:</strong> ${quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString() : 'N/A'}</p>
          </div>

          <table class="items">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${quotation.quotation_items?.map((item: any) => `
                <tr>
                  <td>${item.materials?.name || 'N/A'}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.unit_price)}</td>
                  <td>${formatCurrency(item.line_total)}</td>
                </tr>
              `).join('') || '<tr><td colspan="4">No items</td></tr>'}
            </tbody>
          </table>

          <div class="total">
            <p><strong>Subtotal:</strong> ${formatCurrency(quotation.total_amount || 0)}</p>
            <p><strong>Tax:</strong> ${formatCurrency(quotation.tax_amount || 0)}</p>
            <p><strong>Freight:</strong> ${formatCurrency(quotation.freight_charges || 0)}</p>
            <p><strong>Handling:</strong> ${formatCurrency(quotation.handling_charges || 0)}</p>
            <p><strong>Packing:</strong> ${formatCurrency(quotation.packing_charges || 0)}</p>
            <h3><strong>Grand Total: ${formatCurrency(quotation.grand_total || 0)}</strong></h3>
          </div>

          <div style="margin-top: 30px;">
            <p><strong>Payment Terms:</strong> ${quotation.payment_terms || 'N/A'}</p>
            <p><strong>Terms & Conditions:</strong> ${quotation.terms_conditions || 'N/A'}</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([quotationContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotation-${quotation.quotation_number}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quotations</h1>
          <p className="text-muted-foreground">Manage customer quotations and proposals</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingQuotation(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Quotation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingQuotation ? "Edit Quotation" : "Create New Quotation"}
              </DialogTitle>
              <DialogDescription>
                {editingQuotation ? "Update quotation details" : "Fill in the details to create a new quotation"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quotation_number">Quotation Number</Label>
                  <Input
                    id="quotation_number"
                    value={formData.quotation_number}
                    onChange={(e) => setFormData({ ...formData, quotation_number: e.target.value })}
                    placeholder="Enter quotation number"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="customer_id">Customer</Label>
                  <Select value={formData.customer_id} onValueChange={(value) => setFormData({ ...formData, customer_id: value })}>
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
                  <Label htmlFor="concerned_person">Contact Person</Label>
                  <Input
                    id="concerned_person"
                    value={formData.concerned_person}
                    onChange={(e) => setFormData({ ...formData, concerned_person: e.target.value })}
                    placeholder="Enter contact person name"
                  />
                </div>

                <div>
                  <Label htmlFor="requirement_source">Requirement Source</Label>
                  <Select value={formData.requirement_source} onValueChange={(value) => setFormData({ ...formData, requirement_source: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="visit">Site Visit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Settings Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="advanced-settings"
                  checked={showAdvanced}
                  onCheckedChange={setShowAdvanced}
                />
                <Label htmlFor="advanced-settings">Show Advanced Settings</Label>
              </div>

              {showAdvanced && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="valid_until">Valid Until</Label>
                      <Input
                        id="valid_until"
                        type="date"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="discussion">Discussion</SelectItem>
                          <SelectItem value="won">Won</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="payment_terms">Payment Terms</Label>
                    <Textarea
                      id="payment_terms"
                      value={formData.payment_terms}
                      onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                      placeholder="Enter payment terms"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="terms_conditions">Terms & Conditions</Label>
                    <Textarea
                      id="terms_conditions"
                      value={formData.terms_conditions}
                      onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                      placeholder="Enter terms and conditions"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Items Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Quotation Items</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsProductSelectionOpen(true)}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Browse Products
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={addQuotationItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>

                {quotationItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>Material</Label>
                      <Select
                        value={item.material_id}
                        onValueChange={(value) => updateQuotationItem(index, "material_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {materials?.map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.name} ({material.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuotationItem(index, "quantity", e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateQuotationItem(index, "unit_price", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label>Line Total</Label>
                      <Input
                        type="number"
                        value={item.line_total}
                        readOnly
                        className="bg-muted"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuotationItem(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charges Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Charges</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="tax_amount">Tax Amount</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCharge("tax_amount", 1000)}
                      >
                        {parseFloat(formData.tax_amount) > 0 ? "Remove" : "Add"}
                      </Button>
                    </div>
                    <Input
                      id="tax_amount"
                      type="number"
                      value={formData.tax_amount}
                      onChange={(e) => setFormData({ ...formData, tax_amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="freight_charges">Freight</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCharge("freight_charges", 500)}
                      >
                        {parseFloat(formData.freight_charges) > 0 ? "Remove" : "Add"}
                      </Button>
                    </div>
                    <Input
                      id="freight_charges"
                      type="number"
                      value={formData.freight_charges}
                      onChange={(e) => setFormData({ ...formData, freight_charges: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="handling_charges">Handling</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCharge("handling_charges", 300)}
                      >
                        {parseFloat(formData.handling_charges) > 0 ? "Remove" : "Add"}
                      </Button>
                    </div>
                    <Input
                      id="handling_charges"
                      type="number"
                      value={formData.handling_charges}
                      onChange={(e) => setFormData({ ...formData, handling_charges: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="packing_charges">Packing</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCharge("packing_charges", 200)}
                      >
                        {parseFloat(formData.packing_charges) > 0 ? "Remove" : "Add"}
                      </Button>
                    </div>
                    <Input
                      id="packing_charges"
                      type="number"
                      value={formData.packing_charges}
                      onChange={(e) => setFormData({ ...formData, packing_charges: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(parseFloat(formData.total_amount) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Charges:</span>
                      <span>
                        {formatCurrency(
                          (parseFloat(formData.tax_amount) || 0) +
                          (parseFloat(formData.freight_charges) || 0) +
                          (parseFloat(formData.handling_charges) || 0) +
                          (parseFloat(formData.packing_charges) || 0)
                        )}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Grand Total:</span>
                      <span>{formatCurrency(parseFloat(formData.grand_total) || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="button" variant="outline" onClick={calculateTotals}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Total
                </Button>
                <Button type="submit" disabled={createQuotationMutation.isPending}>
                  {createQuotationMutation.isPending ? (
                    "Saving..."
                  ) : (
                    <>
                      {editingQuotation ? "Update" : "Create"} Quotation
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="global-search">Universal Search</Label>
              <Input
                id="global-search"
                placeholder="Search by customer, product, priority..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="discussion">Discussion</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority-filter">Priority Filter</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High (₹1L+)</SelectItem>
                  <SelectItem value="medium">Medium (₹50K-1L)</SelectItem>
                  <SelectItem value="low">Low (&lt;₹50K)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quotations ({filteredQuotations?.length || 0})</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{quotations?.filter(q => q.status === 'draft').length || 0} Draft</Badge>
              <Badge variant="outline">{quotations?.filter(q => q.status === 'sent').length || 0} Sent</Badge>
              <Badge variant="outline">{quotations?.filter(q => q.status === 'won').length || 0} Won</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("created_at")}>
                    Date {sortField === "created_at" && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("customers.name")}>
                    Customer {sortField === "customers.name" && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                  </TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reminders</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("grand_total")}>
                    Amount {sortField === "grand_total" && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                  </TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations?.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{new Date(quotation.created_at).toLocaleDateString()}</div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          {getRequirementIcon(quotation.requirement_source)}
                          <span className="capitalize">{quotation.requirement_source}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{quotation.customers?.name || 'N/A'}</div>
                        {quotation.concerned_person && (
                          <div className="text-sm text-muted-foreground">{quotation.concerned_person}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {quotation.quotation_items?.slice(0, 2).map((item: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            {item.materials?.name || 'N/A'}
                          </div>
                        ))}
                        {quotation.quotation_items?.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{quotation.quotation_items.length - 2} more
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusSelect 
                        quotationId={quotation.id} 
                        currentStatus={quotation.status} 
                        compact={false}
                      />
                    </TableCell>
                    <TableCell>
                      <ReminderManagement quotationId={quotation.id} />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{formatCurrency(quotation.grand_total || 0)}</div>
                        {quotation.valid_until && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Valid till {new Date(quotation.valid_until).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(quotation.grand_total || 0)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
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
          </div>
        </CardContent>
      </Card>

      {/* Product Selection Modal */}
      <ProductSelectionModal
        open={isProductSelectionOpen}
        onOpenChange={setIsProductSelectionOpen}
        materials={materials || []}
        onSelectMaterial={(material) => {
          const newItem = {
            material_id: material.id,
            quantity: "1",
            unit_price: material.base_price?.toString() || "0",
            line_total: material.base_price?.toString() || "0",
            notes: ""
          };
          setQuotationItems([...quotationItems, newItem]);
          setIsProductSelectionOpen(false);
        }}
      />

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quotation Preview</DialogTitle>
            <DialogDescription>
              Preview of Quotation {previewQuotation?.quotation_number}
            </DialogDescription>
          </DialogHeader>
          
          {previewQuotation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Customer Details</h3>
                  <p>{previewQuotation.customers?.name}</p>
                  <p>{previewQuotation.concerned_person}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Quotation Details</h3>
                  <p>Number: {previewQuotation.quotation_number}</p>
                  <p>Date: {new Date(previewQuotation.created_at).toLocaleDateString()}</p>
                  <p>Status: <StatusSelect quotationId={previewQuotation.id} currentStatus={previewQuotation.status} compact={true} /></p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewQuotation.quotation_items?.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.materials?.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell>{formatCurrency(item.line_total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(previewQuotation.total_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(previewQuotation.tax_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Charges:</span>
                    <span>
                      {formatCurrency(
                        (previewQuotation.freight_charges || 0) +
                        (previewQuotation.handling_charges || 0) +
                        (previewQuotation.packing_charges || 0)
                      )}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(previewQuotation.grand_total || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  Close
                </Button>
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