import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SalesOrderItem {
  id: string;
  sales_order_id: string;
  material_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  batch_selection_status: string;
  notes?: string;
  materials: {
    id: string;
    name: string;
    sku: string;
    grade: string;
    category: string;
  } | null;
}

interface BatchAllocation {
  id: string;
  sales_order_item_id: string;
  batch_id: string;
  allocated_quantity_kg: number;
  batches: {
    batch_code: string;
    quality_grade: string;
  } | null;
}

export function useSalesOrderItems(salesOrderId?: string) {
  return useQuery({
    queryKey: ["sales-order-items", salesOrderId],
    queryFn: async () => {
      if (!salesOrderId) return null;

      const { data: items, error: itemsError } = await supabase
        .from("sales_order_items")
        .select(`
          id,
          sales_order_id,
          material_id,
          quantity,
          unit_price,
          line_total,
          batch_selection_status,
          notes,
          materials!material_id (
            id,
            name,
            sku,
            grade,
            category
          )
        `)
        .eq("sales_order_id", salesOrderId);

      if (itemsError) throw itemsError;

      // Fetch existing batch allocations for these items
      const itemIds = items?.map(item => item.id) || [];
      let allocations: BatchAllocation[] = [];
      
      if (itemIds.length > 0) {
        const { data: allocationsData, error: allocationsError } = await supabase
          .from("sales_order_batch_allocations")
          .select(`
            id,
            sales_order_item_id,
            batch_id,
            allocated_quantity_kg
          `)
          .in("sales_order_item_id", itemIds);

        if (allocationsError) throw allocationsError;
        
        // Fetch batch details separately
        const batchIds = allocationsData?.map(a => a.batch_id) || [];
        let batchDetails = [];
        
        if (batchIds.length > 0) {
          const { data: batchData, error: batchError } = await supabase
            .from("batches")
            .select("id, batch_code, quality_grade")
            .in("id", batchIds);
          
          if (batchError) throw batchError;
          batchDetails = batchData || [];
        }
        
        // Combine allocations with batch details
        allocations = allocationsData?.map(alloc => ({
          ...alloc,
          batches: batchDetails.find(b => b.id === alloc.batch_id) || null
        })) || [];
      }

      // Combine items with their allocations
      const itemsWithAllocations = items?.map(item => ({
        ...item,
        allocations: allocations.filter(alloc => alloc.sales_order_item_id === item.id)
      }));

      return itemsWithAllocations;
    },
    enabled: !!salesOrderId,
  });
}