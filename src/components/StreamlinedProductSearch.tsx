import { useState, useRef, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Material {
  id: string;
  name: string;
  sku: string;
  category: string;
  grade: string;
  base_price?: number;
  unit?: string;
  inventory?: Array<{ quantity: number; available_quantity: number }>;
}

interface StreamlinedProductSearchProps {
  materials: Material[];
  onSelectMaterial: (material: Material) => void;
  placeholder?: string;
}

export function StreamlinedProductSearch({ 
  materials, 
  onSelectMaterial, 
  placeholder = "Search and add items..." 
}: StreamlinedProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredMaterials = materials?.filter(material =>
    searchQuery && (
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ).slice(0, 8) || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStockInfo = (material: Material) => {
    const totalStock = material.inventory?.reduce((sum, inv) => sum + (inv.available_quantity || 0), 0) || 0;
    
    if (totalStock === 0) {
      return { status: "out-of-stock", text: "Out of Stock", color: "destructive" };
    } else if (totalStock < 10) {
      return { status: "low-stock", text: "Low Stock", color: "secondary" };
    } else {
      return { status: "in-stock", text: "In Stock", color: "default" };
    }
  };

  const handleSelectMaterial = (material: Material) => {
    onSelectMaterial(material);
    setSearchQuery("");
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(e.target.value.length > 0);
          }}
          onFocus={() => setShowResults(searchQuery.length > 0)}
          className="pl-10 pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          onClick={() => setShowResults(!showResults)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {showResults && filteredMaterials.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border">
          <CardContent className="p-0 max-h-80 overflow-y-auto">
            {filteredMaterials.map((material) => {
              const stockInfo = getStockInfo(material);
              return (
                <div
                  key={material.id}
                  className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors"
                  onClick={() => handleSelectMaterial(material)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{material.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {material.sku} • {material.category} • {material.grade}
                      </div>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <div className="font-medium text-sm">₹{material.base_price || 0}</div>
                      <Badge variant={stockInfo.color as any} className="text-xs mt-1">
                        {stockInfo.text}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {showResults && searchQuery && filteredMaterials.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border">
          <CardContent className="p-3 text-center text-muted-foreground text-sm">
            No materials found matching "{searchQuery}"
          </CardContent>
        </Card>
      )}
    </div>
  );
}