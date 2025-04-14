
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { mockClasses, mockTeachers } from "@/lib/mockData";
import { type TimeTable as TimeTableType, TimeTableEntry, TimeTableDay } from "@/lib/types";
import { toast } from "sonner";

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const periods = [1, 2, 3, 4, 5, 6, 7, 8];

const TimeTablePage = () => {
  const [selectedClass, setSelectedClass] = useState<string | undefined>(undefined);
  const [selectedSection, setSelectedSection] = useState<string | undefined>(undefined);
  const [selectedDay, setSelectedDay] = useState<typeof daysOfWeek[number]>("monday");
  const [timetable, setTimetable] = useState<TimeTableType | null>(null);
  const [newPeriod, setNewPeriod] = useState<TimeTableEntry>({
    id: "",
    day: "monday",
    periodNumber: 1,
    startTime: "08:00",
    endTime: "08:45",
    subject: "",
    teacherId: "",
    classId: "",
    section: "",
  });

  useEffect(() => {
    // Mock fetch timetable data
    const mockTimetable: TimeTableType = {
      id: "tt-1",
      classId: "class-1",
      section: "A",
      days: {
        monday: {
          isHoliday: false,
          periods: [
            {
              id: "p-1",
              day: "monday",
              periodNumber: 1,
              startTime: "08:00",
              endTime: "08:45",
              subject: "Mathematics",
              teacherId: "teacher-1",
              classId: "class-1",
              section: "A",
            },
            {
              id: "p-2",
              day: "monday",
              periodNumber: 2,
              startTime: "08:45",
              endTime: "09:30",
              subject: "Science",
              teacherId: "teacher-2",
              classId: "class-1",
              section: "A",
            },
          ],
        },
        tuesday: {
          isHoliday: false,
          periods: [],
        },
        wednesday: {
          isHoliday: false,
          periods: [],
        },
        thursday: {
          isHoliday: false,
          periods: [],
        },
        friday: {
          isHoliday: false,
          periods: [],
        },
        saturday: {
          isHoliday: true,
          periods: [],
        },
        sunday: {
          isHoliday: true,
          periods: [],
        },
      },
    };
    setTimetable(mockTimetable);
  }, []);

  const handleAddPeriod = () => {
    if (!selectedClass || !selectedSection) {
      toast.error("Please select a class and section");
      return;
    }

    const newPeriodWithId = { 
      ...newPeriod, 
      id: `period-${Date.now()}`, 
      classId: selectedClass, 
      section: selectedSection, 
      day: selectedDay 
    };
    
    setTimetable(previousTimetable => {
      if (!previousTimetable) return previousTimetable;
      
      const updatedDays = { ...previousTimetable.days };
      
      // Initialize the day if it doesn't exist
      if (!updatedDays[selectedDay]) {
        updatedDays[selectedDay] = {
          isHoliday: false,
          periods: []
        };
      }
      
      // Add the new period
      updatedDays[selectedDay] = {
        ...updatedDays[selectedDay],
        periods: [...updatedDays[selectedDay].periods, newPeriodWithId]
      };
      
      return {
        ...previousTimetable,
        days: updatedDays
      };
    });

    setNewPeriod({
      id: "",
      day: selectedDay,
      periodNumber: 1,
      startTime: "08:00",
      endTime: "08:45",
      subject: "",
      teacherId: "",
      classId: selectedClass,
      section: selectedSection,
    });

    toast.success("Period added successfully");
  };

  const handleDeletePeriod = (periodId: string) => {
    setTimetable(previousTimetable => {
      if (!previousTimetable) return previousTimetable;
      
      const updatedDays = { ...previousTimetable.days };
      
      // Filter out the period
      updatedDays[selectedDay] = {
        ...updatedDays[selectedDay],
        periods: updatedDays[selectedDay].periods.filter(period => period.id !== periodId)
      };
      
      return {
        ...previousTimetable,
        days: updatedDays
      };
    });

    toast.success("Period deleted successfully");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewPeriod({ ...newPeriod, [name]: value });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
          <p className="text-muted-foreground">
            Manage and view class timetables
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {mockClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedSection}>
            <SelectTrigger>
              <SelectValue placeholder="Select Section" />
            </SelectTrigger>
            <SelectContent>
              {selectedClass && ['A', 'B', 'C'].map((section) => (
                <SelectItem key={section} value={section}>
                  {section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th>Period</th>
                {daysOfWeek.map((day) => (
                  <th key={day} className="text-center">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period}>
                  <td>{period}</td>
                  {daysOfWeek.map((day) => {
                    const periodData = timetable?.days[day]?.periods.find((p) => p.periodNumber === period);
                    return (
                      <td key={day} className="text-center p-2">
                        {periodData ? (
                          <div>
                            {periodData.subject}
                            <br />
                            {
                              mockTeachers.find(teacher => teacher.id === periodData.teacherId)?.name
                            }
                            <Button variant="ghost" size="icon" onClick={() => handleDeletePeriod(periodData.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Add Period</h2>
          <p className="text-muted-foreground">
            Add a new period to the timetable
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select 
              name="day" 
              value={selectedDay}
              onValueChange={(value: typeof daysOfWeek[number]) => {
                setSelectedDay(value);
                setNewPeriod(prev => ({ ...prev, day: value }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Day" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select name="periodNumber" onValueChange={(value) => handleInputChange({ target: { name: "periodNumber", value } } as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period} value={String(period)}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="time"
              name="startTime"
              value={newPeriod.startTime}
              onChange={handleInputChange}
              placeholder="Start Time"
            />
            <Input
              type="time"
              name="endTime"
              value={newPeriod.endTime}
              onChange={handleInputChange}
              placeholder="End Time"
            />
            <Input
              type="text"
              name="subject"
              value={newPeriod.subject}
              onChange={handleInputChange}
              placeholder="Subject"
            />

            <Select name="teacherId" onValueChange={(value) => handleInputChange({ target: { name: "teacherId", value } } as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Teacher" />
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

          <Button onClick={handleAddPeriod} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Period
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TimeTablePage;
