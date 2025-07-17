import React from "react";
import { Progress } from "@/components/ui/progress";

interface MaterialFormStepsProps {
  currentStep: number;
  totalSteps: number;
}

export const MaterialFormSteps: React.FC<MaterialFormStepsProps> = ({
  currentStep,
  totalSteps,
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  const stepLabels = [
    "Category",
    "Sub-type",
    "Dimensions",
    "Business Info",
    "Details"
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progressPercentage)}% Complete</span>
      </div>
      
      <Progress value={progressPercentage} className="h-2" />
      
      <div className="flex justify-between text-xs">
        {stepLabels.slice(0, totalSteps).map((label, index) => (
          <span
            key={index}
            className={
              index + 1 <= currentStep
                ? "text-primary font-medium"
                : "text-muted-foreground"
            }
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};