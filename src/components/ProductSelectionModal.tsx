import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Filter, Clock } from "lucide-react";

interface Material {
  id: string;
  name: string;
  sku: string;
  category: string;
  grade: string;
  base_price?: number;
  batch_no?: string;
  heat_number?: string;
  // Add other properties that exist in the real materials table
  description?: string;
  unit?: string;
  is_active?: boolean;
}

interface ProductSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materials: Material[];
  onSelectMaterial: (material: Material) => void;
}

export function ProductSelectionModal({
  open,
  onOpenChange,
  materials,
  onSelectMaterial,
}: ProductSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("search");

  // Get unique categories and grades
  const categories = [...new Set(materials.map(m => m.category))];
  const grades = [...new Set(materials.map(m => m.grade))];

  // Filter materials based on search and filters
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = !searchTerm || 
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.batch_no && material.batch_no.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || material.category === selectedCategory;
    const matchesGrade = selectedGrade === "all" || material.grade === selectedGrade;
    
    return matchesSearch && matchesCategory && matchesGrade;
  });

  // Get materials by category for browse tab
  const materialsByCategory = categories.reduce((acc, category) => {
    acc[category] = materials.filter(m => m.category === category);
    return acc;
  }, {} as Record<string, Material[]>);

  const handleSelectMaterial = (material: Material) => {
    onSelectMaterial(material);
    onOpenChange(false);
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedGrade("all");
    setActiveTab("search");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedGrade("all");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Select Product
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Browse by Category
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="flex flex-col gap-4">
              {/* Search and Filters */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by SKU, product name, or batch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {grades.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(searchTerm || selectedCategory !== "all" || selectedGrade !== "all") && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear
                  </Button>
                )}
              </div>

              {/* Results Grid */}
              <div className="max-h-[400px] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredMaterials.map((material) => (
                    <Card 
                      key={material.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSelectMaterial(material)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{material.name}</CardTitle>
                        <CardDescription className="text-xs">
                          SKU: {material.sku} {material.batch_no && ` | Batch: ${material.batch_no}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {material.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {material.grade}
                            </Badge>
                          </div>
                          <div className="font-semibold text-sm">
                            ₹{material.base_price?.toLocaleString() || 0}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredMaterials.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No products found matching your criteria</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="browse" className="space-y-4">
            <div className="max-h-[500px] overflow-y-auto">
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      {category}
                      <Badge variant="secondary" className="text-xs">
                        {materialsByCategory[category].length} items
                      </Badge>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                      {materialsByCategory[category].map((material) => (
                        <Card 
                          key={material.id} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleSelectMaterial(material)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-sm">{material.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {material.sku} | Grade: {material.grade}
                                </div>
                              </div>
                              <div className="font-semibold text-sm">
                                ₹{material.base_price?.toLocaleString() || 0}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Recent materials feature coming soon</p>
              <p className="text-xs">This will show your frequently used materials</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}