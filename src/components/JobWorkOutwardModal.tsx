import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BatchSelector } from "./BatchSelector";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateJobWorkTransformation } from "@/hooks/useJobWorkTransformations";
import { useToast } from "@/hooks/use-toast";

interface JobWorkOutwardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JobWorkOutwardModal = ({ open, onOpenChange }: JobWorkOutwardModalProps) => {
  const [formData, setFormData] = useState({
    contractor_id: "",
    input_sku_id: "",
    output_sku_id: "",
    input_weight_kg: 0,
    expected_output_weight_kg: 0,
    process_type: "",
    process_description: "",
    expected_return_date: "",
    processing_cost_per_kg: 0,
  });

  const [selectedBatches, setSelectedBatches] = useState<any[]>([]);
  const { toast } = useToast();
  
  const createTransformation = useCreateJobWorkTransformation();

  // Fetch contractors (suppliers)
  const { data: contractors = [] } = useQuery({
    queryKey: ["contractors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch materials
  const { data: materials = [] } = useQuery({
    queryKey: ["materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.contractor_id || !formData.input_sku_id || !formData.output_sku_id) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (selectedBatches.length === 0) {
      toast({
        title: "Validation Error", 
        description: "Please select at least one batch",
        variant: "destructive",
      });
      return;
    }

    const totalWeight = selectedBatches.reduce((sum, batch) => sum + batch.selectedWeight, 0);

    if (totalWeight !== formData.input_weight_kg) {
      toast({
        title: "Validation Error",
        description: "Selected batch weight must match input weight",
        variant: "destructive", 
      });
      return;
    }

    try {
      // For simplicity, using the first batch. In production, you might want to handle multiple batches
      const primaryBatch = selectedBatches[0];
      
      await createTransformation.mutateAsync({
        contractor_id: formData.contractor_id,
        input_batch_id: primaryBatch.batch.id,
        input_weight_kg: formData.input_weight_kg,
        input_sku_id: formData.input_sku_id,
        output_sku_id: formData.output_sku_id,
        expected_output_weight_kg: formData.expected_output_weight_kg,
        process_type: formData.process_type,
        process_description: formData.process_description,
        sent_date: new Date().toISOString().split("T")[0],
        expected_return_date: formData.expected_return_date,
        processing_cost_per_kg: formData.processing_cost_per_kg,
        total_processing_cost: formData.processing_cost_per_kg * formData.input_weight_kg,
      });

      // Reset form
      setFormData({
        contractor_id: "",
        input_sku_id: "",
        output_sku_id: "",
        input_weight_kg: 0,
        expected_output_weight_kg: 0,
        process_type: "",
        process_description: "",
        expected_return_date: "",
        processing_cost_per_kg: 0,
      });
      setSelectedBatches([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating job work:", error);
    }
  };

  const totalSelectedWeight = selectedBatches.reduce((sum, batch) => sum + batch.selectedWeight, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Job Work Outward Entry</DialogTitle>
          <DialogDescription>
            Send materials to contractor for processing. All weights are in kilograms.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Job Work Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contractor">Contractor *</Label>
                  <Select value={formData.contractor_id} onValueChange={(value) => handleInputChange("contractor_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contractor" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-md">
                      {contractors.map((contractor) => (
                        <SelectItem key={contractor.id} value={contractor.id}>
                          {contractor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="process_type">Process Type *</Label>
                  <Select value={formData.process_type} onValueChange={(value) => handleInputChange("process_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select process" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-md">
                      <SelectItem value="cutting">Cutting</SelectItem>
                      <SelectItem value="welding">Welding</SelectItem>
                      <SelectItem value="machining">Machining</SelectItem>
                      <SelectItem value="bending">Bending</SelectItem>
                      <SelectItem value="drilling">Drilling</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="process_description">Process Description</Label>
                <Textarea
                  id="process_description"
                  value={formData.process_description}
                  onChange={(e) => handleInputChange("process_description", e.target.value)}
                  placeholder="Describe the work to be done..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Material Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Material Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="input_sku">Input Material (Raw) *</Label>
                  <Select value={formData.input_sku_id} onValueChange={(value) => handleInputChange("input_sku_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select input material" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-md">
                      {materials.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.name} ({material.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="output_sku">Output Material (Processed) *</Label>
                  <Select value={formData.output_sku_id} onValueChange={(value) => handleInputChange("output_sku_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select output material" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-md">
                      {materials.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.name} ({material.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="input_weight">Input Weight (KG) *</Label>
                  <Input
                    id="input_weight"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.input_weight_kg}
                    onChange={(e) => handleInputChange("input_weight_kg", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="expected_output_weight">Expected Output Weight (KG) *</Label>
                  <Input
                    id="expected_output_weight"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.expected_output_weight_kg}
                    onChange={(e) => handleInputChange("expected_output_weight_kg", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="processing_cost">Processing Cost per KG</Label>
                  <Input
                    id="processing_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.processing_cost_per_kg}
                    onChange={(e) => handleInputChange("processing_cost_per_kg", parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expected_return_date">Expected Return Date</Label>
                <Input
                  id="expected_return_date"
                  type="date"
                  value={formData.expected_return_date}
                  onChange={(e) => handleInputChange("expected_return_date", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Batch Selection */}
          {formData.input_sku_id && formData.input_weight_kg > 0 && (
            <BatchSelector
              materialId={formData.input_sku_id}
              requiredWeightKg={formData.input_weight_kg}
              onBatchesSelect={setSelectedBatches}
              selectedBatches={selectedBatches}
              mode="multiple"
            />
          )}

          {/* Summary */}
          {selectedBatches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Total Input Weight:</strong> {totalSelectedWeight.toFixed(2)} KG
                  </div>
                  <div>
                    <strong>Expected Output Weight:</strong> {formData.expected_output_weight_kg.toFixed(2)} KG
                  </div>
                  <div>
                    <strong>Processing Cost:</strong> ₹{(formData.processing_cost_per_kg * formData.input_weight_kg).toFixed(2)}
                  </div>
                  <div>
                    <strong>Selected Batches:</strong> {selectedBatches.length}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createTransformation.isPending || totalSelectedWeight !== formData.input_weight_kg}
            >
              {createTransformation.isPending ? "Creating..." : "Create Job Work"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};