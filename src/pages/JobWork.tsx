import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { InwardTab } from "@/components/JobWork/InwardTab";
import { OutwardTab } from "@/components/JobWork/OutwardTab";
import { ContractorsTab } from "@/components/JobWork/ContractorsTab";
import { JobWorkOutwardModal } from "@/components/JobWorkOutwardModal";
import { JobWorkEditModal } from "@/components/JobWorkEditModal";

const JobWork = () => {
  const location = useLocation();
  const [isOutwardModalOpen, setIsOutwardModalOpen] = useState(false);
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJobWork, setSelectedJobWork] = useState<any>(null);

  // Determine active view based on URL
  const getActiveView = () => {
    const path = location.pathname;
    if (path.includes('/outward')) return 'outward';
    if (path.includes('/contractors')) return 'contractors';
    return 'inward'; // default to inward
  };

  const activeView = getActiveView();

  const handleCreateOutward = () => {
    setIsOutwardModalOpen(true);
  };

  const handleCreateInward = () => {
    setIsInwardModalOpen(true);
  };

  const handleEditJobWork = (jobWork: any) => {
    setSelectedJobWork(jobWork);
    setIsEditModalOpen(true);
  };

  const handleAddContractor = () => {
    // TODO: Implement add contractor functionality
  };

  const handleEditContractor = (contractorId: string) => {
    // TODO: Implement edit contractor functionality
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'outward':
        return <OutwardTab onCreateOutward={handleCreateOutward} />;
      case 'contractors':
        return <ContractorsTab onAddContractor={handleAddContractor} onEditContractor={handleEditContractor} />;
      case 'inward':
      default:
        return <InwardTab onCreateInward={handleCreateInward} />;
    }
  };

  return (
    <div className="space-y-6">
      {renderActiveView()}

      {/* Modals */}
      <JobWorkOutwardModal 
        open={isOutwardModalOpen}
        onOpenChange={setIsOutwardModalOpen}
      />
      
      <JobWorkEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        jobWork={selectedJobWork}
        onSave={(updatedJobWork) => {
          // TODO: Implement save functionality
          setIsEditModalOpen(false);
        }}
      />
    </div>
  );
};

export default JobWork;
