
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Batch {
  id: string;
  batch_code: string;
  sku_id: string;
  total_weight_kg: number;
  available_weight_kg: number;
  reserved_weight_kg: number;
  heat_number?: string;
  make?: string;
  quality_grade: string;
  compliance_status: string;
  manufactured_date?: string;
  received_date?: string;
  expiry_date?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  supplier_id?: string;
  purchase_order_id?: string;
  material?: {
    name: string;
    sku: string;
    category: string;
    grade: string;
  };
  supplier?: {
    name: string;
  };
}

export const useBatches = () => {
  return useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batches")
        .select(`
          *,
          material:materials(name, sku, category, grade),
          supplier:suppliers(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Batch[];
    },
  });
};

export const useCreateBatch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (batchData: {
      batch_code: string; // Now required - no auto-generation
      sku_id: string;
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
      supplier_id?: string;
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
      toast({
        title: "Success",
        description: "Batch created successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error creating batch:", error);
      
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
};
