import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package } from "lucide-react";
import { useBatchCodeValidation } from "@/hooks/useBatchCodeValidation";

interface BatchSelectionForPOProps {
  materialId: string;
  onBatchSelect: (batch: any) => void;
  onCreateBatch: (batchData: any) => void;
  selectedBatch?: any;
}

export const BatchSelectionForPO = ({ 
  materialId, 
  onBatchSelect, 
  onCreateBatch,
  selectedBatch 
}: BatchSelectionForPOProps) => {
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [newBatchCode, setNewBatchCode] = useState("");
  const [newBatchData, setNewBatchData] = useState({
    total_weight_kg: 0,
    heat_number: "",
    make: "",
    quality_grade: "A",
    compliance_status: "pending",
    manufactured_date: "",
    received_date: "",
    expiry_date: "",
    notes: ""
  });

  const { data: batchCodeValidation } = useBatchCodeValidation(newBatchCode);

  // Fetch existing batches for this material
  const { data: existingBatches } = useQuery({
    queryKey: ["material-batches", materialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batches")
        .select(`
          *,
          material:materials(name, sku),
          supplier:suppliers(name)
        `)
        .eq("sku_id", materialId)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!materialId,
  });

  const handleCreateBatch = () => {
    const batchData = {
      batch_code: newBatchCode,
      sku_id: materialId,
      total_weight_kg: newBatchData.total_weight_kg,
      available_weight_kg: newBatchData.total_weight_kg,
      ...newBatchData
    };
    
    onCreateBatch(batchData);
    setShowCreateBatch(false);
    resetNewBatchForm();
  };

  const resetNewBatchForm = () => {
    setNewBatchCode("");
    setNewBatchData({
      total_weight_kg: 0,
      heat_number: "",
      make: "",
      quality_grade: "A",
      compliance_status: "pending",
      manufactured_date: "",
      received_date: "",
      expiry_date: "",
      notes: ""
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Batch Selection</Label>
        <Dialog open={showCreateBatch} onOpenChange={setShowCreateBatch}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create New Batch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Batch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="batch_code">Batch Code *</Label>
                <Input
                  id="batch_code"
                  value={newBatchCode}
                  onChange={(e) => setNewBatchCode(e.target.value)}
                  placeholder="Enter batch code"
                />
                {batchCodeValidation?.exists && (
                  <p className="text-sm text-destructive mt-1">
                    Batch code already exists
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="total_weight">Total Weight (KG) *</Label>
                <Input
                  id="total_weight"
                  type="number"
                  step="0.01"
                  value={newBatchData.total_weight_kg}
                  onChange={(e) => setNewBatchData({
                    ...newBatchData,
                    total_weight_kg: parseFloat(e.target.value) || 0
                  })}
                />
              </div>

              <div>
                <Label htmlFor="heat_number">Heat Number</Label>
                <Input
                  id="heat_number"
                  value={newBatchData.heat_number}
                  onChange={(e) => setNewBatchData({
                    ...newBatchData,
                    heat_number: e.target.value
                  })}
                />
              </div>

              <div>
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={newBatchData.make}
                  onChange={(e) => setNewBatchData({
                    ...newBatchData,
                    make: e.target.value
                  })}
                />
              </div>

              <div>
                <Label htmlFor="quality_grade">Quality Grade</Label>
                <Select
                  value={newBatchData.quality_grade}
                  onValueChange={(value) => setNewBatchData({
                    ...newBatchData,
                    quality_grade: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateBatch(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={handleCreateBatch}
                  disabled={!newBatchCode || newBatchData.total_weight_kg <= 0 || batchCodeValidation?.exists}
                >
                  Create Batch
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Selected Batch Display */}
      {selectedBatch && (
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              Selected Batch: {selectedBatch.batch_code}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Available: {selectedBatch.available_weight_kg} KG</div>
              <div>Grade: {selectedBatch.quality_grade}</div>
              {selectedBatch.heat_number && (
                <div>Heat: {selectedBatch.heat_number}</div>
              )}
              {selectedBatch.make && (
                <div>Make: {selectedBatch.make}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Batches List */}
      {existingBatches && existingBatches.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Available Batches</Label>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {existingBatches.map((batch) => (
              <Card 
                key={batch.id}
                className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedBatch?.id === batch.id ? 'border-primary' : ''
                }`}
                onClick={() => onBatchSelect(batch)}
              >
                <CardContent className="p-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{batch.batch_code}</div>
                      <div className="text-xs text-muted-foreground">
                        Available: {batch.available_weight_kg} KG
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Grade {batch.quality_grade}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {(!existingBatches || existingBatches.length === 0) && !selectedBatch && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          No existing batches for this material. Create a new batch above.
        </div>
      )}
    </div>
  );
};
