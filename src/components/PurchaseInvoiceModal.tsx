
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const invoiceSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  supplier_id: z.string().min(1, "Supplier is required"),
  purchase_order_id: z.string().optional(),
  invoice_date: z.string().min(1, "Invoice date is required"),
  due_date: z.string().optional(),
  subtotal_amount: z.coerce.number().min(0, "Amount must be positive"),
  tax_amount: z.coerce.number().min(0, "Tax amount must be non-negative"),
  total_amount: z.coerce.number().min(0, "Total amount must be positive"),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface PurchaseInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PurchaseInvoiceModal = ({ open, onOpenChange }: PurchaseInvoiceModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoice_number: "",
      supplier_id: "",
      purchase_order_id: "",
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: "",
      subtotal_amount: 0,
      tax_amount: 0,
      total_amount: 0,
      notes: "",
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("id, po_number, supplier_id")
        .order("po_number");
      if (error) throw error;
      return data;
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (values: InvoiceFormValues) => {
      const { data: invoice, error: invoiceError } = await supabase
        .from("purchase_invoices")
        .insert({
          invoice_number: values.invoice_number,
          supplier_id: values.supplier_id,
          purchase_order_id: values.purchase_order_id || "",
          invoice_date: values.invoice_date,
          due_date: values.due_date || null,
          subtotal_amount: values.subtotal_amount,
          tax_amount: values.tax_amount,
          total_amount: values.total_amount,
          notes: values.notes || null,
          status: "received",
          received_date: values.invoice_date,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create corresponding payable entry
      const { error: payableError } = await supabase
        .from("payables")
        .insert([{
          supplier_id: values.supplier_id,
          purchase_invoice_id: invoice.id,
          original_amount: values.total_amount,
          outstanding_amount: values.total_amount,
          paid_amount: 0,
          due_date: values.due_date || null,
          status: "outstanding",
        }]);

      if (payableError) throw payableError;

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      toast({
        title: "Success",
        description: "Purchase invoice recorded successfully",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record invoice",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: InvoiceFormValues) => {
    createInvoice.mutate(values);
  };

  const selectedSupplierId = form.watch("supplier_id");
  const filteredPOs = purchaseOrders.filter(po => po.supplier_id === selectedSupplierId);

  const subtotal = form.watch("subtotal_amount") || 0;
  const tax = form.watch("tax_amount") || 0;
  
  // Auto-calculate total when subtotal or tax changes
  const calculatedTotal = subtotal + tax;
  if (calculatedTotal !== form.getValues("total_amount")) {
    form.setValue("total_amount", calculatedTotal);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Purchase Invoice</DialogTitle>
          <DialogDescription>
            Enter the details of the supplier invoice to record it in the system.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoice_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input placeholder="INV-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="purchase_order_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Order</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select purchase order" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredPOs.map((po) => (
                        <SelectItem key={po.id} value={po.id}>
                          {po.po_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoice_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="subtotal_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtotal Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tax_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createInvoice.isPending}>
                {createInvoice.isPending ? "Recording..." : "Record Invoice"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
