import React, { useState } from "react";
import { startOfMonth, endOfMonth, addDays, subDays } from "date-fns";
import CalendarWidget from "@/components/Calendar/CalendarWidget";
import EventFilters from "@/components/Calendar/EventFilters";
import IntelligenceDashboard from "@/components/Calendar/IntelligenceDashboard";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MasterCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([
    'sales', 'collection', 'meeting'
  ]);
  const [viewPeriod, setViewPeriod] = useState<'today' | 'week' | 'month'>('today');

  // Calculate date range for events (current month ± buffer)
  const startDate = subDays(startOfMonth(selectedDate), 7);
  const endDate = addDays(endOfMonth(selectedDate), 7);

  const { data: events = [], isLoading } = useCalendarEvents(
    startDate,
    endDate,
    selectedEventTypes.length > 0 ? selectedEventTypes : undefined
  );

  const handleEventTypeToggle = (type: string) => {
    setSelectedEventTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-96 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
            <div className="lg:col-span-3">
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Master Business Calendar</h1>
        <p className="text-muted-foreground">
          Comprehensive view of all business activities, deadlines, and opportunities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Calendar & Filters */}
        <div className="lg:col-span-2 space-y-6">
          <CalendarWidget 
            events={events}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
          
          <EventFilters 
            selectedTypes={selectedEventTypes}
            onTypeToggle={handleEventTypeToggle}
          />
        </div>

        {/* Right Panel - Intelligence Dashboard */}
        <div className="lg:col-span-3">
          <div className="mb-4">
            <Tabs value={viewPeriod} onValueChange={(value) => setViewPeriod(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <IntelligenceDashboard 
            events={events}
            selectedDate={selectedDate}
            viewPeriod={viewPeriod}
          />
        </div>
      </div>
    </div>
  );
};

export default MasterCalendar;