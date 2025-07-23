
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MessageCircle, Truck } from "lucide-react";

interface SupplierContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suppliers: string[];
  overdueCount: number;
}

export const SupplierContactModal = ({ 
  open, 
  onOpenChange, 
  suppliers, 
  overdueCount 
}: SupplierContactModalProps) => {
  const [message, setMessage] = useState(
    "Dear Supplier,\n\nWe hope this message finds you well. We wanted to follow up on our recent purchase order which was scheduled for delivery. Could you please provide us with an updated delivery timeline?\n\nWe appreciate your prompt response and continued partnership.\n\nBest regards,\nMETRO STEEL"
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleContactSuppliers = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Suppliers Contacted Successfully",
      description: `Delivery status requests sent to ${suppliers.length} suppliers`,
    });
    
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Contact Late Suppliers
          </DialogTitle>
          <DialogDescription>
            Send delivery status requests to suppliers with overdue purchase orders
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{overdueCount}</div>
              <div className="text-sm text-muted-foreground">Overdue POs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{suppliers.length}</div>
              <div className="text-sm text-muted-foreground">Suppliers</div>
            </div>
          </div>

          {/* Supplier List */}
          <div className="space-y-2">
            <Label>Suppliers to Contact</Label>
            <div className="flex flex-wrap gap-2">
              {suppliers.length > 0 ? (
                suppliers.map((supplier, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {supplier}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline">No suppliers found</Badge>
              )}
            </div>
          </div>

          {/* Message Template */}
          <div className="space-y-2">
            <Label htmlFor="message">Message Template</Label>
            <Textarea
              id="message"
              placeholder="Enter your message to suppliers..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
          </div>

          {/* Contact Methods */}
          <div className="space-y-2">
            <Label>Contact Methods</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Phone className="h-4 w-4" />
                Call
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleContactSuppliers} 
              disabled={isLoading || !message.trim()}
              className="gap-2"
            >
              {isLoading ? (
                <>Sending...</>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Contact Suppliers
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
