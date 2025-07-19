import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Search, Calendar, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";

const Payables = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Placeholder for future implementation
  const { data: payables = [], isLoading } = useQuery({
    queryKey: ["payables"],
    queryFn: async () => {
      // This will be implemented when we create the payables module
      return [];
    }
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Payables
          </h1>
          <p className="text-muted-foreground">Manage supplier payments and outstanding balances</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search payables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹0</div>
            <p className="text-xs text-muted-foreground">Across all suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹0</div>
            <p className="text-xs text-muted-foreground">Payment due today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Calendar className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">₹0</div>
            <p className="text-xs text-muted-foreground">Past due payments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Payables</CardTitle>
          <CardDescription>
            This module will track outstanding supplier invoices, payment schedules, 
            and payment processing with aging reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Payables Management Module</h3>
            <p className="text-sm max-w-md mx-auto">
              Features will include payment scheduling, aging reports, supplier statements, 
              and integration with accounting systems.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payables;