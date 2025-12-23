import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, User, Scale, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface BatchDrilldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: {
    id: string;
    name: string;
    sku: string;
    unit: string;
    currentStock?: number;
  } | null;
}

export const BatchDrilldownModal: React.FC<BatchDrilldownModalProps> = ({
  isOpen,
  onClose,
  material,
}) => {
  const { data: batches, isLoading } = useQuery({
    queryKey: ["batch-drilldown", material?.id],
    queryFn: async () => {
      if (!material?.id) return [];
      
      const { data, error } = await supabase
        .from("batches")
        .select(`
          *,
          suppliers(name)
        `)
        .eq("sku_id", material.id)
        .order("available_weight_kg", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!material?.id && isOpen,
  });

  const activeBatches = batches?.filter(b => b.status === "active") || [];
  const inactiveBatches = batches?.filter(b => b.status !== "active") || [];
  
  const totalAvailable = activeBatches.reduce((sum, b) => sum + (b.available_weight_kg || 0), 0);
  const totalReserved = activeBatches.reduce((sum, b) => sum + (b.reserved_weight_kg || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "depleted":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case "quarantine":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getQualityColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400";
      case "B":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "C":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Details: {material?.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            SKU: {material?.sku}
          </p>
        </DialogHeader>

        {/* Summary Card */}
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{totalAvailable.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Available {material?.unit}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{totalReserved.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Reserved {material?.unit}</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{activeBatches.length}</p>
                <p className="text-xs text-muted-foreground">Active Batches</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : batches?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-2" />
            <p>No batches found for this material</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Batches */}
            {activeBatches.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-green-600 dark:text-green-400">
                  Active Batches ({activeBatches.length})
                </h3>
                <div className="space-y-3">
                  {activeBatches.map((batch) => (
                    <Card key={batch.id} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              {batch.batch_code}
                            </Badge>
                            <Badge className={getQualityColor(batch.quality_grade)}>
                              Grade {batch.quality_grade}
                            </Badge>
                          </div>
                          <Badge className={getStatusColor(batch.status)}>
                            {batch.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{batch.available_weight_kg} {material?.unit}</p>
                              <p className="text-xs text-muted-foreground">Available</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{batch.total_weight_kg} {material?.unit}</p>
                              <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                          </div>

                          {batch.reserved_weight_kg > 0 && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                              <div>
                                <p className="font-medium text-amber-600">{batch.reserved_weight_kg} {material?.unit}</p>
                                <p className="text-xs text-muted-foreground">Reserved</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <Separator className="my-3" />

                        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                          {batch.suppliers?.name && (
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              <span>{batch.suppliers.name}</span>
                            </div>
                          )}
                          
                          {batch.heat_number && (
                            <div>
                              <span className="text-xs">Heat #:</span> {batch.heat_number}
                            </div>
                          )}
                          
                          {batch.make && (
                            <div>
                              <span className="text-xs">Make:</span> {batch.make}
                            </div>
                          )}

                          {batch.received_date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>Received: {format(new Date(batch.received_date), "dd MMM yyyy")}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Inactive/Depleted Batches */}
            {inactiveBatches.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                  Other Batches ({inactiveBatches.length})
                </h3>
                <div className="space-y-2">
                  {inactiveBatches.map((batch) => (
                    <Card key={batch.id} className="opacity-60">
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {batch.batch_code}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {batch.total_weight_kg} {material?.unit} total
                            </span>
                          </div>
                          <Badge className={getStatusColor(batch.status)}>
                            {batch.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
