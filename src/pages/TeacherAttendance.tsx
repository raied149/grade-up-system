
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon, Download, Search, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockTeachers, mockTeacherAttendance } from "@/lib/mockData";
import { TeacherAttendance as TeacherAttendanceType } from "@/lib/types";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

const TeacherAttendance = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [attendance, setAttendance] = useState<Record<string, TeacherAttendanceType>>({});

  // Initialize attendance data when component mounts or date changes
  useEffect(() => {
    const dateString = format(date, "yyyy-MM-dd");
    
    // Get existing attendance records for the selected date
    const existingAttendance = mockTeacherAttendance
      .filter(record => record.date === dateString)
      .reduce((acc, record) => {
        acc[record.teacherId] = record;
        return acc;
      }, {} as Record<string, TeacherAttendanceType>);
    
    // Initialize attendance state with existing records
    setAttendance(existingAttendance);
  }, [date]);

  // Handle status change for a teacher
  const handleStatusChange = (teacherId: string, status: "present" | "absent" | "late" | "leave") => {
    const dateString = format(date, "yyyy-MM-dd");
    
    // Update attendance state
    setAttendance(prev => ({
      ...prev,
      [teacherId]: {
        id: prev[teacherId]?.id || `ta-${Date.now()}`,
        teacherId,
        date: dateString,
        status,
        checkInTime: status !== "absent" ? format(new Date(), "HH:mm") : undefined,
        checkOutTime: undefined,
      }
    }));
    
    // Show success message
    toast.success(`Attendance marked as ${status} for ${mockTeachers.find(t => t.id === teacherId)?.name}`);
  };

  // Handle check out for a teacher
  const handleCheckOut = (teacherId: string) => {
    setAttendance(prev => {
      const teacherAttendance = prev[teacherId];
      if (!teacherAttendance) return prev;
      
      return {
        ...prev,
        [teacherId]: {
          ...teacherAttendance,
          checkOutTime: format(new Date(), "HH:mm")
        }
      };
    });
    
    toast.success(`Check out time recorded for ${mockTeachers.find(t => t.id === teacherId)?.name}`);
  };

  // Export attendance data to Excel
  const exportToExcel = () => {
    const dateString = format(date, "yyyy-MM-dd");
    
    // Transform attendance data for export
    const exportData = mockTeachers.map(teacher => {
      const attendanceRecord = attendance[teacher.id];
      
      return {
        Name: teacher.name,
        Subject: teacher.subject,
        Date: dateString,
        Status: attendanceRecord?.status || "Not marked",
        "Check In": attendanceRecord?.checkInTime || "-",
        "Check Out": attendanceRecord?.checkOutTime || "-"
      };
    });
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teacher Attendance");
    
    // Generate Excel file
    XLSX.writeFile(workbook, `teacher_attendance_${dateString}.xlsx`);
    
    toast.success("Attendance data exported to Excel");
  };

  // Filter teachers based on search and status
  const filteredTeachers = mockTeachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(search.toLowerCase()) ||
                        teacher.subject.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    
    const teacherStatus = attendance[teacher.id]?.status;
    
    return matchesSearch && teacherStatus === statusFilter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Attendance</h1>
          <p className="text-muted-foreground">
            Manage and track teacher attendance records
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Date Picker */}
              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => newDate && setDate(newDate)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Status Filter */}
              <div className="flex-1">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search teachers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Export Button */}
              <Button variant="outline" onClick={exportToExcel}>
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </Button>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="text-left">Name</th>
                    <th className="text-left">Subject</th>
                    <th className="text-left">Class</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Check In</th>
                    <th className="text-center">Check Out</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.length > 0 ? (
                    filteredTeachers.map((teacher) => {
                      const teacherAttendance = attendance[teacher.id];
                      return (
                        <tr key={teacher.id}>
                          <td>{teacher.name}</td>
                          <td>{teacher.subject}</td>
                          <td>{teacher.classes.join(", ")}</td>
                          <td className="text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                !teacherAttendance
                                  ? "bg-gray-100 text-gray-800"
                                  : teacherAttendance.status === "present"
                                  ? "bg-green-100 text-green-800"
                                  : teacherAttendance.status === "absent"
                                  ? "bg-red-100 text-red-800"
                                  : teacherAttendance.status === "late"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {teacherAttendance?.status || "Not marked"}
                            </span>
                          </td>
                          <td className="text-center">{teacherAttendance?.checkInTime || "-"}</td>
                          <td className="text-center">{teacherAttendance?.checkOutTime || "-"}</td>
                          <td className="text-center">
                            <div className="flex justify-center space-x-1">
                              {!teacherAttendance || !teacherAttendance.status ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-xs bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                                    onClick={() => handleStatusChange(teacher.id, "present")}
                                  >
                                    Present
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-xs bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                                    onClick={() => handleStatusChange(teacher.id, "absent")}
                                  >
                                    Absent
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                                    onClick={() => handleStatusChange(teacher.id, "late")}
                                  >
                                    Late
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                                    onClick={() => handleStatusChange(teacher.id, "leave")}
                                  >
                                    Leave
                                  </Button>
                                </>
                              ) : (
                                teacherAttendance.status !== "absent" && !teacherAttendance.checkOutTime && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800"
                                    onClick={() => handleCheckOut(teacher.id)}
                                  >
                                    <LogOut className="h-3.5 w-3.5 mr-1" /> Check Out
                                  </Button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        No teachers found matching your search criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherAttendance;
