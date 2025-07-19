
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertCircle } from "lucide-react";
import { useBatches, useCreateBatch, Batch } from "@/hooks/useBatches";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UnifiedBatchForm } from "@/components/BatchForm/UnifiedBatchForm";

// Simple batch interface for the form
interface SimpleBatch {
  id?: string;
  batch_code: string;
  total_weight_kg: number;
  heat_number?: string;
  make?: string;
  notes?: string;
}

interface BatchManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: {
    id: string;
    name: string;
    sku: string;
    category: string;
    grade: string;
  } | null;
}

export const BatchManagementModal = ({ isOpen, onClose, material }: BatchManagementModalProps) => {
  const [activeTab, setActiveTab] = useState("view");
  const [newBatches, setNewBatches] = useState<SimpleBatch[]>([{
    batch_code: "",
    total_weight_kg: 0,
    heat_number: "",
    make: "",
    notes: "",
  }]);

  const { toast } = useToast();
  const createBatch = useCreateBatch();

  // Fetch batches for this material
  const { data: batches = [], isLoading: batchesLoading, refetch } = useQuery({
    queryKey: ["batches", "by-material", material?.id],
    queryFn: async () => {
      if (!material?.id) return [];
      
      const { data, error } = await supabase
        .from("batches")
        .select(`
          *,
          material:materials(name, sku, category, grade),
          supplier:suppliers(name)
        `)
        .eq("sku_id", material.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Batch[];
    },
    enabled: !!material?.id && isOpen,
  });

  const handleSubmit = async () => {
    if (!material) return;

    // Validate that at least one batch has required fields
    const validBatches = newBatches.filter(batch => 
      batch.batch_code.trim() && batch.total_weight_kg > 0
    );

    if (validBatches.length === 0) {
      toast({
        title: "No Valid Batches",
        description: "Please add at least one batch with batch code and weight.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create batches one by one
      for (const batch of validBatches) {
        const batchData = {
          batch_code: batch.batch_code,
          sku_id: material.id,
          total_weight_kg: batch.total_weight_kg,
          available_weight_kg: batch.total_weight_kg,
          heat_number: batch.heat_number || undefined,
          make: batch.make || undefined,
          notes: batch.notes || undefined,
        };

        await createBatch.mutateAsync(batchData);
      }

      // Reset form and switch to view tab
      setNewBatches([{
        batch_code: "",
        total_weight_kg: 0,
        heat_number: "",
        make: "",
        notes: "",
      }]);
      setActiveTab("view");
      refetch();
    } catch (error) {
      console.error("Error creating batches:", error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "reserved": return "bg-blue-100 text-blue-800";
      case "consumed": return "bg-gray-100 text-gray-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const totalAvailableWeight = batches.reduce((sum, batch) => sum + (batch.available_weight_kg || 0), 0);
  const totalBatches = batches.length;
  const activeBatches = batches.filter(batch => batch.status === "active").length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Batch Management - {material?.name}
          </DialogTitle>
          <DialogDescription>
            Manage batches for {material?.sku} ({material?.grade} {material?.category})
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBatches}</div>
              <div className="text-xs text-muted-foreground">{activeBatches} active</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Available Weight</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAvailableWeight.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">KG total</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {batches.length > 0 ? batches.filter(b => b.quality_grade === "A").length > batches.length / 2 ? "A" : "B" : "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">Grade average</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view">View Batches</TabsTrigger>
            <TabsTrigger value="create">Add New Batch</TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="space-y-4">
            {batchesLoading ? (
              <div className="text-center py-8">Loading batches...</div>
            ) : batches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No batches found for this material.</p>
                <p className="text-sm">Click "Add New Batch" to create the first batch.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Code</TableHead>
                      <TableHead>Total Weight (KG)</TableHead>
                      <TableHead>Available (KG)</TableHead>
                      <TableHead>Heat Number</TableHead>
                      <TableHead>Make</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">{batch.batch_code}</TableCell>
                        <TableCell>{batch.total_weight_kg.toFixed(2)}</TableCell>
                        <TableCell>{batch.available_weight_kg.toFixed(2)}</TableCell>
                        <TableCell>{batch.heat_number || "N/A"}</TableCell>
                        <TableCell>{batch.make || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(batch.status)}>
                            {batch.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <UnifiedBatchForm
              batches={newBatches}
              onBatchesChange={(updatedBatches) => setNewBatches(updatedBatches)}
              canAddMultiple={true}
              showTitle={true}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setActiveTab("view")}>
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleSubmit}
                disabled={createBatch.isPending || newBatches.every(b => !b.batch_code || b.total_weight_kg <= 0)}
              >
                {createBatch.isPending ? "Creating..." : "Create Batches"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
