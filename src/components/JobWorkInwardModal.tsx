
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface JobWorkInwardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JobWorkInwardModal = ({ open, onOpenChange }: JobWorkInwardModalProps) => {
  const [selectedTransformation, setSelectedTransformation] = useState("");
  const [formData, setFormData] = useState({
    actual_output_weight_kg: 0,
    actual_return_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch sent job work transformations
  const { data: sentTransformations = [] } = useQuery({
    queryKey: ["sent-transformations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_work_transformations")
        .select(`
          *,
          contractor:suppliers(name),
          input_material:materials!job_work_transformations_input_sku_id_fkey(name, sku),
          output_material:materials!job_work_transformations_output_sku_id_fkey(name, sku)
        `)
        .eq("status", "sent")
        .order("sent_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const selectedTransformationData = sentTransformations.find(
    (t) => t.id === selectedTransformation
  );

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedTransformation) {
      toast({
        title: "Validation Error",
        description: "Please select a job work transformation",
        variant: "destructive",
      });
      return;
    }

    if (!formData.actual_output_weight_kg || formData.actual_output_weight_kg <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid output weight",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update the transformation with inward details
      const { error: updateError } = await supabase
        .from("job_work_transformations")
        .update({
          status: "returned",
          actual_output_weight_kg: formData.actual_output_weight_kg,
          actual_return_date: formData.actual_return_date,
          notes: formData.notes,
        })
        .eq("id", selectedTransformation);

      if (updateError) throw updateError;

      // Create a new batch for the returned material
      const transformation = selectedTransformationData;
      if (transformation) {
        const { data: batchData, error: batchError } = await supabase
          .from("batches")
          .insert([{
            sku_id: transformation.output_sku_id,
            batch_code: `JW-${transformation.job_work_number}-OUT`,
            total_weight_kg: formData.actual_output_weight_kg,
            available_weight_kg: formData.actual_output_weight_kg,
            quality_grade: "A",
            make: "Job Work",
            notes: `Returned from job work: ${transformation.job_work_number}`,
          }])
          .select()
          .single();

        if (batchError) throw batchError;

        // Create inward transaction
        const { error: transactionError } = await supabase
          .from("transactions")
          .insert([{
            material_id: transformation.output_sku_id,
            location_id: "00000000-0000-0000-0000-000000000001", // Default location
            transaction_type: "in",
            quantity: formData.actual_output_weight_kg,
            weight_kg: formData.actual_output_weight_kg,
            batch_id: batchData.id,
            reference_type: "job_work_return",
            reference_id: transformation.id,
            transformation_id: transformation.id,
            notes: `Job work return: ${transformation.job_work_number}`,
          }]);

        if (transactionError) throw transactionError;

        // Update the transformation with the output batch
        const { error: updateBatchError } = await supabase
          .from("job_work_transformations")
          .update({ output_batch_id: batchData.id })
          .eq("id", selectedTransformation);

        if (updateBatchError) throw updateBatchError;
      }

      toast({
        title: "Success",
        description: "Job work inward entry created successfully",
      });

      // Reset form
      setSelectedTransformation("");
      setFormData({
        actual_output_weight_kg: 0,
        actual_return_date: new Date().toISOString().split("T")[0],
        notes: "",
      });

      queryClient.invalidateQueries({ queryKey: ["sent-transformations"] });
      queryClient.invalidateQueries({ queryKey: ["job-work-transformations"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating job work inward:", error);
      toast({
        title: "Error",
        description: "Failed to create job work inward entry",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Job Work Inward Entry</DialogTitle>
          <DialogDescription>
            Receive materials back from contractor after processing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Select Job Work */}
          <Card>
            <CardHeader>
              <CardTitle>Select Job Work</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="transformation">Sent Job Work *</Label>
                <Select 
                  value={selectedTransformation} 
                  onValueChange={setSelectedTransformation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sent job work" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-md">
                    {sentTransformations.map((transformation) => (
                      <SelectItem key={transformation.id} value={transformation.id}>
                        {transformation.job_work_number} - {transformation.contractor?.name} - 
                        {transformation.input_material?.name} → {transformation.output_material?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Job Work Details */}
          {selectedTransformationData && (
            <Card>
              <CardHeader>
                <CardTitle>Job Work Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Contractor:</strong> {selectedTransformationData.contractor?.name}
                  </div>
                  <div>
                    <strong>Process:</strong> {selectedTransformationData.process_type}
                  </div>
                  <div>
                    <strong>Input Material:</strong> {selectedTransformationData.input_material?.name}
                  </div>
                  <div>
                    <strong>Output Material:</strong> {selectedTransformationData.output_material?.name}
                  </div>
                  <div>
                    <strong>Input Weight:</strong> {selectedTransformationData.input_weight_kg} KG
                  </div>
                  <div>
                    <strong>Expected Output:</strong> {selectedTransformationData.expected_output_weight_kg} KG
                  </div>
                  <div>
                    <strong>Sent Date:</strong> {selectedTransformationData.sent_date}
                  </div>
                  <div>
                    <strong>Expected Return:</strong> {selectedTransformationData.expected_return_date || "Not specified"}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Return Details */}
          {selectedTransformationData && (
            <Card>
              <CardHeader>
                <CardTitle>Return Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="actual_output_weight">Actual Output Weight (KG) *</Label>
                    <Input
                      id="actual_output_weight"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.actual_output_weight_kg}
                      onChange={(e) => handleInputChange("actual_output_weight_kg", parseFloat(e.target.value) || 0)}
                      placeholder="Enter actual output weight"
                    />
                  </div>

                  <div>
                    <Label htmlFor="actual_return_date">Actual Return Date *</Label>
                    <Input
                      id="actual_return_date"
                      type="date"
                      value={formData.actual_return_date}
                      onChange={(e) => handleInputChange("actual_return_date", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any additional notes about the returned material..."
                    className="min-h-[80px]"
                  />
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
              disabled={!selectedTransformation || !formData.actual_output_weight_kg}
            >
              Create Inward Entry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
