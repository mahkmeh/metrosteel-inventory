import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receipt, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const PurchaseInvoice = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Placeholder for future implementation
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["purchase-invoices"],
    queryFn: async () => {
      // This will be implemented when we create the invoice module
      return [];
    }
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Receipt className="h-8 w-8" />
            Purchase Invoice
          </h1>
          <p className="text-muted-foreground">Record goods receipt and assign batch numbers</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Record Invoice
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>
            This module will allow you to record actual goods receipt against purchase orders, 
            assign batch numbers with supplier data, and update inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Purchase Invoice Module</h3>
            <p className="text-sm max-w-md mx-auto">
              This feature will be implemented to handle goods receipt, batch assignment at invoice time, 
              and proper inventory updates based on actual deliveries.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseInvoice;