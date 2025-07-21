import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePurchaseOrderBatches = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createBatchForPO = useMutation({
    mutationFn: async (batchData: {
      batch_code: string;
      sku_id: string;
      supplier_id?: string;
      purchase_order_id?: string;
      total_weight_kg: number;
      available_weight_kg: number;
      heat_number?: string;
      make?: string;
      quality_grade?: string;
      compliance_status?: string;
      manufactured_date?: string;
      received_date?: string;
      expiry_date?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("batches")
        .insert([batchData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["material-batches"] });
      queryClient.invalidateQueries({ queryKey: ["enhanced-batches"] });
      toast({
        title: "Success",
        description: "Batch created successfully for purchase order",
      });
    },
    onError: (error: any) => {
      console.error("Error creating batch for PO:", error);
      
      let errorMessage = "Failed to create batch";
      
      if (error.message?.includes("duplicate key value violates unique constraint")) {
        if (error.message.includes("batch_code")) {
          errorMessage = "Batch code already exists. Please use a different batch code.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const linkBatchesToPO = useMutation({
    mutationFn: async ({ 
      batchSelections, 
      purchaseOrderId, 
      supplierId 
    }: { 
      batchSelections: { batch: any; quantity: number }[]; 
      purchaseOrderId: string; 
      supplierId: string; 
    }) => {
      const updates = batchSelections.map(selection => ({
        id: selection.batch.id,
        purchase_order_id: purchaseOrderId,
        supplier_id: supplierId,
        reserved_weight_kg: selection.quantity
      }));

      const { data, error } = await supabase
        .from("batches")
        .upsert(updates, { onConflict: "id" })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["enhanced-batches"] });
      toast({
        title: "Success",
        description: "Batches linked to purchase order successfully",
      });
    },
    onError: (error) => {
      console.error("Error linking batches to PO:", error);
      toast({
        title: "Error",
        description: "Failed to link batches to purchase order",
        variant: "destructive",
      });
    },
  });

  const linkBatchToPO = useMutation({
    mutationFn: async ({ batchId, purchaseOrderId }: { batchId: string; purchaseOrderId: string }) => {
      const { data, error } = await supabase
        .from("batches")
        .update({ purchase_order_id: purchaseOrderId })
        .eq("id", batchId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast({
        title: "Success",
        description: "Batch linked to purchase order successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to link batch to purchase order",
        variant: "destructive",
      });
    },
  });

  const updateBatchFromPO = useMutation({
    mutationFn: async ({ 
      batchId, 
      status, 
      receivedDate, 
      actualWeight 
    }: { 
      batchId: string; 
      status?: string; 
      receivedDate?: string;
      actualWeight?: number;
    }) => {
      const updateData: any = {};
      
      if (status) updateData.status = status;
      if (receivedDate) updateData.received_date = receivedDate;
      if (actualWeight !== undefined) {
        updateData.total_weight_kg = actualWeight;
        updateData.available_weight_kg = actualWeight;
      }
      
      const { data, error } = await supabase
        .from("batches")
        .update(updateData)
        .eq("id", batchId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["material-batches"] });
      toast({
        title: "Success",
        description: "Batch updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update batch",
        variant: "destructive",
      });
    },
  });

  return {
    createBatchForPO,
    linkBatchesToPO,
    linkBatchToPO,
    updateBatchFromPO,
  };
};
