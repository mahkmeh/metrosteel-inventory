import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMaterialsWithStock = (searchTerm?: string, sortField = "created_at", sortDirection: "asc" | "desc" = "desc") => {
  return useQuery({
    queryKey: ["materials-with-stock", searchTerm, sortField, sortDirection],
    queryFn: async () => {
      console.log("Fetching materials with stock data...");
      
      // First, get materials with search filter
      let materialsQuery = supabase
        .from("materials")
        .select("*")
        .eq("is_active", true);

      // Apply search filter
      if (searchTerm) {
        materialsQuery = materialsQuery.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,grade.ilike.%${searchTerm}%`);
      }

      const { data: materialsData, error: materialsError } = await materialsQuery;
      if (materialsError) {
        console.error("Materials query error:", materialsError);
        throw materialsError;
      }

      console.log("Materials fetched:", materialsData?.length);

      if (!materialsData || materialsData.length === 0) {
        return [];
      }

      // Get inventory data for all materials
      const materialIds = materialsData.map(m => m.id);
      const { data: inventoryData, error: inventoryError } = await supabase
        .from("inventory")
        .select(`
          material_id,
          location_id,
          quantity,
          available_quantity,
          reserved_quantity,
          unit_cost,
          total_value,
          quality_grade,
          locations (
            id,
            name
          )
        `)
        .in("material_id", materialIds);

      if (inventoryError) {
        console.error("Inventory query error:", inventoryError);
        throw inventoryError;
      }

      console.log("Inventory data fetched:", inventoryData?.length);

      // Get pending purchase order quantities
      const { data: pendingOrders, error: ordersError } = await supabase
        .from("purchase_order_items")
        .select(`
          material_id,
          quantity,
          purchase_orders!inner (
            status
          )
        `)
        .in("purchase_orders.status", ["pending", "approved", "ordered"])
        .in("material_id", materialIds);

      if (ordersError) {
        console.error("Purchase orders query error:", ordersError);
        // Don't throw error for pending orders, just log and continue
        console.warn("Continuing without pending orders data");
      }

      console.log("Pending orders fetched:", pendingOrders?.length || 0);

      // Process and combine data
      const materialsWithStock = materialsData.map(material => {
        // Get inventory for this material
        const materialInventory = inventoryData?.filter(inv => inv.material_id === material.id) || [];

        // Calculate current stock across all locations
        const currentStock = materialInventory.reduce((total, inv) => {
          return total + (inv.available_quantity || inv.quantity - (inv.reserved_quantity || 0));
        }, 0);

        // Calculate total inventory value and weighted average cost
        const totalInventoryValue = materialInventory.reduce((total, inv) => {
          return total + (inv.total_value || 0);
        }, 0);

        const totalQuantity = materialInventory.reduce((total, inv) => {
          return total + (inv.quantity || 0);
        }, 0);

        const weightedAvgCost = totalQuantity > 0 ? totalInventoryValue / totalQuantity : 0;

        // Calculate ordered quantity from pending POs
        const orderedQty = pendingOrders
          ?.filter(order => order.material_id === material.id)
          .reduce((total, order) => total + (order.quantity || 0), 0) || 0;

        // Calculate total expected (current + ordered)
        const totalExpected = currentStock + orderedQty;

        // Determine stock status
        let stockStatus: "critical" | "low" | "adequate" = "adequate";
        let statusColor = "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
        
        if (currentStock === 0) {
          stockStatus = "critical";
          statusColor = "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
        } else if (currentStock < 100) { // Define threshold later as configurable
          stockStatus = "low";
          statusColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
        }

        // Transform inventory data for locations
        const locations = materialInventory.map(inv => ({
          id: inv.location_id,
          name: inv.locations?.name || "Unknown Location",
          quantity: inv.quantity || 0,
          available: inv.available_quantity || (inv.quantity - (inv.reserved_quantity || 0))
        }));

        return {
          ...material,
          currentStock,
          orderedQty,
          totalExpected,
          stockStatus,
          statusColor,
          totalInventoryValue,
          weightedAvgCost,
          totalQuantity,
          // Keep inventory details for drill-down
          inventoryDetails: materialInventory,
          locations
        };
      });

      console.log("Materials with stock processed:", materialsWithStock.length);

      // Apply sorting
      materialsWithStock.sort((a, b) => {
        let aValue = a[sortField as keyof typeof a];
        let bValue = b[sortField as keyof typeof b];

        if (sortField === "currentStock" || sortField === "orderedQty" || sortField === "totalExpected") {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc" 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });

      return materialsWithStock;
    },
    staleTime: 30000, // 30 seconds
  });
};
