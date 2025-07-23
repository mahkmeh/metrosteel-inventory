
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, Mail, MessageCircle, Phone } from "lucide-react";

interface PaymentReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overduePayments: number;
  overdueAmount: number;
}

export const PaymentReminderModal = ({ 
  open, 
  onOpenChange, 
  overduePayments, 
  overdueAmount 
}: PaymentReminderModalProps) => {
  const [reminderType, setReminderType] = useState<"email" | "whatsapp" | "sms">("email");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendReminder = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Reminders Sent Successfully",
      description: `Payment reminders sent to ${overduePayments} customers via ${reminderType}`,
    });
    
    setIsLoading(false);
    onOpenChange(false);
  };

  const defaultMessages = {
    email: "Dear Customer,\n\nThis is a friendly reminder that your payment of ₹{amount} is overdue. Please arrange for payment at your earliest convenience.\n\nThank you for your business.\n\nBest regards,\nMETRO STEEL",
    whatsapp: "Hi! Your payment of ₹{amount} is overdue. Please process payment soon. Thank you! - METRO STEEL",
    sms: "METRO STEEL: Payment of ₹{amount} overdue. Please pay soon. Thank you."
  };

  const handleReminderTypeChange = (type: "email" | "whatsapp" | "sms") => {
    setReminderType(type);
    setMessage(defaultMessages[type]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Payment Reminders
          </DialogTitle>
          <DialogDescription>
            Send payment reminders to customers with overdue payments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{overduePayments}</div>
              <div className="text-sm text-muted-foreground">Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                ₹{(overdueAmount / 100000).toFixed(1)}L
              </div>
              <div className="text-sm text-muted-foreground">Total Overdue</div>
            </div>
          </div>

          {/* Reminder Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="reminder-type">Reminder Method</Label>
            <Select value={reminderType} onValueChange={handleReminderTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select reminder method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="whatsapp">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    SMS
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message Template */}
          <div className="space-y-2">
            <Label htmlFor="message">Message Template</Label>
            <Textarea
              id="message"
              placeholder="Enter your reminder message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
            <div className="text-xs text-muted-foreground">
              Use {"{amount}"} as placeholder for individual payment amounts
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendReminder} 
              disabled={isLoading || !message.trim()}
              className="gap-2"
            >
              {isLoading ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Reminders
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
