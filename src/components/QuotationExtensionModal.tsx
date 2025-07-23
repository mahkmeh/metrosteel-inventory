
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Send } from "lucide-react";

interface QuotationExtensionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expiringQuotes: number;
  expiringValue: number;
}

export const QuotationExtensionModal = ({ 
  open, 
  onOpenChange, 
  expiringQuotes, 
  expiringValue 
}: QuotationExtensionModalProps) => {
  const [extensionPeriod, setExtensionPeriod] = useState("7");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleExtendQuotations = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Quotations Extended Successfully",
      description: `Extended validity of ${expiringQuotes} quotations by ${extensionPeriod} days`,
    });
    
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Extend Quotation Validity
          </DialogTitle>
          <DialogDescription>
            Extend the validity period for quotations expiring soon
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{expiringQuotes}</div>
              <div className="text-sm text-muted-foreground">Quotations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                ₹{(expiringValue / 100000).toFixed(1)}L
              </div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
          </div>

          {/* Extension Period */}
          <div className="space-y-2">
            <Label htmlFor="extension-period">Extension Period</Label>
            <Select value={extensionPeriod} onValueChange={setExtensionPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select extension period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Extension (Optional)</Label>
            <Input
              id="reason"
              placeholder="e.g., Customer requested additional time for review"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Extension Preview */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Extension Preview</span>
            </div>
            <div className="text-sm text-muted-foreground">
              All selected quotations will be valid for an additional {extensionPeriod} days from their current expiry date.
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleExtendQuotations} 
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>Extending...</>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Extend Quotations
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
