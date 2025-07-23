
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUp, ArrowDown, Users } from "lucide-react";
import { OutwardTab } from "@/components/JobWork/OutwardTab";
import { InwardTab } from "@/components/JobWork/InwardTab";
import { ContractorsTab } from "@/components/JobWork/ContractorsTab";
import { JobWorkOutwardModal } from "@/components/JobWorkOutwardModal";
import { JobWorkInwardModal } from "@/components/JobWorkInwardModal";

const JobWork = () => {
  const [showOutwardModal, setShowOutwardModal] = useState(false);
  const [showInwardModal, setShowInwardModal] = useState(false);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Job Work Management</h1>
          <p className="text-muted-foreground">Manage job work transformations and contractor relationships</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowOutwardModal(true)}>
            <ArrowUp className="h-4 w-4 mr-2" />
            Create OUTWARD ENTRY
          </Button>
          <Button variant="outline" onClick={() => setShowInwardModal(true)}>
            <ArrowDown className="h-4 w-4 mr-2" />
            Create INWARD ENTRY
          </Button>
        </div>
      </div>

      <Tabs defaultValue="outward" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="outward">
            <ArrowUp className="h-4 w-4 mr-2" />
            Outward
          </TabsTrigger>
          <TabsTrigger value="inward">
            <ArrowDown className="h-4 w-4 mr-2" />
            Inward
          </TabsTrigger>
          <TabsTrigger value="contractors">
            <Users className="h-4 w-4 mr-2" />
            Contractors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="outward">
          <OutwardTab onCreateOutward={() => setShowOutwardModal(true)} />
        </TabsContent>

        <TabsContent value="inward">
          <InwardTab onCreateInward={() => setShowInwardModal(true)} />
        </TabsContent>

        <TabsContent value="contractors">
          <ContractorsTab 
            onAddContractor={() => {}} 
            onEditContractor={() => {}} 
          />
        </TabsContent>
      </Tabs>

      <JobWorkOutwardModal
        open={showOutwardModal}
        onOpenChange={setShowOutwardModal}
      />

      <JobWorkInwardModal
        open={showInwardModal}
        onOpenChange={setShowInwardModal}
      />
    </div>
  );
};

export default JobWork;
