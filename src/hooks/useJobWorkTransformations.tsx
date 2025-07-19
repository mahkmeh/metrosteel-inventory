import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface JobWorkTransformation {
  id: string;
  job_work_number: string;
  contractor_id: string;
  input_batch_id: string;
  input_weight_kg: number;
  input_sku_id: string;
  output_sku_id: string;
  expected_output_weight_kg: number;
  actual_output_weight_kg?: number;
  output_batch_id?: string;
  process_type: string;
  process_description?: string;
  sent_date: string;
  expected_return_date?: string;
  actual_return_date?: string;
  status: string;
  processing_cost_per_kg?: number;
  total_processing_cost?: number;
  created_at: string;
  updated_at: string;
  // Joined data
  contractor?: {
    name: string;
    contact_person?: string;
  };
  input_batch?: {
    batch_code: string;
    quality_grade: string;
  };
  input_sku?: {
    name: string;
    sku: string;
  };
  output_sku?: {
    name: string;
    sku: string;
  };
  output_batch?: {
    batch_code: string;
  };
}

export const useJobWorkTransformations = () => {
  return useQuery({
    queryKey: ["job-work-transformations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_work_transformations")
        .select(`
          *,
          contractor:suppliers(name, contact_person),
          input_batch:batches!input_batch_id(batch_code, quality_grade),
          input_sku:materials!input_sku_id(name, sku),
          output_sku:materials!output_sku_id(name, sku),
          output_batch:batches!output_batch_id(batch_code)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as JobWorkTransformation[];
    },
  });
};

export const useJobWorkTransformationsByStatus = (status: string) => {
  return useQuery({
    queryKey: ["job-work-transformations", "by-status", status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_work_transformations")
        .select(`
          *,
          contractor:suppliers(name, contact_person),
          input_batch:batches!input_batch_id(batch_code, quality_grade),
          input_sku:materials!input_sku_id(name, sku),
          output_sku:materials!output_sku_id(name, sku),
          output_batch:batches!output_batch_id(batch_code)
        `)
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as JobWorkTransformation[];
    },
  });
};

export const useCreateJobWorkTransformation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (transformationData: {
      contractor_id: string;
      input_batch_id: string;
      input_weight_kg: number;
      input_sku_id: string;
      output_sku_id: string;
      expected_output_weight_kg: number;
      process_type: string;
      process_description?: string;
      sent_date: string;
      expected_return_date?: string;
      processing_cost_per_kg?: number;
      total_processing_cost?: number;
    }) => {
      // Generate job work number
      const jobWorkNumber = `JW${Date.now()}`;

      const { data, error } = await supabase
        .from("job_work_transformations")
        .insert({
          job_work_number: jobWorkNumber,
          contractor_id: transformationData.contractor_id,
          input_batch_id: transformationData.input_batch_id,
          input_weight_kg: transformationData.input_weight_kg,
          input_sku_id: transformationData.input_sku_id,
          output_sku_id: transformationData.output_sku_id,
          expected_output_weight_kg: transformationData.expected_output_weight_kg,
          process_type: transformationData.process_type,
          process_description: transformationData.process_description,
          sent_date: transformationData.sent_date,
          expected_return_date: transformationData.expected_return_date,
          processing_cost_per_kg: transformationData.processing_cost_per_kg,
          total_processing_cost: transformationData.total_processing_cost,
          status: 'sent',
        })
        .select()
        .single();

      if (error) throw error;

      // Create outward transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          transaction_type: "out",
          material_id: transformationData.input_sku_id,
          location_id: "default-location-id", // Should be selected from UI
          quantity: transformationData.input_weight_kg,
          weight_kg: transformationData.input_weight_kg,
          batch_id: transformationData.input_batch_id,
          transformation_id: data.id,
          reference_type: "job_work_outward",
          reference_id: data.id,
          notes: `Job work outward - ${jobWorkNumber}`,
        });

      if (transactionError) throw transactionError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-work-transformations"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["batch-inventory"] });
      toast({
        title: "Success",
        description: "Job work transformation created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create job work transformation: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useCompleteJobWorkTransformation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      actual_output_weight_kg,
      location_id,
      unit_cost_per_kg,
    }: {
      id: string;
      actual_output_weight_kg: number;
      location_id: string;
      unit_cost_per_kg?: number;
    }) => {
      // Get transformation details
      const { data: transformation, error: fetchError } = await supabase
        .from("job_work_transformations")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Generate batch code for output
      const { data: batchCode, error: codeError } = await supabase
        .rpc("generate_batch_code");

      if (codeError) throw codeError;

      // Create output batch
      const { data: outputBatch, error: batchError } = await supabase
        .from("batches")
        .insert({
          batch_code: batchCode,
          sku_id: transformation.output_sku_id,
          supplier_id: transformation.contractor_id,
          total_weight_kg: actual_output_weight_kg,
          available_weight_kg: actual_output_weight_kg,
          quality_grade: "A", // Default, should be configurable
          received_date: new Date().toISOString().split("T")[0],
          status: "active",
          notes: `Processed from job work ${transformation.job_work_number}`,
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Update transformation
      const { data: updatedTransformation, error: updateError } = await supabase
        .from("job_work_transformations")
        .update({
          actual_output_weight_kg,
          output_batch_id: outputBatch.id,
          actual_return_date: new Date().toISOString().split("T")[0],
          status: "completed",
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Create inward transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          transaction_type: "in",
          material_id: transformation.output_sku_id,
          location_id,
          quantity: actual_output_weight_kg,
          weight_kg: actual_output_weight_kg,
          batch_id: outputBatch.id,
          transformation_id: id,
          unit_cost: unit_cost_per_kg,
          reference_type: "job_work_inward",
          reference_id: id,
          notes: `Job work inward - ${transformation.job_work_number}`,
        });

      if (transactionError) throw transactionError;

      return updatedTransformation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-work-transformations"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["batch-inventory"] });
      toast({
        title: "Success",
        description: "Job work completed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to complete job work: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};