import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Paperclip, Link, Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Batch {
  id?: string;
  batch_code: string;
  total_weight_kg: number;
  heat_number?: string;
  quality_grade: string;
  make?: string;
  supplier_id?: string;
  location_id?: string;
  manufactured_date?: string;
  received_date?: string;
  notes?: string;
}

interface StreamlinedMaterialFormProps {
  formData: any;
  onFormDataChange: (data: any) => void;
  category: string;
  subType: string;
}

export const StreamlinedMaterialForm: React.FC<StreamlinedMaterialFormProps> = ({
  formData,
  onFormDataChange,
  category,
  subType,
}) => {
  const [batches, setBatches] = useState<Batch[]>([
    {
      batch_code: "",
      total_weight_kg: 0,
      heat_number: "",
      quality_grade: "A",
      make: "",
      supplier_id: "",
      location_id: "",
      manufactured_date: "",
      received_date: "",
      notes: "",
    },
  ]);

  // Fetch suppliers and locations for dropdowns
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("locations").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  // Fetch previous batch numbers for reference
  const { data: previousBatches = [] } = useQuery({
    queryKey: ["previous-batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batches")
        .select("batch_code")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const updateField = (field: string, value: string) => {
    onFormDataChange({ ...formData, [field]: value, batches });
  };

  const addBatch = () => {
    setBatches([
      ...batches,
      {
        batch_code: "",
        total_weight_kg: 0,
        heat_number: "",
        quality_grade: "A",
        make: "",
        supplier_id: "",
        location_id: "",
        manufactured_date: "",
        received_date: "",
        notes: "",
      },
    ]);
  };

  const removeBatch = (index: number) => {
    if (batches.length > 1) {
      const updatedBatches = batches.filter((_, i) => i !== index);
      setBatches(updatedBatches);
      onFormDataChange({ ...formData, batches: updatedBatches });
    }
  };

  const updateBatch = (index: number, field: string, value: string | number) => {
    const updatedBatches = batches.map((batch, i) =>
      i === index ? { ...batch, [field]: value } : batch
    );
    setBatches(updatedBatches);
    onFormDataChange({ ...formData, batches: updatedBatches });
  };

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
        <p className="text-sm text-muted-foreground mt-1">
          A descriptive name for this material
        </p>
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
              <Input
                id="sku"
                value={formData.sku || ""}
                onChange={(e) => updateField("sku", e.target.value)}
                placeholder="e.g., SS304-SHT-150x1219"
                required
              />
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

            {/* Description spanning multiple columns */}
            <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Additional details about this material..."
                className="min-h-[80px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Management Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Initial Batches</h3>
            <p className="text-sm text-muted-foreground">
              Add one or more initial batches for this material
            </p>
          </div>
          <Button onClick={addBatch} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Batch
          </Button>
        </div>

        {/* Previous batch numbers reference */}
        {previousBatches.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Recent batch numbers: {previousBatches.map(b => b.batch_code).join(", ")}
          </div>
        )}

        {batches.map((batch, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                  <Label htmlFor={`quality_${index}`}>Quality Grade</Label>
                  <Select
                    value={batch.quality_grade}
                    onValueChange={(value) => updateBatch(index, "quality_grade", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Grade A</SelectItem>
                      <SelectItem value="B">Grade B</SelectItem>
                      <SelectItem value="C">Grade C</SelectItem>
                    </SelectContent>
                  </Select>
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

                <div>
                  <Label htmlFor={`supplier_${index}`}>Supplier</Label>
                  <Select
                    value={batch.supplier_id || ""}
                    onValueChange={(value) => updateBatch(index, "supplier_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`location_${index}`}>Location</Label>
                  <Select
                    value={batch.location_id || ""}
                    onValueChange={(value) => updateBatch(index, "location_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`manufactured_date_${index}`}>Manufactured Date</Label>
                  <Input
                    id={`manufactured_date_${index}`}
                    type="date"
                    value={batch.manufactured_date || ""}
                    onChange={(e) => updateBatch(index, "manufactured_date", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor={`received_date_${index}`}>Received Date</Label>
                  <Input
                    id={`received_date_${index}`}
                    type="date"
                    value={batch.received_date || ""}
                    onChange={(e) => updateBatch(index, "received_date", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
                  <Label htmlFor={`notes_${index}`}>Notes</Label>
                  <Textarea
                    id={`notes_${index}`}
                    value={batch.notes || ""}
                    onChange={(e) => updateBatch(index, "notes", e.target.value)}
                    placeholder="Additional notes for this batch..."
                    className="min-h-[60px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};