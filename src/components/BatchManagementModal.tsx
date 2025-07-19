
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Package, AlertCircle } from "lucide-react";
import { useBatches, useCreateBatch, Batch } from "@/hooks/useBatches";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [formData, setFormData] = useState({
    total_weight_kg: "",
    heat_number: "",
    make: "",
    quality_grade: "A",
    compliance_status: "pending",
    manufactured_date: "",
    received_date: "",
    expiry_date: "",
    notes: "",
  });

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

  // Fetch suppliers for dropdown
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: isOpen,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!material) return;

    const batchData = {
      sku_id: material.id,
      total_weight_kg: parseFloat(formData.total_weight_kg),
      available_weight_kg: parseFloat(formData.total_weight_kg),
      heat_number: formData.heat_number || undefined,
      make: formData.make || undefined,
      quality_grade: formData.quality_grade,
      compliance_status: formData.compliance_status,
      manufactured_date: formData.manufactured_date || undefined,
      received_date: formData.received_date || undefined,
      expiry_date: formData.expiry_date || undefined,
      notes: formData.notes || undefined,
    };

    try {
      await createBatch.mutateAsync(batchData);
      // Reset form
      setFormData({
        total_weight_kg: "",
        heat_number: "",
        make: "",
        quality_grade: "A",
        compliance_status: "pending",
        manufactured_date: "",
        received_date: "",
        expiry_date: "",
        notes: "",
      });
      setActiveTab("view");
      refetch();
    } catch (error) {
      console.error("Error creating batch:", error);
    }
  };

  const getQualityBadgeColor = (grade: string) => {
    switch (grade) {
      case "A": return "bg-green-100 text-green-800";
      case "B": return "bg-yellow-100 text-yellow-800";
      case "C": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
                      <TableHead>Weight (KG)</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Heat Number</TableHead>
                      <TableHead>Make</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">{batch.batch_code}</TableCell>
                        <TableCell>{batch.total_weight_kg.toFixed(2)}</TableCell>
                        <TableCell>{batch.available_weight_kg.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getQualityBadgeColor(batch.quality_grade)}>
                            Grade {batch.quality_grade}
                          </Badge>
                        </TableCell>
                        <TableCell>{batch.heat_number || "N/A"}</TableCell>
                        <TableCell>{batch.make || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(batch.status)}>
                            {batch.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(batch.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_weight_kg">Total Weight (KG) *</Label>
                  <Input
                    id="total_weight_kg"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.total_weight_kg}
                    onChange={(e) => setFormData({ ...formData, total_weight_kg: e.target.value })}
                    placeholder="Enter batch weight in KG"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quality_grade">Quality Grade</Label>
                  <Select
                    value={formData.quality_grade}
                    onValueChange={(value) => setFormData({ ...formData, quality_grade: value })}
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

                <div className="space-y-2">
                  <Label htmlFor="heat_number">Heat Number</Label>
                  <Input
                    id="heat_number"
                    value={formData.heat_number}
                    onChange={(e) => setFormData({ ...formData, heat_number: e.target.value })}
                    placeholder="Enter heat number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="make">Make/Brand</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    placeholder="Enter make or brand"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compliance_status">Compliance Status</Label>
                  <Select
                    value={formData.compliance_status}
                    onValueChange={(value) => setFormData({ ...formData, compliance_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufactured_date">Manufactured Date</Label>
                  <Input
                    id="manufactured_date"
                    type="date"
                    value={formData.manufactured_date}
                    onChange={(e) => setFormData({ ...formData, manufactured_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="received_date">Received Date</Label>
                  <Input
                    id="received_date"
                    type="date"
                    value={formData.received_date}
                    onChange={(e) => setFormData({ ...formData, received_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Enter any additional notes about this batch"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setActiveTab("view")}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createBatch.isPending || !formData.total_weight_kg}
                >
                  {createBatch.isPending ? "Creating..." : "Create Batch"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
