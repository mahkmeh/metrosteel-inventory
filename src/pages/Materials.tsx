import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Package, Edit, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Materials = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    category: "",
    thickness: "",
    width: "",
    length: "",
    finish: "",
    unit: "MT",
    base_price: "",
    description: ""
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
        const { data: skuData } = await supabase.rpc("generate_sku", {
          p_grade: material.grade,
          p_category: material.category,
          p_thickness: material.thickness ? parseFloat(material.thickness) : null,
          p_width: material.width ? parseFloat(material.width) : null
        });

        const { data, error } = await supabase
          .from("materials")
          .insert([{ ...material, sku: skuData }])
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
      grade: "",
      category: "",
      thickness: "",
      width: "",
      length: "",
      finish: "",
      unit: "MT",
      base_price: "",
      description: ""
    });
  };

  const handleEdit = (material: any) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      grade: material.grade,
      category: material.category,
      thickness: material.thickness?.toString() || "",
      width: material.width?.toString() || "",
      length: material.length?.toString() || "",
      finish: material.finish || "",
      unit: material.unit,
      base_price: material.base_price?.toString() || "",
      description: material.description || ""
    });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMaterial.mutate({
      ...formData,
      thickness: formData.thickness ? parseFloat(formData.thickness) : null,
      width: formData.width ? parseFloat(formData.width) : null,
      length: formData.length ? parseFloat(formData.length) : null,
      base_price: formData.base_price ? parseFloat(formData.base_price) : null,
    });
  };

  const grades = ["304", "316", "316L", "202", "201", "430", "409"];
  const categories = ["Sheet", "Pipe", "Rod", "Bar", "Coil", "Plate"];
  const finishes = ["2B", "BA", "HL", "NO.4", "Mirror", "Satin"];
  const units = ["MT", "KG", "PCS", "SQM"];

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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMaterial ? "Edit Material" : "Add New Material"}</DialogTitle>
              <DialogDescription>
                {editingMaterial ? "Update the steel material details" : "Create a new steel material entry"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Material Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., SS304 Sheet"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="finish">Finish</Label>
                  <Select value={formData.finish} onValueChange={(value) => setFormData({ ...formData, finish: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select finish" />
                    </SelectTrigger>
                    <SelectContent>
                      {finishes.map((finish) => (
                        <SelectItem key={finish} value={finish}>{finish}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="thickness">Thickness (mm)</Label>
                  <Input
                    id="thickness"
                    type="number"
                    step="0.001"
                    value={formData.thickness}
                    onChange={(e) => setFormData({ ...formData, thickness: e.target.value })}
                    placeholder="1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="width">Width (mm)</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.001"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    placeholder="1219"
                  />
                </div>
                <div>
                  <Label htmlFor="length">Length (mm)</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.001"
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                    placeholder="2438"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
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
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    placeholder="150000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about the material..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingMaterial(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMaterial.isPending}>
                  {createMaterial.isPending 
                    ? (editingMaterial ? "Updating..." : "Creating...") 
                    : (editingMaterial ? "Update Material" : "Create Material")
                  }
                </Button>
              </div>
            </form>
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
              {materials?.map((material) => (
                <TableRow key={material.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{material.sku}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{material.grade}</Badge>
                  </TableCell>
                  <TableCell>{material.category}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {[
                      material.thickness && `${material.thickness}mm`,
                      material.width && `${material.width}mm`,
                      material.length && `${material.length}mm`
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {materials?.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No materials found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first material"}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Materials;