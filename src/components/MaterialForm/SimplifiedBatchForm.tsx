
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

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
      batch_code: `BATCH-${Date.now()}`,
      total_weight_kg: 0,
      heat_number: "",
      make: defaultMake,
      notes: "",
    };
    onBatchesChange([...batches, newBatch]);
  };

  const removeBatch = (index: number) => {
    if (batches.length > 1) {
      onBatchesChange(batches.filter((_, i) => i !== index));
    }
  };

  const updateBatch = (index: number, field: keyof Batch, value: string | number) => {
    const updatedBatches = batches.map((batch, i) => 
      i === index ? { ...batch, [field]: value } : batch
    );
    onBatchesChange(updatedBatches);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Initial Stock Batches</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addBatch}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Batch
        </Button>
      </div>

      {batches.map((batch, index) => (
        <Card key={index} className="relative">
          <CardContent className="pt-4">
            {batches.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeBatch(index)}
                className="absolute top-2 right-2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`batch_code_${index}`}>Batch Code *</Label>
                <Input
                  id={`batch_code_${index}`}
                  value={batch.batch_code}
                  onChange={(e) => updateBatch(index, "batch_code", e.target.value)}
                  placeholder="e.g., BATCH-001"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`weight_${index}`}>Weight (KG) *</Label>
                <Input
                  id={`weight_${index}`}
                  type="number"
                  step="0.1"
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
                  placeholder="Optional"
                />
              </div>
              
              <div>
                <Label htmlFor={`make_${index}`}>Make</Label>
                <Input
                  id={`make_${index}`}
                  value={batch.make || ""}
                  onChange={(e) => updateBatch(index, "make", e.target.value)}
                  placeholder="Manufacturer"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
