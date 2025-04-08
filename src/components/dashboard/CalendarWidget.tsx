
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { CalendarEvent } from "@/lib/types";

interface CalendarWidgetProps {
  events: CalendarEvent[];
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventStartDate = new Date(event.start);
      const eventEndDate = new Date(event.end);
      
      // Check if the date falls within the event range
      if (event.allDay) {
        return (
          date >= eventStartDate && 
          date <= eventEndDate
        );
      }
      
      // For non-all-day events, check if it's on the same day
      return isSameDay(date, eventStartDate);
    });
  };
  
  // Next and previous day handlers
  const goToPreviousDay = () => {
    const newDate = subDays(selectedDate, 1);
    setSelectedDate(newDate);
  };
  
  const goToNextDay = () => {
    const newDate = addDays(selectedDate, 1);
    setSelectedDate(newDate);
  };

  // Event badge color based on type
  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case "class":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "exam":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "meeting":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "holiday":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "task":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const selectedEvents = getEventsForDate(selectedDate);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Calendar
          </CardTitle>
          <div className="flex items-center space-x-2">
            <button 
              className="p-1 rounded-full hover:bg-gray-100"
              onClick={goToPreviousDay}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="p-1 rounded-full hover:bg-gray-100"
              onClick={goToNextDay}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <h3 className="font-medium text-lg">
            {format(selectedDate, "EEEE")}
          </h3>
          <p className="text-muted-foreground">
            {format(selectedDate, "d MMMM yyyy")}
          </p>
        </div>

        <div className="space-y-2 mt-4">
          {selectedEvents.length > 0 ? (
            selectedEvents.map((event) => (
              <div 
                key={event.id} 
                className="flex items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex-1">
                  <p className="font-medium">{event.title}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    {!event.allDay && (
                      <span className="mr-2">
                        {format(new Date(event.start), "h:mm a")}
                        {" - "}
                        {format(new Date(event.end), "h:mm a")}
                      </span>
                    )}
                    <Badge variant="outline" className={`${getEventBadgeColor(event.type)} text-xs font-normal`}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No events scheduled for today
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarWidget;
