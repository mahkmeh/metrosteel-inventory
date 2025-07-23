
import { useState } from "react";
import { InwardTab } from "@/components/JobWork/InwardTab";
import { JobWorkInwardModal } from "@/components/JobWorkInwardModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const JobWorkInward = () => {
  const [showInwardModal, setShowInwardModal] = useState(false);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inward Job Work</h1>
          <p className="text-muted-foreground">Track materials returned from contractors</p>
        </div>
        <Button onClick={() => setShowInwardModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Inward
        </Button>
      </div>

      <InwardTab onCreateInward={() => setShowInwardModal(true)} />

      <JobWorkInwardModal
        open={showInwardModal}
        onOpenChange={setShowInwardModal}
      />
    </div>
  );
};

export default JobWorkInward;
