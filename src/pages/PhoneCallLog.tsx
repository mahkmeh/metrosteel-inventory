import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Phone, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Clock, 
  Plus,
  Calendar,
  User,
  FileText
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface PhoneCallLog {
  id: string;
  customer_id: string;
  quotation_id: string | null;
  call_type: "incoming" | "outgoing" | "missed";
  call_duration: number | null;
  call_date: string;
  call_notes: string | null;
  follow_up_required: boolean;
  follow_up_date: string | null;
  call_outcome: string | null;
  customers: {
    name: string;
    phone: string;
  } | null;
  quotations: {
    quotation_number: string;
  } | null;
}

const PhoneCallLog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [callTypeFilter, setCallTypeFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [showNewCallDialog, setShowNewCallDialog] = useState(false);

  const { data: callLogs, isLoading } = useQuery({
    queryKey: ["phone-call-logs", searchTerm, callTypeFilter, outcomeFilter],
    queryFn: async () => {
      let query = supabase
        .from("phone_call_logs")
        .select(`
          *,
          customers(name, phone),
          quotations(quotation_number)
        `)
        .order("call_date", { ascending: false });

      if (callTypeFilter !== "all") {
        query = query.eq("call_type", callTypeFilter);
      }

      if (outcomeFilter !== "all") {
        query = query.eq("call_outcome", outcomeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Apply search filter
      if (searchTerm) {
        return data?.filter(call =>
          call.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return data;
    },
  });

  const getCallIcon = (callType: string) => {
    switch (callType) {
      case "incoming":
        return <PhoneIncoming className="h-4 w-4 text-green-600" />;
      case "outgoing":
        return <PhoneOutgoing className="h-4 w-4 text-blue-600" />;
      case "missed":
        return <PhoneMissed className="h-4 w-4 text-red-600" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  };

  const getOutcomeBadge = (outcome: string | null) => {
    if (!outcome) return null;

    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      interested: "default",
      not_interested: "destructive",
      callback_requested: "secondary",
      quotation_requested: "default",
      order_placed: "default",
      no_answer: "outline",
    };

    return (
      <Badge variant={variants[outcome] || "outline"} className="text-xs">
        {outcome.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading call logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={callTypeFilter} onValueChange={setCallTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Call Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="incoming">Incoming</SelectItem>
            <SelectItem value="outgoing">Outgoing</SelectItem>
            <SelectItem value="missed">Missed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            <SelectItem value="interested">Interested</SelectItem>
            <SelectItem value="not_interested">Not Interested</SelectItem>
            <SelectItem value="callback_requested">Callback Requested</SelectItem>
            <SelectItem value="quotation_requested">Quotation Requested</SelectItem>
            <SelectItem value="order_placed">Order Placed</SelectItem>
            <SelectItem value="no_answer">No Answer</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={showNewCallDialog} onOpenChange={setShowNewCallDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Call
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log New Call</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Customer</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* This would be populated with actual customers */}
                    <SelectItem value="customer1">ABC Construction Ltd</SelectItem>
                    <SelectItem value="customer2">XYZ Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Call Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select call type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incoming">Incoming</SelectItem>
                    <SelectItem value="outgoing">Outgoing</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duration (seconds)</Label>
                <Input type="number" placeholder="120" />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Call notes..." />
              </div>
              <div>
                <Label>Outcome</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="not_interested">Not Interested</SelectItem>
                    <SelectItem value="callback_requested">Callback Requested</SelectItem>
                    <SelectItem value="quotation_requested">Quotation Requested</SelectItem>
                    <SelectItem value="order_placed">Order Placed</SelectItem>
                    <SelectItem value="no_answer">No Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowNewCallDialog(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button className="flex-1">Save Call</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Call Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5" />
            Phone Call History ({callLogs?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {callLogs?.map((call) => (
              <div key={call.id} className="p-4 border-b hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {call.customers?.name?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCallIcon(call.call_type)}
                        <h3 className="font-medium">
                          {call.customers?.name || "Unknown Customer"}
                        </h3>
                        {call.quotations && (
                          <Badge variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {call.quotations.quotation_number}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(new Date(call.call_date), { addSuffix: true })}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(call.call_date), "MMM dd, yyyy HH:mm")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Duration: {formatDuration(call.call_duration)}
                      </div>
                      {call.customers?.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {call.customers.phone}
                        </div>
                      )}
                    </div>

                    {call.call_notes && (
                      <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        {call.call_notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {call.call_outcome && getOutcomeBadge(call.call_outcome)}
                        {call.follow_up_required && (
                          <Badge variant="outline" className="text-xs">
                            Follow-up Required
                            {call.follow_up_date && (
                              <span className="ml-1">
                                ({format(new Date(call.follow_up_date), "MMM dd")})
                              </span>
                            )}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhoneCallLog;