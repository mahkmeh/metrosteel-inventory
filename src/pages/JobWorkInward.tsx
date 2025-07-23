
import { useState } from "react";
import { InwardTab } from "@/components/JobWork/InwardTab";
import { JobWorkInwardModal } from "@/components/JobWorkInwardModal";

const JobWorkInward = () => {
  const [showInwardModal, setShowInwardModal] = useState(false);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inward Job Work</h1>
          <p className="text-muted-foreground">Track materials returned from contractors</p>
        </div>
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
