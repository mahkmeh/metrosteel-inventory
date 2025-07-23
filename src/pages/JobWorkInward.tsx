
import { useState } from "react";
import { InwardTab } from "@/components/JobWork/InwardTab";
import { JobWorkInwardModal } from "@/components/JobWorkInwardModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const JobWorkInward = () => {
  const [showInwardModal, setShowInwardModal] = useState(false);

  const handleCreateInward = () => {
    console.log("Create Inward button clicked");
    setShowInwardModal(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inward Job Work</h1>
          <p className="text-muted-foreground">Track materials returned from contractors</p>
        </div>
        <Button 
          onClick={handleCreateInward} 
          className="gap-2"
          type="button"
        >
          <Plus className="h-4 w-4" />
          Create Inward
        </Button>
      </div>

      <InwardTab onCreateInward={handleCreateInward} />

      <JobWorkInwardModal
        open={showInwardModal}
        onOpenChange={(open) => {
          console.log("Inward modal state changing to:", open);
          setShowInwardModal(open);
        }}
      />
    </div>
  );
};

export default JobWorkInward;
