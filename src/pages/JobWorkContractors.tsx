
import { ContractorsTab } from "@/components/JobWork/ContractorsTab";

const JobWorkContractors = () => {
  const handleAddContractor = () => {
    // TODO: Implement add contractor functionality
    console.log("Add contractor clicked");
  };

  const handleEditContractor = (contractorId: string) => {
    // TODO: Implement edit contractor functionality
    console.log("Edit contractor clicked:", contractorId);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Job Work Contractors</h1>
          <p className="text-muted-foreground">Manage contractor relationships and performance</p>
        </div>
      </div>

      <ContractorsTab 
        onAddContractor={handleAddContractor}
        onEditContractor={handleEditContractor}
      />
    </div>
  );
};

export default JobWorkContractors;
