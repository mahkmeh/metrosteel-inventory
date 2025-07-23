
import { useState } from "react";
import { ContractorsTab } from "@/components/JobWork/ContractorsTab";
import { VendorModal } from "@/components/VendorModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const JobWorkContractors = () => {
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddContractor = () => {
    setSelectedContractor(null);
    setIsEditing(false);
    setShowVendorModal(true);
  };

  const handleEditContractor = (contractorId: string) => {
    // In a real app, you'd fetch the contractor data
    setSelectedContractor({ id: contractorId });
    setIsEditing(true);
    setShowVendorModal(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Job Work Contractors</h1>
          <p className="text-muted-foreground">Manage contractor relationships and performance</p>
        </div>
        <Button onClick={handleAddContractor} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Contractor
        </Button>
      </div>

      <ContractorsTab 
        onAddContractor={handleAddContractor}
        onEditContractor={handleEditContractor}
      />

      <VendorModal
        open={showVendorModal}
        onOpenChange={setShowVendorModal}
        vendor={selectedContractor}
        isEditing={isEditing}
      />
    </div>
  );
};

export default JobWorkContractors;
