import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Package, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BatchManagementModal } from "@/components/BatchManagementModal";

const MaterialDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [batchManagementOpen, setBatchManagementOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    grade: "",
    sku: "",
    make: "",
    unit: "KG",
    base_price: "",
    description: "",
    thickness: "",
    width: "",
    length: "",
    diameter: "",
    pipe_type: "",
    bar_shape: "",
    size_description: "",
    finish: "",
  });

  // Fetch material data
  const { data: material, isLoading } = useQuery({
    queryKey: ["material", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch batches for this material
  const { data: batches } = useQuery({
    queryKey: ["material-batches", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batches")
        .select(`
          *,
          materials!inner(name, sku),
          suppliers(name)
        `)
        .eq("sku_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  // Update material mutation
  const updateMaterial = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("materials")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Material updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      queryClient.invalidateQueries({ queryKey: ["material", id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update material",
        variant: "destructive",
      });
    },
  });

  // Populate form when material data loads
  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name || "",
        category: material.category || "",
        grade: material.grade || "",
        sku: material.sku || "",
        make: material.make || "",
        unit: material.unit || "KG",
        base_price: material.base_price?.toString() || "",
        description: material.description || "",
        thickness: material.thickness?.toString() || "",
        width: material.width?.toString() || "",
        length: material.length?.toString() || "",
        diameter: material.diameter?.toString() || "",
        pipe_type: material.pipe_type || "",
        bar_shape: material.bar_shape || "",
        size_description: material.size_description || "",
        finish: material.finish || "",
      });
    }
  }, [material]);

  const handleSave = () => {
    const updateData = {
      name: formData.name,
      category: formData.category,
      grade: formData.grade,
      sku: formData.sku,
      make: formData.make || null,
      unit: formData.unit,
      base_price: formData.base_price ? parseFloat(formData.base_price) : null,
      description: formData.description || null,
      thickness: formData.thickness ? parseFloat(formData.thickness) : null,
      width: formData.width ? parseFloat(formData.width) : null,
      length: formData.length ? parseFloat(formData.length) : null,
      diameter: formData.diameter ? parseFloat(formData.diameter) : null,
      pipe_type: formData.pipe_type || null,
      bar_shape: formData.bar_shape || null,
      size_description: formData.size_description || null,
      finish: formData.finish || null,
    };

    updateMaterial.mutate(updateData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading material details...</div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Material not found</h2>
          <Button onClick={() => navigate("/materials")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Materials
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/materials")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Materials
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{material.name}</h1>
            <p className="text-muted-foreground">SKU: {material.sku}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={updateMaterial.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateMaterial.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Material Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Material Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sheet">Sheet</SelectItem>
                      <SelectItem value="Plate">Plate</SelectItem>
                      <SelectItem value="Pipe">Pipe</SelectItem>
                      <SelectItem value="Bar">Bar</SelectItem>
                      <SelectItem value="Rod">Rod</SelectItem>
                      <SelectItem value="Wire">Wire</SelectItem>
                      <SelectItem value="Tube">Tube</SelectItem>
                      <SelectItem value="Angle">Angle</SelectItem>
                      <SelectItem value="Channel">Channel</SelectItem>
                      <SelectItem value="Beam">Beam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => handleInputChange("grade", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => handleInputChange("make", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KG">KG</SelectItem>
                      <SelectItem value="TON">TON</SelectItem>
                      <SelectItem value="PCS">PCS</SelectItem>
                      <SelectItem value="MTR">MTR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="base_price">Base Price</Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => handleInputChange("base_price", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="finish">Finish</Label>
                  <Input
                    id="finish"
                    value={formData.finish}
                    onChange={(e) => handleInputChange("finish", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dimensions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="thickness">Thickness (mm)</Label>
                  <Input
                    id="thickness"
                    type="number"
                    step="0.01"
                    value={formData.thickness}
                    onChange={(e) => handleInputChange("thickness", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="width">Width (mm)</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.01"
                    value={formData.width}
                    onChange={(e) => handleInputChange("width", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="length">Length (mm)</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.01"
                    value={formData.length}
                    onChange={(e) => handleInputChange("length", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="diameter">Diameter (mm)</Label>
                  <Input
                    id="diameter"
                    type="number"
                    step="0.01"
                    value={formData.diameter}
                    onChange={(e) => handleInputChange("diameter", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pipe_type">Pipe Type</Label>
                  <Input
                    id="pipe_type"
                    value={formData.pipe_type}
                    onChange={(e) => handleInputChange("pipe_type", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bar_shape">Bar Shape</Label>
                  <Input
                    id="bar_shape"
                    value={formData.bar_shape}
                    onChange={(e) => handleInputChange("bar_shape", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="size_description">Size Description</Label>
                <Input
                  id="size_description"
                  value={formData.size_description}
                  onChange={(e) => handleInputChange("size_description", e.target.value)}
                  placeholder="Custom size description"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Batch Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Batches ({batches?.length || 0})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBatchManagementOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </CardHeader>
            <CardContent>
              {batches && batches.length > 0 ? (
                <div className="space-y-3">
                  {batches.map((batch) => (
                    <div key={batch.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{batch.batch_code}</Badge>
                        <Badge variant={batch.status === "active" ? "default" : "secondary"}>
                          {batch.status}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Weight:</span>
                          <span>{batch.total_weight_kg} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available:</span>
                          <span>{batch.available_weight_kg} kg</span>
                        </div>
                        {batch.quality_grade && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Grade:</span>
                            <span>{batch.quality_grade}</span>
                          </div>
                        )}
                        {batch.suppliers?.name && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Supplier:</span>
                            <span>{batch.suppliers.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No batches found for this material
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Batch Management Modal */}
      <BatchManagementModal
        isOpen={batchManagementOpen}
        onClose={() => setBatchManagementOpen(false)}
        material={material}
      />
    </div>
  );
};

export default MaterialDetails;