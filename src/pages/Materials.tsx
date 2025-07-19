import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, ArrowUpDown, ChevronLeft, ChevronRight, AlertTriangle, Package, DollarSign, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { KpiCard } from "@/components/KpiCard";
import { useMaterialKpis } from "@/hooks/useMaterialKpis";
import { MaterialFormSteps } from "@/components/MaterialForm/MaterialFormSteps";
import { CategoryStep } from "@/components/MaterialForm/steps/CategoryStep";
import { SubTypeStep } from "@/components/MaterialForm/steps/SubTypeStep";
import { StreamlinedMaterialForm } from "@/components/MaterialForm/steps/StreamlinedMaterialForm";
import { BatchManagementModal } from "@/components/BatchManagementModal";
import { useCreateBatch } from "@/hooks/useBatches";

const Materials = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [batchManagementOpen, setBatchManagementOpen] = useState(false);
  const [selectedMaterialForBatch, setSelectedMaterialForBatch] = useState<any>(null);

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic info
    name: "",
    category: "",
    grade: "",
    sku: "",
    make: "",
    unit: "KG",
    base_price: "",
    description: "",
    
    // Dimensions
    thickness: "",
    width: "",
    length: "",
    diameter: "",
    
    // Category specific
    pipe_type: "",
    bar_shape: "",
    size_description: "",
    
    // Finish
    finish: "",
    
    // Batches
    batches: [] as any[],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: kpiData, isLoading: kpiLoading } = useMaterialKpis();

  const { data: materials, isLoading } = useQuery({
    queryKey: ["materials", searchTerm, sortField, sortDirection],
    queryFn: async () => {
      let query = supabase
        .from("materials")
        .select("*")
        .eq("is_active", true)
        .order(sortField, { ascending: sortDirection === "asc" });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,grade.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Query to check for existing SKUs for validation
  const { data: existingSKUs = [] } = useQuery({
    queryKey: ["existing-skus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("sku")
        .eq("is_active", true);
      
      if (error) throw error;
      return data.map(item => item.sku);
    }
  });

  const createMaterial = useMutation({
    mutationFn: async (material: any) => {
      if (editingMaterial) {
        // Update existing material
        const { data, error } = await supabase
          .from("materials")
          .update(material)
          .eq("id", editingMaterial.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new material
        const { data, error } = await supabase
          .from("materials")
          .insert([material])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      queryClient.invalidateQueries({ queryKey: ["existing-skus"] });
      setIsDialogOpen(false);
      setEditingMaterial(null);
      resetForm();
      toast({
        title: "Success",
        description: editingMaterial ? "Material updated successfully" : "Material created successfully",
      });
    },
    onError: (error: any) => {
      console.error("Material creation/update error:", error);
      
      let errorMessage = editingMaterial ? "Failed to update material" : "Failed to create material";
      
      // Handle specific database constraint errors
      if (error.message?.includes("duplicate key value violates unique constraint")) {
        if (error.message.includes("materials_sku_key")) {
          errorMessage = `SKU "${formData.sku}" already exists. Please use a different SKU or edit the existing material.`;
        } else {
          errorMessage = "A material with these details already exists. Please check for duplicates.";
        }
      } else if (error.message?.includes("violates foreign key constraint")) {
        errorMessage = "Invalid reference data. Please check your selections.";
      } else if (error.message?.includes("violates not-null constraint")) {
        errorMessage = "Please fill in all required fields.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setEditingMaterial(null);
    setFormData({
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
      batches: [],
    });
    setCurrentStep(1);
  };

  const handleEdit = (material: any) => {
    setEditingMaterial(material);
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
      batches: [],
    });
    setCurrentStep(1);
    setIsDialogOpen(true);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getTotalSteps = () => {
    if (formData.category === "Pipe" || formData.category === "Bar") {
      return 3; // Category → Sub-type → Complete Form
    }
    return 2; // Category → Complete Form
  };

  const canProceedToNext = () => {
    if (currentStep === 1) {
      return !!formData.category;
    }
    
    if (currentStep === 2) {
      // If category requires sub-type, check sub-type
      if (formData.category === "Pipe" || formData.category === "Bar") {
        return !!(formData.pipe_type || formData.bar_shape);
      }
      // For categories without sub-type, step 2 is the complete form
      return validateAllFields();
    }
    
    if (currentStep === 3) {
      // This is the complete form step for categories with sub-type
      return validateAllFields();
    }
    
    return false;
  };

  const validateAllFields = () => {
    // Check required fields common to all categories
    if (!formData.grade || !formData.sku || !formData.make || !formData.name) return false;
    
    // Check for duplicate SKU (only for new materials)
    if (!editingMaterial && formData.sku && existingSKUs.includes(formData.sku)) {
      return false;
    }
    
    // Check if at least one batch exists with required fields
    if (!formData.batches || formData.batches.length === 0) return false;
    
    const hasValidBatch = formData.batches.some((batch: any) => 
      batch.batch_code && batch.total_weight_kg > 0
    );
    if (!hasValidBatch) return false;
    
    // Check category-specific dimension fields
    switch (formData.category) {
      case "Sheet":
        return !!(formData.thickness && formData.width && formData.length);
      case "Pipe":
        return !!(formData.thickness && formData.diameter && formData.length);
      case "Bar":
        if (formData.bar_shape === "Round") {
          return !!(formData.diameter && formData.length);
        } else {
          return !!(formData.width && formData.length);
        }
      case "Flat":
        return !!(formData.width && formData.thickness && formData.length);
      case "Angle":
        return !!(formData.size_description && formData.thickness && formData.length);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < getTotalSteps()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createBatch = useCreateBatch();

  const handleSubmit = async () => {
    // Validate SKU before submission for new materials
    if (!editingMaterial && formData.sku && existingSKUs.includes(formData.sku)) {
      toast({
        title: "Duplicate SKU",
        description: `SKU "${formData.sku}" already exists. Please use a different SKU.`,
        variant: "destructive",
      });
      return;
    }

    const materialData: any = {
      name: formData.name,
      category: formData.category,
      grade: formData.grade,
      sku: formData.sku,
      make: formData.make || null,
      unit: formData.unit || "KG",
      description: formData.description || null,
      thickness: formData.thickness ? parseFloat(formData.thickness) : null,
      width: formData.width ? parseFloat(formData.width) : null,
      length: formData.length ? parseFloat(formData.length) : null,
      diameter: formData.diameter ? parseFloat(formData.diameter) : null,
      base_price: formData.base_price ? parseFloat(formData.base_price) : null,
      size_description: formData.size_description || null,
      finish: formData.finish || null,
    };

    // Only include pipe_type for Pipe category
    if (formData.category === "Pipe") {
      materialData.pipe_type = formData.pipe_type || null;
    } else {
      materialData.pipe_type = null;
    }

    // Only include bar_shape for Bar category
    if (formData.category === "Bar") {
      materialData.bar_shape = formData.bar_shape || null;
    } else {
      materialData.bar_shape = null;
    }

    // Create material first
    try {
      const materialResult = await createMaterial.mutateAsync(materialData);
      
      // Then create batches if not editing
      if (!editingMaterial && formData.batches && formData.batches.length > 0) {
        console.log("Creating batches:", formData.batches);
        for (const batch of formData.batches) {
          if (batch.batch_code && batch.total_weight_kg > 0) {
            try {
              await createBatch.mutateAsync({
                sku_id: materialResult.id,
                total_weight_kg: batch.total_weight_kg,
                available_weight_kg: batch.total_weight_kg,
                heat_number: batch.heat_number,
                make: batch.make || formData.make,
                notes: batch.notes,
              });
              console.log("Created batch:", batch.batch_code);
            } catch (batchError) {
              console.error("Error creating batch:", batch.batch_code, batchError);
              toast({
                title: "Batch Creation Warning",
                description: `Material created but failed to create batch ${batch.batch_code}`,
                variant: "destructive",
              });
            }
          }
        }
        toast({
          title: "Success",
          description: `Material created with ${formData.batches.length} batches`,
        });
      }
    } catch (error) {
      console.error("Error creating material and batches:", error);
    }
  };

  const handleManageBatches = (material: any) => {
    setSelectedMaterialForBatch({
      id: material.id,
      name: material.name,
      sku: material.sku,
      category: material.category,
      grade: material.grade,
    });
    setBatchManagementOpen(true);
  };

  const renderCurrentStep = () => {
    if (currentStep === 1) {
      return (
        <CategoryStep
          selectedCategory={formData.category}
          onCategoryChange={(category) => setFormData({ ...formData, category })}
        />
      );
    }

    if (currentStep === 2) {
      // If category requires sub-type, show SubTypeStep
      if (formData.category === "Pipe" || formData.category === "Bar") {
        return (
          <SubTypeStep
            category={formData.category}
            selectedSubType={formData.pipe_type || formData.bar_shape || ""}
            onSubTypeChange={(subType) => {
              if (formData.category === "Pipe") {
                setFormData({ ...formData, pipe_type: subType });
              } else if (formData.category === "Bar") {
                setFormData({ ...formData, bar_shape: subType });
              }
            }}
          />
        );
      }
      // Otherwise, show StreamlinedMaterialForm
      return (
        <StreamlinedMaterialForm
          category={formData.category}
          subType=""
          formData={formData}
          onFormDataChange={setFormData}
          existingSKUs={existingSKUs}
          isEditing={!!editingMaterial}
        />
      );
    }

    if (currentStep === 3) {
      // This is StreamlinedMaterialForm for categories with sub-type
      return (
        <StreamlinedMaterialForm
          category={formData.category}
          subType={formData.pipe_type || formData.bar_shape || ""}
          formData={formData}
          onFormDataChange={setFormData}
          existingSKUs={existingSKUs}
          isEditing={!!editingMaterial}
        />
      );
    }

    return null;
  };

  const getSKUValidationMessage = () => {
    if (!formData.sku || editingMaterial) return null;
    if (existingSKUs.includes(formData.sku)) {
      return "This SKU already exists. Please use a different SKU.";
    }
    return null;
  };

  return (
    <div className="px-4 sm:px-0">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Reorder Now"
          value={kpiData?.reorderNow || 0}
          subtitle="below minimum"
          status="critical"
          icon={AlertTriangle}
          actionLabel="Create PO"
          onAction={() => toast({ title: "Create PO", description: "Opening purchase order creation" })}
        />
        <KpiCard
          title="Excess Stock"
          value={kpiData?.excessStock.count || 0}
          subtitle={`₹${(kpiData?.excessStock.value || 0).toLocaleString('en-IN')} value`}
          status="warning"
          icon={Package}
          actionLabel="Liquidate"
          onAction={() => toast({ title: "Liquidate", description: "Opening stock liquidation" })}
        />
        <KpiCard
          title="Price Updates Required"
          value={kpiData?.priceUpdatesRequired || 0}
          subtitle="with old prices"
          status="info"
          icon={DollarSign}
          actionLabel="Update Pricing"
          onAction={() => toast({ title: "Update Pricing", description: "Opening price update workflow" })}
        />
        <KpiCard
          title="Quality Hold"
          value={kpiData?.qualityHold || 0}
          subtitle="materials on hold"
          status="warning"
          icon={ShieldAlert}
          actionLabel="Quality Check"
          onAction={() => toast({ title: "Quality Check", description: "Opening quality management" })}
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Materials</h1>
          <p className="text-muted-foreground">Manage your steel material catalog</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingMaterial(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMaterial ? "Edit Material" : "Add New Material"}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <MaterialFormSteps currentStep={currentStep} totalSteps={getTotalSteps()} />
              
              {renderCurrentStep()}
              
              {getSKUValidationMessage() && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <p className="text-sm text-destructive font-medium">
                    {getSKUValidationMessage()}
                  </p>
                </div>
              )}
              
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingMaterial(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  
                  {currentStep < getTotalSteps() ? (
                    <Button 
                      type="button"
                      onClick={handleNext}
                      disabled={!canProceedToNext()}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      onClick={handleSubmit}
                      disabled={createMaterial.isPending || !canProceedToNext()}
                    >
                      {createMaterial.isPending 
                        ? (editingMaterial ? "Updating..." : "Creating...") 
                        : (editingMaterial ? "Update Material" : "Create Material")
                      }
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search materials by name, SKU, or grade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* loading state and table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-semibold text-left justify-start"
                    onClick={() => handleSort("name")}
                  >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-semibold text-left justify-start"
                    onClick={() => handleSort("sku")}
                  >
                    SKU
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-semibold text-left justify-start"
                    onClick={() => handleSort("grade")}
                  >
                    Grade
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-semibold text-left justify-start"
                    onClick={() => handleSort("category")}
                  >
                    Category
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Make</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Finish</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-semibold text-left justify-start"
                    onClick={() => handleSort("base_price")}
                  >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No materials found. Create your first material to get started.
                  </TableCell>
                </TableRow>
              ) : (
                materials?.map((material) => (
                  <TableRow key={material.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{material.sku}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{material.grade}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {material.category}
                        {material.pipe_type && (
                          <Badge variant="outline" className="text-xs">{material.pipe_type}</Badge>
                        )}
                        {material.bar_shape && (
                          <Badge variant="outline" className="text-xs">{material.bar_shape}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{material.make || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {material.size_description || [
                        material.thickness && `${material.thickness}mm`,
                        material.width && `${material.width}mm`,
                        material.length && `${material.length}mm`,
                        material.diameter && `⌀${material.diameter}mm`
                      ].filter(Boolean).join(" × ") || "—"}
                    </TableCell>
                    <TableCell>{material.finish || "—"}</TableCell>
                    <TableCell>
                      {material.base_price ? `₹${material.base_price}/${material.unit}` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleManageBatches(material)}
                          title="Manage Batches"
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(material)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Batch Management Modal */}
      <BatchManagementModal
        isOpen={batchManagementOpen}
        onClose={() => {
          setBatchManagementOpen(false);
          setSelectedMaterialForBatch(null);
        }}
        material={selectedMaterialForBatch}
      />
    </div>
  );
};

export default Materials;
