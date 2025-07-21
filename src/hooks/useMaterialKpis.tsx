import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMaterialKpis = () => {
  return useQuery({
    queryKey: ["material-kpis"],
    queryFn: async () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [materialsRes, inventoryRes, valuationSummaryRes] = await Promise.all([
        supabase.from("materials").select("*").eq("is_active", true),
        supabase.from("inventory_valuation").select("*"),
        supabase.from("inventory_valuation_summary").select("*").single()
      ]);

      if (materialsRes.error) throw materialsRes.error;
      if (inventoryRes.error) throw inventoryRes.error;
      if (valuationSummaryRes.error) throw valuationSummaryRes.error;

      const materials = materialsRes.data || [];
      const inventory = inventoryRes.data || [];
      const valuationSummary = valuationSummaryRes.data;

      // 1. Reorder Now - Count below minimum (using 10 as minimum threshold)
      const reorderNow = inventory.filter(item => 
        (item.available_quantity || 0) < 10
      );

      // 2. Excess Stock - Count above maximum (using 1000 as maximum threshold)
      const excessStock = inventory.filter(item => 
        (item.quantity || 0) > 1000
      );
      const excessStockValue = excessStock.reduce((sum, item) => {
        const excess = (item.quantity || 0) - 1000;
        const avgCost = item.weighted_avg_cost || 0;
        return sum + (excess * avgCost);
      }, 0);

      // 3. Price Updates Required - Count with old prices (simulated as materials updated >30 days ago)
      const priceUpdatesRequired = materials.filter(material => {
        const updatedDate = new Date(material.updated_at);
        return updatedDate < thirtyDaysAgo && !material.base_price;
      });

      // 4. Quality Hold - Simulated count of materials on hold
      const qualityHold = Math.floor(Math.random() * 5); // Simulated for demo

      return {
        reorderNow: reorderNow.length,
        excessStock: {
          count: excessStock.length,
          value: excessStockValue
        },
        priceUpdatesRequired: priceUpdatesRequired.length,
        qualityHold,
        totalInventoryValue: valuationSummary?.total_inventory_value || 0,
        totalMaterials: valuationSummary?.total_materials || 0,
        overallAvgCost: valuationSummary?.overall_avg_cost || 0
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};