import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Batch {
  id: string;
  batch_code: string;
  sku_id: string;
  supplier_id?: string;
  purchase_order_id?: string;
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
  // Joined data
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

export interface BatchInventory {
  id: string;
  batch_id: string;
  location_id: string;
  quantity_kg: number;
  reserved_kg: number;
  available_kg: number;
  unit_cost_per_kg?: number;
  total_value?: number;
  last_updated: string;
  created_at: string;
  // Joined data
  batch?: {
    batch_code: string;
    quality_grade: string;
  };
  location?: {
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

export const useBatchesByMaterial = (materialId: string | null) => {
  return useQuery({
    queryKey: ["batches", "by-material", materialId],
    queryFn: async () => {
      if (!materialId) return [];
      
      const { data, error } = await supabase
        .from("batches")
        .select(`
          *,
          material:materials(name, sku, category, grade),
          supplier:suppliers(name)
        `)
        .eq("sku_id", materialId)
        .eq("status", "active")
        .gt("available_weight_kg", 0)
        .order("created_at", { ascending: true }); // FIFO

      if (error) throw error;
      return data as Batch[];
    },
    enabled: !!materialId,
  });
};

export const useBatchInventory = () => {
  return useQuery({
    queryKey: ["batch-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batch_inventory")
        .select(`
          *,
          batch:batches(batch_code, quality_grade),
          location:locations(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BatchInventory[];
    },
  });
};

export const useCreateBatch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (batchData: {
      sku_id: string;
      supplier_id?: string;
      purchase_order_id?: string;
      total_weight_kg: number;
      available_weight_kg: number;
      reserved_weight_kg?: number;
      heat_number?: string;
      make?: string;
      quality_grade?: string;
      compliance_status?: string;
      manufactured_date?: string;
      received_date?: string;
      expiry_date?: string;
      status?: string;
      notes?: string;
    }) => {
      // Generate batch code
      const { data: batchCode, error: codeError } = await supabase
        .rpc("generate_batch_code");

      if (codeError) throw codeError;

      const { data, error } = await supabase
        .from("batches")
        .insert({
          sku_id: batchData.sku_id,
          supplier_id: batchData.supplier_id,
          purchase_order_id: batchData.purchase_order_id,
          total_weight_kg: batchData.total_weight_kg,
          available_weight_kg: batchData.available_weight_kg,
          reserved_weight_kg: batchData.reserved_weight_kg || 0,
          heat_number: batchData.heat_number,
          make: batchData.make,
          quality_grade: batchData.quality_grade || 'A',
          compliance_status: batchData.compliance_status || 'pending',
          manufactured_date: batchData.manufactured_date,
          received_date: batchData.received_date,
          expiry_date: batchData.expiry_date,
          status: batchData.status || 'active',
          notes: batchData.notes,
          batch_code: batchCode,
        })
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
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create batch: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Batch> & { id: string }) => {
      const { data, error } = await supabase
        .from("batches")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast({
        title: "Success",
        description: "Batch updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update batch: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};