
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, AlertTriangle, CheckCircle, Plus } from "lucide-react";
import { categoryTemplates, getTemplateByCategory } from "./CategoryTemplates";
import { SimplifiedBatchForm } from "./SimplifiedBatchForm";

interface Batch {
  batch_code: string;
  total_weight_kg: number;
  heat_number?: string;
  make?: string;
  notes?: string;
}

interface MaterialTemplateFormProps {
  formData: any;
  onFormDataChange: (data: any) => void;
  existingSKUs?: string[];
  isEditing?: boolean;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const MaterialTemplateForm: React.FC<MaterialTemplateFormProps> = ({
  formData,
  onFormDataChange,
  existingSKUs = [],
  isEditing = false,
  onSubmit,
  isSubmitting = false,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedSubType, setSelectedSubType] = useState<string>("");
  const [showSubTypeSelection, setShowSubTypeSelection] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  
  const updateField = (field: string, value: any) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const template = getTemplateByCategory(templateKey);
    if (template) {
      // Check if template has sub-types
      if (template.subTypes && template.subTypes.length > 0) {
        setShowSubTypeSelection(true);
        return;
      }
      
      // No sub-types, proceed with template setup
      setupTemplate(template);
    }
  };

  const handleSubTypeSelect = (subTypeKey: string) => {
    setSelectedSubType(subTypeKey);
    const template = getTemplateByCategory(selectedTemplate);
    if (template) {
      setupTemplate(template, subTypeKey);
      setShowSubTypeSelection(false);
    }
  };

  const setupTemplate = (template: any, subType?: string) => {
    const updatedData = {
      ...formData,
      category: template.category,
      ...template.fields,
      // Initialize with single batch if no batches exist
      batches: formData.batches?.length > 0 ? formData.batches : [
        {
          batch_code: `BATCH-${Date.now()}`,
          total_weight_kg: 0,
          heat_number: "",
          make: formData.make || "",
          notes: "",
        }
      ],
    };

    // Set sub-type specific fields
    if (subType) {
      if (template.category === "Pipe") {
        updatedData.pipe_type = subType;
      } else if (template.category === "Bar") {
        updatedData.bar_shape = subType;
        // Adjust dimension fields based on bar shape
        if (subType !== "Round") {
          updatedData.dimensionFields = ["width", "length"];
        }
      }
    }

    onFormDataChange(updatedData);
  };

  const handleBatchesChange = (newBatches: Batch[]) => {
    onFormDataChange({ ...formData, batches: newBatches });
  };

  const isSKUDuplicate = formData.sku && !isEditing && existingSKUs.includes(formData.sku);

  const renderDimensionFields = () => {
    const template = getTemplateByCategory(formData.category);
    if (!template) return null;

    return template.dimensionFields.map((field) => {
      const fieldConfig = {
        thickness: { label: "Thickness (mm)", placeholder: "e.g., 1.5", step: "0.1" },
        width: { label: "Width (mm)", placeholder: "e.g., 1219" },
        length: { label: "Length (mm)", placeholder: "e.g., 2438" },
        diameter: { 
          label: formData.pipe_type === "OD" ? "Outer Diameter (mm)" : 
                 formData.pipe_type === "NB" ? "Nominal Bore (mm)" : "Diameter (mm)", 
          placeholder: "e.g., 25.4", 
          step: "0.1" 
        },
        size_description: { label: "Size", placeholder: "e.g., 50x50x6, 75x75x8" },
      }[field];

      if (!fieldConfig) return null;

      return (
        <div key={field}>
          <Label htmlFor={field}>{fieldConfig.label} *</Label>
          <Input
            id={field}
            type={field === "size_description" ? "text" : "number"}
            step={fieldConfig.step}
            value={formData[field] || ""}
            onChange={(e) => updateField(field, e.target.value)}
            placeholder={fieldConfig.placeholder}
            required
          />
        </div>
      );
    });
  };

  const canSubmit = () => {
    if (!formData.name || !formData.category || !formData.grade || !formData.sku || !formData.make) {
      return false;
    }
    
    if (isSKUDuplicate) return false;
    
    if (!formData.batches || formData.batches.length === 0) return false;
    
    const hasValidBatch = formData.batches.some((batch: any) => 
      batch.batch_code && batch.total_weight_kg > 0
    );
    if (!hasValidBatch) return false;

    const template = getTemplateByCategory(formData.category);
    if (template) {
      return template.dimensionFields.every(field => 
        field === "size_description" ? formData[field] : formData[field] && parseFloat(formData[field]) > 0
      );
    }
    
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      {!selectedTemplate && !formData.category && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Choose Material Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(categoryTemplates).map(([key, template]) => {
                const IconComponent = template.icon;
                return (
                  <Button
                    key={key}
                    variant="outline"
                    className="h-20 p-4 text-left flex-col justify-start hover:border-primary hover:bg-primary/5"
                    onClick={() => handleTemplateSelect(key)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <IconComponent className="h-6 w-6 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{template.displayName}</div>
                        <div className="text-xs text-muted-foreground mt-1">{template.description}</div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sub-type Selection (for Pipe and Bar) */}
      {showSubTypeSelection && selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Select {categoryTemplates[selectedTemplate].displayName} Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoryTemplates[selectedTemplate].subTypes?.map((subType) => {
                const IconComponent = subType.icon;
                return (
                  <Button
                    key={subType.key}
                    variant="outline"
                    className="h-16 p-4 text-left flex-col justify-start hover:border-primary hover:bg-primary/5"
                    onClick={() => handleSubTypeSelect(subType.key)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <IconComponent className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{subType.name}</div>
                        <div className="text-xs text-muted-foreground">{subType.description}</div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
            <div className="mt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowSubTypeSelection(false);
                  setSelectedTemplate("");
                }}
              >
                ← Back to categories
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      {(selectedTemplate || formData.category) && !showSubTypeSelection && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Material Name */}
              <div>
                <Label htmlFor="name" className="text-base font-medium">Material Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g., SS304 Sheet 1.5mm x 1219mm x 2438mm"
                  className="text-base h-11"
                  required
                />
              </div>

              {/* Essential Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="grade">Grade *</Label>
                  <Select value={formData.grade || ""} onValueChange={(value) => updateField("grade", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {getTemplateByCategory(formData.category)?.commonGrades.map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <div className="relative">
                    <Input
                      id="sku"
                      value={formData.sku || ""}
                      onChange={(e) => updateField("sku", e.target.value)}
                      placeholder="e.g., SS304-SHT-150x1219"
                      className={isSKUDuplicate ? "border-destructive" : ""}
                      required
                    />
                    {formData.sku && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        {isSKUDuplicate ? (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    )}
                  </div>
                  {isSKUDuplicate && (
                    <p className="text-xs text-destructive mt-1">This SKU already exists</p>
                  )}
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
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={formData.unit || "KG"} onValueChange={(value) => updateField("unit", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KG">KG</SelectItem>
                      <SelectItem value="MT">MT</SelectItem>
                      <SelectItem value="PCS">PCS</SelectItem>
                      <SelectItem value="FT">FT</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dimension Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderDimensionFields()}
              </div>

              {/* Advanced Fields - Collapsible */}
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto">
                    <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                    Advanced Options
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    {getTemplateByCategory(formData.category)?.commonFinishes.length > 0 && (
                      <div>
                        <Label htmlFor="finish">Finish</Label>
                        <Select value={formData.finish || ""} onValueChange={(value) => updateField("finish", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select finish" />
                          </SelectTrigger>
                          <SelectContent>
                            {getTemplateByCategory(formData.category)?.commonFinishes.map((finish) => (
                              <SelectItem key={finish} value={finish}>{finish}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {!showDescription ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDescription(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Description
                    </Button>
                  ) : (
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description || ""}
                        onChange={(e) => updateField("description", e.target.value)}
                        placeholder="Additional details about this material..."
                        className="min-h-[80px]"
                      />
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Management */}
      {(selectedTemplate || formData.category) && !showSubTypeSelection && (
        <SimplifiedBatchForm
          batches={formData.batches || []}
          onBatchesChange={handleBatchesChange}
          defaultMake={formData.make || ""}
        />
      )}

      {/* Submit Button */}
      {(selectedTemplate || formData.category) && !showSubTypeSelection && (
        <div className="flex justify-end gap-3">
          <Button 
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !canSubmit()}
            className="min-w-[120px]"
          >
            {isSubmitting 
              ? (isEditing ? "Updating..." : "Creating...") 
              : (isEditing ? "Update Material" : "Create Material")
            }
          </Button>
        </div>
      )}
    </div>
  );
};
