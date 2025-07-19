
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, DollarSign, Package, CheckCircle, Eye } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { JobWorkFilters } from "@/components/JobWorkFilters";
import { JobWorkOutwardModal } from "../JobWorkOutwardModal";
import { useJobWorkTransformations } from "@/hooks/useJobWorkTransformations";
import { format } from "date-fns";

interface OutwardTabProps {
  onCreateOutward: () => void;
}

export const OutwardTab = ({ onCreateOutward }: OutwardTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { data: transformations = [], isLoading } = useJobWorkTransformations();

  // Mock data for outward entries with new/old material tracking
  const mockOutwardData = [
    {
      id: "OW001",
      dcDate: "2025-01-15",
      vendorName: "Steel Fab Works",
      newMaterialDetails: "MS Sheet 10mm - Cut pieces",
      newSkuBatch: "MS-SHE-10-CUT / B001-P",
      oldMaterialDetails: "MS Sheet 10mm - Raw",
      oldSkuBatch: "MS-SHE-10 / B001",
      status: "in_progress",
      value: 45000
    },
    {
      id: "OW002", 
      dcDate: "2025-01-10",
      vendorName: "Precision Tools Ltd",
      newMaterialDetails: "SS Rod 12mm - Threaded",
      newSkuBatch: "SS-ROD-12-THR / B002-P",
      oldMaterialDetails: "SS Rod 12mm - Plain",
      oldSkuBatch: "SS-ROD-12 / B002",
      status: "ready_dispatch",
      value: 85000
    },
    {
      id: "OW003",
      dcDate: "2025-01-05",
      vendorName: "Welding Solutions",
      newMaterialDetails: "MS Plate 20mm - Welded assembly",
      newSkuBatch: "MS-PLA-20-WLD / B003-P",
      oldMaterialDetails: "MS Plate 20mm - Raw",
      oldSkuBatch: "MS-PLA-20 / B003",
      status: "quality_issues",
      value: 52000
    }
  ];

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = mockOutwardData.filter(item => {
      const matchesSearch = searchTerm === "" || 
        item.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.newMaterialDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
      const itemDate = new Date(item.dcDate);
      const matchesDateRange = !dateRange.from || !dateRange.to ||
        (itemDate >= dateRange.from && itemDate <= dateRange.to);
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });

    // Sort the filtered data
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "dcDate":
          return new Date(b.dcDate).getTime() - new Date(a.dcDate).getTime();
        case "vendorName":
          return a.vendorName.localeCompare(b.vendorName);
        case "value":
          return b.value - a.value;
        default:
          return 0;
      }
    });

    return filtered;
  }, [mockOutwardData, searchTerm, statusFilter, sortBy, dateRange]);

  // KPI calculations
  const kpiData = useMemo(() => {
    const activeJobWork = mockOutwardData.filter(item => item.status === "in_progress").length;
    const readyForDispatch = mockOutwardData.filter(item => item.status === "ready_dispatch").length;
    const totalValue = mockOutwardData.reduce((sum, item) => sum + item.value, 0);
    
    return { activeJobWork, readyForDispatch, totalValue };
  }, [mockOutwardData]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_progress: { variant: "default" as const, label: "In Progress" },
      ready_dispatch: { variant: "success" as const, label: "Ready for Dispatch" },
      quality_issues: { variant: "destructive" as const, label: "Quality Issues" },
      dispatched: { variant: "secondary" as const, label: "Dispatched" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.in_progress;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("dcDate");
    setDateRange({});
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Active Job Work"
          value={kpiData.activeJobWork}
          subtitle="Items with contractors"
          status="info"
          icon={Package}
          actionLabel="View Active"
          onAction={() => setStatusFilter("in_progress")}
          details={`${kpiData.activeJobWork} items currently being processed`}
        />
        <KpiCard
          title="Ready for Dispatch"
          value={kpiData.readyForDispatch}
          subtitle="Completed items"
          status="good"
          icon={CheckCircle}
          actionLabel="View Ready"
          onAction={() => setStatusFilter("ready_dispatch")}
          details={`${kpiData.readyForDispatch} items ready for collection`}
        />
        <KpiCard
          title="Total Value"
          value={formatCurrency(kpiData.totalValue)}
          subtitle="Materials out for job work"
          status="info"
          icon={DollarSign}
          actionLabel="View Details"
          onAction={() => {}}
          details="Total value of materials with contractors"
        />
      </div>

      {/* Action Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Outward Job Work</h2>
        <Button onClick={onCreateOutward} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create OUTWARD ENTRY
        </Button>
      </div>

      {/* Filters */}
      <JobWorkFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        overdueFilter="all"
        onOverdueFilterChange={() => {}}
        sortBy={sortBy}
        onSortChange={setSortBy}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onClearFilters={clearFilters}
      />

      {/* Outward Dashboard Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            Outward Job Work Status ({filteredData.length})
          </CardTitle>
          <CardDescription className="text-sm">
            Track materials sent to contractors for processing
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="text-xs font-medium px-2 sm:px-4">DC Date</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Vendor</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4 min-w-[180px]">NEW Material Details</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4 min-w-[140px]">SKU + Batch Code</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4 min-w-[180px]">OLD Material Details</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4 w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-xs px-2 sm:px-4 py-2">
                      {formatDate(item.dcDate)}
                    </TableCell>
                    <TableCell className="text-xs px-2 sm:px-4 py-2">
                      <div>
                        <div className="font-medium">{item.vendorName}</div>
                        <div className="text-muted-foreground text-xs">{item.id}</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      <div className="text-sm">
                        <div className="font-medium">{item.newMaterialDetails}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      <div className="text-xs">
                        <div className="font-mono">{item.newSkuBatch}</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      <div className="text-sm">
                        <div>{item.oldMaterialDetails}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-1">
                          {item.oldSkuBatch}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No outward entries found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
