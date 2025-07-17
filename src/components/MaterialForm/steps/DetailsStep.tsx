import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface DetailsStepProps {
  formData: any;
  onFormDataChange: (data: any) => void;
}

export const DetailsStep: React.FC<DetailsStepProps> = ({
  formData,
  onFormDataChange,
}) => {
  const updateField = (field: string, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Additional Details</h3>
        <p className="text-sm text-muted-foreground">
          Add material name and any additional information
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Material Name *</Label>
          <Input
            id="name"
            value={formData.name || ""}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g., SS304 Sheet 1.5mm x 1219mm x 2438mm"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            A descriptive name for this material
          </p>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Additional details about the material..."
            rows={3}
          />
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg space-y-2">
        <h4 className="font-medium">Summary</h4>
        <div className="text-sm space-y-1">
          <p><span className="font-medium">Category:</span> {formData.category}</p>
          {formData.pipe_type && (
            <p><span className="font-medium">Type:</span> {formData.pipe_type}</p>
          )}
          {formData.bar_shape && (
            <p><span className="font-medium">Shape:</span> {formData.bar_shape}</p>
          )}
          <p><span className="font-medium">Grade:</span> {formData.grade}</p>
          <p><span className="font-medium">SKU:</span> {formData.sku}</p>
          <p><span className="font-medium">Make:</span> {formData.make}</p>
        </div>
      </div>
    </div>
  );
};