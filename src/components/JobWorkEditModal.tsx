
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface JobWorkItem {
  id: string;
  dcDate: string;
  vendorName: string;
  materialDetails: string;
  status: string;
  expectedDate: string;
  overDueDays: number;
  vendorAddress?: string;
  contactPerson?: string;
  contactNumber?: string;
  notes?: string;
}

interface JobWorkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobWork: JobWorkItem | null;
  onSave: (updatedJobWork: JobWorkItem) => void;
}

export const JobWorkEditModal = ({ isOpen, onClose, jobWork, onSave }: JobWorkEditModalProps) => {
  const [formData, setFormData] = useState<JobWorkItem | null>(jobWork);
  const [expectedDate, setExpectedDate] = useState<Date | undefined>(
    jobWork ? new Date(jobWork.expectedDate) : undefined
  );

  React.useEffect(() => {
    if (jobWork) {
      setFormData(jobWork);
      setExpectedDate(new Date(jobWork.expectedDate));
    }
  }, [jobWork]);

  const handleSave = () => {
    if (formData && expectedDate) {
      const updatedJobWork = {
        ...formData,
        expectedDate: expectedDate.toISOString().split('T')[0]
      };
      onSave(updatedJobWork);
      onClose();
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Work Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendorName">Vendor Name</Label>
              <Input
                id="vendorName"
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson || ''}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                value={formData.contactNumber || ''}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yet_to_start">Yet to Start</SelectItem>
                  <SelectItem value="under_process">Under Process</SelectItem>
                  <SelectItem value="ready_to_dispatch">Ready to Dispatch</SelectItem>
                  <SelectItem value="quality_issues">Quality Issues</SelectItem>
                  <SelectItem value="machine_under_repair">Machine Under Repair</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="vendorAddress">Vendor Address</Label>
            <Textarea
              id="vendorAddress"
              value={formData.vendorAddress || ''}
              onChange={(e) => setFormData({ ...formData, vendorAddress: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="materialDetails">Material Details</Label>
            <Textarea
              id="materialDetails"
              value={formData.materialDetails}
              onChange={(e) => setFormData({ ...formData, materialDetails: e.target.value })}
            />
          </div>

          <div>
            <Label>Expected Delivery Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expectedDate ? format(expectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expectedDate}
                  onSelect={setExpectedDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
