import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Paperclip, Link, Plus, Trash2, X, AlertTriangle, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Batch {
  id?: string;
  batch_code: string;
  total_weight_kg: number;
  heat_number?: string;
  notes?: string;
}

interface StreamlinedMaterialFormProps {
  formData: any;
  onFormDataChange: (data: any) => void;
  category: string;
  subType: string;
  existingSKUs?: string[];
  isEditing?: boolean;
}

export const StreamlinedMaterialForm: React.FC<StreamlinedMaterialFormProps> = ({
  formData,
  onFormDataChange,
  category,
  subType,
  existingSKUs = [],
  isEditing = false,
}) => {
  const [batches, setBatches] = useState<Batch[]>([
    {
      batch_code: "",
      total_weight_kg: 0,
      heat_number: "",
      notes: "",
    },
  ]);
  
  const [showDescription, setShowDescription] = useState(false);
  const [showBatchNotes, setShowBatchNotes] = useState<{[key: number]: boolean}>({});

  // Fetch recent batch numbers for reference
  const { data: recentBatches = [] } = useQuery({
    queryKey: ["recent-batches", formData.sku],
    queryFn: async () => {
      if (!formData.sku) return [];
      
      const { data, error } = await supabase
        .from("batches")
        .select("batch_code")
        .eq("sku_id", formData.id || "")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        // If no batches found for this specific SKU, get general recent batches
        const { data: generalData, error: generalError } = await supabase
          .from("batches")
          .select("batch_code")
          .order("created_at", { ascending: false })
          .limit(3);
        
        if (generalError) throw generalError;
        return generalData || [];
      }
      return data;
    },
    enabled: !!formData.sku
  });

  const updateField = (field: string, value: string) => {
    onFormDataChange({ ...formData, [field]: value, batches });
  };

  const addBatch = () => {
    const newBatches = [
      ...batches,
      {
        batch_code: "",
        total_weight_kg: 0,
        heat_number: "",
        notes: "",
      },
    ];
    setBatches(newBatches);
    onFormDataChange({ ...formData, batches: newBatches });
  };

  const removeBatch = (index: number) => {
    if (batches.length > 1) {
      const updatedBatches = batches.filter((_, i) => i !== index);
      setBatches(updatedBatches);
      onFormDataChange({ ...formData, batches: updatedBatches });
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
    setBatches(updatedBatches);
    onFormDataChange({ ...formData, batches: updatedBatches });
  };

  const toggleBatchNotes = (index: number) => {
    setShowBatchNotes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const isSKUDuplicate = formData.sku && !isEditing && existingSKUs.includes(formData.sku);

  const renderDimensionFields = () => {
    switch (category) {
      case "Sheet":
        return (
          <>
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
          </>
        );

      case "Pipe":
        return (
          <>
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
          </>
        );

      case "Bar":
        return (
          <>
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
          </>
        );

      case "Flat":
        return (
          <>
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
          </>
        );

      case "Angle":
        return (
          <>
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
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Material Name at the top */}
      <div>
        <Label htmlFor="name" className="text-lg font-medium">Material Name *</Label>
        <Input
          id="name"
          value={formData.name || ""}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="e.g., SS304 Sheet 1.5mm x 1219mm x 2438mm"
          className="text-lg h-12"
          required
        />
      </div>

      {/* Single form layout */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Basic Information */}
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

            {/* Dimension fields based on category */}
            {renderDimensionFields()}

            {/* Description with plus button */}
            <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Description</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDescription(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Additional details about this material..."
                    className="min-h-[80px]"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Management Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Initial Batches</h3>
          <Button onClick={addBatch} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Batch
          </Button>
        </div>

        {/* Recent batch numbers reference */}
        {recentBatches.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Recent: {recentBatches.map(b => b.batch_code).join(", ")}
          </div>
        )}

        {batches.map((batch, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Batch {index + 1}</h4>
                {batches.length > 1 && (
                  <Button
                    onClick={() => removeBatch(index)}
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
                  <Input
                    id={`batch_code_${index}`}
                    value={batch.batch_code}
                    onChange={(e) => updateBatch(index, "batch_code", e.target.value)}
                    placeholder="e.g., B2024001"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor={`weight_${index}`}>Weight (kg) *</Label>
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
                  <div className="flex space-x-2">
                    <Input
                      id={`heat_number_${index}`}
                      value={batch.heat_number || ""}
                      onChange={(e) => updateBatch(index, "heat_number", e.target.value)}
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
        ))}
      </div>
    </div>
  );
};
