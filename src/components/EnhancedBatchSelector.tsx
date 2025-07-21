
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Calendar, Factory, Hash, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface BatchDetails {
  id: string;
  batch_code: string;
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
  supplier?: {
    name: string;
  };
  unit_cost_per_kg?: number;
  total_value?: number;
}

interface EnhancedBatchSelectorProps {
  materialId: string;
  onBatchSelect: (batch: BatchDetails, quantity: number) => void;
  selectedBatches: { batch: BatchDetails; quantity: number }[];
  requiredQuantity: number;
}

export const EnhancedBatchSelector = ({ 
  materialId, 
  onBatchSelect, 
  selectedBatches, 
  requiredQuantity 
}: EnhancedBatchSelectorProps) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [allocationQuantity, setAllocationQuantity] = useState<number>(0);

  const { data: batches, isLoading } = useQuery({
    queryKey: ["enhanced-batches", materialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batches")
        .select(`
          *,
          supplier:suppliers(name),
          batch_inventory(
            quantity_kg,
            unit_cost_per_kg,
            total_value,
            location:locations(name)
          )
        `)
        .eq("sku_id", materialId)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BatchDetails[];
    },
    enabled: !!materialId,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-3 w-3" />;
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "rejected":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Package className="h-3 w-3" />;
    }
  };

  const handleBatchSelect = () => {
    if (!selectedBatchId || allocationQuantity <= 0) return;
    
    const selectedBatch = batches?.find(b => b.id === selectedBatchId);
    if (!selectedBatch) return;

    onBatchSelect(selectedBatch, allocationQuantity);
    setSelectedBatchId("");
    setAllocationQuantity(0);
  };

  const totalAllocated = selectedBatches.reduce((sum, item) => sum + item.quantity, 0);
  const remainingQuantity = requiredQuantity - totalAllocated;

  if (isLoading) {
    return <div className="text-center py-4">Loading batches...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Allocation Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            Batch Allocation Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{requiredQuantity}</div>
              <div className="text-xs text-muted-foreground">Required</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{totalAllocated}</div>
              <div className="text-xs text-muted-foreground">Allocated</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{remainingQuantity}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Select Batch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="batch-select">Available Batches</Label>
            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a batch" />
              </SelectTrigger>
              <SelectContent>
                {batches?.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{batch.batch_code}</span>
                      <span className="text-xs text-muted-foreground">
                        ({batch.available_weight_kg} KG available)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity to Allocate (KG)</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              step="0.01"
              value={allocationQuantity}
              onChange={(e) => setAllocationQuantity(parseFloat(e.target.value) || 0)}
              placeholder="Enter quantity"
            />
          </div>

          <Button 
            onClick={handleBatchSelect}
            disabled={!selectedBatchId || allocationQuantity <= 0}
            className="w-full"
          >
            Allocate Batch
          </Button>
        </CardContent>
      </Card>

      {/* Selected Batches */}
      {selectedBatches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Selected Batches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedBatches.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                <div>
                  <div className="font-medium text-sm">{item.batch.batch_code}</div>
                  <div className="text-xs text-muted-foreground">
                    Grade: {item.batch.quality_grade} | {item.batch.supplier?.name || 'Unknown'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">{item.quantity} KG</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency((item.batch.unit_cost_per_kg || 0) * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Available Batches Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Available Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {batches?.map((batch) => (
              <Card key={batch.id} className="border-l-4 border-l-primary/30">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{batch.batch_code}</div>
                    <Badge className={getComplianceColor(batch.compliance_status)}>
                      {getComplianceIcon(batch.compliance_status)}
                      <span className="ml-1 capitalize">{batch.compliance_status}</span>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      <span>Available: {batch.available_weight_kg} KG</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      <span>Grade: {batch.quality_grade}</span>
                    </div>
                    {batch.heat_number && (
                      <div className="flex items-center gap-1">
                        <Factory className="h-3 w-3" />
                        <span>Heat: {batch.heat_number}</span>
                      </div>
                    )}
                    {batch.make && (
                      <div className="flex items-center gap-1">
                        <Factory className="h-3 w-3" />
                        <span>Make: {batch.make}</span>
                      </div>
                    )}
                    {batch.received_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Received: {new Date(batch.received_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {batch.supplier?.name && (
                      <div className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        <span>Supplier: {batch.supplier.name}</span>
                      </div>
                    )}
                  </div>
                  
                  {batch.unit_cost_per_kg && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="flex justify-between text-xs">
                        <span>Cost per KG:</span>
                        <span className="font-medium">{formatCurrency(batch.unit_cost_per_kg)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Total Value:</span>
                        <span className="font-medium">{formatCurrency(batch.total_value || 0)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
