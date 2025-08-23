import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SheetsEnhancedBatchForm } from "./SheetsEnhancedBatchForm";

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

interface SheetsFormData {
  // Section 1: Material Info
  name: string;
  grade: string;
  finish: string;
  make: string;
  thickness: string;
  width: string;
  length: string;
  
  // Section 2 & 3: Batches
  batches: SheetsBatch[];
  
  // Other required fields to match existing form data structure
  category: string;
  sku: string;
  unit: string;
  description: string;
  base_price: string;
  diameter: string;
  pipe_type: string;
  bar_shape: string;
  size_description: string;
}

interface SheetsSpecificMaterialFormProps {
  formData: SheetsFormData;
  onFormDataChange: (data: SheetsFormData) => void;
  existingSKUs: string[];
  isEditing?: boolean;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

// Predefined options for dropdowns
const GRADES = ["MS", "SS304", "SS316", "SS202", "SS409", "Aluminum"];
const FINISHES = ["Hot Rolled", "Cold Rolled", "Galvanized", "Stainless", "Polished"];
const MAKES = ["Jindal", "Tata Steel", "JSW", "SAIL", "Essar Steel", "Other"];
const THICKNESS_OPTIONS = ["1", "1.2", "1.5", "2", "2.5", "3", "4", "5", "6", "8", "10", "12", "15", "20", "25"];
const WIDTH_OPTIONS = ["1000", "1200", "1220", "1250", "1500", "1524", "2000", "2440", "2500"];
const LENGTH_OPTIONS = ["2000", "2440", "2500", "3000", "3050", "6000", "8000", "10000", "12000"];

export const SheetsSpecificMaterialForm: React.FC<SheetsSpecificMaterialFormProps> = ({
  formData,
  onFormDataChange,
  existingSKUs,
  isEditing = false,
  onSubmit,
  isSubmitting = false,
}) => {
  const [activeBatches, setActiveBatches] = useState<number[]>([0]); // Track which batches are expanded

  const updateField = (field: keyof SheetsFormData, value: any) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const addNewBatch = () => {
    const newBatch: SheetsBatch = {
      batch_code: "",
      inward_date: new Date().toISOString().split('T')[0],
      total_inward_weight_kg: 0,
      total_inward_pieces: 0,
      heat_number: "",
      base_price_per_kg: 0,
      make: formData.make,
    };
    
    const updatedBatches = [...formData.batches, newBatch];
    updateField("batches", updatedBatches);
    setActiveBatches([...activeBatches, updatedBatches.length - 1]);
  };

  const updateBatch = (index: number, batch: SheetsBatch) => {
    const updatedBatches = formData.batches.map((b, i) => i === index ? batch : b);
    updateField("batches", updatedBatches);
  };

  const removeBatch = (index: number) => {
    if (formData.batches.length > 1) {
      const updatedBatches = formData.batches.filter((_, i) => i !== index);
      updateField("batches", updatedBatches);
      setActiveBatches(activeBatches.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    }
  };

  const isSKUDuplicate = formData.sku && !isEditing && existingSKUs.includes(formData.sku);

  const canSubmit = () => {
    // Check required material fields
    if (!formData.name || !formData.grade || !formData.make || !formData.thickness || !formData.width || !formData.length) {
      return false;
    }
    
    // Check SKU
    if (!formData.sku || isSKUDuplicate) {
      return false;
    }
    
    // Check at least one valid batch
    if (formData.batches.length === 0) return false;
    
    return formData.batches.some(batch => 
      batch.batch_code && 
      batch.total_inward_weight_kg > 0 && 
      batch.total_inward_pieces > 0 &&
      batch.base_price_per_kg && batch.base_price_per_kg > 0
    );
  };

  // Initialize with one batch if empty
  React.useEffect(() => {
    if (formData.batches.length === 0) {
      const initialBatch: SheetsBatch = {
        batch_code: "",
        inward_date: new Date().toISOString().split('T')[0],
        total_inward_weight_kg: 0,
        total_inward_pieces: 0,
        heat_number: "",
        base_price_per_kg: 0,
        make: formData.make,
      };
      updateField("batches", [initialBatch]);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Section 1: Material Specific Information */}
      <Card>
        <CardHeader>
          <CardTitle>1. Material Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="material_name">Material Name *</Label>
              <Input
                id="material_name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., MS Sheet Hot Rolled"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => updateField("sku", e.target.value)}
                placeholder="e.g., MS-SHT-3x1220x2440"
                required
                className={isSKUDuplicate ? "border-destructive" : ""}
              />
              {isSKUDuplicate && (
                <p className="text-destructive text-sm mt-1">This SKU already exists</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="grade">Grade *</Label>
              <Select value={formData.grade} onValueChange={(value) => updateField("grade", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="finish">Finish *</Label>
              <Select value={formData.finish} onValueChange={(value) => updateField("finish", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Finish" />
                </SelectTrigger>
                <SelectContent>
                  {FINISHES.map((finish) => (
                    <SelectItem key={finish} value={finish}>{finish}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="make">Make *</Label>
              <Select value={formData.make} onValueChange={(value) => updateField("make", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Make" />
                </SelectTrigger>
                <SelectContent>
                  {MAKES.map((make) => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="thickness">Thickness (mm) *</Label>
              <Select value={formData.thickness} onValueChange={(value) => updateField("thickness", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Thickness" />
                </SelectTrigger>
                <SelectContent>
                  {THICKNESS_OPTIONS.map((thickness) => (
                    <SelectItem key={thickness} value={thickness}>{thickness} mm</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="width">Width (mm) *</Label>
              <Select value={formData.width} onValueChange={(value) => updateField("width", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Width" />
                </SelectTrigger>
                <SelectContent>
                  {WIDTH_OPTIONS.map((width) => (
                    <SelectItem key={width} value={width}>{width} mm</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="length">Length (mm) *</Label>
              <Select value={formData.length} onValueChange={(value) => updateField("length", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Length" />
                </SelectTrigger>
                <SelectContent>
                  {LENGTH_OPTIONS.map((length) => (
                    <SelectItem key={length} value={length}>{length} mm</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: First Batch Information */}
      {formData.batches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Batch Information</CardTitle>
          </CardHeader>
          <CardContent>
            <SheetsEnhancedBatchForm
              batch={formData.batches[0]}
              onBatchChange={(batch) => updateBatch(0, batch)}
              onRemove={formData.batches.length > 1 ? () => removeBatch(0) : undefined}
              defaultMake={formData.make}
            />
          </CardContent>
        </Card>
      )}

      {/* Section 3: Additional Batches */}
      {formData.batches.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>3. Additional Batches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.batches.slice(1).map((batch, index) => (
              <div key={index + 1} className="border rounded-lg p-4">
                <SheetsEnhancedBatchForm
                  batch={batch}
                  onBatchChange={(batch) => updateBatch(index + 1, batch)}
                  onRemove={() => removeBatch(index + 1)}
                  defaultMake={formData.make}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add Another Batch Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={addNewBatch}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Another Batch
        </Button>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={onSubmit}
          disabled={!canSubmit() || isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Material" : "Create Material"}
        </Button>
      </div>
    </div>
  );
};
