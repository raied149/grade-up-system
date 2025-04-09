
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarEvent, Teacher } from "@/lib/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { mockTeachers } from "@/lib/mockData";
import * as XLSX from 'xlsx';

// Mock classes
const mockClasses = [
  {
    id: "class-1",
    name: "Grade 8",
    section: "A",
  },
  {
    id: "class-2",
    name: "Grade 9",
    section: "B",
  },
  {
    id: "class-3",
    name: "Grade 10",
    section: "A",
  },
];

// Mock subjects
const mockSubjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Geography",
  "Computer Science",
];

// Mock calendar events
const initialEvents: CalendarEvent[] = [
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
    description: "Final math examination for Grade 8 students",
    maxMarks: 100,
    class: "Grade 8"
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
  },
  { 
    id: "event-5", 
    title: "Physics Test", 
    start: "2025-04-18T09:00:00", 
    end: "2025-04-18T10:00:00", 
    allDay: false,
    type: "test",
    description: "Unit test on mechanics",
    subject: "Physics",
    maxMarks: 25,
    class: "Grade 9"
  }
];

const Calendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<string>("month");
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [assignTeachers, setAssignTeachers] = useState<boolean>(true);
  
  const [newEvent, setNewEvent] = useState<{
    title: string;
    description: string;
    start: string;
    end: string;
    allDay: boolean;
    type: "class" | "exam" | "meeting" | "holiday" | "task" | "test";
    subject?: string;
    class?: string;
    maxMarks?: string;
  }>({
    title: "",
    description: "",
    start: format(date, "yyyy-MM-dd'T'HH:mm"),
    end: format(date, "yyyy-MM-dd'T'HH:mm"),
    allDay: false,
    type: "meeting"
  });
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setNewEvent({
        title: "",
        description: "",
        start: format(date, "yyyy-MM-dd'T'HH:mm"),
        end: format(date, "yyyy-MM-dd'T'HH:mm"),
        allDay: false,
        type: "meeting"
      });
      setSelectedTeachers([]);
      setAssignTeachers(true);
    }
  }, [isDialogOpen, date]);
  
  // Update form based on event type
  useEffect(() => {
    if (newEvent.type === 'test' || newEvent.type === 'exam') {
      if (newEvent.type === 'test') {
        setNewEvent(prev => ({
          ...prev,
          subject: prev.subject || ''
        }));
      } else if (newEvent.type === 'exam') {
        setNewEvent(prev => ({
          ...prev,
          subject: undefined
        }));
      }
    }
  }, [newEvent.type]);
  
  // Get events for the selected month
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Function to get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      isSameDay(parseISO(event.start), day)
    );
  };

  // Function to handle checkbox change for teacher selection
  const handleTeacherCheckboxChange = (teacherId: string) => {
    setSelectedTeachers(current => {
      if (current.includes(teacherId)) {
        return current.filter(id => id !== teacherId);
      } else {
        return [...current, teacherId];
      }
    });
  };
  
  // Function to add a new event
  const handleAddEvent = () => {
    const eventId = `event-${Date.now()}`;
    const eventData: CalendarEvent = {
      id: eventId,
      title: newEvent.title,
      start: newEvent.start,
      end: newEvent.end,
      allDay: newEvent.allDay,
      type: newEvent.type,
      description: newEvent.description,
    };
    
    // Add test/exam specific fields
    if (newEvent.type === 'test' || newEvent.type === 'exam') {
      eventData.maxMarks = newEvent.maxMarks ? parseInt(newEvent.maxMarks) : undefined;
      eventData.class = newEvent.class;
      
      if (newEvent.type === 'test') {
        eventData.subject = newEvent.subject;
      }
    }
    
    // Add teacher assignments if selected
    if (assignTeachers && selectedTeachers.length > 0) {
      eventData.assignedTeachers = selectedTeachers;
    }
    
    setEvents(prev => [...prev, eventData]);
    toast.success("Event added successfully");
    setIsDialogOpen(false);
  };

  // Export events to Excel
  const exportEventsToExcel = () => {
    // Transform events for Excel
    const exportData = events.map(event => {
      const baseData = {
        Title: event.title,
        Type: event.type.charAt(0).toUpperCase() + event.type.slice(1),
        Start: format(parseISO(event.start), "PPP"),
        End: format(parseISO(event.end), "PPP"),
        StartTime: event.allDay ? "All Day" : format(parseISO(event.start), "p"),
        EndTime: event.allDay ? "All Day" : format(parseISO(event.end), "p"),
        AllDay: event.allDay ? "Yes" : "No",
        Description: event.description || "",
        Teachers: event.assignedTeachers?.map(id => {
          const teacher = mockTeachers.find(t => t.id === id);
          return teacher ? teacher.name : id;
        }).join(', ') || "All"
      };
      
      // Add test/exam specific fields
      if (event.type === 'test' || event.type === 'exam') {
        return {
          ...baseData,
          Subject: event.subject || "Multiple",
          Class: event.class || "",
          MaxMarks: event.maxMarks || ""
        };
      }
      
      return baseData;
    });
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Calendar Events");
    
    // Generate Excel file
    XLSX.writeFile(workbook, "calendar_events.xlsx");
    
    toast.success("Events exported to Excel");
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">School Calendar</h1>
            <p className="text-muted-foreground">
              View and manage important school events
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportEventsToExcel}>
              Export to Excel
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                  <DialogDescription>
                    Fill in the details to add a new event to the calendar
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      value={newEvent.title} 
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} 
                      placeholder="Event title" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Event Type</Label>
                    <Select 
                      value={newEvent.type} 
                      onValueChange={(value: "class" | "exam" | "meeting" | "holiday" | "task" | "test") => 
                        setNewEvent({...newEvent, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="class">Class</SelectItem>
                        <SelectItem value="test">Test</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="holiday">Holiday</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Test/Exam specific fields */}
                  {(newEvent.type === 'test' || newEvent.type === 'exam') && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="class">Class</Label>
                        <Select 
                          value={newEvent.class} 
                          onValueChange={(value) => setNewEvent({...newEvent, class: value})}
                        >
                          <SelectTrigger id="class">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockClasses.map((cls) => (
                              <SelectItem key={cls.id} value={cls.name}>
                                {cls.name} - {cls.section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {newEvent.type === 'test' && (
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Select 
                            value={newEvent.subject} 
                            onValueChange={(value) => setNewEvent({...newEvent, subject: value})}
                          >
                            <SelectTrigger id="subject">
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockSubjects.map((subject) => (
                                <SelectItem key={subject} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="maxMarks">Maximum Marks</Label>
                        <Input 
                          id="maxMarks" 
                          type="number" 
                          value={newEvent.maxMarks || ''} 
                          onChange={(e) => setNewEvent({...newEvent, maxMarks: e.target.value})} 
                          placeholder="Enter maximum marks" 
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start">Start Date & Time</Label>
                      <Input 
                        type="datetime-local" 
                        id="start" 
                        value={newEvent.start} 
                        onChange={(e) => setNewEvent({...newEvent, start: e.target.value})} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="end">End Date & Time</Label>
                      <Input 
                        type="datetime-local" 
                        id="end" 
                        value={newEvent.end} 
                        onChange={(e) => setNewEvent({...newEvent, end: e.target.value})} 
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="allDay" 
                      checked={newEvent.allDay} 
                      onCheckedChange={(checked) => 
                        setNewEvent({...newEvent, allDay: checked === true})} 
                    />
                    <Label htmlFor="allDay">All Day Event</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      value={newEvent.description} 
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} 
                      placeholder="Event description" 
                    />
                  </div>
                  
                  {/* Teacher assignment section */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="assign-teachers"
                        checked={assignTeachers}
                        onCheckedChange={(checked) => setAssignTeachers(checked === true)}
                      />
                      <Label htmlFor="assign-teachers">Assign Teachers to this Event</Label>
                    </div>
                    
                    {assignTeachers && (
                      <div className="max-h-48 overflow-y-auto border rounded-md p-2 mt-2">
                        <div className="mb-2 text-sm text-muted-foreground">
                          Select teachers for this event:
                        </div>
                        <div className="space-y-2">
                          {mockTeachers.map((teacher) => (
                            <div key={teacher.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={teacher.id} 
                                checked={selectedTeachers.includes(teacher.id)} 
                                onCheckedChange={() => handleTeacherCheckboxChange(teacher.id)} 
                              />
                              <Label htmlFor={teacher.id}>{teacher.name} ({teacher.subject})</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddEvent} disabled={!newEvent.title}>Add Event</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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
                className="rounded-md border pointer-events-auto"
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
                        event.type === 'test' ? 'bg-purple-50 border-purple-200' :
                        event.type === 'class' ? 'bg-green-50 border-green-200' :
                        event.type === 'holiday' ? 'bg-red-50 border-red-200' :
                        event.type === 'task' ? 'bg-indigo-50 border-indigo-200' :
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
                          <div>
                            {event.type === 'test' && event.subject && (
                              <span className="font-medium">Subject: {event.subject}</span>
                            )}
                            {event.class && (
                              <span className="ml-2 font-medium">Class: {event.class}</span>
                            )}
                          </div>
                          {event.maxMarks !== undefined && (
                            <div>Maximum Marks: {event.maxMarks}</div>
                          )}
                        </div>
                      )}
                      
                      {event.description && (
                        <div className="text-sm mt-1">{event.description}</div>
                      )}
                      
                      {event.assignedTeachers && event.assignedTeachers.length > 0 && (
                        <div className="text-sm mt-2">
                          <span className="font-medium">Assigned to: </span>
                          {event.assignedTeachers.map(id => {
                            const teacher = mockTeachers.find(t => t.id === id);
                            return teacher ? teacher.name : id;
                          }).join(', ')}
                        </div>
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
