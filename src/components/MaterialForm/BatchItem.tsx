import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Paperclip, Link, Plus, Trash2, X, AlertTriangle, CheckCircle } from "lucide-react";
import { useBatchCodeValidation } from "@/hooks/useBatchCodeValidation";

interface Batch {
  id?: string;
  batch_code: string;
  total_weight_kg: number;
  heat_number?: string;
  notes?: string;
}

interface BatchItemProps {
  batch: Batch;
  index: number;
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  showNotes: boolean;
  onToggleNotes: (index: number) => void;
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

export const BatchItem: React.FC<BatchItemProps> = ({ 
  batch, 
  index, 
  onUpdate, 
  onRemove, 
  canRemove, 
  showNotes, 
  onToggleNotes 
}) => {
  const { data: validation } = useBatchCodeValidation(batch.batch_code);
  const batchExists = validation?.exists && batch.batch_code.length >= 2;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">Batch {index + 1}</h4>
          {canRemove && (
            <Button
              onClick={() => onRemove(index)}
              variant="outline"
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor={`batch_code_${index}`}>Batch Number *</Label>
            <div className="relative">
              <Input
                id={`batch_code_${index}`}
                value={batch.batch_code}
                onChange={(e) => onUpdate(index, "batch_code", e.target.value)}
                placeholder="e.g., B2024001"
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
            <Label htmlFor={`weight_${index}`}>Weight (kg) *</Label>
            <Input
              id={`weight_${index}`}
              type="number"
              step="0.1"
              value={batch.total_weight_kg}
              onChange={(e) => onUpdate(index, "total_weight_kg", parseFloat(e.target.value) || 0)}
              placeholder="e.g., 500.5"
              required
            />
          </div>

          <div>
            <Label htmlFor={`heat_number_${index}`}>Heat Number</Label>
            <div className="flex space-x-2">
              <Input
                id={`heat_number_${index}`}
                value={batch.heat_number || ""}
                onChange={(e) => onUpdate(index, "heat_number", e.target.value)}
                placeholder="e.g., HT240515"
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" className="px-3">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="sm" className="px-3">
                <Link className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Notes with plus button */}
        <div className="mt-4">
          {!showNotes ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onToggleNotes(index)}
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
                  onClick={() => onToggleNotes(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                id={`notes_${index}`}
                value={batch.notes || ""}
                onChange={(e) => onUpdate(index, "notes", e.target.value)}
                placeholder="Additional notes for this batch..."
                className="min-h-[60px]"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};