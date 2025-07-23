import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, MessageCircle, Clock, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface WhatsAppMessage {
  id: string;
  customer_id: string;
  quotation_id: string | null;
  message_type: string;
  message_content: string;
  message_timestamp: string;
  is_read: boolean;
  attachment_url?: string;
  attachment_type?: string;
  created_at: string;
  updated_at: string;
  customers: {
    name: string;
  } | null;
  quotations: {
    quotation_number: string;
  } | null;
}

interface ChatConversation {
  customer_id: string;
  customer_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  messages: WhatsAppMessage[];
}

const WhatsAppChat = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["whatsapp-conversations", searchTerm],
    queryFn: async () => {
      // Fetch all messages with customer and quotation data
      const { data: messages, error } = await supabase
        .from("whatsapp_messages")
        .select(`
          *,
          customers(name),
          quotations(quotation_number)
        `)
        .order("message_timestamp", { ascending: false });

      if (error) throw error;

      // Group messages by customer
      const conversationsMap = new Map<string, ChatConversation>();

      messages?.forEach((message) => {
        const customerId = message.customer_id;
        const customerName = message.customers?.name || "Unknown Customer";

        if (!conversationsMap.has(customerId)) {
          conversationsMap.set(customerId, {
            customer_id: customerId,
            customer_name: customerName,
            last_message: message.message_content,
            last_message_time: message.message_timestamp,
            unread_count: 0,
            messages: [],
          });
        }

        const conversation = conversationsMap.get(customerId)!;
        conversation.messages.push(message);

        // Update unread count
        if (message.message_type === "received" && !message.is_read) {
          conversation.unread_count++;
        }
      });

      // Convert to array and sort by last message time
      const conversationsArray = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());

      // Apply search filter
      if (searchTerm) {
        return conversationsArray.filter(conv =>
          conv.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return conversationsArray;
    },
  });

  const selectedConversation = conversations?.find(conv => conv.customer_id === selectedCustomer);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCustomer) return;

    try {
      await supabase
        .from("whatsapp_messages")
        .insert({
          customer_id: selectedCustomer,
          message_type: "sent",
          message_content: newMessage,
          message_timestamp: new Date().toISOString(),
          is_read: true,
        });

      setNewMessage("");
      // Refetch conversations
      window.location.reload();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            WhatsApp Conversations
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {conversations?.map((conversation) => (
              <div
                key={conversation.customer_id}
                className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedCustomer === conversation.customer_id ? "bg-muted" : ""
                }`}
                onClick={() => setSelectedCustomer(conversation.customer_id)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {conversation.customer_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">
                        {conversation.customer_name}
                      </p>
                      {conversation.unread_count > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {conversation.last_message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(conversation.last_message_time), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle>
            {selectedConversation ? selectedConversation.customer_name : "Select a conversation"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {selectedConversation ? (
            <div className="flex flex-col h-[480px]">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.messages
                    .sort((a, b) => new Date(a.message_timestamp).getTime() - new Date(b.message_timestamp).getTime())
                    .map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.message_type === "sent" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.message_type === "sent"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.message_content}</p>
                        {message.quotations && (
                          <Badge variant="secondary" className="mt-2">
                            {message.quotations.quotation_number}
                          </Badge>
                        )}
                        <div className="flex items-center justify-end gap-1 mt-2">
                          <Clock className="h-3 w-3 opacity-60" />
                          <span className="text-xs opacity-60">
                            {formatDistanceToNow(new Date(message.message_timestamp), { addSuffix: true })}
                          </span>
                          {message.message_type === "sent" && (
                            <CheckCheck className="h-3 w-3 opacity-60" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[480px] text-muted-foreground">
              Select a conversation to start chatting
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppChat;