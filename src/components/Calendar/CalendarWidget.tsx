import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { format, isSameDay, isToday } from "date-fns";

interface CalendarWidgetProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const getEventTypeColor = (eventType: string, priority: string) => {
  const colors = {
    urgent: "bg-red-500",
    sales: "bg-blue-500", 
    collection: "bg-green-500",
    meeting: "bg-orange-500",
    job_work: "bg-purple-500",
    purchase: "bg-purple-500",
    follow_up: "bg-yellow-500",
    review: "bg-yellow-500",
    completed: "bg-gray-500"
  };
  
  if (priority === 'urgent') return colors.urgent;
  return colors[eventType as keyof typeof colors] || colors.review;
};

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ events, selectedDate, onDateSelect }) => {
  const [month, setMonth] = useState<Date>(selectedDate);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.event_date), date));
  };

  const renderDayContent = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 0) return null;

    return (
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
        {dayEvents.slice(0, 3).map((event, index) => (
          <div
            key={event.id}
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              getEventTypeColor(event.status === 'completed' ? 'completed' : event.event_type, event.priority)
            )}
          />
        ))}
        {dayEvents.length > 3 && (
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground opacity-50" />
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          month={month}
          onMonthChange={setMonth}
          className="w-full pointer-events-auto"
          components={{
            Day: (dayProps: any) => {
              const isTodayDate = isToday(dayProps.date);
              const isSelected = isSameDay(dayProps.date, selectedDate);
              
              return (
                <button
                  className={cn(
                    "relative w-9 h-9 p-0 font-normal text-sm rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                    isTodayDate && !isSelected && "bg-accent/50 font-medium",
                    dayProps.className
                  )}
                  onClick={() => onDateSelect(dayProps.date)}
                >
                  {format(dayProps.date, 'd')}
                  {renderDayContent(dayProps.date)}
                </button>
              );
            },
          }}
          modifiers={{
            hasEvents: (date) => getEventsForDate(date).length > 0,
          }}
          modifiersClassNames={{
            hasEvents: "font-semibold",
          }}
        />
        
        {/* Event Type Legend */}
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Event Types</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Urgent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Meetings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Collections</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Operations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>Planning</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarWidget;