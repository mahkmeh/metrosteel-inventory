import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BusinessInfoStepProps {
  formData: any;
  onFormDataChange: (data: any) => void;
}

export const BusinessInfoStep: React.FC<BusinessInfoStepProps> = ({
  formData,
  onFormDataChange,
}) => {
  const updateField = (field: string, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Business Information</h3>
        <p className="text-sm text-muted-foreground">
          Enter SKU, batch details, manufacturer, and pricing information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            value={formData.sku || ""}
            onChange={(e) => updateField("sku", e.target.value)}
            placeholder="e.g., SS304-SHT-150x1219"
            required
          />
        </div>

        <div>
          <Label htmlFor="batch_no">Batch Code</Label>
          <Input
            id="batch_no"
            value={formData.batch_no || ""}
            onChange={(e) => updateField("batch_no", e.target.value)}
            placeholder="e.g., B2024001"
          />
        </div>

        <div>
          <Label htmlFor="heat_number">Heat Number</Label>
          <Input
            id="heat_number"
            value={formData.heat_number || ""}
            onChange={(e) => updateField("heat_number", e.target.value)}
            placeholder="e.g., HT240515"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Batch-specific heat number for traceability
          </p>
        </div>

        <div>
          <Label htmlFor="make">Make/Manufacturer *</Label>
          <Input
            id="make"
            value={formData.make || ""}
            onChange={(e) => updateField("make", e.target.value)}
            placeholder="e.g., Jindal, Tata Steel"
            required
          />
        </div>

        <div>
          <Label htmlFor="base_price">Base Price (₹)</Label>
          <Input
            id="base_price"
            type="number"
            step="0.01"
            value={formData.base_price || ""}
            onChange={(e) => updateField("base_price", e.target.value)}
            placeholder="e.g., 150.50"
          />
        </div>

        <div>
          <Label htmlFor="unit">Unit *</Label>
          <Input
            id="unit"
            value={formData.unit || "KG"}
            onChange={(e) => updateField("unit", e.target.value)}
            placeholder="e.g., KG, MT, PCS"
            required
          />
        </div>
      </div>
    </div>
  );
};