import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DimensionsStepProps {
  category: string;
  subType: string;
  formData: any;
  onFormDataChange: (data: any) => void;
}

export const DimensionsStep: React.FC<DimensionsStepProps> = ({
  category,
  subType,
  formData,
  onFormDataChange,
}) => {
  const updateField = (field: string, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const renderSheetFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="grade">Grade *</Label>
        <Input
          id="grade"
          value={formData.grade || ""}
          onChange={(e) => updateField("grade", e.target.value)}
          placeholder="e.g., SS304, MS, SS316"
          required
        />
      </div>
      <div>
        <Label htmlFor="finish">Finish</Label>
        <Select value={formData.finish || ""} onValueChange={(value) => updateField("finish", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select finish" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2B">2B</SelectItem>
            <SelectItem value="BA">BA (Bright Annealed)</SelectItem>
            <SelectItem value="No.4">No.4</SelectItem>
            <SelectItem value="HL">HL (Hair Line)</SelectItem>
            <SelectItem value="Mirror">Mirror</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="thickness">Thickness (mm) *</Label>
        <Input
          id="thickness"
          type="number"
          step="0.1"
          value={formData.thickness || ""}
          onChange={(e) => updateField("thickness", e.target.value)}
          placeholder="e.g., 1.5"
          required
        />
      </div>
      <div>
        <Label htmlFor="width">Width (mm) *</Label>
        <Input
          id="width"
          type="number"
          value={formData.width || ""}
          onChange={(e) => updateField("width", e.target.value)}
          placeholder="e.g., 1219"
          required
        />
      </div>
      <div>
        <Label htmlFor="length">Length (mm) *</Label>
        <Input
          id="length"
          type="number"
          value={formData.length || ""}
          onChange={(e) => updateField("length", e.target.value)}
          placeholder="e.g., 2438"
          required
        />
      </div>
      <div>
        <Label htmlFor="no_of_sheets">No. of Sheets per Batch</Label>
        <Input
          id="no_of_sheets"
          type="number"
          value={formData.no_of_sheets || ""}
          onChange={(e) => updateField("no_of_sheets", e.target.value)}
          placeholder="e.g., 20"
        />
      </div>
      <div>
        <Label htmlFor="batch_weight">Batch Weight (kg)</Label>
        <Input
          id="batch_weight"
          type="number"
          step="0.1"
          value={formData.batch_weight || ""}
          onChange={(e) => updateField("batch_weight", e.target.value)}
          placeholder="e.g., 500.5"
        />
      </div>
    </div>
  );

  const renderPipeFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="grade">Grade *</Label>
        <Input
          id="grade"
          value={formData.grade || ""}
          onChange={(e) => updateField("grade", e.target.value)}
          placeholder="e.g., SS304, MS"
          required
        />
      </div>
      <div>
        <Label htmlFor="thickness">Thickness (mm) *</Label>
        <Input
          id="thickness"
          type="number"
          step="0.1"
          value={formData.thickness || ""}
          onChange={(e) => updateField("thickness", e.target.value)}
          placeholder="e.g., 2.0"
          required
        />
      </div>
      <div>
        <Label htmlFor="diameter">{subType === "OD" ? "Outer Diameter" : "Nominal Bore"} (mm) *</Label>
        <Input
          id="diameter"
          type="number"
          step="0.1"
          value={formData.diameter || ""}
          onChange={(e) => updateField("diameter", e.target.value)}
          placeholder="e.g., 25.4"
          required
        />
      </div>
      <div>
        <Label htmlFor="length">Length (mm) *</Label>
        <Input
          id="length"
          type="number"
          value={formData.length || ""}
          onChange={(e) => updateField("length", e.target.value)}
          placeholder="e.g., 6000"
          required
        />
      </div>
      <div>
        <Label htmlFor="finish">Finish</Label>
        <Select value={formData.finish || ""} onValueChange={(value) => updateField("finish", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select finish" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Annealed">Annealed</SelectItem>
            <SelectItem value="Pickled">Pickled</SelectItem>
            <SelectItem value="Bright">Bright</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderBarFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="grade">Grade *</Label>
        <Input
          id="grade"
          value={formData.grade || ""}
          onChange={(e) => updateField("grade", e.target.value)}
          placeholder="e.g., SS304, MS"
          required
        />
      </div>
      {subType === "Round" ? (
        <div>
          <Label htmlFor="diameter">Diameter (mm) *</Label>
          <Input
            id="diameter"
            type="number"
            step="0.1"
            value={formData.diameter || ""}
            onChange={(e) => updateField("diameter", e.target.value)}
            placeholder="e.g., 12.5"
            required
          />
        </div>
      ) : (
        <div>
          <Label htmlFor="width">Width (mm) *</Label>
          <Input
            id="width"
            type="number"
            step="0.1"
            value={formData.width || ""}
            onChange={(e) => updateField("width", e.target.value)}
            placeholder="e.g., 20"
            required
          />
        </div>
      )}
      <div>
        <Label htmlFor="length">Length (mm) *</Label>
        <Input
          id="length"
          type="number"
          value={formData.length || ""}
          onChange={(e) => updateField("length", e.target.value)}
          placeholder="e.g., 6000"
          required
        />
      </div>
      <div>
        <Label htmlFor="finish">Finish</Label>
        <Select value={formData.finish || ""} onValueChange={(value) => updateField("finish", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select finish" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Hot Rolled">Hot Rolled</SelectItem>
            <SelectItem value="Cold Drawn">Cold Drawn</SelectItem>
            <SelectItem value="Bright">Bright</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderFlatFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="grade">Grade *</Label>
        <Input
          id="grade"
          value={formData.grade || ""}
          onChange={(e) => updateField("grade", e.target.value)}
          placeholder="e.g., SS304, MS"
          required
        />
      </div>
      <div>
        <Label htmlFor="width">Width (mm) *</Label>
        <Input
          id="width"
          type="number"
          step="0.1"
          value={formData.width || ""}
          onChange={(e) => updateField("width", e.target.value)}
          placeholder="e.g., 50"
          required
        />
      </div>
      <div>
        <Label htmlFor="thickness">Thickness (mm) *</Label>
        <Input
          id="thickness"
          type="number"
          step="0.1"
          value={formData.thickness || ""}
          onChange={(e) => updateField("thickness", e.target.value)}
          placeholder="e.g., 6"
          required
        />
      </div>
      <div>
        <Label htmlFor="length">Length (mm) *</Label>
        <Input
          id="length"
          type="number"
          value={formData.length || ""}
          onChange={(e) => updateField("length", e.target.value)}
          placeholder="e.g., 6000"
          required
        />
      </div>
      <div>
        <Label htmlFor="finish">Finish</Label>
        <Select value={formData.finish || ""} onValueChange={(value) => updateField("finish", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select finish" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Hot Rolled">Hot Rolled</SelectItem>
            <SelectItem value="Cold Rolled">Cold Rolled</SelectItem>
            <SelectItem value="Bright">Bright</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderAngleFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="grade">Grade *</Label>
        <Input
          id="grade"
          value={formData.grade || ""}
          onChange={(e) => updateField("grade", e.target.value)}
          placeholder="e.g., MS, SS304"
          required
        />
      </div>
      <div>
        <Label htmlFor="size_description">Size *</Label>
        <Input
          id="size_description"
          value={formData.size_description || ""}
          onChange={(e) => updateField("size_description", e.target.value)}
          placeholder="e.g., 50x50x6, 75x75x8"
          required
        />
      </div>
      <div>
        <Label htmlFor="thickness">Thickness (mm) *</Label>
        <Input
          id="thickness"
          type="number"
          step="0.1"
          value={formData.thickness || ""}
          onChange={(e) => updateField("thickness", e.target.value)}
          placeholder="e.g., 6"
          required
        />
      </div>
      <div>
        <Label htmlFor="length">Length (mm) *</Label>
        <Input
          id="length"
          type="number"
          value={formData.length || ""}
          onChange={(e) => updateField("length", e.target.value)}
          placeholder="e.g., 6000"
          required
        />
      </div>
    </div>
  );

  const renderFields = () => {
    switch (category) {
      case "Sheet":
        return renderSheetFields();
      case "Pipe":
        return renderPipeFields();
      case "Bar":
        return renderBarFields();
      case "Flat":
        return renderFlatFields();
      case "Angle":
        return renderAngleFields();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Dimensions & Specifications</h3>
        <p className="text-sm text-muted-foreground">
          Enter the technical specifications for this {category.toLowerCase()}
        </p>
      </div>

      {renderFields()}
    </div>
  );
};