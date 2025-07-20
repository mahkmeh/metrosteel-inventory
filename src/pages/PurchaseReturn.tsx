
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Plus, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { PurchaseReturnModal } from "@/components/PurchaseReturnModal";

const PurchaseReturn = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showReturnModal, setShowReturnModal] = useState(false);

  const { data: returns = [], isLoading } = useQuery({
    queryKey: ["purchase-returns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_returns")
        .select(`
          *,
          suppliers(name),
          purchase_orders(po_number),
          purchase_invoices(invoice_number),
          purchase_return_items(
            quantity_returned,
            unit_price,
            line_total,
            materials(name, sku),
            batches(batch_code)
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const filteredReturns = returns.filter((returnItem: any) =>
    returnItem.return_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.suppliers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.return_reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <RotateCcw className="h-8 w-8" />
            Purchase Return
          </h1>
          <p className="text-muted-foreground">Handle material returns to suppliers</p>
        </div>
        <Button onClick={() => setShowReturnModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Return
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search returns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Returns</CardTitle>
          <CardDescription>
            Track and manage material returns to suppliers with credit note processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading returns...</div>
          ) : filteredReturns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Returns Found</h3>
              <p className="text-sm">No purchase returns match your search criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Return Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Credit Note</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReturns.map((returnItem: any) => (
                  <TableRow key={returnItem.id}>
                    <TableCell className="font-medium">{returnItem.return_number}</TableCell>
                    <TableCell>{returnItem.suppliers?.name}</TableCell>
                    <TableCell>{returnItem.purchase_invoices?.invoice_number}</TableCell>
                    <TableCell>{format(new Date(returnItem.return_date), "dd/MM/yyyy")}</TableCell>
                    <TableCell>₹{returnItem.total_return_amount?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(returnItem.status)}>
                        {returnItem.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{returnItem.credit_note_number || "-"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PurchaseReturnModal 
        open={showReturnModal} 
        onOpenChange={setShowReturnModal} 
      />
    </div>
  );
};

export default PurchaseReturn;
