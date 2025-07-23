
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DollarSign, Search, Eye } from "lucide-react";
import { PaymentRecordingModal } from "@/components/PaymentRecordingModal";
import { PayableDetailsModal } from "@/components/PayableDetailsModal";

const Payables = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState<any>(null);

  const { data: payables = [], isLoading } = useQuery({
    queryKey: ["payables", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("payables")
        .select(`
          *,
          supplier:suppliers(name),
          purchase_invoice:purchase_invoices(invoice_number)
        `)
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`supplier.name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "outstanding":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "partial":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewPayable = (payable: any) => {
    setSelectedPayable(payable);
    setShowDetailsModal(true);
  };

  const handleRecordPayment = (payable: any) => {
    setSelectedPayable(payable);
    setShowPaymentModal(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Payables
          </h1>
          <p className="text-muted-foreground">Track and manage supplier payments</p>
        </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Outstanding Payables</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Original Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payables.map((payable) => (
                  <TableRow key={payable.id}>
                    <TableCell className="font-medium">{payable.supplier?.name || "N/A"}</TableCell>
                    <TableCell>{payable.purchase_invoice?.invoice_number || "N/A"}</TableCell>
                    <TableCell>₹{payable.original_amount?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>₹{payable.paid_amount?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>₹{payable.outstanding_amount?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>{payable.due_date || "N/A"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payable.status)}>
                        {payable.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPayable(payable)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payable.status !== "paid" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRecordPayment(payable)}
                          >
                            Record Payment
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {payables.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Payables Found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? "No payables match your search criteria." : "All payments are up to date."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentRecordingModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        payable={selectedPayable}
      />

      <PayableDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        payable={selectedPayable}
      />
    </div>
  );
};

export default Payables;
