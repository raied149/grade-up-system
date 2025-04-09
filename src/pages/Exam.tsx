
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarEvent, User } from "@/lib/types";
import { Download, Edit, Plus, Trash, Upload } from "lucide-react";
import * as XLSX from 'xlsx';
import { mockTeachers } from "@/lib/mockData";

// Create mock classes
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

// Create mock subjects
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

// Mock events for tests and exams
const initialEvents: CalendarEvent[] = [
  {
    id: "event-1",
    title: "Mathematics Test",
    start: "2025-04-15T09:00:00",
    end: "2025-04-15T10:30:00",
    allDay: false,
    type: "test",
    subject: "Mathematics",
    class: "Grade 8",
    maxMarks: 50,
  },
  {
    id: "event-2",
    title: "Mid-Term Examination",
    start: "2025-05-01T09:00:00",
    end: "2025-05-10T16:00:00",
    allDay: true,
    type: "exam",
    class: "Grade 10",
    maxMarks: 100,
  },
  {
    id: "event-3",
    title: "Physics Unit Test",
    start: "2025-04-20T11:00:00",
    end: "2025-04-20T12:00:00",
    allDay: false,
    type: "test",
    subject: "Physics",
    class: "Grade 9",
    maxMarks: 25,
  },
];

const Exam = () => {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<"all" | "test" | "exam">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null);
  
  const [newEvent, setNewEvent] = useState<{
    title: string;
    type: "test" | "exam";
    subject?: string;
    class: string;
    maxMarks: string;
    date: string;
    startTime: string;
    endTime: string;
    allDay: boolean;
  }>({
    title: "",
    type: "test",
    subject: "",
    class: "",
    maxMarks: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "11:00",
    allDay: false,
  });
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  useEffect(() => {
    // Reset form data when dialog closes
    if (!isDialogOpen) {
      setNewEvent({
        title: "",
        type: "test",
        subject: "",
        class: "",
        maxMarks: "",
        date: new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "11:00",
        allDay: false,
      });
      setIsEditMode(false);
      setCurrentEvent(null);
    }
  }, [isDialogOpen]);
  
  // Update form based on event type selection
  useEffect(() => {
    if (newEvent.type === "exam") {
      setNewEvent(prev => ({ ...prev, subject: undefined }));
    } else {
      setNewEvent(prev => ({ ...prev, subject: prev.subject || "" }));
    }
  }, [newEvent.type]);
  
  // Filter events based on search term and event type
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = eventTypeFilter === "all" || event.type === eventTypeFilter;
    
    return matchesSearch && matchesFilter;
  });
  
  // Add or update event
  const handleSaveEvent = () => {
    const startDateTime = `${newEvent.date}T${newEvent.startTime}:00`;
    const endDateTime = `${newEvent.date}T${newEvent.endTime}:00`;
    
    const eventData: CalendarEvent = {
      id: isEditMode && currentEvent ? currentEvent.id : `event-${Date.now()}`,
      title: newEvent.title,
      start: startDateTime,
      end: endDateTime,
      allDay: newEvent.allDay,
      type: newEvent.type,
      subject: newEvent.type === "test" ? newEvent.subject : undefined,
      class: newEvent.class,
      maxMarks: parseInt(newEvent.maxMarks),
    };
    
    if (isEditMode && currentEvent) {
      // Update existing event
      setEvents(prev => prev.map(e => (e.id === currentEvent.id ? eventData : e)));
      toast.success("Test/Exam updated successfully");
    } else {
      // Add new event
      setEvents(prev => [...prev, eventData]);
      toast.success("Test/Exam added successfully");
    }
    
    setIsDialogOpen(false);
  };
  
  // Edit event
  const handleEditEvent = (event: CalendarEvent) => {
    setCurrentEvent(event);
    setIsEditMode(true);
    
    // Parse date and times from event
    const eventDate = new Date(event.start).toISOString().split("T")[0];
    const eventStartTime = new Date(event.start).toTimeString().substring(0, 5);
    const eventEndTime = new Date(event.end).toTimeString().substring(0, 5);
    
    setNewEvent({
      title: event.title,
      type: event.type as "test" | "exam",
      subject: event.subject,
      class: event.class || "",
      maxMarks: event.maxMarks?.toString() || "",
      date: eventDate,
      startTime: eventStartTime,
      endTime: eventEndTime,
      allDay: event.allDay,
    });
    
    setIsDialogOpen(true);
  };
  
  // Delete event
  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    toast.success("Test/Exam deleted successfully");
  };
  
  // Export events to Excel
  const exportToExcel = () => {
    const data = events.map(event => ({
      "Title": event.title,
      "Type": event.type.charAt(0).toUpperCase() + event.type.slice(1),
      "Subject": event.subject || "Multiple",
      "Class": event.class || "",
      "Date": new Date(event.start).toLocaleDateString(),
      "Start Time": event.allDay ? "All Day" : new Date(event.start).toLocaleTimeString(),
      "End Time": event.allDay ? "All Day" : new Date(event.end).toLocaleTimeString(),
      "Maximum Marks": event.maxMarks || ""
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tests and Exams");
    XLSX.writeFile(workbook, "tests_and_exams.xlsx");
    toast.success("Data exported to Excel");
  };
  
  // Import from Excel
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Process imported data
        const importedEvents = jsonData.map((row: any, index) => {
          const typeStr = row["Type"]?.toLowerCase() || "test";
          const type = typeStr === "exam" ? "exam" : "test";
          
          const dateObj = new Date();
          if (row["Date"]) {
            // Try to parse the date
            try {
              const parsed = new Date(row["Date"]);
              if (!isNaN(parsed.getTime())) {
                dateObj.setFullYear(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
              }
            } catch (err) {
              console.error("Date parsing error:", err);
            }
          }
          
          // Create start and end date objects
          const startDate = new Date(dateObj);
          const endDate = new Date(dateObj);
          
          // Set times if provided
          if (row["Start Time"] && row["Start Time"] !== "All Day") {
            try {
              const timeParts = row["Start Time"].split(":");
              if (timeParts.length >= 2) {
                startDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]));
              }
            } catch (err) {
              console.error("Time parsing error:", err);
            }
          }
          
          if (row["End Time"] && row["End Time"] !== "All Day") {
            try {
              const timeParts = row["End Time"].split(":");
              if (timeParts.length >= 2) {
                endDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]));
              } else {
                // Default end time is start time + 1 hour
                endDate.setHours(startDate.getHours() + 1, startDate.getMinutes());
              }
            } catch (err) {
              console.error("Time parsing error:", err);
              endDate.setHours(startDate.getHours() + 1, startDate.getMinutes());
            }
          } else {
            // Default end time is start time + 1 hour
            endDate.setHours(startDate.getHours() + 1, startDate.getMinutes());
          }
          
          const isAllDay = row["Start Time"] === "All Day" || row["End Time"] === "All Day";
          
          return {
            id: `imported-event-${Date.now()}-${index}`,
            title: row["Title"] || `Imported ${type}`,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            allDay: isAllDay,
            type: type as "test" | "exam",
            subject: type === "test" ? (row["Subject"] || "") : undefined,
            class: row["Class"] || "",
            maxMarks: parseInt(row["Maximum Marks"]) || (type === "test" ? 50 : 100),
          };
        });
        
        setEvents(prev => [...prev, ...importedEvents]);
        toast.success(`Imported ${importedEvents.length} tests/exams`);
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to import data. Please check the file format.");
      }
    };
    
    reader.readAsArrayBuffer(file);
    
    // Reset the input
    e.target.value = "";
  };
  
  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tests & Exams</h1>
            <p className="text-muted-foreground">
              Manage and schedule tests and exams for students
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToExcel}>
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
            
            <div>
              <Input
                type="file"
                id="excel-import"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleImport}
              />
              <Button variant="outline" onClick={() => document.getElementById("excel-import")?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Import from Excel
              </Button>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Test/Exam
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {isEditMode ? "Edit Test/Exam" : "Add New Test/Exam"}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditMode 
                      ? "Update the details for this test or exam" 
                      : "Fill in the details to schedule a new test or exam"}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Event Type</Label>
                    <Select 
                      value={newEvent.type} 
                      onValueChange={(value: "test" | "exam") => 
                        setNewEvent({...newEvent, type: value})}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test">Test</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      value={newEvent.title} 
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} 
                      placeholder={`Enter ${newEvent.type} name`} 
                    />
                  </div>
                  
                  {newEvent.type === "test" && (
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxMarks">Maximum Marks</Label>
                    <Input 
                      id="maxMarks" 
                      type="number" 
                      value={newEvent.maxMarks} 
                      onChange={(e) => setNewEvent({...newEvent, maxMarks: e.target.value})} 
                      placeholder="Enter maximum marks" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      value={newEvent.date} 
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} 
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      id="allDay"
                      checked={newEvent.allDay}
                      onChange={(e) => setNewEvent({...newEvent, allDay: e.target.checked})}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="allDay">All Day Event</Label>
                  </div>
                  
                  {!newEvent.allDay && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input 
                          id="startTime" 
                          type="time" 
                          value={newEvent.startTime} 
                          onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input 
                          id="endTime" 
                          type="time" 
                          value={newEvent.endTime} 
                          onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})} 
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveEvent} 
                    disabled={!newEvent.title || !newEvent.class || !newEvent.maxMarks}
                  >
                    {isEditMode ? "Update" : "Add"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all" onClick={() => setEventTypeFilter("all")}>
              All
            </TabsTrigger>
            <TabsTrigger value="test" onClick={() => setEventTypeFilter("test")}>
              Tests
            </TabsTrigger>
            <TabsTrigger value="exam" onClick={() => setEventTypeFilter("exam")}>
              Exams
            </TabsTrigger>
          </TabsList>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Upcoming Tests & Exams</CardTitle>
                <div className="max-w-sm">
                  <Input
                    placeholder="Search by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>{eventTypeFilter === "exam" ? "Class" : "Subject"}</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Max Marks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            event.type === "exam" 
                              ? "bg-purple-100 text-purple-800" 
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {event.type === "exam" ? "Exam" : "Test"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {event.type === "test" ? event.subject : "Multiple"}
                        </TableCell>
                        <TableCell>{event.class}</TableCell>
                        <TableCell>{new Date(event.start).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {event.allDay 
                            ? "All Day" 
                            : `${new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(event.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                          }
                        </TableCell>
                        <TableCell>{event.maxMarks}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditEvent(event)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No tests or exams found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Exam;
