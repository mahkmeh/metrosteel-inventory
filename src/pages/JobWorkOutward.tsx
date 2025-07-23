
import { useState } from "react";
import { OutwardTab } from "@/components/JobWork/OutwardTab";
import { JobWorkOutwardModal } from "@/components/JobWorkOutwardModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const JobWorkOutward = () => {
  const [showOutwardModal, setShowOutwardModal] = useState(false);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Outward Job Work</h1>
          <p className="text-muted-foreground">Track materials sent to contractors for processing</p>
        </div>
        <Button onClick={() => setShowOutwardModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Outward
        </Button>
      </div>

      <OutwardTab onCreateOutward={() => setShowOutwardModal(true)} />

      <JobWorkOutwardModal
        open={showOutwardModal}
        onOpenChange={setShowOutwardModal}
      />
    </div>
  );
};

export default JobWorkOutward;
