
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, X, AlertTriangle, CheckCircle } from "lucide-react";
import { useBatchCodeValidation } from "@/hooks/useBatchCodeValidation";

interface Batch {
  id?: string;
  batch_code: string;
  total_weight_kg: number;
  heat_number?: string;
  make?: string;
  notes?: string;
}

interface UnifiedBatchFormProps {
  batches: Batch[];
  onBatchesChange: (batches: Batch[]) => void;
  canAddMultiple?: boolean;
  showTitle?: boolean;
}

const BatchCodeValidation: React.FC<{ batchCode: string }> = ({ batchCode }) => {
  const { data: validation, isLoading } = useBatchCodeValidation(batchCode);

  if (!batchCode || batchCode.length < 2) return null;
  
  if (isLoading) {
    return (
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (validation?.exists) {
    return (
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
      </div>
    );
  }

  return (
    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
      <CheckCircle className="h-4 w-4 text-green-500" />
    </div>
  );
};

export const UnifiedBatchForm: React.FC<UnifiedBatchFormProps> = ({ 
  batches, 
  onBatchesChange, 
  canAddMultiple = true,
  showTitle = true 
}) => {
  const [showBatchNotes, setShowBatchNotes] = useState<{[key: number]: boolean}>({});

  const addBatch = () => {
    if (!canAddMultiple && batches.length > 0) return;
    
    const newBatches = [
      ...batches,
      {
        batch_code: "",
        total_weight_kg: 0,
        heat_number: "",
        make: "",
        notes: "",
      },
    ];
    onBatchesChange(newBatches);
  };

  const removeBatch = (index: number) => {
    if (batches.length > 1) {
      const updatedBatches = batches.filter((_, i) => i !== index);
      onBatchesChange(updatedBatches);
      // Remove notes visibility state for removed batch
      const newShowBatchNotes = { ...showBatchNotes };
      delete newShowBatchNotes[index];
      // Reindex remaining batch notes
      Object.keys(newShowBatchNotes).forEach(key => {
        const keyNum = parseInt(key);
        if (keyNum > index) {
          newShowBatchNotes[keyNum - 1] = newShowBatchNotes[keyNum];
          delete newShowBatchNotes[keyNum];
        }
      });
      setShowBatchNotes(newShowBatchNotes);
    }
  };

  const updateBatch = (index: number, field: string, value: string | number) => {
    const updatedBatches = batches.map((batch, i) =>
      i === index ? { ...batch, [field]: value } : batch
    );
    onBatchesChange(updatedBatches);
  };

  const toggleBatchNotes = (index: number) => {
    setShowBatchNotes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Batches</h3>
          {canAddMultiple && (
            <Button onClick={addBatch} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Batch
            </Button>
          )}
        </div>
      )}

      {batches.map((batch, index) => {
        const { data: validation } = useBatchCodeValidation(batch.batch_code);
        const batchExists = validation?.exists && batch.batch_code.length >= 2;

        return (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Batch {index + 1}</h4>
                {(batches.length > 1 || !canAddMultiple) && (
                  <Button
                    onClick={() => removeBatch(index)}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`batch_code_${index}`}>Batch Code *</Label>
                  <div className="relative">
                    <Input
                      id={`batch_code_${index}`}
                      value={batch.batch_code}
                      onChange={(e) => updateBatch(index, "batch_code", e.target.value)}
                      placeholder="e.g., 14G1-B1"
                      className={batchExists ? "border-destructive" : ""}
                      required
                    />
                    <BatchCodeValidation batchCode={batch.batch_code} />
                  </div>
                  {batchExists && (
                    <p className="text-xs text-destructive mt-1">This batch code already exists</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`weight_${index}`}>Total Weight (kg) *</Label>
                  <Input
                    id={`weight_${index}`}
                    type="number"
                    step="0.1"
                    value={batch.total_weight_kg}
                    onChange={(e) => updateBatch(index, "total_weight_kg", parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 500.5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor={`heat_number_${index}`}>Heat Number</Label>
                  <Input
                    id={`heat_number_${index}`}
                    value={batch.heat_number || ""}
                    onChange={(e) => updateBatch(index, "heat_number", e.target.value)}
                    placeholder="e.g., HT240515"
                  />
                </div>

                <div>
                  <Label htmlFor={`make_${index}`}>Make/Brand</Label>
                  <Input
                    id={`make_${index}`}
                    value={batch.make || ""}
                    onChange={(e) => updateBatch(index, "make", e.target.value)}
                    placeholder="e.g., Jindal, Tata Steel"
                  />
                </div>
              </div>

              {/* Notes with plus button */}
              <div className="mt-4">
                {!showBatchNotes[index] ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleBatchNotes(index)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Notes
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`notes_${index}`}>Notes</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBatchNotes(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      id={`notes_${index}`}
                      value={batch.notes || ""}
                      onChange={(e) => updateBatch(index, "notes", e.target.value)}
                      placeholder="Additional notes for this batch..."
                      className="min-h-[60px]"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {batches.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No batches added yet.</p>
          <Button onClick={addBatch} variant="outline" size="sm" className="mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Add First Batch
          </Button>
        </div>
      )}
    </div>
  );
};
