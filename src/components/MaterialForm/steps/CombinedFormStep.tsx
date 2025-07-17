import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Paperclip, Link, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CombinedFormStepProps {
  category: string;
  subType: string;
  formData: any;
  onFormDataChange: (data: any) => void;
}

export const CombinedFormStep: React.FC<CombinedFormStepProps> = ({
  category,
  subType,
  formData,
  onFormDataChange,
}) => {
  const updateField = (field: string, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const renderDimensionFields = () => {
    switch (category) {
      case "Sheet":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      case "Pipe":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      case "Bar":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      case "Flat":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      case "Angle":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Complete Material Information</h3>
        <p className="text-sm text-muted-foreground">
          Fill in all the details for your {category.toLowerCase()} material
        </p>
      </div>

      {/* Dimensions & Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dimensions & Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          {renderDimensionFields()}
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="flex space-x-2">
                <Input
                  id="heat_number"
                  value={formData.heat_number || ""}
                  onChange={(e) => updateField("heat_number", e.target.value)}
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
        </CardContent>
      </Card>

      {/* Material Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Material Details</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Category:</span>
              <p>{formData.category}</p>
            </div>
            {formData.pipe_type && (
              <div>
                <span className="font-medium text-muted-foreground">Type:</span>
                <p>{formData.pipe_type}</p>
              </div>
            )}
            {formData.bar_shape && (
              <div>
                <span className="font-medium text-muted-foreground">Shape:</span>
                <p>{formData.bar_shape}</p>
              </div>
            )}
            <div>
              <span className="font-medium text-muted-foreground">Grade:</span>
              <p>{formData.grade || "Not specified"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">SKU:</span>
              <p>{formData.sku || "Not specified"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Make:</span>
              <p>{formData.make || "Not specified"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};