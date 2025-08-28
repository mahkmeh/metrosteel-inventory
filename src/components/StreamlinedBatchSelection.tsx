import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Package2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BatchDetails {
  id: string;
  batch_code: string;
  available_weight_kg: number;
  quality_grade: string;
  heat_number?: string;
  make?: string;
}

interface BatchAllocation {
  batchId: string;
  allocatedQuantity: number;
  batch: BatchDetails;
}

interface StreamlinedBatchSelectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string;
  materialName: string;
  requiredQuantity: number;
  onComplete: (allocations: BatchAllocation[]) => void;
}

export function StreamlinedBatchSelection({
  open,
  onOpenChange,
  materialId,
  materialName,
  requiredQuantity,
  onComplete
}: StreamlinedBatchSelectionProps) {
  const [allocations, setAllocations] = useState<BatchAllocation[]>([]);
  const { toast } = useToast();

  // Fetch available batches
  const { data: batches } = useQuery({
    queryKey: ["material-batches", materialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batches")
        .select("id, batch_code, available_weight_kg, quality_grade, heat_number, make")
        .eq("sku_id", materialId)
        .eq("status", "active")
        .gt("available_weight_kg", 0)
        .order("received_date", { ascending: true });

      if (error) throw error;
      return data as BatchDetails[];
    },
    enabled: !!materialId && open,
  });

  useEffect(() => {
    if (open) {
      setAllocations([]);
    }
  }, [open]);

  const addNewAllocation = () => {
    if (!batches || batches.length === 0) return;
    
    setAllocations(prev => [...prev, {
      batchId: "",
      allocatedQuantity: 0,
      batch: batches[0]
    }]);
  };

  const updateAllocation = (index: number, field: 'batchId' | 'allocatedQuantity', value: string | number) => {
    setAllocations(prev => {
      const updated = [...prev];
      if (field === 'batchId') {
        const selectedBatch = batches?.find(b => b.id === value as string);
        if (selectedBatch) {
          updated[index] = {
            ...updated[index],
            batchId: value as string,
            batch: selectedBatch
          };
        }
      } else {
        updated[index] = {
          ...updated[index],
          allocatedQuantity: value as number
        };
      }
      return updated;
    });
  };

  const removeAllocation = (index: number) => {
    setAllocations(prev => prev.filter((_, i) => i !== index));
  };

  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.allocatedQuantity, 0);
  const remainingQuantity = requiredQuantity - totalAllocated;
  const isComplete = totalAllocated === requiredQuantity;
  const isOverAllocated = totalAllocated > requiredQuantity;

  const getAvailableBatches = (currentIndex: number) => {
    const usedBatchIds = allocations
      .map((alloc, index) => index !== currentIndex ? alloc.batchId : null)
      .filter(Boolean);
    
    return batches?.filter(batch => !usedBatchIds.includes(batch.id)) || [];
  };

  const validateAllocation = (allocation: BatchAllocation) => {
    if (!allocation.batchId || allocation.allocatedQuantity <= 0) return false;
    if (allocation.allocatedQuantity > allocation.batch.available_weight_kg) return false;
    return true;
  };

  const handleSave = () => {
    if (!isComplete) {
      toast({
        title: "Incomplete Allocation",
        description: `Please allocate the full quantity. Remaining: ${remainingQuantity.toFixed(2)} kg`,
        variant: "destructive"
      });
      return;
    }

    const invalidAllocations = allocations.filter(alloc => !validateAllocation(alloc));
    if (invalidAllocations.length > 0) {
      toast({
        title: "Invalid Allocations",
        description: "Please check all batch allocations for errors",
        variant: "destructive"
      });
      return;
    }

    onComplete(allocations);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Batch Selection - {materialName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Allocation Summary */}
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Total Quantity to Allocate</div>
                  <div className="text-lg font-semibold">{requiredQuantity} kg</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Allocated</div>
                  <div className={`text-lg font-semibold ${isOverAllocated ? 'text-destructive' : isComplete ? 'text-green-600' : 'text-orange-500'}`}>
                    {totalAllocated} kg
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Remaining</div>
                  <div className={`text-lg font-semibold ${remainingQuantity === 0 ? 'text-green-600' : 'text-orange-500'}`}>
                    {remainingQuantity.toFixed(2)} kg
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex items-center gap-2">
                {isComplete ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Fully Allocated
                  </Badge>
                ) : isOverAllocated ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Over Allocated
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Incomplete
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Batch Allocations */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {allocations.map((allocation, index) => {
              const availableBatches = getAvailableBatches(index);
              const isValid = validateAllocation(allocation);
              
              return (
                <Card key={index} className={`border ${!isValid && allocation.allocatedQuantity > 0 ? 'border-destructive' : ''}`}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-6">
                        <Label className="text-xs">Batch</Label>
                        <Select
                          value={allocation.batchId}
                          onValueChange={(value) => updateAllocation(index, 'batchId', value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select batch" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableBatches.map((batch) => (
                              <SelectItem key={batch.id} value={batch.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{batch.batch_code}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {batch.available_weight_kg} kg
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="col-span-3">
                        <Label className="text-xs">Quantity (kg)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max={allocation.batch?.available_weight_kg || 0}
                          value={allocation.allocatedQuantity || ""}
                          onChange={(e) => updateAllocation(index, 'allocatedQuantity', parseFloat(e.target.value) || 0)}
                          className="h-9"
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label className="text-xs">Balance</Label>
                        <div className="text-xs text-muted-foreground h-9 flex items-center">
                          {allocation.batch ? (allocation.batch.available_weight_kg - allocation.allocatedQuantity).toFixed(2) : "0"} kg
                        </div>
                      </div>
                      
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAllocation(index)}
                          className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                    
                    {allocation.batch && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Grade: {allocation.batch.quality_grade}
                        {allocation.batch.heat_number && ` • Heat: ${allocation.batch.heat_number}`}
                        {allocation.batch.make && ` • Make: ${allocation.batch.make}`}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Add New Allocation Button */}
          <Button
            type="button"
            variant="outline"
            onClick={addNewAllocation}
            className="w-full"
            disabled={!batches || batches.length === 0 || allocations.length >= batches.length}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Batch Allocation
          </Button>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSave}
              disabled={!isComplete || allocations.length === 0}
            >
              Save Allocation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}