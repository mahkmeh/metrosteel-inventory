
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Search, Package, Filter, Clock, Plus, X, ArrowRight } from "lucide-react";
import { InventoryInfoDisplay } from "./InventoryInfoDisplay";
import { EnhancedBatchSelector } from "./EnhancedBatchSelector";

interface Material {
  id: string;
  name: string;
  sku: string;
  category: string;
  grade: string;
  base_price: number;
  batch_no?: string;
}

interface BatchSelection {
  batch: any;
  quantity: number;
}

interface EnhancedProductSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materials: Material[];
  onSelectMaterial: (material: Material, orderQuantity: number, batchSelections: BatchSelection[]) => void;
}

export function EnhancedProductSelectionModal({
  open,
  onOpenChange,
  materials,
  onSelectMaterial,
}: EnhancedProductSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("search");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(0);
  const [batchSelections, setBatchSelections] = useState<BatchSelection[]>([]);
  const [showBatchSelector, setShowBatchSelector] = useState(false);

  // Get inventory information for the selected material
  const { data: inventoryInfo } = useQuery({
    queryKey: ["material-inventory", selectedMaterial?.id],
    queryFn: async () => {
      if (!selectedMaterial) return null;

      const { data: inventory, error } = await supabase
        .from("inventory_valuation")
        .select("*")
        .eq("material_id", selectedMaterial.id);

      if (error) throw error;

      const { data: batches, error: batchError } = await supabase
        .from("batches")
        .select("*")
        .eq("sku_id", selectedMaterial.id)
        .eq("status", "active");

      if (batchError) throw batchError;

      const { data: locations, error: locationError } = await supabase
        .from("inventory")
        .select(`
          *,
          location:locations(name)
        `)
        .eq("material_id", selectedMaterial.id);

      if (locationError) throw locationError;

      const totalQuantity = inventory?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      const availableQuantity = inventory?.reduce((sum, item) => sum + (item.available_quantity || 0), 0) || 0;
      const reservedQuantity = inventory?.reduce((sum, item) => sum + (item.reserved_quantity || 0), 0) || 0;
      const totalValue = inventory?.reduce((sum, item) => sum + (item.total_value || 0), 0) || 0;
      const weightedAvgCost = inventory?.reduce((sum, item) => sum + (item.weighted_avg_cost || 0), 0) / (inventory?.length || 1);
      const batchCount = batches?.length || 0;
      const totalBatchWeight = batches?.reduce((sum, batch) => sum + (batch.total_weight_kg || 0), 0) || 0;

      return {
        totalQuantity,
        availableQuantity,
        reservedQuantity,
        totalValue,
        weightedAvgCost,
        batchCount,
        totalBatchWeight,
        locations: locations?.map(loc => ({
          id: loc.location_id,
          name: loc.location?.name || 'Unknown',
          quantity: loc.quantity || 0,
          available: loc.available_quantity || 0,
        })) || []
      };
    },
    enabled: !!selectedMaterial,
  });

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

  const handleMaterialSelect = (material: Material) => {
    setSelectedMaterial(material);
    setOrderQuantity(0);
    setBatchSelections([]);
    setShowBatchSelector(false);
  };

  const handleBatchSelect = (batch: any, quantity: number) => {
    setBatchSelections(prev => [...prev, { batch, quantity }]);
  };

  const handleRemoveBatch = (index: number) => {
    setBatchSelections(prev => prev.filter((_, i) => i !== index));
  };

  const handleProceedToBatchSelection = () => {
    if (orderQuantity <= 0) return;
    setShowBatchSelector(true);
  };

  const handleConfirmSelection = () => {
    if (!selectedMaterial || orderQuantity <= 0) return;
    
    onSelectMaterial(selectedMaterial, orderQuantity, batchSelections);
    onOpenChange(false);
    resetState();
  };

  const resetState = () => {
    setSelectedMaterial(null);
    setOrderQuantity(0);
    setBatchSelections([]);
    setShowBatchSelector(false);
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

  const totalAllocated = batchSelections.reduce((sum, item) => sum + item.quantity, 0);
  const allocationComplete = Math.abs(totalAllocated - orderQuantity) < 0.01;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {selectedMaterial ? `Configure Order: ${selectedMaterial.name}` : "Select Product"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[calc(90vh-120px)] overflow-hidden">
          {/* Left Panel - Material Selection */}
          <div className="flex-1 overflow-y-auto pr-4">
            {!selectedMaterial ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="search" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search
                  </TabsTrigger>
                  <TabsTrigger value="browse" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Browse
                  </TabsTrigger>
                  <TabsTrigger value="recent" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="space-y-4">
                  <div className="flex flex-col gap-4">
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

                    <div className="max-h-[500px] overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredMaterials.map((material) => (
                          <Card 
                            key={material.id} 
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleMaterialSelect(material)}
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
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="browse">
                  <div className="text-center py-8 text-muted-foreground">
                    <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Browse by category feature</p>
                  </div>
                </TabsContent>

                <TabsContent value="recent">
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Recent materials feature</p>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedMaterial(null)}>
                    ← Back to Selection
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="order-quantity">Order Quantity (KG)</Label>
                    <Input
                      id="order-quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(parseFloat(e.target.value) || 0)}
                      placeholder="Enter order quantity"
                    />
                  </div>

                  {orderQuantity > 0 && !showBatchSelector && (
                    <Button onClick={handleProceedToBatchSelection} className="w-full">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Proceed to Batch Selection
                    </Button>
                  )}

                  {showBatchSelector && (
                    <div className="space-y-4">
                      <Separator />
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Batch Selection</h3>
                        <Badge variant={allocationComplete ? "default" : "secondary"}>
                          {allocationComplete ? "Complete" : "Incomplete"}
                        </Badge>
                      </div>
                      
                      <EnhancedBatchSelector
                        materialId={selectedMaterial.id}
                        onBatchSelect={handleBatchSelect}
                        selectedBatches={batchSelections}
                        requiredQuantity={orderQuantity}
                      />

                      <div className="flex gap-2">
                        <Button
                          onClick={handleConfirmSelection}
                          disabled={!allocationComplete}
                          className="flex-1"
                        >
                          Confirm Selection
                        </Button>
                        <Button variant="outline" onClick={() => setShowBatchSelector(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Inventory Information */}
          <div className="w-80 border-l pl-4">
            <div className="sticky top-0">
              {selectedMaterial && inventoryInfo ? (
                <InventoryInfoDisplay
                  material={selectedMaterial}
                  inventoryInfo={inventoryInfo}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Select a material to view inventory details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
