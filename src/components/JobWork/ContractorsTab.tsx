
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Users, Star, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";

interface ContractorsTabProps {
  onAddContractor: () => void;
  onEditContractor: (contractorId: string) => void;
}

export const ContractorsTab = ({ onAddContractor, onEditContractor }: ContractorsTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Mock data for contractors
  const mockContractorsData = [
    {
      id: "C001",
      vendorName: "Steel Fab Works",
      concernedPerson: "Rajesh Kumar",
      phone: "+91-9876543210",
      specialization: "Cutting, Welding",
      activeJobwork: ["Cutting MS Sheets", "Welding SS Pipes"],
      status: "active",
      rating: 4.5,
      completedJobs: 25,
      pendingPayment: 45000
    },
    {
      id: "C002",
      vendorName: "Precision Tools Ltd", 
      concernedPerson: "Suresh Patel",
      phone: "+91-9876543211",
      specialization: "Threading, Machining",
      activeJobwork: ["Threading SS Rods"],
      status: "active",
      rating: 4.8,
      completedJobs: 18,
      pendingPayment: 0
    },
    {
      id: "C003",
      vendorName: "Welding Solutions",
      concernedPerson: "Amit Singh", 
      phone: "+91-9876543212",
      specialization: "Welding, Fabrication",
      activeJobwork: ["Welding MS Plates", "Aluminum Bending", "CI Machining"],
      status: "quality_issues",
      rating: 3.2,
      completedJobs: 12,
      pendingPayment: 25000
    },
    {
      id: "C004",
      vendorName: "Heavy Industries",
      concernedPerson: "Vikram Sharma",
      phone: "+91-9876543213", 
      specialization: "Heavy Machining",
      activeJobwork: ["CI Block Machining"],
      status: "machine_repair",
      rating: 4.2,
      completedJobs: 8,
      pendingPayment: 15000
    },
    {
      id: "C005",
      vendorName: "Quick Process",
      concernedPerson: "Pradeep Gupta",
      phone: "+91-9876543214",
      specialization: "Quick Processing",
      activeJobwork: ["AL Sheet Bending", "MS Sheet Cutting"],
      status: "active",
      rating: 4.0,
      completedJobs: 32,
      pendingPayment: 8000
    }
  ];

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = mockContractorsData.filter(contractor => {
      const matchesSearch = searchTerm === "" || 
        contractor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contractor.concernedPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contractor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || contractor.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort the filtered data
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.vendorName.localeCompare(b.vendorName);
        case "rating":
          return b.rating - a.rating;
        case "completedJobs":
          return b.completedJobs - a.completedJobs;
        default:
          return 0;
      }
    });

    return filtered;
  }, [mockContractorsData, searchTerm, statusFilter, sortBy]);

  // KPI calculations
  const kpiData = useMemo(() => {
    const activeContractors = mockContractorsData.filter(c => c.status === "active").length;
    const pendingPayments = mockContractorsData.filter(c => c.pendingPayment > 0).length;
    const avgRating = mockContractorsData.reduce((sum, c) => sum + c.rating, 0) / mockContractorsData.length;
    
    return { activeContractors, pendingPayments, avgRating };
  }, [mockContractorsData]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "success" as const, label: "Active" },
      inactive: { variant: "secondary" as const, label: "Inactive" },
      quality_issues: { variant: "destructive" as const, label: "Quality Issues" },
      machine_repair: { variant: "warning" as const, label: "Machine Repair" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRatingStars = (rating: number) => {
    return "★".repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? "☆" : "") + "☆".repeat(5 - Math.ceil(rating));
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
          title="Pending Payments"
          value={kpiData.pendingPayments}
          subtitle="Outstanding contractors"
          status="warning"
          icon={TrendingUp}
          actionLabel="View Pending"
          onAction={() => {}}
          details={`${kpiData.pendingPayments} contractors with pending payments`}
        />
        <KpiCard
          title="Performance Rating"
          value={kpiData.avgRating.toFixed(1)}
          subtitle="Average contractor rating"
          status="good"
          icon={Star}
          actionLabel="View Ratings"
          onAction={() => setSortBy("rating")}
          details="Average quality and delivery performance"
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
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="quality_issues">Quality Issues</SelectItem>
            <SelectItem value="machine_repair">Machine Repair</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="completedJobs">Completed Jobs</SelectItem>
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
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Concerned Person</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4 min-w-[200px]">List of Jobwork</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Status</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4">Rating</TableHead>
                  <TableHead className="text-xs font-medium px-2 sm:px-4 w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((contractor) => (
                  <TableRow key={contractor.id} className="hover:bg-muted/50">
                    <TableCell className="px-2 sm:px-4 py-2">
                      <div>
                        <div className="font-medium text-sm">{contractor.vendorName}</div>
                        <div className="text-xs text-muted-foreground">{contractor.specialization}</div>
                        <div className="text-xs text-muted-foreground">{contractor.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm px-2 sm:px-4 py-2">
                      <div className="font-medium">{contractor.concernedPerson}</div>
                      <div className="text-xs text-muted-foreground">
                        {contractor.completedJobs} completed jobs
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      <div className="text-sm">
                        {contractor.activeJobwork.slice(0, 2).map((job, index) => (
                          <div key={index} className="text-xs py-1">
                            • {job}
                          </div>
                        ))}
                        {contractor.activeJobwork.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{contractor.activeJobwork.length - 2} more
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      <div className="space-y-1">
                        {getStatusBadge(contractor.status)}
                        {contractor.pendingPayment > 0 && (
                          <div className="text-xs text-orange-600">
                            Pending: {formatCurrency(contractor.pendingPayment)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-2">
                      <div className="text-sm">
                        <div className="text-yellow-500">{getRatingStars(contractor.rating)}</div>
                        <div className="text-xs text-muted-foreground">{contractor.rating}/5.0</div>
                      </div>
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
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No contractors found matching your criteria
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
