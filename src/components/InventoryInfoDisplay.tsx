
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, MapPin, Clock, DollarSign, Layers } from "lucide-react";

interface InventoryInfo {
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  totalValue: number;
  weightedAvgCost: number;
  batchCount: number;
  totalBatchWeight: number;
  locations: {
    id: string;
    name: string;
    quantity: number;
    available: number;
  }[];
}

interface InventoryInfoDisplayProps {
  material: any;
  inventoryInfo: InventoryInfo;
}

export const InventoryInfoDisplay = ({ material, inventoryInfo }: InventoryInfoDisplayProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStockStatus = () => {
    if (inventoryInfo.availableQuantity === 0) {
      return { status: "out-of-stock", label: "Out of Stock", color: "bg-destructive/10 text-destructive" };
    } else if (inventoryInfo.availableQuantity < 10) {
      return { status: "low-stock", label: "Low Stock", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" };
    } else {
      return { status: "in-stock", label: "In Stock", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{material.name}</CardTitle>
          <Badge className={stockStatus.color}>
            {stockStatus.label}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          SKU: {material.sku} | Grade: {material.grade} | Category: {material.category}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stock Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{inventoryInfo.totalQuantity}</div>
            <div className="text-xs text-muted-foreground">Total Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{inventoryInfo.availableQuantity}</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{inventoryInfo.reservedQuantity}</div>
            <div className="text-xs text-muted-foreground">Reserved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{inventoryInfo.batchCount}</div>
            <div className="text-xs text-muted-foreground">Batches</div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">WAC</div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(inventoryInfo.weightedAvgCost)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">Total Value</div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(inventoryInfo.totalValue)}
              </div>
            </div>
          </div>
        </div>

        {/* Location Breakdown */}
        {inventoryInfo.locations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              Locations
            </div>
            <div className="grid grid-cols-1 gap-2">
              {inventoryInfo.locations.map((location) => (
                <div key={location.id} className="flex justify-between items-center p-2 bg-muted/20 rounded">
                  <span className="text-sm">{location.name}</span>
                  <div className="text-sm">
                    <span className="font-medium">{location.available}</span>
                    <span className="text-muted-foreground"> / {location.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Batch Weight Information */}
        {inventoryInfo.totalBatchWeight > 0 && (
          <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Batch Weight</span>
            </div>
            <span className="text-sm font-semibold">{inventoryInfo.totalBatchWeight} KG</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
