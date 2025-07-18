
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { JobWorkFilters } from "@/components/JobWorkFilters";

interface InwardTabProps {
  onCreateInward: () => void;
}

export const InwardTab = ({ onCreateInward }: InwardTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dcDate");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Mock data for inward entries
  const mockInwardData = [
    {
      id: "IW001",
      dcDate: "2025-01-15",
      vendorName: "Steel Fab Works",
      materialDetails: "MS Sheet 10mm - Cut pieces",
      status: "pending_receipt",
      expectedDate: "2025-01-25",
      overDueDays: 0,
    },
    {
      id: "IW002",
      dcDate: "2025-01-10", 
      vendorName: "Precision Tools Ltd",
      materialDetails: "SS Rod 12mm - Threaded",
      status: "quality_check",
      expectedDate: "2025-01-20",
      overDueDays: 0,
    },
    {
      id: "IW003",
      dcDate: "2025-01-05",
      vendorName: "Welding Solutions", 
      materialDetails: "MS Plate 20mm - Welded assembly",
      status: "received",
      expectedDate: "2025-01-15",
      overDueDays: 3,
    }
  ];

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = mockInwardData.filter(item => {
      const matchesSearch = searchTerm === "" || 
        item.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.materialDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        case "expectedDate":
          return new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime();
        case "vendorName":
          return a.vendorName.localeCompare(b.vendorName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [mockInwardData, searchTerm, statusFilter, sortBy, dateRange]);

  // KPI calculations
  const kpiData = useMemo(() => {
    const pendingReturns = mockInwardData.filter(item => item.status === "pending_receipt").length;
    const qualityIssues = mockInwardData.filter(item => item.status === "quality_check").length;
    const overdueReturns = mockInwardData.filter(item => item.overDueDays > 0).length;
    
    return { pendingReturns, qualityIssues, overdueReturns };
  }, [mockInwardData]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_receipt: { variant: "secondary" as const, label: "Pending Receipt" },
      quality_check: { variant: "warning" as const, label: "Quality Check" },
      received: { variant: "success" as const, label: "Received" },
      rejected: { variant: "destructive" as const, label: "Rejected" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_receipt;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
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
          title="Pending Returns"
          value={kpiData.pendingReturns}
          subtitle="Items awaiting return"
          status="warning"
          icon={Clock}
          actionLabel="View Pending"
          onAction={() => setStatusFilter("pending_receipt")}
          details={`${kpiData.pendingReturns} items pending return from contractors`}
        />
        <KpiCard
          title="Quality Issues"
          value={kpiData.qualityIssues}
          subtitle="Items in quality check"
          status="critical"
          icon={AlertTriangle}
          actionLabel="View Issues"
          onAction={() => setStatusFilter("quality_check")}
          details={`${kpiData.qualityIssues} items require quality verification`}
        />
        <KpiCard
          title="Overdue Returns"
          value={kpiData.overdueReturns}
          subtitle="Items past expected date"
          status="critical"
          icon={AlertTriangle}
          actionLabel="View Overdue"
          onAction={() => {}}
          details={`${kpiData.overdueReturns} items overdue for return`}
        />
      </div>

      {/* Action Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Inward Job Work</h2>
        <Button onClick={onCreateInward} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create INWARD ENTRY
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

      {/* Inward Dashboard Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            Inward Job Work Status ({filteredData.length})
          </CardTitle>
          <CardDescription className="text-sm">
            Track materials returned from contractors
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
                      <span className="text-sm">{item.materialDetails}</span>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      {getStatusBadge(item.status)}
                    </TableCell>
                    <TableCell className="text-xs px-2 sm:px-4 py-2">{formatDate(item.expectedDate)}</TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      {item.overDueDays > 0 ? (
                        <Badge variant="destructive" className="text-xs px-1 py-0">
                          {item.overDueDays}d
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
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
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No inward entries found matching your criteria
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
