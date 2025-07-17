import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MaterialFormSteps } from "@/components/MaterialForm/MaterialFormSteps";
import { CategoryStep } from "@/components/MaterialForm/steps/CategoryStep";
import { SubTypeStep } from "@/components/MaterialForm/steps/SubTypeStep";
import { DimensionsStep } from "@/components/MaterialForm/steps/DimensionsStep";
import { BusinessInfoStep } from "@/components/MaterialForm/steps/BusinessInfoStep";
import { DetailsStep } from "@/components/MaterialForm/steps/DetailsStep";

const Materials = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
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
    
    // Batch info
    batch_no: "",
    heat_number: "",
    no_of_sheets: "",
    batch_weight: "",
    
    // Finish
    finish: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      setIsDialogOpen(false);
      setEditingMaterial(null);
      resetForm();
      toast({
        title: "Success",
        description: editingMaterial ? "Material updated successfully" : "Material created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: editingMaterial ? "Failed to update material" : "Failed to create material",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
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
      batch_no: "",
      heat_number: "",
      no_of_sheets: "",
      batch_weight: "",
      finish: "",
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
      batch_no: material.batch_no || "",
      heat_number: material.heat_number || "",
      no_of_sheets: material.no_of_sheets?.toString() || "",
      batch_weight: material.batch_weight?.toString() || "",
      finish: material.finish || "",
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
    if (!formData.category) return 5;
    
    // Skip sub-type step for categories that don't need it
    const needsSubType = formData.category === "Pipe" || formData.category === "Bar";
    return needsSubType ? 5 : 4;
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: // Category step
        return formData.category !== "";
      case 2: // Sub-type step (if applicable)
        if (formData.category === "Pipe") return formData.pipe_type !== "";
        if (formData.category === "Bar") return formData.bar_shape !== "";
        return true;
      case 3: // Dimensions step
        return formData.grade !== "";
      case 4: // Business info step
        return formData.sku !== "" && formData.make !== "";
      case 5: // Details step
        return formData.name !== "";
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext()) {
      const totalSteps = getTotalSteps();
      const needsSubType = formData.category === "Pipe" || formData.category === "Bar";
      
      if (currentStep === 1 && !needsSubType) {
        setCurrentStep(3); // Skip sub-type step
      } else if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const needsSubType = formData.category === "Pipe" || formData.category === "Bar";
      
      if (currentStep === 3 && !needsSubType) {
        setCurrentStep(1); // Skip sub-type step backwards
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleSubmit = () => {
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
      batch_no: formData.batch_no || null,
      heat_number: formData.heat_number || null,
      no_of_sheets: formData.no_of_sheets ? parseInt(formData.no_of_sheets) : null,
      batch_weight: formData.batch_weight ? parseFloat(formData.batch_weight) : null,
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

    createMaterial.mutate(materialData);
  };

  const renderCurrentStep = () => {
    const totalSteps = getTotalSteps();
    const needsSubType = formData.category === "Pipe" || formData.category === "Bar";
    
    // Adjust step numbers for categories without sub-type
    let adjustedStep = currentStep;
    if (!needsSubType && currentStep >= 3) {
      adjustedStep = currentStep + 1;
    }

    switch (adjustedStep) {
      case 1:
        return (
          <CategoryStep
            selectedCategory={formData.category}
            onCategoryChange={(category) => setFormData({ ...formData, category, pipe_type: "", bar_shape: "" })}
          />
        );
      case 2:
        return (
          <SubTypeStep
            category={formData.category}
            selectedSubType={formData.category === "Pipe" ? formData.pipe_type : formData.bar_shape}
            onSubTypeChange={(subType) => {
              if (formData.category === "Pipe") {
                setFormData({ ...formData, pipe_type: subType });
              } else if (formData.category === "Bar") {
                setFormData({ ...formData, bar_shape: subType });
              }
            }}
          />
        );
      case 3:
        return (
          <DimensionsStep
            category={formData.category}
            subType={formData.category === "Pipe" ? formData.pipe_type : formData.bar_shape}
            formData={formData}
            onFormDataChange={setFormData}
          />
        );
      case 4:
        return (
          <BusinessInfoStep
            formData={formData}
            onFormDataChange={setFormData}
          />
        );
      case 5:
        return (
          <DetailsStep
            formData={formData}
            onFormDataChange={setFormData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="px-4 sm:px-0">
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
              <DialogDescription>
                {editingMaterial ? "Update the steel material details" : "Create a new steel material entry"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <MaterialFormSteps currentStep={currentStep} totalSteps={getTotalSteps()} />
              
              {renderCurrentStep()}
              
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(material)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Materials;