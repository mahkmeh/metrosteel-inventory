import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useBatches, Batch } from "@/hooks/useBatches";
import { Check, AlertTriangle } from "lucide-react";

interface BatchSelection {
  batch: Batch;
  selectedWeight: number;
}

interface BatchSelectorProps {
  materialId: string | null;
  requiredWeightKg: number;
  onBatchesSelect: (selections: BatchSelection[]) => void;
  selectedBatches?: BatchSelection[];
  mode?: "single" | "multiple";
}

export const BatchSelector = ({
  materialId,
  requiredWeightKg,
  onBatchesSelect,
  selectedBatches = [],
  mode = "multiple",
}: BatchSelectorProps) => {
  const [selections, setSelections] = useState<BatchSelection[]>(selectedBatches);
  const { data: allBatches = [], isLoading } = useBatches();
  const batches = allBatches.filter(batch => batch.sku_id === materialId);

  const handleBatchToggle = (batch: Batch, checked: boolean) => {
    if (mode === "single") {
      if (checked) {
        const newSelection = {
          batch,
          selectedWeight: Math.min(batch.available_weight_kg, requiredWeightKg),
        };
        setSelections([newSelection]);
        onBatchesSelect([newSelection]);
      } else {
        setSelections([]);
        onBatchesSelect([]);
      }
      return;
    }

    // Multiple mode
    if (checked) {
      const remainingWeight = requiredWeightKg - getTotalSelectedWeight();
      const selectedWeight = Math.min(batch.available_weight_kg, remainingWeight);
      
      const newSelection = { batch, selectedWeight };
      const newSelections = [...selections, newSelection];
      setSelections(newSelections);
      onBatchesSelect(newSelections);
    } else {
      const newSelections = selections.filter(s => s.batch.id !== batch.id);
      setSelections(newSelections);
      onBatchesSelect(newSelections);
    }
  };

  const handleWeightChange = (batchId: string, weight: number) => {
    const newSelections = selections.map(selection =>
      selection.batch.id === batchId
        ? { ...selection, selectedWeight: Math.min(weight, selection.batch.available_weight_kg) }
        : selection
    );
    setSelections(newSelections);
    onBatchesSelect(newSelections);
  };

  const getTotalSelectedWeight = () => {
    return selections.reduce((total, selection) => total + selection.selectedWeight, 0);
  };

  const isSelected = (batchId: string) => {
    return selections.some(s => s.batch.id === batchId);
  };

  const getSelectedWeight = (batchId: string) => {
    return selections.find(s => s.batch.id === batchId)?.selectedWeight || 0;
  };

  const getQualityBadgeColor = (grade: string) => {
    switch (grade) {
      case "A": return "bg-green-100 text-green-800";
      case "B": return "bg-yellow-100 text-yellow-800";
      case "C": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalSelected = getTotalSelectedWeight();
  const isComplete = totalSelected >= requiredWeightKg;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading batches...</div>
        </CardContent>
      </Card>
    );
  }

  if (!materialId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Please select a material first</div>
        </CardContent>
      </Card>
    );
  }

  if (batches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">No batches available for this material</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Available Batches
          <div className="flex items-center gap-2">
            {isComplete && <Check className="h-4 w-4 text-green-600" />}
            <Badge variant={isComplete ? "default" : "secondary"}>
              {totalSelected.toFixed(2)} / {requiredWeightKg.toFixed(2)} KG
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Select</TableHead>
                <TableHead>Batch Code</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Available (KG)</TableHead>
                <TableHead>Heat Number</TableHead>
                <TableHead>Supplier</TableHead>
                {mode === "multiple" && <TableHead>Use Weight (KG)</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>
                    <Checkbox
                      checked={isSelected(batch.id)}
                      onCheckedChange={(checked) => handleBatchToggle(batch, checked as boolean)}
                      disabled={!isSelected(batch.id) && totalSelected >= requiredWeightKg}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{batch.batch_code}</TableCell>
                  <TableCell>
                    <Badge className={getQualityBadgeColor(batch.quality_grade)}>
                      Grade {batch.quality_grade}
                    </Badge>
                  </TableCell>
                  <TableCell>{batch.available_weight_kg.toFixed(2)}</TableCell>
                  <TableCell>{batch.heat_number || "N/A"}</TableCell>
                  <TableCell>{batch.supplier?.name || "N/A"}</TableCell>
                  {mode === "multiple" && (
                    <TableCell>
                      {isSelected(batch.id) ? (
                        <Input
                          type="number"
                          min="0"
                          max={batch.available_weight_kg}
                          step="0.01"
                          value={getSelectedWeight(batch.id)}
                          onChange={(e) => handleWeightChange(batch.id, parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {!isComplete && totalSelected > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">
                Still need {(requiredWeightKg - totalSelected).toFixed(2)} KG more
              </span>
            </div>
          </div>
        )}

        {mode === "multiple" && (
          <div className="mt-4 text-sm text-muted-foreground">
            <strong>Selection Strategy:</strong> FIFO (First In, First Out) - Older batches are listed first
          </div>
        )}
      </CardContent>
    </Card>
  );
};