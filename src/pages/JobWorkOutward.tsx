
import { useState } from "react";
import { OutwardTab } from "@/components/JobWork/OutwardTab";
import { JobWorkOutwardModal } from "@/components/JobWorkOutwardModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const JobWorkOutward = () => {
  const [showOutwardModal, setShowOutwardModal] = useState(false);

  const handleCreateOutward = () => {
    console.log("Create Outward button clicked");
    setShowOutwardModal(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Outward Job Work</h1>
          <p className="text-muted-foreground">Track materials sent to contractors for processing</p>
        </div>
        <Button 
          onClick={handleCreateOutward} 
          className="gap-2"
          type="button"
        >
          <Plus className="h-4 w-4" />
          Create Outward
        </Button>
      </div>

      <OutwardTab onCreateOutward={handleCreateOutward} />

      <JobWorkOutwardModal
        open={showOutwardModal}
        onOpenChange={(open) => {
          console.log("Outward modal state changing to:", open);
          setShowOutwardModal(open);
        }}
      />
    </div>
  );
};

export default JobWorkOutward;
