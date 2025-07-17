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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, ArrowUpDown, Download, Eye, Mail, MessageCircle, MapPin, AlertTriangle, Trash2, ChevronDown, Calculator, Search, Package, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductSelectionModal } from "@/components/ProductSelectionModal";

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
        .select("id, name, sku, base_price, batch_no, category, grade")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

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
    setShowAdvanced(false);
    setEditingQuotation(null);
    setIsDialogOpen(false);
    setProductSearch("");
  };

  const calculateTotals = () => {
    // Calculate total from items
    const itemsTotal = quotationItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    
    // Calculate tax (18% GST)
    const tax = itemsTotal * 0.18;
    
    const handling = parseFloat(formData.handling_charges) || 0;
    const freight = parseFloat(formData.freight_charges) || 0;
    const packing = parseFloat(formData.packing_charges) || 0;
    
    const grandTotal = itemsTotal + tax + handling + freight + packing;
    
    setFormData(prev => ({ 
      ...prev, 
      total_amount: itemsTotal.toString(),
      tax_amount: tax.toString(),
      grand_total: grandTotal.toString() 
    }));
  };

  const addQuotationItem = () => {
    setQuotationItems([...quotationItems, {
      id: Date.now(),
      material_id: "",
      material_name: "",
      quantity: 1,
      unit_price: 0,
      delivery_time: "ready_stock",
      notes: ""
    }]);
  };

  const createQuickMaterial = async () => {
    try {
      const { data, error } = await supabase
        .from("materials")
        .insert([{
          name: quickAddData.name,
          category: quickAddData.category,
          grade: quickAddData.grade,
          sku: quickAddData.sku,
          base_price: parseFloat(quickAddData.base_price) || 0
        }])
        .select()
        .single();

      if (error) throw error;

      // Add the new material to quotation items
      setQuotationItems([...quotationItems, {
        id: Date.now(),
        material_id: data.id,
        material_name: data.name,
        quantity: 1,
        unit_price: data.base_price || 0,
        delivery_time: "ready_stock",
        notes: ""
      }]);

      // Reset quick add form
      setQuickAddData({
        name: "",
        category: "",
        grade: "",
        sku: "",
        base_price: ""
      });
      setIsQuickAddOpen(false);
      
      // Refresh materials list
      queryClient.invalidateQueries({ queryKey: ["materials-list"] });

      toast({
        title: "Success",
        description: "Material created and added to quotation",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to create material: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const updateQuotationItem = (index: number, field: string, value: any) => {
    const updatedItems = [...quotationItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // If material is selected, update the name and price
    if (field === "material_id" && materials) {
      const material = materials.find(m => m.id === value);
      if (material) {
        updatedItems[index].material_name = material.name;
        updatedItems[index].unit_price = material.base_price || 0;
      }
    }
    
    setQuotationItems(updatedItems);
    setTimeout(calculateTotals, 0); // Recalculate totals after state update
  };

  const getDeliveryBadge = (deliveryTime: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", text: string }> = {
      ready_stock: { variant: "default", text: "Ready in Stock" },
      "3_5_days": { variant: "secondary", text: "3-5 Days" },
      "5_8_days": { variant: "outline", text: "5-8 Days" },
      material_transit: { variant: "destructive", text: "Material in Transit" },
    };
    const config = variants[deliveryTime] || variants.ready_stock;
    return <Badge variant={config.variant} className="text-xs">{config.text}</Badge>;
  };

  const removeQuotationItem = (index: number) => {
    const updatedItems = quotationItems.filter((_, i) => i !== index);
    setQuotationItems(updatedItems);
    setTimeout(calculateTotals, 0);
  };

  const toggleCharge = (chargeType: string, defaultValue: number) => {
    const currentValue = parseFloat(formData[chargeType as keyof typeof formData] as string) || 0;
    const newValue = currentValue > 0 ? 0 : defaultValue;
    setFormData(prev => ({ ...prev, [chargeType]: newValue.toString() }));
    setTimeout(calculateTotals, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateTotals();
    
    // Generate quotation number if not provided
    const quotationNumber = formData.quotation_number || `QT-${Date.now()}`;
    
    createQuotationMutation.mutate({
      ...formData,
      quotation_number: quotationNumber,
      total_amount: parseFloat(formData.total_amount) || 0,
      tax_amount: parseFloat(formData.tax_amount) || 0,
      handling_charges: parseFloat(formData.handling_charges) || 0,
      freight_charges: parseFloat(formData.freight_charges) || 0,
      packing_charges: parseFloat(formData.packing_charges) || 0,
      grand_total: parseFloat(formData.grand_total) || 0,
      valid_until: formData.valid_until || null, // Fix date issue
    });
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
            <DialogContent className="sm:max-w-[1000px] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingQuotation ? "Edit Quotation" : "Quick Quotation"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Essential Fields Section */}
              <div className="grid grid-cols-4 gap-3 p-3 border rounded-lg bg-muted/20">
                <div>
                  <Label htmlFor="quotation_number" className="text-xs">Quotation Number</Label>
                  <Input
                    id="quotation_number"
                    className="h-8 text-sm"
                    placeholder="Auto-generated"
                    value={formData.quotation_number}
                    onChange={(e) => setFormData({ ...formData, quotation_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="customer_id" className="text-xs">Customer *</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                    required
                  >
                    <SelectTrigger className="h-8 text-sm">
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
                  <Label htmlFor="concerned_person" className="text-xs">Contact Person</Label>
                  <Input
                    id="concerned_person"
                    className="h-8 text-sm"
                    placeholder="Contact name"
                    value={formData.concerned_person}
                    onChange={(e) => setFormData({ ...formData, concerned_person: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="customer_need" className="text-xs">Customer Need</Label>
                  <Select
                    value={formData.customer_need}
                    onValueChange={(value) => setFormData({ ...formData, customer_need: value })}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="for_quotation">For Quotation</SelectItem>
                      <SelectItem value="1_2_days">1-2 Days</SelectItem>
                      <SelectItem value="sos">SOS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-4">
                  <Label className="text-xs">Source</Label>
                  <div className="flex gap-1 mt-1">
                    <Button
                      type="button"
                      variant={formData.requirement_source === "email" ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => setFormData({ ...formData, requirement_source: "email" })}
                    >
                      <Mail className="h-3 w-3 mr-1" />Email
                    </Button>
                    <Button
                      type="button"
                      variant={formData.requirement_source === "whatsapp" ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => setFormData({ ...formData, requirement_source: "whatsapp" })}
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />WhatsApp
                    </Button>
                    <Button
                      type="button"
                      variant={formData.requirement_source === "walk_in" ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => setFormData({ ...formData, requirement_source: "walk_in" })}
                    >
                      <MapPin className="h-3 w-3 mr-1" />Walk-in
                    </Button>
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Products</Label>
                  <div className="flex gap-2">
                    <Button type="button" onClick={() => setIsProductSelectionOpen(true)} variant="outline" size="sm" className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" />Add Product
                    </Button>
                    <Button type="button" onClick={() => setIsQuickAddOpen(true)} variant="outline" size="sm" className="h-7 text-xs">
                      <Package className="h-3 w-3 mr-1" />Quick Add
                    </Button>
                  </div>
                </div>

                {/* Enhanced Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by SKU, product name, or batch code..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-10 h-9"
                  />
                  {productSearch && filteredMaterials.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredMaterials.slice(0, 5).map((material) => (
                        <div
                          key={material.id}
                          className="p-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                          onClick={() => {
                            const newItem = {
                              id: Date.now(),
                              material_id: material.id,
                              material_name: material.name,
                              quantity: 1,
                              unit_price: material.base_price || 0,
                              delivery_time: "ready_stock",
                              notes: ""
                            };
                            setQuotationItems([...quotationItems, newItem]);
                            setProductSearch("");
                            setTimeout(calculateTotals, 0);
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{material.name}</span>
                            <span className="text-xs text-muted-foreground">
                              SKU: {material.sku} {material.batch_no && ` | Batch: ${material.batch_no}`} | ₹{material.base_price || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {quotationItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No products added yet. Click "Add Product" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Compact Header Row */}
                    <div className="grid grid-cols-12 gap-2 px-2 py-1 bg-muted/30 rounded text-xs font-medium text-muted-foreground">
                      <div className="col-span-5">Product</div>
                      <div className="col-span-1 text-center">Qty</div>
                      <div className="col-span-2 text-right">Rate</div>
                      <div className="col-span-2 text-right">Total</div>
                      <div className="col-span-1 text-center">Delivery</div>
                      <div className="col-span-1 text-center"></div>
                    </div>

                    {quotationItems.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 p-2 border rounded bg-card hover:bg-muted/20 transition-colors">
                        <div className="col-span-5">
                          <Select
                            value={item.material_id}
                            onValueChange={(value) => updateQuotationItem(index, "material_id", value)}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Select SKU..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                              {(productSearch ? filteredMaterials : materials || []).map((material) => (
                                <SelectItem key={material.id} value={material.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-sm">{material.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      SKU: {material.sku} {material.batch_no && ` | Batch: ${material.batch_no}`} | ₹{material.base_price || 0}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="number"
                            placeholder="Qty"
                            className="h-8 text-center text-sm"
                            value={item.quantity}
                            onChange={(e) => updateQuotationItem(index, "quantity", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Price"
                            className="h-8 text-right text-sm"
                            value={item.unit_price}
                            onChange={(e) => updateQuotationItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-2">
                          <div className="h-8 flex items-center justify-end px-2 bg-muted/30 rounded text-sm font-medium">
                            ₹{(item.quantity * item.unit_price).toLocaleString()}
                          </div>
                        </div>
                        <div className="col-span-1">
                          <Select
                            value={item.delivery_time || "ready_stock"}
                            onValueChange={(value) => updateQuotationItem(index, "delivery_time", value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ready_stock">Stock</SelectItem>
                              <SelectItem value="3_5_days">3-5d</SelectItem>
                              <SelectItem value="5_8_days">5-8d</SelectItem>
                              <SelectItem value="material_transit">Transit</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeQuotationItem(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Compact Financial Summary */}
              <div className="p-3 border rounded-lg bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold">Financial Summary</Label>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant={parseFloat(formData.tax_amount) > 0 ? "default" : "outline"}
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => toggleCharge("tax_amount", (parseFloat(formData.total_amount) || 0) * 0.18)}
                    >
                      GST 18%
                    </Button>
                    <Button
                      type="button"
                      variant={parseFloat(formData.freight_charges) > 0 ? "default" : "outline"}
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => toggleCharge("freight_charges", 500)}
                    >
                      Freight ₹500
                    </Button>
                    <Button
                      type="button"
                      variant={parseFloat(formData.handling_charges) > 0 ? "default" : "outline"}
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => toggleCharge("handling_charges", 200)}
                    >
                      Handling ₹200
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div className="bg-background/50 p-2 rounded">
                    <Label className="text-xs text-muted-foreground">Base Amount</Label>
                    <div className="font-semibold text-sm">₹{parseFloat(formData.total_amount || "0").toLocaleString()}</div>
                  </div>
                  <div className="bg-background/50 p-2 rounded">
                    <Label className="text-xs text-muted-foreground">Tax (GST)</Label>
                    <div className="font-semibold text-sm">₹{parseFloat(formData.tax_amount || "0").toLocaleString()}</div>
                  </div>
                  <div className="bg-background/50 p-2 rounded">
                    <Label className="text-xs text-muted-foreground">Other Charges</Label>
                    <div className="font-semibold text-sm">
                      ₹{((parseFloat(formData.handling_charges || "0")) + 
                          (parseFloat(formData.freight_charges || "0")) + 
                          (parseFloat(formData.packing_charges || "0"))).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-primary/10 p-2 rounded border border-primary/20">
                    <Label className="text-xs text-muted-foreground">Grand Total</Label>
                    <div className="font-bold text-base">₹{parseFloat(formData.grand_total || "0").toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Advanced Options (Collapsible) */}
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button type="button" variant="ghost" className="w-full justify-between">
                    <span>Advanced Options</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="payment_terms">Payment Terms</Label>
                      <Select
                        value={formData.payment_terms}
                        onValueChange={(value) => setFormData({ ...formData, payment_terms: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select terms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="net_30">Net 30 days</SelectItem>
                          <SelectItem value="net_15">Net 15 days</SelectItem>
                          <SelectItem value="advance">100% Advance</SelectItem>
                          <SelectItem value="50_50">50% Advance, 50% on delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="handling_charges">Handling</Label>
                      <Input
                        id="handling_charges"
                        type="number"
                        placeholder="0"
                        value={formData.handling_charges}
                        onChange={(e) => { 
                          setFormData({ ...formData, handling_charges: e.target.value });
                          setTimeout(calculateTotals, 0);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="freight_charges">Freight</Label>
                      <Input
                        id="freight_charges"
                        type="number"
                        placeholder="0"
                        value={formData.freight_charges}
                        onChange={(e) => { 
                          setFormData({ ...formData, freight_charges: e.target.value });
                          setTimeout(calculateTotals, 0);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="packing_charges">Packing</Label>
                      <Input
                        id="packing_charges"
                        type="number"
                        placeholder="0"
                        value={formData.packing_charges}
                        onChange={(e) => { 
                          setFormData({ ...formData, packing_charges: e.target.value });
                          setTimeout(calculateTotals, 0);
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="terms_conditions">Terms & Conditions</Label>
                    <Textarea
                      id="terms_conditions"
                      placeholder="Standard terms and conditions apply..."
                      value={formData.terms_conditions}
                      onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                      rows={3}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsPreviewOpen(true)}>
                    <Eye className="h-4 w-4 mr-1" />Preview
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createQuotationMutation.isPending}>
                    {createQuotationMutation.isPending ? "Saving..." : editingQuotation ? "Update" : "Create"} Quotation
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Enhanced Quick Add Material Dialog */}
        <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Quick Add Material</DialogTitle>
              <DialogDescription>
                Add a new material with essential details - batch allocation can be done later in sales orders
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="quick_name" className="text-xs">Material Name *</Label>
                  <Input
                    id="quick_name"
                    className="h-8 text-sm"
                    placeholder="e.g., Steel Plate MS"
                    value={quickAddData.name}
                    onChange={(e) => setQuickAddData({ ...quickAddData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="quick_category" className="text-xs">Category *</Label>
                  <Select
                    value={quickAddData.category}
                    onValueChange={(value) => setQuickAddData({ ...quickAddData, category: value })}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sheet">Sheet</SelectItem>
                      <SelectItem value="plate">Plate</SelectItem>
                      <SelectItem value="pipe">Pipe</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="rod">Rod</SelectItem>
                      <SelectItem value="angle">Angle</SelectItem>
                      <SelectItem value="channel">Channel</SelectItem>
                      <SelectItem value="beam">Beam</SelectItem>
                      <SelectItem value="coil">Coil</SelectItem>
                      <SelectItem value="wire">Wire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="quick_grade" className="text-xs">Grade *</Label>
                  <Select
                    value={quickAddData.grade}
                    onValueChange={(value) => setQuickAddData({ ...quickAddData, grade: value })}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MS">MS</SelectItem>
                      <SelectItem value="SS304">SS304</SelectItem>
                      <SelectItem value="SS316">SS316</SelectItem>
                      <SelectItem value="IS2062">IS2062</SelectItem>
                      <SelectItem value="CORTEN">Corten</SelectItem>
                      <SelectItem value="HCHC">HCHC</SelectItem>
                      <SelectItem value="CRCA">CRCA</SelectItem>
                      <SelectItem value="HRCA">HRCA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quick_sku" className="text-xs">SKU *</Label>
                  <Input
                    id="quick_sku"
                    className="h-8 text-sm"
                    placeholder="Auto-generated"
                    value={quickAddData.sku}
                    onChange={(e) => setQuickAddData({ ...quickAddData, sku: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="quick_price" className="text-xs">Rate (₹/unit)</Label>
                  <Input
                    id="quick_price"
                    type="number"
                    className="h-8 text-sm"
                    placeholder="0"
                    value={quickAddData.base_price}
                    onChange={(e) => setQuickAddData({ ...quickAddData, base_price: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="p-2 bg-muted/30 rounded text-xs text-muted-foreground">
                <p><strong>Note:</strong> This creates a basic SKU entry. Batch numbers will be allocated when converting to sales orders for better inventory management.</p>
              </div>
              
              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsQuickAddOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="button"
                  size="sm"
                  onClick={createQuickMaterial}
                  disabled={!quickAddData.name || !quickAddData.category || !quickAddData.grade}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add to Quotation
                </Button>
              </div>
            </div>
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
                <TableHead>Need</TableHead>
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
                    <Badge variant="outline" className="text-xs">
                      {(() => {
                        const needMap: Record<string, string> = {
                          immediate: "Immediate",
                          for_quotation: "Quotation", 
                          "1_2_days": "1-2 Days",
                          sos: "SOS"
                        };
                        return needMap[quotation.customer_need || "for_quotation"] || "Quotation";
                      })()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRequirementIcon(quotation.requirement_source)}
                      <span className="capitalize text-xs">{quotation.requirement_source?.replace("_", "-") || "email"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(quotation.grand_total)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(quotation.grand_total)}</TableCell>
                  <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                  <TableCell className="text-xs">
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

      {/* Product Selection Modal */}
      <ProductSelectionModal
        open={isProductSelectionOpen}
        onOpenChange={setIsProductSelectionOpen}
        materials={materials || []}
        onSelectMaterial={(material) => {
          const newItem = {
            id: Date.now(),
            material_id: material.id,
            material_name: material.name,
            quantity: 1,
            unit_price: material.base_price || 0,
            delivery_time: "ready_stock",
            notes: ""
          };
          setQuotationItems([...quotationItems, newItem]);
          setTimeout(calculateTotals, 0);
        }}
      />

      {/* Quick Add Material Modal */}
      <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Quick Add Material</DialogTitle>
            <DialogDescription>
              Create a new material and add it to the quotation
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quick-name" className="text-right">
                Name
              </Label>
              <Input
                id="quick-name"
                className="col-span-3"
                value={quickAddData.name}
                onChange={(e) => setQuickAddData({ ...quickAddData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quick-category" className="text-right">
                Category
              </Label>
              <Input
                id="quick-category"
                className="col-span-3"
                value={quickAddData.category}
                onChange={(e) => setQuickAddData({ ...quickAddData, category: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quick-grade" className="text-right">
                Grade
              </Label>
              <Input
                id="quick-grade"
                className="col-span-3"
                value={quickAddData.grade}
                onChange={(e) => setQuickAddData({ ...quickAddData, grade: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quick-sku" className="text-right">
                SKU
              </Label>
              <Input
                id="quick-sku"
                className="col-span-3"
                value={quickAddData.sku}
                onChange={(e) => setQuickAddData({ ...quickAddData, sku: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quick-price" className="text-right">
                Price
              </Label>
              <Input
                id="quick-price"
                type="number"
                className="col-span-3"
                value={quickAddData.base_price}
                onChange={(e) => setQuickAddData({ ...quickAddData, base_price: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsQuickAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createQuickMaterial}>Create & Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Quotations;