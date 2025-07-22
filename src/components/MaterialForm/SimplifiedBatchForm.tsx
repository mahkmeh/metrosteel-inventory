
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Package } from "lucide-react";

interface Batch {
  batch_code: string;
  total_weight_kg: number;
  heat_number?: string;
  make?: string;
  notes?: string;
}

interface SimplifiedBatchFormProps {
  batches: Batch[];
  onBatchesChange: (batches: Batch[]) => void;
  defaultMake?: string;
}

export const SimplifiedBatchForm: React.FC<SimplifiedBatchFormProps> = ({
  batches,
  onBatchesChange,
  defaultMake = "",
}) => {
  const addBatch = () => {
    const newBatch: Batch = {
      batch_code: "",
      total_weight_kg: 0,
      heat_number: "",
      make: defaultMake,
      notes: "",
    };
    onBatchesChange([...batches, newBatch]);
  };

  const updateBatch = (index: number, field: keyof Batch, value: string | number) => {
    const updatedBatches = batches.map((batch, i) => 
      i === index ? { ...batch, [field]: value } : batch
    );
    onBatchesChange(updatedBatches);
  };

  const removeBatch = (index: number) => {
    if (batches.length > 1) {
      const updatedBatches = batches.filter((_, i) => i !== index);
      onBatchesChange(updatedBatches);
    }
  };

  // Initialize with one batch if empty
  React.useEffect(() => {
    if (batches.length === 0) {
      addBatch();
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Initial Batches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {batches.map((batch, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Batch #{index + 1}</h4>
              {batches.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBatch(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`batch_code_${index}`}>Batch Code *</Label>
                <Input
                  id={`batch_code_${index}`}
                  value={batch.batch_code}
                  onChange={(e) => updateBatch(index, "batch_code", e.target.value)}
                  placeholder="Enter batch code (e.g., BATCH-001)"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`weight_${index}`}>Total Weight (KG) *</Label>
                <Input
                  id={`weight_${index}`}
                  type="number"
                  step="0.01"
                  value={batch.total_weight_kg || ""}
                  onChange={(e) => updateBatch(index, "total_weight_kg", parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 1000"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`heat_number_${index}`}>Heat Number</Label>
                <Input
                  id={`heat_number_${index}`}
                  value={batch.heat_number || ""}
                  onChange={(e) => updateBatch(index, "heat_number", e.target.value)}
                  placeholder="e.g., HN-2024-001"
                />
              </div>
              
              <div>
                <Label htmlFor={`make_${index}`}>Make</Label>
                <Input
                  id={`make_${index}`}
                  value={batch.make || ""}
                  onChange={(e) => updateBatch(index, "make", e.target.value)}
                  placeholder="e.g., Jindal, Tata Steel"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor={`notes_${index}`}>Notes</Label>
              <Textarea
                id={`notes_${index}`}
                value={batch.notes || ""}
                onChange={(e) => updateBatch(index, "notes", e.target.value)}
                placeholder="Additional notes about this batch..."
                className="min-h-[60px]"
              />
            </div>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={addBatch}
          className="w-full flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Another Batch
        </Button>
      </CardContent>
    </Card>
  );
};
