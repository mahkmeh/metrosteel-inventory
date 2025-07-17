import React from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface SubTypeStepProps {
  category: string;
  selectedSubType: string;
  onSubTypeChange: (subType: string) => void;
}

export const SubTypeStep: React.FC<SubTypeStepProps> = ({
  category,
  selectedSubType,
  onSubTypeChange,
}) => {
  const getSubTypeOptions = () => {
    switch (category) {
      case "Pipe":
        return [
          { value: "OD", label: "OD (Outer Diameter)", description: "Measured by outer diameter" },
          { value: "NB", label: "NB (Nominal Bore)", description: "Measured by nominal bore size" },
        ];
      case "Bar":
        return [
          { value: "Round", label: "Round Bar", description: "Circular cross-section" },
          { value: "Square", label: "Square Bar", description: "Square cross-section" },
          { value: "Hex", label: "Hex Bar", description: "Hexagonal cross-section" },
        ];
      default:
        return [];
    }
  };

  const subTypeOptions = getSubTypeOptions();

  if (subTypeOptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Select {category} Type</h3>
        <p className="text-sm text-muted-foreground">
          Choose the specific type of {category.toLowerCase()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subTypeOptions.map((option) => (
          <Card
            key={option.value}
            className={`cursor-pointer transition-all ${
              selectedSubType === option.value
                ? "ring-2 ring-primary border-primary"
                : "hover:border-primary/50"
            }`}
            onClick={() => onSubTypeChange(option.value)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <Label className="text-base font-medium cursor-pointer">
                  {option.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};