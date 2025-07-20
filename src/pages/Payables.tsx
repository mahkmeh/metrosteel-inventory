
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Search, Eye, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { PaymentRecordingModal } from "@/components/PaymentRecordingModal";

const Payables = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: payables = [], isLoading } = useQuery({
    queryKey: ["payables"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payables")
        .select(`
          *,
          suppliers(name, payment_terms),
          purchase_invoices(invoice_number, invoice_date)
        `)
        .order("due_date", { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  const filteredPayables = payables.filter((payable: any) =>
    payable.suppliers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payable.purchase_invoices?.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "outstanding": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "partial": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "paid": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getAgingColor = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - due.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays > 90) return "text-red-600 font-semibold";
    if (diffDays > 60) return "text-orange-600 font-semibold";
    if (diffDays > 30) return "text-yellow-600 font-semibold";
    if (diffDays > 0) return "text-blue-600";
    return "text-green-600";
  };

  const totalOutstanding = payables.reduce((sum: number, p: any) => sum + (p.outstanding_amount || 0), 0);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Payables
          </h1>
          <p className="text-muted-foreground">Track outstanding payments to suppliers</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
            <p className="text-2xl font-bold">₹{totalOutstanding.toLocaleString()}</p>
          </div>
          <Button onClick={() => setShowPaymentModal(true)}>
            <DollarSign className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
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
          <CardDescription>
            Monitor payment obligations and aging analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading payables...</div>
          ) : filteredPayables.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Payables Found</h3>
              <p className="text-sm">No outstanding payables match your search criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Original Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayables.map((payable: any) => (
                  <TableRow key={payable.id}>
                    <TableCell className="font-medium">{payable.suppliers?.name}</TableCell>
                    <TableCell>{payable.purchase_invoices?.invoice_number}</TableCell>
                    <TableCell>
                      {payable.purchase_invoices?.invoice_date 
                        ? format(new Date(payable.purchase_invoices.invoice_date), "dd/MM/yyyy")
                        : "-"
                      }
                    </TableCell>
                    <TableCell className={payable.due_date ? getAgingColor(payable.due_date) : ""}>
                      {payable.due_date ? format(new Date(payable.due_date), "dd/MM/yyyy") : "-"}
                    </TableCell>
                    <TableCell>₹{payable.original_amount?.toLocaleString()}</TableCell>
                    <TableCell>₹{payable.paid_amount?.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">₹{payable.outstanding_amount?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payable.status)}>
                        {payable.status}
                      </Badge>
                    </TableCell>
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

      <PaymentRecordingModal 
        open={showPaymentModal} 
        onOpenChange={setShowPaymentModal} 
      />
    </div>
  );
};

export default Payables;
