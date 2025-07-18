import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Package, ArrowLeft, ArrowRight, Edit, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { KpiCard } from "@/components/KpiCard";
import { JobWorkFilters } from "@/components/JobWorkFilters";
import { JobWorkEditModal } from "@/components/JobWorkEditModal";

const JobWork = () => {
  const [activeView, setActiveView] = useState<"dashboard" | "outward" | "inward">("dashboard");
  
  // Mock data for job work entries
  const [mockJobWorkData, setMockJobWorkData] = useState([
    {
      id: "JW001",
      dcDate: "2025-01-15",
      vendorName: "Steel Fab Works",
      materialDetails: "MS Sheet 10mm - Cutting, SS Rod 12mm - Threading",
      status: "under_process",
      expectedDate: "2025-01-25",
      overDueDays: 0,
      vendorAddress: "Industrial Area, Phase 2, Sector 45",
      contactPerson: "Rajesh Kumar",
      contactNumber: "+91-9876543210",
      notes: "Priority job for customer order"
    },
    {
      id: "JW002", 
      dcDate: "2025-01-10",
      vendorName: "Precision Tools Ltd",
      materialDetails: "SS Rod 12mm - Threading",
      status: "ready_to_dispatch",
      expectedDate: "2025-01-20",
      overDueDays: 0,
      vendorAddress: "Main Road, Industrial Estate",
      contactPerson: "Suresh Patel",
      contactNumber: "+91-9876543211"
    },
    {
      id: "JW003",
      dcDate: "2025-01-05",
      vendorName: "Welding Solutions",
      materialDetails: "MS Plate 20mm - Welding, Aluminum Sheet - Bending, Cast Iron - Machining",
      status: "quality_issues",
      expectedDate: "2025-01-15",
      overDueDays: 3,
      vendorAddress: "Workshop Lane, Sector 12",
      contactPerson: "Amit Singh",
      contactNumber: "+91-9876543212"
    },
    {
      id: "JW004",
      dcDate: "2024-12-28",
      vendorName: "Heavy Industries",
      materialDetails: "Cast Iron - Machining",
      status: "machine_under_repair",
      expectedDate: "2025-01-08",
      overDueDays: 10,
      vendorAddress: "Heavy Industrial Complex",
      contactPerson: "Vikram Sharma",
      contactNumber: "+91-9876543213"
    },
    {
      id: "JW005",
      dcDate: "2025-01-12",
      vendorName: "Quick Process",
      materialDetails: "Aluminum Sheet - Bending, MS Sheet 8mm - Cutting",
      status: "yet_to_start",
      expectedDate: "2025-01-22",
      overDueDays: 0,
      vendorAddress: "Quick Processing Unit, Zone A",
      contactPerson: "Pradeep Gupta",
      contactNumber: "+91-9876543214"
    },
    {
      id: "JW006",
      dcDate: "2025-01-08",
      vendorName: "Metro Fabricators",
      materialDetails: "SS Pipe 25mm - Cutting, MS Angle - Welding",
      status: "ready_to_dispatch",
      expectedDate: "2025-01-18",
      overDueDays: 0,
      vendorAddress: "Metro Industrial Park",
      contactPerson: "Ravi Mehta",
      contactNumber: "+91-9876543215"
    },
    {
      id: "JW007",
      dcDate: "2024-12-30",
      vendorName: "Advanced Manufacturing",
      materialDetails: "Titanium Rod - Precision Machining",
      status: "quality_issues",
      expectedDate: "2025-01-10",
      overDueDays: 8,
      vendorAddress: "Advanced Tech Hub",
      contactPerson: "Dr. Ramesh",
      contactNumber: "+91-9876543216"
    }
  ]);

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

  // Filter and search logic
  const filteredAndSortedData = useMemo(() => {
    let filtered = mockJobWorkData.filter(jobWork => {
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
  }, [mockJobWorkData, searchTerm, statusFilter, overdueFilter, sortBy, dateRange]);

  // KPI calculations
  const kpiData = useMemo(() => {
    const overdueJobs = mockJobWorkData.filter(job => job.overDueDays > 0).length;
    const readyToDispatch = mockJobWorkData.filter(job => job.status === "ready_to_dispatch").length;
    const qualityIssues = mockJobWorkData.filter(job => job.status === "quality_issues").length;
    
    return { overdueJobs, readyToDispatch, qualityIssues };
  }, [mockJobWorkData]);

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
    setMockJobWorkData(prev => 
      prev.map(job => 
        job.id === jobWorkId ? { ...job, status: newStatus } : job
      )
    );
    setEditingJobWorkId(null);
  };

  const handleEditJobWork = (jobWork: any) => {
    setEditingJobWork(jobWork);
    setEditModalOpen(true);
  };

  const handleSaveJobWork = (updatedJobWork: any) => {
    setMockJobWorkData(prev => 
      prev.map(job => 
        job.id === updatedJobWork.id ? updatedJobWork : job
      )
    );
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

  const addOutwardItem = () => {
    setOutwardForm(prev => ({
      ...prev,
      items: [...prev.items, {
        materialId: "",
        sku: "",
        batchNumber: "",
        quantity: 0,
        currentStock: 0,
        basePrice: 0,
        jobworkDetails: ""
      }]
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setActiveView("dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Outward Job Work</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="challan">Delivery Challan Number</Label>
              <Input
                id="challan"
                value={outwardForm.challanNumber}
                onChange={(e) => setOutwardForm(prev => ({ ...prev, challanNumber: e.target.value }))}
                placeholder="Enter challan number"
              />
            </div>
            
            <div>
              <Label htmlFor="contractor">Contractor Name</Label>
              <Input
                id="contractor"
                value={outwardForm.contractorName}
                onChange={(e) => setOutwardForm(prev => ({ ...prev, contractorName: e.target.value }))}
                placeholder="Enter contractor name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Contractor Address</Label>
            <Textarea
              id="address"
              value={outwardForm.contractorAddress}
              onChange={(e) => setOutwardForm(prev => ({ ...prev, contractorAddress: e.target.value }))}
              placeholder="Enter contractor address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="person">Concerned Person</Label>
              <Input
                id="person"
                value={outwardForm.concernedPerson}
                onChange={(e) => setOutwardForm(prev => ({ ...prev, concernedPerson: e.target.value }))}
                placeholder="Enter concerned person name"
              />
            </div>
            
            <div>
              <Label htmlFor="contact">Contact Number</Label>
              <Input
                id="contact"
                value={outwardForm.contactNumber}
                onChange={(e) => setOutwardForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                placeholder="Enter contact number"
              />
            </div>
          </div>

          <div>
            <Label>Expected Delivery Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
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

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="customerOrder"
                checked={outwardForm.isForCustomerOrder}
                onCheckedChange={(checked) => setOutwardForm(prev => ({ ...prev, isForCustomerOrder: !!checked }))}
              />
              <Label htmlFor="customerOrder">Is this for customer's order?</Label>
            </div>

            {outwardForm.isForCustomerOrder && (
              <div>
                <Label htmlFor="salesOrder">Link to Sales Order</Label>
                <Select
                  value={outwardForm.salesOrderId}
                  onValueChange={(value) => setOutwardForm(prev => ({ ...prev, salesOrderId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sales order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SO001">SO001 - Customer A</SelectItem>
                    <SelectItem value="SO002">SO002 - Customer B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="woodPallet"
                  checked={outwardForm.woodPallet}
                  onCheckedChange={(checked) => setOutwardForm(prev => ({ ...prev, woodPallet: !!checked }))}
                />
                <Label htmlFor="woodPallet">Did you send wood pallet?</Label>
              </div>

              {outwardForm.woodPallet && (
                <div>
                  <Label htmlFor="paletteCount">Number of Pallets</Label>
                  <Input
                    id="paletteCount"
                    type="number"
                    value={outwardForm.paletteCount}
                    onChange={(e) => setOutwardForm(prev => ({ ...prev, paletteCount: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter number of pallets"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Material Details</CardTitle>
        </CardHeader>
        <CardContent>
          {outwardForm.items.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4 mb-4">
              <h4 className="font-semibold">Item {index + 1}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={item.sku}
                    onChange={(e) => {
                      const newItems = [...outwardForm.items];
                      newItems[index].sku = e.target.value;
                      setOutwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Enter SKU"
                  />
                </div>
                
                <div>
                  <Label>Batch Number</Label>
                  <Input
                    value={item.batchNumber}
                    onChange={(e) => {
                      const newItems = [...outwardForm.items];
                      newItems[index].batchNumber = e.target.value;
                      setOutwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Enter batch number"
                  />
                </div>
                
                <div>
                  <Label>Quantity (Current Stock: {item.currentStock})</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...outwardForm.items];
                      newItems[index].quantity = parseFloat(e.target.value) || 0;
                      setOutwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Enter quantity"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Base Price</Label>
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
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label>Job Work Details</Label>
                  <Input
                    value={item.jobworkDetails}
                    onChange={(e) => {
                      const newItems = [...outwardForm.items];
                      newItems[index].jobworkDetails = e.target.value;
                      setOutwardForm(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="Enter job work details"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button type="button" variant="outline" onClick={addOutwardItem}>
            Add Another Item
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setActiveView("dashboard")}>
          Cancel
        </Button>
        <Button>
          Submit Outward Entry
        </Button>
      </div>
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

  return (
    <div className="container mx-auto p-4 sm:p-6">
      {activeView === "dashboard" && renderDashboard()}
      {activeView === "outward" && renderOutwardForm()}
      {activeView === "inward" && renderInwardForm()}
    </div>
  );
};

export default JobWork;
