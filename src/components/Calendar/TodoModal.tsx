import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useCreateEvent, CalendarEvent } from "@/hooks/useCalendarEvents";
import { toast } from "@/hooks/use-toast";

interface TodoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
}

export const TodoModal: React.FC<TodoModalProps> = ({
  open,
  onOpenChange,
  defaultDate = new Date(),
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState<Date>(defaultDate);
  const [eventTime, setEventTime] = useState("");
  const [priority, setPriority] = useState<CalendarEvent['priority']>("medium");
  const [eventType, setEventType] = useState<CalendarEvent['event_type']>("follow_up");

  const createEvent = useCreateEvent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createEvent.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        event_date: format(eventDate, 'yyyy-MM-dd'),
        event_time: eventTime || undefined,
        event_type: eventType,
        priority,
        status: 'pending',
        is_auto_generated: false,
        source_table: 'manual',
      });

      toast({
        title: "Success",
        description: "TO DO created successfully",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setEventDate(defaultDate);
      setEventTime("");
      setPriority("medium");
      setEventType("follow_up");
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create TO DO",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create TO DO
          </DialogTitle>
          <DialogDescription>
            Add a new task or reminder to your business calendar.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !eventDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventDate ? format(eventDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={eventDate}
                    onSelect={(date) => date && setEventDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time (Optional)</Label>
              <Input
                id="time"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(value: CalendarEvent['priority']) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={eventType} onValueChange={(value: CalendarEvent['event_type']) => setEventType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="collection">Collection</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="job_work">Job Work</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createEvent.isPending}
            >
              {createEvent.isPending ? "Creating..." : "Create TO DO"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};