
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

  // Filter and search logic - now using real data
  const filteredData = useMemo(() => {
    let filtered = transformations.filter(item => {
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
        case "contractor":
          return (a.contractor?.name || '').localeCompare(b.contractor?.name || '');
        case "total_cost":
          return (b.total_processing_cost || 0) - (a.total_processing_cost || 0);
        case "created_at":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [transformations, searchTerm, statusFilter, sortBy, dateRange]);

  // KPI calculations using real data
  const kpiData = useMemo(() => {
    const activeJobWork = transformations.filter(item => item.status === "sent" || item.status === "processing").length;
    const readyForDispatch = transformations.filter(item => item.status === "completed").length;
    const totalValue = transformations.reduce((sum, item) => sum + (item.total_processing_cost || 0), 0);
    
    return { activeJobWork, readyForDispatch, totalValue };
  }, [transformations]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      sent: { variant: "default" as const, label: "Sent to Contractor" },
      processing: { variant: "default" as const, label: "Processing" },
      completed: { variant: "success" as const, label: "Completed" },
      quality_check: { variant: "warning" as const, label: "Quality Check" },
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
    setSortBy("created_at");
    setDateRange({});
  };

  return (
    <div className="space-y-6">

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
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Sent Date</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Contractor</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4 min-w-[180px]">Output Material</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4 min-w-[140px]">Input Material</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4 min-w-[120px]">Process</TableHead>
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
                        <div className="text-muted-foreground text-xs font-mono">{item.job_work_number}</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      <div className="text-sm">
                        <div className="font-medium">{item.output_sku?.name || 'Unknown Material'}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Expected: {item.expected_output_weight_kg}kg
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      <div className="text-sm">
                        <div className="font-medium">{item.input_sku?.name || 'Unknown Material'}</div>
                        <div className="text-xs text-muted-foreground">
                          Weight: {item.input_weight_kg}kg
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {item.input_batch?.batch_code || 'No batch'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      <div className="text-sm">
                        <div className="font-medium">{item.process_type}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.process_description}
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
                {filteredData.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No job work transformations found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
