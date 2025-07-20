
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

const paymentSchema = z.object({
  payable_id: z.string().min(1, "Payable is required"),
  payment_amount: z.coerce.number().min(0.01, "Payment amount must be greater than 0"),
  payment_method: z.string().min(1, "Payment method is required"),
  reference_number: z.string().optional(),
  payment_date: z.string().min(1, "Payment date is required"),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentRecordingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaymentRecordingModal = ({ open, onOpenChange }: PaymentRecordingModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payable_id: "",
      payment_amount: 0,
      payment_method: "",
      reference_number: "",
      payment_date: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const { data: payables = [] } = useQuery({
    queryKey: ["outstanding-payables"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payables")
        .select(`
          *,
          suppliers(name),
          purchase_invoices(invoice_number)
        `)
        .in("status", ["outstanding", "partial"])
        .gt("outstanding_amount", 0)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const recordPayment = useMutation({
    mutationFn: async (values: PaymentFormValues) => {
      const selectedPayable = payables.find(p => p.id === values.payable_id);
      if (!selectedPayable) throw new Error("Payable not found");

      const newPaidAmount = selectedPayable.paid_amount + values.payment_amount;
      const newOutstandingAmount = selectedPayable.outstanding_amount - values.payment_amount;
      
      if (newOutstandingAmount < 0) {
        throw new Error("Payment amount exceeds outstanding balance");
      }

      const newStatus = newOutstandingAmount === 0 ? "paid" : "partial";

      const { error } = await supabase
        .from("payables")
        .update({
          paid_amount: newPaidAmount,
          outstanding_amount: newOutstandingAmount,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", values.payable_id);

      if (error) throw error;

      // Record the payment transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert([{
          transaction_type: "payment",
          reference_type: "payable",
          reference_id: values.payable_id,
          material_id: selectedPayable.purchase_invoices?.id, // Use invoice ID as reference
          location_id: "00000000-0000-0000-0000-000000000000", // Default location for payments
          quantity: values.payment_amount,
          unit_cost: 1,
          notes: `Payment: ${values.payment_method} - ${values.reference_number || 'No ref'}`,
        }]);

      if (transactionError) {
        console.warn("Failed to record payment transaction:", transactionError);
      }

      return { payable_id: values.payable_id, amount: values.payment_amount };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      queryClient.invalidateQueries({ queryKey: ["outstanding-payables"] });
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: PaymentFormValues) => {
    recordPayment.mutate(values);
  };

  const selectedPayableId = form.watch("payable_id");
  const selectedPayable = payables.find(p => p.id === selectedPayableId);
  const maxPaymentAmount = selectedPayable?.outstanding_amount || 0;

  const paymentMethods = [
    "cash",
    "bank_transfer",
    "cheque",
    "credit_card",
    "debit_card",
    "online_payment",
    "other"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment against an outstanding payable.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="payable_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outstanding Payable</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payable to pay" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {payables.map((payable) => (
                        <SelectItem key={payable.id} value={payable.id}>
                          {payable.suppliers?.name} - {payable.purchase_invoices?.invoice_number} 
                          (₹{payable.outstanding_amount?.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPayable && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Outstanding Amount:</strong> ₹{selectedPayable.outstanding_amount?.toLocaleString()}
                </p>
                <p className="text-sm">
                  <strong>Due Date:</strong> {selectedPayable.due_date ? new Date(selectedPayable.due_date).toLocaleDateString() : "No due date"}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payment_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        max={maxPaymentAmount}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                    {maxPaymentAmount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Maximum: ₹{maxPaymentAmount.toLocaleString()}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Cheque/Transaction ref" {...field} />
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
                    <Textarea placeholder="Additional payment notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={recordPayment.isPending}>
                {recordPayment.isPending ? "Recording..." : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
