
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Users, Star, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ContractorsTabProps {
  onAddContractor: () => void;
  onEditContractor: (contractorId: string) => void;
}

export const ContractorsTab = ({ onAddContractor, onEditContractor }: ContractorsTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Fetch suppliers (contractors) from database
  const { data: contractors = [], isLoading } = useQuery({
    queryKey: ['contractors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching contractors:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Filter and search logic using real data
  const filteredData = useMemo(() => {
    let filtered = contractors.filter(contractor => {
      const matchesSearch = searchTerm === "" || 
        contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contractor.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contractor.address?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Since suppliers table doesn't have status field, we treat all as active
      const matchesStatus = statusFilter === "all" || statusFilter === "active";
      
      return matchesSearch && matchesStatus;
    });

    // Sort the filtered data
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "contact":
          return (a.contact_person || '').localeCompare(b.contact_person || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [contractors, searchTerm, statusFilter, sortBy]);

  // KPI calculations using real data
  const kpiData = useMemo(() => {
    const activeContractors = contractors.length;
    const withContact = contractors.filter(c => c.contact_person).length;
    const withPaymentTerms = contractors.filter(c => c.payment_terms).length;
    
    return { 
      activeContractors, 
      withContact, 
      withPaymentTerms
    };
  }, [contractors]);

  const getStatusBadge = (status: string = "active") => {
    const statusConfig = {
      active: { variant: "success" as const, label: "Active" },
      inactive: { variant: "secondary" as const, label: "Inactive" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("name");
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Active Contractors"
          value={kpiData.activeContractors}
          subtitle="Currently engaged"
          status="good"
          icon={Users}
          actionLabel="View Active"
          onAction={() => setStatusFilter("active")}
          details={`${kpiData.activeContractors} contractors actively working`}
        />
        <KpiCard
          title="Contact Information"
          value={kpiData.withContact}
          subtitle="Contractors with contact person"
          status="info"
          icon={TrendingUp}
          actionLabel="View Details"
          onAction={() => {}}
          details={`${kpiData.withContact} contractors have contact person info`}
        />
        <KpiCard
          title="Payment Terms"
          value={kpiData.withPaymentTerms}
          subtitle="Contractors with payment terms"
          status="good"
          icon={Star}
          actionLabel="View Terms"
          onAction={() => {}}
          details="Contractors with defined payment terms"
        />
      </div>

      {/* Action Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Contractors Management</h2>
        <Button onClick={onAddContractor} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New CONTRACTOR
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contractors, person, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Contractors</SelectItem>
            <SelectItem value="active">Active</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="contact">Contact Person</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>

      {/* Contractors Dashboard Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            Contractors Directory ({filteredData.length})
          </CardTitle>
          <CardDescription className="text-sm">
            Manage contractor relationships and performance
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Vendor Name</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Contact Person</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4 min-w-[200px]">Contact Details</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Payment Terms</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Status</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4 w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((contractor) => (
                  <TableRow key={contractor.id} className="hover:bg-muted/50">
                    <TableCell className="px-2 sm:px-4 py-2">
                      <div>
                        <div className="font-medium text-sm">{contractor.name}</div>
                        <div className="text-xs text-muted-foreground">{contractor.gst_number || 'No GST'}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm px-2 sm:px-4 py-2">
                      <div className="font-medium">{contractor.contact_person || 'Not specified'}</div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      <div className="text-sm">
                        {contractor.phone && (
                          <div className="text-xs py-1">📞 {contractor.phone}</div>
                        )}
                        {contractor.email && (
                          <div className="text-xs py-1">✉️ {contractor.email}</div>
                        )}
                        {contractor.address && (
                          <div className="text-xs py-1 text-muted-foreground">
                            📍 {contractor.address.substring(0, 50)}...
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      <div className="text-sm">
                        {contractor.payment_terms || 'Not specified'}
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      {getStatusBadge("active")}
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onEditContractor(contractor.id)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No contractors found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading contractors...
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
