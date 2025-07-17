import React from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  { value: "Sheet", label: "Sheet", description: "Flat steel sheets with varying dimensions" },
  { value: "Pipe", label: "Pipe", description: "Tubular steel products (OD/NB)" },
  { value: "Bar", label: "Bar", description: "Solid bars (Round/Square/Hex)" },
  { value: "Flat", label: "Flat", description: "Flat bars with width and thickness" },
  { value: "Angle", label: "Angle", description: "L-shaped structural steel" },
];

interface CategoryStepProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryStep: React.FC<CategoryStepProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Select Material Category</h3>
        <p className="text-sm text-muted-foreground">
          Choose the type of material you want to add
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card
            key={category.value}
            className={`cursor-pointer transition-all ${
              selectedCategory === category.value
                ? "ring-2 ring-primary border-primary"
                : "hover:border-primary/50"
            }`}
            onClick={() => onCategoryChange(category.value)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <Label className="text-base font-medium cursor-pointer">
                  {category.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};