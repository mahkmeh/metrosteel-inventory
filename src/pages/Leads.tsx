import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MessageCircle, Phone } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Quotations from "./Quotations";
import WhatsAppChat from "./WhatsAppChat";
import PhoneCallLog from "./PhoneCallLog";

const Leads = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("quotations");

  useEffect(() => {
    // Set active tab based on current path
    if (location.pathname === "/leads/quotations") {
      setActiveTab("quotations");
    } else if (location.pathname === "/leads/whatsapp") {
      setActiveTab("whatsapp");
    } else if (location.pathname === "/leads/calls") {
      setActiveTab("calls");
    } else if (location.pathname === "/leads") {
      setActiveTab("quotations");
    }
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "quotations") {
      navigate("/leads/quotations");
    } else if (value === "whatsapp") {
      navigate("/leads/whatsapp");
    } else if (value === "calls") {
      navigate("/leads/calls");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Lead Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage customer quotations, WhatsApp conversations, and phone calls
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="quotations" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Quotations
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            WhatsApp Chat
          </TabsTrigger>
          <TabsTrigger value="calls" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Calls
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quotations" className="mt-0">
          <Quotations />
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-0">
          <WhatsAppChat />
        </TabsContent>

        <TabsContent value="calls" className="mt-0">
          <PhoneCallLog />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leads;