
import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarEvent } from "@/lib/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";

// Mock calendar events
const mockEvents: CalendarEvent[] = [
  { 
    id: "event-1", 
    title: "Staff Meeting", 
    start: "2025-04-10T09:00:00", 
    end: "2025-04-10T10:30:00", 
    allDay: false,
    type: "meeting",
    description: "Monthly staff meeting in the conference room"
  },
  { 
    id: "event-2", 
    title: "Math Exam - Grade 8", 
    start: "2025-04-15T10:00:00", 
    end: "2025-04-15T12:00:00", 
    allDay: false,
    type: "exam",
    description: "Final math examination for Grade 8 students"
  },
  { 
    id: "event-3", 
    title: "School Holiday", 
    start: "2025-04-20T00:00:00", 
    end: "2025-04-20T23:59:59", 
    allDay: true,
    type: "holiday",
    description: "National Holiday - School Closed"
  },
  { 
    id: "event-4", 
    title: "Parent-Teacher Conference", 
    start: "2025-04-25T14:00:00", 
    end: "2025-04-25T18:00:00", 
    allDay: false,
    type: "meeting",
    description: "Quarterly parent-teacher meetings"
  }
];

const Calendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<string>("month");
  
  // Get events for the selected month
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Function to get events for a specific day
  const getEventsForDay = (day: Date) => {
    return mockEvents.filter(event => 
      isSameDay(parseISO(event.start), day)
    );
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">School Calendar</h1>
          <p className="text-muted-foreground">
            View and manage important school events
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <Card className="md:w-2/3">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">{format(date, 'MMMM yyyy')}</h2>
                <Select value={view} onValueChange={setView}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          
          <Card className="md:w-1/3">
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Events for {format(date, 'MMMM d, yyyy')}</h2>
              <div className="space-y-4">
                {getEventsForDay(date).length > 0 ? (
                  getEventsForDay(date).map((event) => (
                    <div 
                      key={event.id} 
                      className={`p-3 rounded-md border ${
                        event.type === 'meeting' ? 'bg-blue-50 border-blue-200' :
                        event.type === 'exam' ? 'bg-amber-50 border-amber-200' :
                        event.type === 'class' ? 'bg-green-50 border-green-200' :
                        event.type === 'holiday' ? 'bg-red-50 border-red-200' :
                        event.type === 'task' ? 'bg-purple-50 border-purple-200' :
                        'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.allDay ? 
                          'All day' : 
                          `${format(parseISO(event.start), 'h:mm a')} - ${format(parseISO(event.end), 'h:mm a')}`
                        }
                      </div>
                      {event.description && (
                        <div className="text-sm mt-1">{event.description}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No events scheduled for today</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
