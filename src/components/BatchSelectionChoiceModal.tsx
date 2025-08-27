import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock } from "lucide-react";

interface BatchSelectionChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNow: () => void;
  onSelectLater: () => void;
  materialName: string;
  quantity: number;
}

export const BatchSelectionChoiceModal: React.FC<BatchSelectionChoiceModalProps> = ({
  isOpen,
  onClose,
  onSelectNow,
  onSelectLater,
  materialName,
  quantity
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Batch Selection Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="font-medium">{materialName}</p>
            <p className="text-sm text-muted-foreground">Quantity: {quantity} KG</p>
          </div>
          
          <div className="text-sm text-muted-foreground">
            This material requires batch allocation. You can either:
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={onSelectNow}
              className="w-full justify-start h-auto p-4"
              variant="outline"
            >
              <div className="text-left">
                <div className="font-medium">Select Batch Now</div>
                <div className="text-sm text-muted-foreground">
                  Choose specific batches immediately
                </div>
              </div>
            </Button>
            
            <Button
              onClick={onSelectLater}
              className="w-full justify-start h-auto p-4"
              variant="outline"
            >
              <div className="text-left flex items-center gap-2">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Select Batch Later
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Batch selection will be required during invoice creation
                  </div>
                </div>
              </div>
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>Batch selection is required before creating sales invoice</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};