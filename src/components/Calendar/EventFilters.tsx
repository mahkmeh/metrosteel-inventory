import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface EventFiltersProps {
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
}

const eventTypeOptions = [
  { value: 'sales', label: 'Sales Orders', color: 'bg-blue-500' },
  { value: 'collection', label: 'Collections', color: 'bg-green-500' },
  { value: 'meeting', label: 'Meetings', color: 'bg-orange-500' },
  { value: 'job_work', label: 'Job Work', color: 'bg-purple-500' },
  { value: 'purchase', label: 'Purchase Orders', color: 'bg-purple-500' },
  { value: 'follow_up', label: 'Follow-ups', color: 'bg-yellow-500' },
  { value: 'review', label: 'Reviews', color: 'bg-yellow-500' },
];

const EventFilters: React.FC<EventFiltersProps> = ({ selectedTypes, onTypeToggle }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {eventTypeOptions.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={option.value}
              checked={selectedTypes.includes(option.value)}
              onCheckedChange={() => onTypeToggle(option.value)}
            />
            <div className={`w-3 h-3 rounded-full ${option.color}`} />
            <Label 
              htmlFor={option.value}
              className="text-sm font-normal cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default EventFilters;