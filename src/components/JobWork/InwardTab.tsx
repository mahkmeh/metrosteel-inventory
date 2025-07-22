
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
import { useJobWorkTransformations } from "@/hooks/useJobWorkTransformations";
import { format } from "date-fns";

interface InwardTabProps {
  onCreateInward: () => void;
}

export const InwardTab = ({ onCreateInward }: InwardTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const { data: transformations = [], isLoading } = useJobWorkTransformations();

  // Filter transformations to show only those expected to return (inward perspective)
  const inwardTransformations = transformations.filter(t => 
    t.status === 'sent' || t.status === 'processing' || t.status === 'completed' || t.status === 'quality_check'
  );

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = inwardTransformations.filter(item => {
      const matchesSearch = searchTerm === "" || 
        (item.contractor?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.input_sku?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.output_sku?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.job_work_number.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
      const itemDate = new Date(item.sent_date);
      const matchesDateRange = !dateRange.from || !dateRange.to ||
        (itemDate >= dateRange.from && itemDate <= dateRange.to);
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });

    // Sort the filtered data
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "sent_date":
          return new Date(b.sent_date).getTime() - new Date(a.sent_date).getTime();
        case "expected_return_date":
          return new Date(a.expected_return_date || '').getTime() - new Date(b.expected_return_date || '').getTime();
        case "contractor":
          return (a.contractor?.name || '').localeCompare(b.contractor?.name || '');
        case "created_at":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [inwardTransformations, searchTerm, statusFilter, sortBy, dateRange]);

  // KPI calculations
  const kpiData = useMemo(() => {
    const pendingReturns = inwardTransformations.filter(item => item.status === 'sent' || item.status === 'processing').length;
    const qualityIssues = inwardTransformations.filter(item => item.status === 'quality_check').length;
    const overdueReturns = inwardTransformations.filter(item => {
      if (!item.expected_return_date) return false;
      const expectedDate = new Date(item.expected_return_date);
      const today = new Date();
      return expectedDate < today && (item.status === 'sent' || item.status === 'processing');
    }).length;
    
    return { pendingReturns, qualityIssues, overdueReturns };
  }, [inwardTransformations]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      sent: { variant: "secondary" as const, label: "Sent to Contractor" },
      processing: { variant: "default" as const, label: "Processing" },
      quality_check: { variant: "warning" as const, label: "Quality Check" },
      completed: { variant: "success" as const, label: "Completed" },
      returned: { variant: "success" as const, label: "Returned" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.sent;
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
    setSortBy("created_at");
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
          onAction={() => setStatusFilter("sent")}
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
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Sent Date</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Contractor</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4 min-w-[200px]">Job Work Details</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Status</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Expected Return</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Job Number</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4 w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-xs px-2 sm:px-4 py-2">
                      {format(new Date(item.sent_date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="text-xs px-2 sm:px-4 py-2">
                      <div>
                        <div className="font-medium">{item.contractor?.name || 'Unknown Contractor'}</div>
                        <div className="text-muted-foreground text-xs">{item.process_type}</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      <div className="text-sm">
                        <div className="font-medium">
                          {item.output_sku?.name || 'Unknown Material'} 
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Input: {item.input_sku?.name || 'Unknown'} ({item.input_weight_kg}kg)
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Expected: {item.expected_output_weight_kg}kg
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      {getStatusBadge(item.status)}
                    </TableCell>
                    <TableCell className="text-xs px-2 sm:px-4 py-2">
                      {item.expected_return_date ? format(new Date(item.expected_return_date), 'dd/MM/yyyy') : 'Not set'}
                    </TableCell>
                    <TableCell className="text-xs px-2 sm:px-4 py-2 font-mono">
                      {item.job_work_number}
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
                {filteredData.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No job work transformations found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading job work data...
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
