
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isSameDay, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, parseISO } from "date-fns";
import { CalendarEvent } from "@/lib/types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface CalendarWidgetProps {
  events: CalendarEvent[];
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ events }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  
  // Calculate month boundaries
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfMonth(currentMonth);
  const endDate = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventStartDate = parseISO(event.start);
      const eventEndDate = parseISO(event.end);
      
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
  
  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };
  
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };
  
  // Event badge color based on type
  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case "class":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "test":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "exam":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "meeting":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "occasion":
        return "bg-pink-100 text-pink-800 hover:bg-pink-200";
      case "holiday":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "task":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };
  
  // Get the day's event count for the calendar view
  const getDayEventCount = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    return dayEvents.length;
  };

  // Get events for the selected date for the dialog
  const selectedDateEvents = getEventsForDate(selectedDate);

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
              onClick={goToPreviousMonth}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="p-1 rounded-full hover:bg-gray-100"
              onClick={goToToday}
              aria-label="Today"
            >
              <Badge variant="outline" className="px-2 py-0">Today</Badge>
            </button>
            <button
              className="p-1 rounded-full hover:bg-gray-100"
              onClick={goToNextMonth}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <h3 className="font-medium text-lg">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Day names */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-xs font-medium text-muted-foreground py-1">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {daysInMonth.map((day, i) => {
            const eventCount = getDayEventCount(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            
            return (
              <button
                key={i}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-md text-sm p-1
                  ${!isCurrentMonth && 'text-muted-foreground opacity-50'}
                  ${isToday && 'bg-primary text-primary-foreground'}
                  ${isSelected && !isToday && 'bg-secondary text-secondary-foreground'}
                  ${!isSelected && !isToday && 'hover:bg-muted'}
                  ${eventCount > 0 && !isToday ? 'font-medium' : ''}
                `}
                onClick={() => handleDateClick(day)}
              >
                <span>{format(day, "d")}</span>
                {eventCount > 0 && (
                  <div className="mt-1 flex gap-0.5">
                    {eventCount > 3 ? (
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                    ) : (
                      Array.from({ length: Math.min(eventCount, 3) }).map((_, i) => (
                        <span key={i} className="inline-flex h-1 w-1 rounded-full bg-primary" />
                      ))
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Upcoming events preview */}
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Upcoming Events</h4>
          <div className="space-y-2">
            {events
              .filter(event => parseISO(event.start) >= new Date())
              .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())
              .slice(0, 3)
              .map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="mr-2">
                        {format(parseISO(event.start), "MMM d")}
                      </span>
                      <Badge variant="outline" className={`${getEventBadgeColor(event.type)} text-xs font-normal`}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
      
      {/* Day view dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>
            {format(selectedDate, "MMMM d, yyyy")}
          </DialogTitle>
          <div className="py-4">
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className={`p-3 rounded-md border ${
                      event.type === 'meeting' || event.type === 'occasion' ? 'bg-blue-50 border-blue-200' :
                      event.type === 'exam' ? 'bg-amber-50 border-amber-200' :
                      event.type === 'test' ? 'bg-purple-50 border-purple-200' :
                      event.type === 'class' ? 'bg-green-50 border-green-200' :
                      event.type === 'holiday' ? 'bg-red-50 border-red-200' :
                      event.type === 'task' ? 'bg-indigo-50 border-indigo-200' :
                      event.type === 'occasion' ? 'bg-pink-50 border-pink-200' :
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
                    
                    {/* Show test/exam specific information */}
                    {(event.type === 'test' || event.type === 'exam') && (
                      <div className="mt-1 text-sm">
                        {event.type === 'test' && event.subject && (
                          <div className="font-medium">Subject: {event.subject}</div>
                        )}
                        {event.maxMarks !== undefined && (
                          <div>Maximum Marks: {event.maxMarks}</div>
                        )}
                      </div>
                    )}
                    
                    {event.description && (
                      <div className="text-sm mt-1">{event.description}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-muted-foreground">
                No events scheduled for this day
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CalendarWidget;
