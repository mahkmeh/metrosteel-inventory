
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export const useBatchCodeValidation = (batchCode: string, debounceMs: number = 500) => {
  const [debouncedBatchCode, setDebouncedBatchCode] = useState("");

  // Proper debouncing with useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBatchCode(batchCode);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [batchCode, debounceMs]);

  return useQuery({
    queryKey: ["batch-code-exists", debouncedBatchCode],
    queryFn: async () => {
      if (!debouncedBatchCode || debouncedBatchCode.length < 2) {
        return { exists: false, count: 0 };
      }
      
      const { data, error } = await supabase
        .from("batches")
        .select("batch_code", { count: "exact" })
        .eq("batch_code", debouncedBatchCode)
        .limit(1);

      if (error) throw error;
      
      return { 
        exists: (data?.length || 0) > 0,
        count: data?.length || 0
      };
    },
    enabled: !!debouncedBatchCode && debouncedBatchCode.length >= 2,
    staleTime: 30000, // Cache for 30 seconds
  });
};

export const useRecentBatchCodes = (limit: number = 5) => {
  return useQuery({
    queryKey: ["recent-batch-codes", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batches")
        .select("batch_code")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data?.map(b => b.batch_code) || [];
    },
    staleTime: 60000, // Cache for 1 minute
  });
};
