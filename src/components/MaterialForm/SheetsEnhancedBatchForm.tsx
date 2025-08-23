import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar } from "lucide-react";

interface SheetsBatch {
  batch_code: string;
  inward_date: string;
  total_inward_weight_kg: number;
  total_inward_pieces: number;
  weight_per_piece?: number; // auto-calculated
  scale_weight_per_piece?: number;
  total_scale_weight?: number; // auto-calculated
  heat_number?: string;
  base_price_per_kg?: number;
  total_price?: number; // auto-calculated
  make?: string;
}

interface SheetsEnhancedBatchFormProps {
  batch: SheetsBatch;
  onBatchChange: (batch: SheetsBatch) => void;
  onRemove?: () => void;
  defaultMake?: string;
  isCompact?: boolean;
}

export const SheetsEnhancedBatchForm: React.FC<SheetsEnhancedBatchFormProps> = ({
  batch,
  onBatchChange,
  onRemove,
  defaultMake = "",
  isCompact = false,
}) => {
  const updateField = (field: keyof SheetsBatch, value: string | number) => {
    const updatedBatch = { ...batch, [field]: value };
    
    // Auto-calculate derived fields
    if (field === "total_inward_weight_kg" || field === "total_inward_pieces") {
      if (updatedBatch.total_inward_weight_kg > 0 && updatedBatch.total_inward_pieces > 0) {
        updatedBatch.weight_per_piece = updatedBatch.total_inward_weight_kg / updatedBatch.total_inward_pieces;
      } else {
        updatedBatch.weight_per_piece = 0;
      }
    }
    
    if (field === "scale_weight_per_piece" || field === "total_inward_pieces") {
      if (updatedBatch.scale_weight_per_piece && updatedBatch.total_inward_pieces > 0) {
        updatedBatch.total_scale_weight = updatedBatch.scale_weight_per_piece * updatedBatch.total_inward_pieces;
      } else {
        updatedBatch.total_scale_weight = 0;
      }
    }
    
    // Auto-calculate total price
    if (field === "base_price_per_kg" || field === "total_scale_weight" || field === "total_inward_weight_kg") {
      if (updatedBatch.base_price_per_kg && updatedBatch.base_price_per_kg > 0) {
        const weightForPrice = (updatedBatch.total_scale_weight && updatedBatch.total_scale_weight > 0) 
          ? updatedBatch.total_scale_weight 
          : updatedBatch.total_inward_weight_kg;
        updatedBatch.total_price = updatedBatch.base_price_per_kg * weightForPrice;
      } else {
        updatedBatch.total_price = 0;
      }
    }
    
    onBatchChange(updatedBatch);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isCompact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Additional Batch</h4>
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <Label className="text-xs">Batch Code *</Label>
            <Input
              value={batch.batch_code}
              onChange={(e) => updateField("batch_code", e.target.value)}
              placeholder="BATCH-002"
              className="h-8"
            />
          </div>
          
          <div>
            <Label className="text-xs">Weight (KG) *</Label>
            <Input
              type="number"
              step="0.01"
              value={batch.total_inward_weight_kg || ""}
              onChange={(e) => updateField("total_inward_weight_kg", parseFloat(e.target.value) || 0)}
              placeholder="1000"
              className="h-8"
            />
          </div>
          
          <div>
            <Label className="text-xs">Pieces *</Label>
            <Input
              type="number"
              value={batch.total_inward_pieces || ""}
              onChange={(e) => updateField("total_inward_pieces", parseInt(e.target.value) || 0)}
              placeholder="50"
              className="h-8"
            />
          </div>
          
          <div>
            <Label className="text-xs">Price/KG *</Label>
            <Input
              type="number"
              step="0.01"
              value={batch.base_price_per_kg || ""}
              onChange={(e) => updateField("base_price_per_kg", parseFloat(e.target.value) || 0)}
              placeholder="75.00"
              className="h-8"
            />
          </div>
        </div>
        
        {batch.total_price && batch.total_price > 0 && (
          <div className="text-right text-sm">
            <span className="font-medium">Total: {formatCurrency(batch.total_price)}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Batch Details</h4>
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="batch_code">Batch Code *</Label>
          <Input
            id="batch_code"
            value={batch.batch_code}
            onChange={(e) => updateField("batch_code", e.target.value)}
            placeholder="e.g., BATCH-001"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="inward_date">Inward Date</Label>
          <div className="relative">
            <Input
              id="inward_date"
              type="date"
              value={batch.inward_date}
              onChange={(e) => updateField("inward_date", e.target.value)}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="total_inward_weight">Total Inward Weight (KG) *</Label>
          <Input
            id="total_inward_weight"
            type="number"
            step="0.01"
            value={batch.total_inward_weight_kg || ""}
            onChange={(e) => updateField("total_inward_weight_kg", parseFloat(e.target.value) || 0)}
            placeholder="e.g., 1000"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="total_inward_pieces">Total Inward No of Pieces *</Label>
          <Input
            id="total_inward_pieces"
            type="number"
            value={batch.total_inward_pieces || ""}
            onChange={(e) => updateField("total_inward_pieces", parseInt(e.target.value) || 0)}
            placeholder="e.g., 50"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="weight_per_piece">Inward Weight of Each Piece (KG)</Label>
          <Input
            id="weight_per_piece"
            type="number"
            step="0.01"
            value={batch.weight_per_piece?.toFixed(2) || ""}
            placeholder="Auto-calculated"
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Auto-calculated: Total Weight ÷ Total Pieces
          </p>
        </div>
        
        <div>
          <Label htmlFor="scale_weight_per_piece">Scale Weight of Each Piece (KG)</Label>
          <Input
            id="scale_weight_per_piece"
            type="number"
            step="0.01"
            value={batch.scale_weight_per_piece || ""}
            onChange={(e) => updateField("scale_weight_per_piece", parseFloat(e.target.value) || 0)}
            placeholder="e.g., 20.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="total_scale_weight">Total Scale Weight (KG)</Label>
          <Input
            id="total_scale_weight"
            type="number"
            step="0.01"
            value={batch.total_scale_weight?.toFixed(2) || ""}
            placeholder="Auto-calculated"
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Auto-calculated: Scale Weight per Piece × Total Pieces
          </p>
        </div>
        
        <div>
          <Label htmlFor="heat_number">Heat Number</Label>
          <Input
            id="heat_number"
            value={batch.heat_number || ""}
            onChange={(e) => updateField("heat_number", e.target.value)}
            placeholder="e.g., HN-2024-001"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="base_price">Base Price (₹ per KG) *</Label>
          <Input
            id="base_price"
            type="number"
            step="0.01"
            value={batch.base_price_per_kg || ""}
            onChange={(e) => updateField("base_price_per_kg", parseFloat(e.target.value) || 0)}
            placeholder="e.g., 75.00"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="total_price">Total Price</Label>
          <div className="relative">
            <Input
              id="total_price"
              value={batch.total_price ? formatCurrency(batch.total_price) : ""}
              placeholder="Auto-calculated"
              disabled
              className="bg-muted"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Auto-calculated: Base Price × (Total Scale Weight OR Total Inward Weight)
          </p>
        </div>
      </div>
    </div>
  );
};