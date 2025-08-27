import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BatchDetails {
  id: string;
  batch_code: string;
  total_weight_kg: number;
  available_weight_kg: number;
  quality_grade: string;
  make?: string;
  heat_number?: string;
  compliance_status?: string;
  supplier?: {
    name: string;
  };
}

interface BatchAllocation {
  batch_id: string;
  allocated_quantity: number;
}

interface InlineBatchSelectorProps {
  materialId: string;
  materialName: string;
  requiredQuantity: number;
  onAllocationChange: (allocations: BatchAllocation[]) => void;
  initialAllocations?: BatchAllocation[];
}

export default function InlineBatchSelector({
  materialId,
  materialName,
  requiredQuantity,
  onAllocationChange,
  initialAllocations = []
}: InlineBatchSelectorProps) {
  const [allocations, setAllocations] = useState<BatchAllocation[]>(initialAllocations);

  const { data: batches, isLoading } = useQuery({
    queryKey: ["material-batches", materialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batches")
        .select(`
          id,
          batch_code,
          total_weight_kg,
          available_weight_kg,
          quality_grade,
          make,
          heat_number,
          compliance_status,
          suppliers:supplier_id (
            name
          )
        `)
        .eq("sku_id", materialId)
        .eq("status", "active")
        .order("received_date", { ascending: true }); // FIFO order for reference

      if (error) throw error;
      return data?.map(batch => ({
        ...batch,
        supplier: batch.suppliers
      })) as BatchDetails[];
    },
  });

  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.allocated_quantity, 0);
  const remainingToAllocate = requiredQuantity - totalAllocated;
  const isFullyAllocated = Math.abs(remainingToAllocate) < 0.001;
  const isOverAllocated = remainingToAllocate < 0;

  const handleAllocationChange = (batchId: string, quantity: number) => {
    const newAllocations = allocations.filter(a => a.batch_id !== batchId);
    if (quantity > 0) {
      newAllocations.push({ batch_id: batchId, allocated_quantity: quantity });
    }
    setAllocations(newAllocations);
    onAllocationChange(newAllocations);
  };

  const getCurrentAllocation = (batchId: string) => {
    return allocations.find(a => a.batch_id === batchId)?.allocated_quantity || 0;
  };

  const getComplianceColor = (status?: string) => {
    switch (status) {
      case "approved": return "text-success";
      case "rejected": return "text-destructive";
      case "pending": return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  const getComplianceIcon = (status?: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <AlertCircle className="h-4 w-4" />;
      case "pending": return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Batch Selection - {materialName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading batches...</div>
        </CardContent>
      </Card>
    );
  }

  if (!batches || batches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Batch Selection - {materialName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No batches available for this material</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">{materialName}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isFullyAllocated ? "default" : isOverAllocated ? "destructive" : "secondary"}>
              {totalAllocated.toFixed(2)} / {requiredQuantity.toFixed(2)} kg
            </Badge>
            {!isFullyAllocated && (
              <span className="text-xs text-muted-foreground">
                {isOverAllocated ? "Over-allocated" : `${remainingToAllocate.toFixed(2)} kg remaining`}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Batch Code</TableHead>
              <TableHead className="w-20">Available</TableHead>
              <TableHead className="w-16">Grade</TableHead>
              <TableHead className="w-20">Make</TableHead>
              <TableHead className="w-24">Heat No.</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead className="w-32">Allocate (kg)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch) => {
              const currentAllocation = getCurrentAllocation(batch.id);
              const maxAllocation = Math.min(batch.available_weight_kg, remainingToAllocate + currentAllocation);
              
              return (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium text-xs">{batch.batch_code}</TableCell>
                  <TableCell className="text-xs">{batch.available_weight_kg.toFixed(2)}</TableCell>
                  <TableCell className="text-xs">{batch.quality_grade}</TableCell>
                  <TableCell className="text-xs">{batch.make || "-"}</TableCell>
                  <TableCell className="text-xs">{batch.heat_number || "-"}</TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1 ${getComplianceColor(batch.compliance_status)}`}>
                      {getComplianceIcon(batch.compliance_status)}
                      <span className="text-xs">{batch.compliance_status || "pending"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      max={maxAllocation}
                      step="0.001"
                      value={currentAllocation || ""}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        const clampedValue = Math.min(Math.max(0, value), maxAllocation);
                        handleAllocationChange(batch.id, clampedValue);
                      }}
                      className="h-8 text-xs"
                      placeholder="0.00"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}