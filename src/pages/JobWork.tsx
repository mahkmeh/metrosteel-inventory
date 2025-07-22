import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Package, ArrowLeft, ArrowRight, Edit, AlertTriangle, CheckCircle, Clock, Plus, Search, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { KpiCard } from "@/components/KpiCard";
import { JobWorkFilters } from "@/components/JobWorkFilters";
import { JobWorkEditModal } from "@/components/JobWorkEditModal";
import { ProductSelectionModal } from "@/components/ProductSelectionModal";
import { InwardTab } from "@/components/JobWork/InwardTab";
import { OutwardTab } from "@/components/JobWork/OutwardTab";
import { ContractorsTab } from "@/components/JobWork/ContractorsTab";
import { useJobWorkTransformations } from "@/hooks/useJobWorkTransformations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const JobWork = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("inward");
  const [activeView, setActiveView] = useState<"dashboard" | "outward" | "inward">("dashboard");
  
  // Fetch real data from Supabase
  const { data: jobWorkTransformations = [], isLoading } = useJobWorkTransformations();
  
  // Fetch materials data for product selection
  const { data: materials = [] } = useQuery({
    queryKey: ["materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .eq("is_active", true);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [overdueFilter, setOverdueFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dcDate");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingJobWork, setEditingJobWork] = useState<any>(null);
  const [editingJobWorkId, setEditingJobWorkId] = useState<string | null>(null);

  // Transform job work data to match the expected format
  const transformedJobWorkData = useMemo(() => {
    return jobWorkTransformations.map(transformation => {
      const sentDate = new Date(transformation.sent_date);
      const expectedDate = transformation.expected_return_date ? new Date(transformation.expected_return_date) : new Date();
      const today = new Date();
      const overDueDays = Math.max(0, Math.floor((today.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      return {
        id: transformation.job_work_number,
        dcDate: transformation.sent_date,
        vendorName: transformation.contractor?.name || 'Unknown Contractor',
        materialDetails: `${transformation.input_sku?.name || 'Unknown Material'} - ${transformation.process_description || 'Processing'}`,
        status: transformation.status,
        expectedDate: transformation.expected_return_date || transformation.sent_date,
        overDueDays,
        vendorAddress: '',
        contactPerson: transformation.contractor?.contact_person || '',
        contactNumber: '',
        notes: transformation.process_description || ''
      };
    });
  }, [jobWorkTransformations]);

  // Filter and search logic
  const filteredAndSortedData = useMemo(() => {
    let filtered = transformedJobWorkData.filter(jobWork => {
      const matchesSearch = searchTerm === "" || 
        jobWork.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jobWork.materialDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jobWork.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || jobWork.status === statusFilter;
      
      const matchesOverdue = overdueFilter === "all" || 
        (overdueFilter === "yes" && jobWork.overDueDays > 0) ||
        (overdueFilter === "no" && jobWork.overDueDays === 0);
      
      const jobWorkDate = new Date(jobWork.dcDate);
      const matchesDateRange = !dateRange.from || !dateRange.to ||
        (jobWorkDate >= dateRange.from && jobWorkDate <= dateRange.to);
      
      return matchesSearch && matchesStatus && matchesOverdue && matchesDateRange;
    });

    // Sort the filtered data
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "dcDate":
          return new Date(b.dcDate).getTime() - new Date(a.dcDate).getTime();
        case "expectedDate":
          return new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime();
        case "vendorName":
          return a.vendorName.localeCompare(b.vendorName);
        case "overdueDays":
          return b.overDueDays - a.overDueDays;
        default:
          return 0;
      }
    });

    return filtered;
  }, [transformedJobWorkData, searchTerm, statusFilter, overdueFilter, sortBy, dateRange]);

  // KPI calculations
  const kpiData = useMemo(() => {
    const overdueJobs = transformedJobWorkData.filter(job => job.overDueDays > 0).length;
    const readyToDispatch = transformedJobWorkData.filter(job => job.status === "ready_to_dispatch").length;
    const qualityIssues = transformedJobWorkData.filter(job => job.status === "quality_issues").length;
    
    return { overdueJobs, readyToDispatch, qualityIssues };
  }, [transformedJobWorkData]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setOverdueFilter("all");
    setSortBy("dcDate");
    setDateRange({});
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      yet_to_start: { variant: "secondary" as const, label: "Yet to Start" },
      under_process: { variant: "default" as const, label: "Under Process" },
      ready_to_dispatch: { variant: "success" as const, label: "Ready to Dispatch" },
      quality_issues: { variant: "destructive" as const, label: "Quality Issues" },
      machine_under_repair: { variant: "warning" as const, label: "Machine Under Repair" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.yet_to_start;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const handleStatusUpdate = (jobWorkId: string, newStatus: string) => {
    // This will be updated when we implement real status updates to the database
    toast({
      title: "Status Update",
      description: `Status updated to ${newStatus}`,
    });
    setEditingJobWorkId(null);
  };

  const handleEditJobWork = (jobWork: any) => {
    setEditingJobWork(jobWork);
    setEditModalOpen(true);
  };

  const handleSaveJobWork = (updatedJobWork: any) => {
    // This will be updated when we implement real job work updates to the database
    toast({
      title: "Job Work Updated",
      description: "Job work details have been updated",
    });
  };

  const formatMaterialDetails = (details: string) => {
    const items = details.split(', ');
    if (items.length <= 1) {
      return <span className="text-sm">{details}</span>;
    }
    
    return (
      <div className="text-sm">
        <div>{items[0]}</div>
        {items.length > 1 && (
          <div className="text-xs text-muted-foreground mt-1">
            +{items.length - 1} more item{items.length > 2 ? 's' : ''}
          </div>
        )}
      </div>
    );
  };

  const [outwardForm, setOutwardForm] = useState({
    challanNumber: "",
    contractorName: "",
    contractorAddress: "",
    concernedPerson: "",
    contactNumber: "",
    expectedDelivery: undefined as Date | undefined,
    isForCustomerOrder: false,
    salesOrderId: "",
    woodPallet: false,
    paletteCount: 0,
    items: [{
      materialId: "",
      materialName: "",
      sku: "",
      batchNumber: "",
      quantity: 0,
      currentStock: 0,
      basePrice: 0,
      jobworkDetails: ""
    }]
  });

  const [inwardForm, setInwardForm] = useState({
    outwardChallanNumber: "",
    vendorInvoiceNumber: "",
    items: [{
      originalSku: "",
      newQuantity: 0,
      newSku: "",
      newBatchNumber: "",
      qualityChecked: false,
      newBasePrice: 0,
      wastageQuantity: 0,
      scrapQuantity: 0
    }]
  });

  // Product selection modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [quickSearchTerm, setQuickSearchTerm] = useState("");

  const handleSelectMaterial = (material: any) => {
    const newItem = {
      materialId: material.id,
      materialName: material.name,
      sku: material.sku,
      batchNumber: material.batch_no || "",
      quantity: 0,
      currentStock: 100, // Mock stock value
      basePrice: material.base_price,
      jobworkDetails: ""
    };

    setOutwardForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleQuickSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickSearchTerm.trim()) {
      const material = materials.find(m => 
        m.name.toLowerCase().includes(quickSearchTerm.toLowerCase()) ||
        m.sku.toLowerCase().includes(quickSearchTerm.toLowerCase())
      );
      
      if (material) {
        handleSelectMaterial(material);
        setQuickSearchTerm("");
      }
    }
  };

  const addOutwardItem = () => {
    setOutwardForm(prev => ({
      ...prev,
      items: [...prev.items, {
        materialId: "",
        materialName: "",
        sku: "",
        batchNumber: "",
        quantity: 0,
        currentStock: 0,
        basePrice: 0,
        jobworkDetails: ""
      }]
    }));
  };

  const removeOutwardItem = (index: number) => {
    setOutwardForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const addInwardItem = () => {
    setInwardForm(prev => ({
      ...prev,
      items: [...prev.items, {
        originalSku: "",
        newQuantity: 0,
        newSku: "",
        newBatchNumber: "",
        qualityChecked: false,
        newBasePrice: 0,
        wastageQuantity: 0,
        scrapQuantity: 0
      }]
    }));
  };

  const [isSubmittingOutward, setIsSubmittingOutward] = React.useState(false);

  const handleSubmitOutward = async () => {
    try {
      setIsSubmittingOutward(true);

      // Validation
      if (!outwardForm.challanNumber) {
        toast({
          title: "Validation Error",
          description: "Challan Number is required",
          variant: "destructive",
        });
        return;
      }

      if (!outwardForm.expectedDelivery) {
        toast({
          title: "Validation Error", 
          description: "Expected Delivery Date is required",
          variant: "destructive",
        });
        return;
      }

      if (!outwardForm.contractorName) {
        toast({
          title: "Validation Error",
          description: "Contractor Name is required", 
          variant: "destructive",
        });
        return;
      }

      if (outwardForm.items.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one material item is required",
          variant: "destructive",
        });
        return;
      }

      // Validate each item
      for (let i = 0; i < outwardForm.items.length; i++) {
        const item = outwardForm.items[i];
        if (!item.materialName || !item.sku || !item.quantity || !item.jobworkDetails) {
          toast({
            title: "Validation Error",
            description: `Item ${i + 1}: All fields are required`,
            variant: "destructive",
          });
          return;
        }
        
        if (item.quantity > item.currentStock) {
          toast({
            title: "Validation Error",
            description: `Item ${i + 1}: Quantity exceeds current stock (${item.currentStock})`,
            variant: "destructive",
          });
          return;
        }
      }

      // Simulate API call (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success feedback
      toast({
        title: "Success",
        description: "Outward entry submitted successfully",
      });

      // Reset form
      setOutwardForm({
        challanNumber: "",
        contractorName: "",
        contractorAddress: "",
        concernedPerson: "",
        contactNumber: "",
        expectedDelivery: undefined,
        isForCustomerOrder: false,
        salesOrderId: "",
        woodPallet: false,
        paletteCount: 0,
        items: []
      });

      // Navigate back to dashboard
      setActiveView("dashboard");
      setActiveTab("inward");

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit outward entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingOutward(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Job Work Management</h1>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Overdue Jobs"
          value={kpiData.overdueJobs}
          subtitle="Jobs past expected date"
          status="critical"
          icon={AlertTriangle}
          actionLabel="View Overdue"
          onAction={() => {
            setOverdueFilter("yes");
          }}
          details={`${kpiData.overdueJobs} jobs need immediate attention`}
        />
        <KpiCard
          title="Ready to Dispatch"
          value={kpiData.readyToDispatch}
          subtitle="Completed jobs ready"
          status="good"
          icon={CheckCircle}
          actionLabel="View Ready"
          onAction={() => {
            setStatusFilter("ready_to_dispatch");
          }}
          details={`${kpiData.readyToDispatch} jobs completed and ready`}
        />
        <KpiCard
          title="Quality Issues"
          value={kpiData.qualityIssues}
          subtitle="Jobs with quality problems"
          status="warning"
          icon={Clock}
          actionLabel="View Issues"
          onAction={() => {
            setStatusFilter("quality_issues");
          }}
          details={`${kpiData.qualityIssues} jobs require rework`}
        />
      </div>
      
      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView("outward")}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowRight className="h-5 w-5 text-primary" />
              Outward Job Work
            </CardTitle>
            <CardDescription className="text-sm">
              Send materials to contractors for processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setActiveView("outward")}>
              Create Outward Entry
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView("inward")}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowLeft className="h-5 w-5 text-primary" />
              Inward Job Work
            </CardTitle>
            <CardDescription className="text-sm">
              Receive processed materials from contractors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setActiveView("inward")}>
              Create Inward Entry
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <JobWorkFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        overdueFilter={overdueFilter}
        onOverdueFilterChange={setOverdueFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onClearFilters={clearFilters}
      />

      {/* Job Work Status Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Job Work Status ({filteredAndSortedData.length})
          </CardTitle>
          <CardDescription className="text-sm">
            Track the status of materials sent to vendors for processing
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="text-xs font-medium px-2 sm:px-4">DC Date</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Vendor</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4 min-w-[200px]">Material Details</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Status</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Expected</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Overdue</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4 w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.map((jobWork) => (
                  <TableRow key={jobWork.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-xs px-2 sm:px-4 py-2">
                      {formatDate(jobWork.dcDate)}
                    </TableCell>
                    <TableCell className="text-xs px-2 sm:px-4 py-2">
                      <div>
                        <div className="font-medium">{jobWork.vendorName}</div>
                        <div className="text-muted-foreground text-xs">{jobWork.id}</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      {formatMaterialDetails(jobWork.materialDetails)}
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      {editingJobWorkId === jobWork.id ? (
                        <Select
                          defaultValue={jobWork.status}
                          onValueChange={(value) => handleStatusUpdate(jobWork.id, value)}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yet_to_start">Yet to Start</SelectItem>
                            <SelectItem value="under_process">Under Process</SelectItem>
                            <SelectItem value="ready_to_dispatch">Ready to Dispatch</SelectItem>
                            <SelectItem value="quality_issues">Quality Issues</SelectItem>
                            <SelectItem value="machine_under_repair">Machine Under Repair</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div
                          className="cursor-pointer"
                          onClick={() => setEditingJobWorkId(jobWork.id)}
                        >
                          {getStatusBadge(jobWork.status)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs px-2 sm:px-4 py-2">{formatDate(jobWork.expectedDate)}</TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      {jobWork.overDueDays > 0 ? (
                        <Badge variant="destructive" className="text-xs px-1 py-0">
                          {jobWork.overDueDays}d
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditJobWork(jobWork)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAndSortedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No job work entries found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <JobWorkEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        jobWork={editingJobWork}
        onSave={handleSaveJobWork}
      />
    </div>
  );

  const renderOutwardForm = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setActiveView("dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Outward Job Work</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Row 1: Challan Number | Contractor Name | Expected Delivery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="challan" className="text-sm">Delivery Challan Number</Label>
              <Input
                id="challan"
                value={outwardForm.challanNumber}
                onChange={(e) => setOutwardForm(prev => ({ ...prev, challanNumber: e.target.value }))}
                placeholder="Enter challan number"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="contractor" className="text-sm">Contractor Name</Label>
              <Input
                id="contractor"
                value={outwardForm.contractorName}
                onChange={(e) => setOutwardForm(prev => ({ ...prev, contractorName: e.target.value }))}
                placeholder="Enter contractor name"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm">Expected Delivery Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !outwardForm.expectedDelivery && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {outwardForm.expectedDelivery ? (
                      format(outwardForm.expectedDelivery, "PPP")
                    ) : (
                      <span>Pick expected delivery date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={outwardForm.expectedDelivery}
                    onSelect={(date) => setOutwardForm(prev => ({ ...prev, expectedDelivery: date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Row 2: Contractor Address */}
          <div>
            <Label htmlFor="address" className="text-sm">Contractor Address</Label>
            <Textarea
              id="address"
              value={outwardForm.contractorAddress}
              onChange={(e) => setOutwardForm(prev => ({ ...prev, contractorAddress: e.target.value }))}
              placeholder="Enter contractor address"
              className="mt-1 min-h-[60px]"
            />
          </div>

          {/* Row 3: Concerned Person | Contact Number | Customer Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="person" className="text-sm">Concerned Person</Label>
              <Input
                id="person"
                value={outwardForm.concernedPerson}
                onChange={(e) => setOutwardForm(prev => ({ ...prev, concernedPerson: e.target.value }))}
                placeholder="Enter concerned person name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="contact" className="text-sm">Contact Number</Label>
              <Input
                id="contact"
                value={outwardForm.contactNumber}
                onChange={(e) => setOutwardForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                placeholder="Enter contact number"
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="customerOrder"
                checked={outwardForm.isForCustomerOrder}
                onCheckedChange={(checked) => setOutwardForm(prev => ({ ...prev, isForCustomerOrder: !!checked }))}
              />
              <Label htmlFor="customerOrder" className="text-sm">Is this for customer's order?</Label>
            </div>
          </div>

          {/* Conditional Sales Order Selection */}
          {outwardForm.isForCustomerOrder && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="salesOrder" className="text-sm">Link to Sales Order</Label>
                <Select
                  value={outwardForm.salesOrderId}
                  onValueChange={(value) => setOutwardForm(prev => ({ ...prev, salesOrderId: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select sales order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SO001">SO001 - Customer A</SelectItem>
                    <SelectItem value="SO002">SO002 - Customer B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Wood Pallet Section */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="woodPallet"
                checked={outwardForm.woodPallet}
                onCheckedChange={(checked) => setOutwardForm(prev => ({ ...prev, woodPallet: !!checked }))}
              />
              <Label htmlFor="woodPallet" className="text-sm">Did you send wood pallet?</Label>
            </div>

            {outwardForm.woodPallet && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="paletteCount" className="text-sm">Number of Pallets</Label>
                  <Input
                    id="paletteCount"
                    type="number"
                    value={outwardForm.paletteCount}
                    onChange={(e) => setOutwardForm(prev => ({ ...prev, paletteCount: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter number of pallets"
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Material Details</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProductModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Browse Products
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={addOutwardItem}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Quick add: Type product name or SKU and press Enter..."
              value={quickSearchTerm}
              onChange={(e) => setQuickSearchTerm(e.target.value)}
              onKeyDown={handleQuickSearch}
              className="pl-10"
            />
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {outwardForm.items.map((item, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Item {index + 1}</h4>
                  {outwardForm.items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOutwardItem(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {/* Top Row: Material Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-sm">Material Name</Label>
                    <Input
                      value={item.materialName}
                      onChange={(e) => {
                        const newItems = [...outwardForm.items];
                        newItems[index].materialName = e.target.value;
                        setOutwardForm(prev => ({ ...prev, items: newItems }));
                      }}
                      placeholder="Enter material name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">SKU</Label>
                    <Input
                      value={item.sku}
                      onChange={(e) => {
                        const newItems = [...outwardForm.items];
                        newItems[index].sku = e.target.value;
                        setOutwardForm(prev => ({ ...prev, items: newItems }));
                      }}
                      placeholder="Enter SKU"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm">Batch Number</Label>
                    <Input
                      value={item.batchNumber}
                      onChange={(e) => {
                        const newItems = [...outwardForm.items];
                        newItems[index].batchNumber = e.target.value;
                        setOutwardForm(prev => ({ ...prev, items: newItems }));
                      }}
                      placeholder="Enter batch number"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Bottom Row: Quantities and Job Work */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-sm">Quantity (Stock: {item.currentStock})</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...outwardForm.items];
                        newItems[index].quantity = parseFloat(e.target.value) || 0;
                        setOutwardForm(prev => ({ ...prev, items: newItems }));
                      }}
                      placeholder="Enter quantity"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Base Price</Label>
                    <Input
                      type="number"
                      value={item.basePrice}
                      onChange={(e) => {
                        const newItems = [...outwardForm.items];
                        newItems[index].basePrice = parseFloat(e.target.value) || 0;
                        setOutwardForm(prev => ({ ...prev, items: newItems }));
                      }}
                      placeholder="Base price"
                      readOnly
                      className="bg-muted mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm">Job Work Details</Label>
                    <Input
                      value={item.jobworkDetails}
                      onChange={(e) => {
                        const newItems = [...outwardForm.items];
                        newItems[index].jobworkDetails = e.target.value;
                        setOutwardForm(prev => ({ ...prev, items: newItems }));
                      }}
                      placeholder="Enter job work details"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" onClick={() => setActiveView("dashboard")}>
          Cancel
        </Button>
        <Button onClick={handleSubmitOutward} disabled={isSubmittingOutward}>
          {isSubmittingOutward ? "Submitting..." : "Submit Outward Entry"}
        </Button>
      </div>

      {/* Product Selection Modal */}
      <ProductSelectionModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        materials={materials}
        onSelectMaterial={handleSelectMaterial}
      />
    </div>
  );

  const renderInwardForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setActiveView("dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Inward Job Work</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reference Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="outwardChallan">Our Delivery Challan Number</Label>
              <Select
                value={inwardForm.outwardChallanNumber}
                onValueChange={(value) => setInwardForm(prev => ({ ...prev, outwardChallanNumber: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outward challan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CH001">CH001 - Contractor A</SelectItem>
                  <SelectItem value="CH002">CH002 - Contractor B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="vendorInvoice">Vendor's Invoice Number</Label>
              <Input
                id="vendorInvoice"
                value={inwardForm.vendorInvoiceNumber}
                onChange={(e) => setInwardForm(prev => ({ ...prev, vendorInvoiceNumber: e.target.value }))}
                placeholder="Enter vendor invoice number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Received Items</CardTitle>
        </CardHeader>
        <CardContent>
          {inwardForm.items.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4 mb-4">
              <h4 className="font-semibold">Item {index + 1}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Original SKU</Label>
                  <Input
                    value={item.originalSku}
                    onChange={(e) => {
                      const newItems = [...inwardForm.items];
                      newItems[index].originalSku = e.target.value;
                      setInwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Original SKU"
                    readOnly
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label>New Quantity Received</Label>
                  <Input
                    type="number"
                    value={item.newQuantity}
                    onChange={(e) => {
                      const newItems = [...inwardForm.items];
                      newItems[index].newQuantity = parseFloat(e.target.value) || 0;
                      setInwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Enter received quantity"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>New SKU</Label>
                  <Input
                    value={item.newSku}
                    onChange={(e) => {
                      const newItems = [...inwardForm.items];
                      newItems[index].newSku = e.target.value;
                      setInwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Enter new SKU"
                  />
                </div>
                
                <div>
                  <Label>New Batch Number</Label>
                  <Input
                    value={item.newBatchNumber}
                    onChange={(e) => {
                      const newItems = [...inwardForm.items];
                      newItems[index].newBatchNumber = e.target.value;
                      setInwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Enter new batch number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>New Base Price</Label>
                  <Input
                    type="number"
                    value={item.newBasePrice}
                    onChange={(e) => {
                      const newItems = [...inwardForm.items];
                      newItems[index].newBasePrice = parseFloat(e.target.value) || 0;
                      setInwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Enter new base price"
                  />
                </div>
                
                <div>
                  <Label>Wastage Quantity</Label>
                  <Input
                    type="number"
                    value={item.wastageQuantity}
                    onChange={(e) => {
                      const newItems = [...inwardForm.items];
                      newItems[index].wastageQuantity = parseFloat(e.target.value) || 0;
                      setInwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Wastage quantity"
                  />
                </div>
                
                <div>
                  <Label>Scrap Quantity</Label>
                  <Input
                    type="number"
                    value={item.scrapQuantity}
                    onChange={(e) => {
                      const newItems = [...inwardForm.items];
                      newItems[index].scrapQuantity = parseFloat(e.target.value) || 0;
                      setInwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Scrap quantity"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`quality-${index}`}
                  checked={item.qualityChecked}
                  onCheckedChange={(checked) => {
                    const newItems = [...inwardForm.items];
                    newItems[index].qualityChecked = !!checked;
                    setInwardForm(prev => ({ ...prev, items: newItems }));
                  }}
                />
                <Label htmlFor={`quality-${index}`}>Quality Checked</Label>
              </div>
            </div>
          ))}
          
          <Button type="button" variant="outline" onClick={addInwardItem}>
            Add Another Item
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setActiveView("dashboard")}>
          Cancel
        </Button>
        <Button>
          Submit Inward Entry & Update Inventory
        </Button>
      </div>
    </div>
  );

  if (activeView === "outward") {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        {renderOutwardForm()}
      </div>
    );
  }

  if (activeView === "inward") {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        {renderInwardForm()}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Job Work Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inward">Inward</TabsTrigger>
          <TabsTrigger value="outward">Outward</TabsTrigger>
          <TabsTrigger value="contractors">Contractors</TabsTrigger>
        </TabsList>

        <TabsContent value="inward" className="space-y-6">
          <InwardTab onCreateInward={() => setActiveView("inward")} />
        </TabsContent>

        <TabsContent value="outward" className="space-y-6">
          <OutwardTab onCreateOutward={() => setActiveView("outward")} />
        </TabsContent>

        <TabsContent value="contractors" className="space-y-6">
          <ContractorsTab 
            onAddContractor={() => console.log("Add new contractor clicked")} 
            onEditContractor={(contractorId) => console.log("Edit contractor:", contractorId)}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <JobWorkEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        jobWork={editingJobWork}
        onSave={handleSaveJobWork}
      />

      <ProductSelectionModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        materials={materials}
        onSelectMaterial={handleSelectMaterial}
      />
    </div>
  );
};

export default JobWork;
