import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarEvent, useUpdateEventStatus } from "@/hooks/useCalendarEvents";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";
import { Phone, Mail, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntelligenceDashboardProps {
  events: CalendarEvent[];
  selectedDate: Date;
  viewPeriod: 'today' | 'week' | 'month';
}

const IntelligenceDashboard: React.FC<IntelligenceDashboardProps> = ({ 
  events, 
  selectedDate, 
  viewPeriod 
}) => {
  const updateEventStatus = useUpdateEventStatus();

  const getFilteredEvents = () => {
    return events.filter(event => {
      const eventDate = new Date(event.event_date);
      switch (viewPeriod) {
        case 'today':
          return isToday(eventDate);
        case 'week':
          return isThisWeek(eventDate);
        case 'month':
          return isThisMonth(eventDate);
        default:
          return true;
      }
    });
  };

  const filteredEvents = getFilteredEvents();
  
  const urgentEvents = filteredEvents.filter(e => e.priority === 'urgent' && e.status === 'pending');
  const pendingEvents = filteredEvents.filter(e => e.status === 'pending');
  const completedEvents = filteredEvents.filter(e => e.status === 'completed');

  const handleMarkComplete = (eventId: string) => {
    updateEventStatus.mutate({ id: eventId, status: 'completed' });
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: "bg-red-100 text-red-800 border-red-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-green-100 text-green-800 border-green-200"
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getTopRowCards = () => {
    switch (viewPeriod) {
      case 'today':
        return [
          {
            title: "Today's Focus",
            value: pendingEvents.length,
            subtitle: "tasks pending",
            icon: Clock,
          },
          {
            title: "Cash Flow Today",
            value: "₹2.4L",
            subtitle: "expected inflow",
            icon: AlertTriangle,
          },
          {
            title: "Urgent Actions",
            value: urgentEvents.length,
            subtitle: "require attention",
            icon: AlertTriangle,
          }
        ];
      case 'week':
        return [
          {
            title: "Week's Targets",
            value: `${completedEvents.length}/${filteredEvents.length}`,
            subtitle: "tasks completed",
            icon: CheckCircle,
          },
          {
            title: "Pipeline Progress",
            value: "68%",
            subtitle: "weekly target",
            icon: Clock,
          },
          {
            title: "Week Alerts",
            value: urgentEvents.length,
            subtitle: "overdue items",
            icon: AlertTriangle,
          }
        ];
      case 'month':
        return [
          {
            title: "Monthly Performance",
            value: "₹45.6L",
            subtitle: "revenue this month",
            icon: CheckCircle,
          },
          {
            title: "Trends Analysis",
            value: "+12%",
            subtitle: "vs last month",
            icon: Clock,
          },
          {
            title: "Strategic Focus",
            value: "8",
            subtitle: "key priorities",
            icon: AlertTriangle,
          }
        ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {getTopRowCards().map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {viewPeriod === 'today' ? "Today's Events" : 
             viewPeriod === 'week' ? "This Week's Events" : 
             "This Month's Events"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div 
                key={event.id} 
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  event.status === 'completed' ? "bg-muted/50" : "bg-card"
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={cn(
                      "font-medium",
                      event.status === 'completed' && "line-through text-muted-foreground"
                    )}>
                      {event.title}
                    </h4>
                    <Badge className={getPriorityColor(event.priority)}>
                      {event.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.event_date), 'MMM dd, yyyy')}
                    {event.event_time && ` at ${event.event_time}`}
                  </p>
                  {event.customers?.name && (
                    <p className="text-sm text-muted-foreground">
                      Customer: {event.customers.name}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {event.status === 'pending' && (
                    <>
                      <Button size="sm" variant="outline">
                        <Phone className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleMarkComplete(event.id)}
                        disabled={updateEventStatus.isPending}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  {event.status === 'completed' && (
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No events found for the selected period.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Smart Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">💡 INSIGHTS:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• You have {urgentEvents.length} urgent tasks requiring immediate attention</li>
                <li>• {completedEvents.length} tasks completed out of {filteredEvents.length} total</li>
                <li>• Peak activity day this week is Tuesday with 8 scheduled events</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🎯 SUGGESTED ACTIONS:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Prioritize overdue payment collections to improve cash flow</li>
                <li>• Schedule follow-up calls for pending quotations from last week</li>
                <li>• Review and reschedule low-priority meetings to focus on urgent tasks</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligenceDashboard;