
import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Save, Book, Plus, Trash, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { mockTeachers } from "@/lib/mockData";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

const classOptions = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const subjects = [
  "Mathematics", "Science", "English", "Hindi", "Social Studies", 
  "Physical Education", "Arts", "Computer Science", "Environmental Science"
];

const TimeTable = () => {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [activeDay, setActiveDay] = useState<string>("monday");
  const [isHoliday, setIsHoliday] = useState<Record<string, boolean>>({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  });
  const [timetableData, setTimetableData] = useState<Record<string, any[]>>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  });
  const [isAddingPeriod, setIsAddingPeriod] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<{
    id?: string,
    subject: string,
    teacherId: string,
    startTime: string,
    endTime: string,
    periodNumber: number
  }>({
    subject: "",
    teacherId: "",
    startTime: "",
    endTime: "",
    periodNumber: 1
  });
  
  // Handle class change
  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    // In a real app, we would fetch timetable data for this class+section
    resetTimetable();
  };
  
  // Handle section change
  const handleSectionChange = (value: string) => {
    setSelectedSection(value);
    // In a real app, we would fetch timetable data for this class+section
    resetTimetable();
  };
  
  // Reset timetable data
  const resetTimetable = () => {
    setTimetableData({
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
    });
    setIsHoliday({
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
    });
  };
  
  // Toggle holiday status for a day
  const toggleHoliday = (day: string) => {
    setIsHoliday(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };
  
  // Add a new period
  const addPeriod = () => {
    if (!currentPeriod.subject || !currentPeriod.teacherId || !currentPeriod.startTime || !currentPeriod.endTime) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const newPeriod = {
      ...currentPeriod,
      id: `period-${Date.now()}`,
    };
    
    setTimetableData(prev => ({
      ...prev,
      [activeDay]: [...prev[activeDay], newPeriod]
    }));
    
    // Reset form and close dialog
    setCurrentPeriod({
      subject: "",
      teacherId: "",
      startTime: "",
      endTime: "",
      periodNumber: prev[activeDay].length + 1
    });
    setIsAddingPeriod(false);
    
    toast.success("Period added successfully");
  };
  
  // Remove a period
  const removePeriod = (periodId: string) => {
    setTimetableData(prev => ({
      ...prev,
      [activeDay]: prev[activeDay].filter(period => period.id !== periodId)
    }));
    
    toast.success("Period removed successfully");
  };
  
  // Save the entire timetable
  const saveTimetable = () => {
    // In a real app, we would send the timetable data to an API
    toast.success("Timetable saved successfully");
  };
  
  // Export timetable to Excel
  const exportToExcel = () => {
    if (!selectedClass || !selectedSection) {
      toast.error("Please select class and section");
      return;
    }
    
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const worksheets: Record<string, any> = {};
    
    // Create a worksheet for each day
    days.forEach(day => {
      const dayData = timetableData[day];
      if (isHoliday[day]) {
        worksheets[day] = XLSX.utils.json_to_sheet([{ 
          Note: `${day.charAt(0).toUpperCase() + day.slice(1)} is marked as a holiday`
        }]);
      } else if (dayData.length > 0) {
        const formattedData = dayData.map(period => {
          const teacher = mockTeachers.find(t => t.id === period.teacherId);
          return {
            "Period Number": period.periodNumber,
            "Start Time": period.startTime,
            "End Time": period.endTime,
            "Subject": period.subject,
            "Teacher": teacher ? teacher.name : "Unknown"
          };
        });
        worksheets[day] = XLSX.utils.json_to_sheet(formattedData);
      } else {
        worksheets[day] = XLSX.utils.json_to_sheet([{ Note: "No periods scheduled for this day" }]);
      }
    });
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Add each worksheet to the workbook
    days.forEach(day => {
      XLSX.utils.book_append_sheet(workbook, worksheets[day], day.charAt(0).toUpperCase() + day.slice(1));
    });
    
    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, `timetable_class${selectedClass}_section${selectedSection}.xlsx`);
    
    toast.success("Timetable exported to Excel");
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Time Table</h1>
            <p className="text-muted-foreground">
              Create and manage class timetables
            </p>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={exportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={saveTimetable}>
              <Save className="h-4 w-4 mr-2" />
              Save Timetable
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="w-full md:w-1/2">
                <label className="text-sm font-medium">Class</label>
                <Select value={selectedClass} onValueChange={handleClassChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        Class {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-1/2">
                <label className="text-sm font-medium">Section</label>
                <Input 
                  placeholder="Enter section"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                />
              </div>
            </div>
            
            {!selectedClass || !selectedSection ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  Please select a class and section to view or create a timetable
                </p>
              </div>
            ) : (
              <div className="mt-6">
                <Tabs 
                  defaultValue="monday" 
                  value={activeDay}
                  onValueChange={setActiveDay}
                >
                  <TabsList className="grid grid-cols-6">
                    {dayNames.map((day, idx) => (
                      <TabsTrigger 
                        key={day} 
                        value={day.toLowerCase()}
                        className={isHoliday[day.toLowerCase()] ? "line-through text-muted-foreground" : ""}
                      >
                        {day}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {dayNames.map((day, idx) => (
                    <TabsContent key={day} value={day.toLowerCase()}>
                      <Card>
                        <CardHeader className="bg-muted/50 pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{day}</CardTitle>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`holiday-${day}`}
                                checked={isHoliday[day.toLowerCase()]}
                                onCheckedChange={() => toggleHoliday(day.toLowerCase())}
                              />
                              <Label htmlFor={`holiday-${day}`}>Mark as Holiday</Label>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          {isHoliday[day.toLowerCase()] ? (
                            <div className="py-8 text-center">
                              <p className="text-muted-foreground">This day is marked as a holiday</p>
                            </div>
                          ) : timetableData[day.toLowerCase()].length === 0 ? (
                            <div className="py-8 text-center">
                              <p className="text-muted-foreground mb-4">No periods added yet</p>
                              <Button onClick={() => setIsAddingPeriod(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Period
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {timetableData[day.toLowerCase()].map((period, index) => {
                                const teacher = mockTeachers.find(t => t.id === period.teacherId);
                                return (
                                  <div 
                                    key={period.id} 
                                    className="flex items-center justify-between p-3 border rounded-md bg-card"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center">
                                        <div className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3">
                                          {period.periodNumber}
                                        </div>
                                        <div>
                                          <h4 className="font-medium">{period.subject}</h4>
                                          <div className="flex items-center text-sm text-muted-foreground">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {period.startTime} - {period.endTime}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium">{teacher?.name || "Unknown Teacher"}</p>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => removePeriod(period.id)}
                                        className="text-destructive hover:text-destructive/90"
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="flex justify-center mt-4">
                                <Button onClick={() => setIsAddingPeriod(true)}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Period
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Add Period Dialog */}
        <Dialog open={isAddingPeriod} onOpenChange={setIsAddingPeriod}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Add New Period - {activeDay.charAt(0).toUpperCase() + activeDay.slice(1)}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="periodNumber" className="text-sm font-medium">Period Number</label>
                  <Input 
                    id="periodNumber"
                    type="number"
                    min="1"
                    value={currentPeriod.periodNumber}
                    onChange={(e) => setCurrentPeriod({
                      ...currentPeriod,
                      periodNumber: parseInt(e.target.value) || 1
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                  <Select 
                    value={currentPeriod.subject} 
                    onValueChange={(value) => setCurrentPeriod({...currentPeriod, subject: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="teacher" className="text-sm font-medium">Teacher</label>
                <Select 
                  value={currentPeriod.teacherId} 
                  onValueChange={(value) => setCurrentPeriod({...currentPeriod, teacherId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTeachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="startTime" className="text-sm font-medium">Start Time</label>
                  <Input 
                    id="startTime"
                    type="time"
                    value={currentPeriod.startTime}
                    onChange={(e) => setCurrentPeriod({...currentPeriod, startTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="endTime" className="text-sm font-medium">End Time</label>
                  <Input 
                    id="endTime"
                    type="time"
                    value={currentPeriod.endTime}
                    onChange={(e) => setCurrentPeriod({...currentPeriod, endTime: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingPeriod(false)}>Cancel</Button>
              <Button onClick={addPeriod}>
                <Plus className="h-4 w-4 mr-2" />
                Add Period
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TimeTable;
