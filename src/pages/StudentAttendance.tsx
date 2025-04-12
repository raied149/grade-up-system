
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon, Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockClasses, mockStudentAttendance, mockStudents } from "@/lib/mockData";
import { StudentAttendance as StudentAttendanceType, User } from "@/lib/types";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

const StudentAttendance = () => {
  const [user, setUser] = useState<User | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [attendance, setAttendance] = useState<Record<string, StudentAttendanceType>>({});
  
  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Initialize attendance data when component mounts, date or class changes
  useEffect(() => {
    const dateString = format(date, "yyyy-MM-dd");
    
    const relevantStudentIds = selectedClass === "all"
      ? mockStudents.map(s => s.id)
      : mockClasses.find(c => c.id === selectedClass)?.students.map(s => s.id) || [];
    
    // Get existing attendance records for the selected date and class
    const existingAttendance = mockStudentAttendance
      .filter(record => 
        record.date === dateString && 
        (selectedClass === "all" || record.classId === selectedClass)
      )
      .reduce((acc, record) => {
        acc[record.studentId] = record;
        return acc;
      }, {} as Record<string, StudentAttendanceType>);
    
    // Initialize attendance state with existing records
    setAttendance(existingAttendance);
  }, [date, selectedClass]);

  // Handle status change for a student
  const handleStatusChange = (studentId: string, status: "present" | "absent" | "late" | "excused") => {
    const dateString = format(date, "yyyy-MM-dd");
    const classId = selectedClass === "all" ? mockClasses[0].id : selectedClass;
    
    // Update attendance state
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        id: prev[studentId]?.id || `sa-${Date.now()}`,
        studentId,
        date: dateString,
        classId,
        status,
        markedById: user?.id || "unknown",
        markedAt: new Date().toISOString(),
      }
    }));
    
    // Show success message
    toast.success(`Attendance marked as ${status} for ${mockStudents.find(s => s.id === studentId)?.name}`);
  };

  // Export attendance data to Excel
  const exportToExcel = () => {
    const dateString = format(date, "yyyy-MM-dd");
    
    // Get students based on selected class
    const students = getStudents();
    
    // Transform attendance data for export
    const exportData = students.map(student => {
      const attendanceRecord = attendance[student.id];
      
      return {
        Name: student.name,
        "Enrollment No": student.enrollmentNo,
        Section: student.section,
        Date: dateString,
        Status: attendanceRecord?.status || "Not marked",
        "Marked At": attendanceRecord?.markedAt 
          ? format(new Date(attendanceRecord.markedAt), "yyyy-MM-dd HH:mm:ss") 
          : "-",
        "Marked By": attendanceRecord?.markedById || "-"
      };
    });
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Attendance");
    
    // Generate Excel file
    XLSX.writeFile(workbook, `student_attendance_${dateString}.xlsx`);
    
    toast.success("Attendance data exported to Excel");
  };

  // Get students based on selected class
  const getStudents = () => {
    if (selectedClass === "all") {
      return mockStudents;
    }
    
    const classItem = mockClasses.find(c => c.id === selectedClass);
    return classItem ? classItem.students : [];
  };

  // Filter students based on search and status
  const filteredStudents = getStudents().filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) ||
                         student.enrollmentNo.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    
    const studentStatus = attendance[student.id]?.status;
    
    return matchesSearch && studentStatus === statusFilter;
  });

  const allClassesOption = { id: "all", name: "All Classes", section: "", teacherId: "", students: [] };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Attendance</h1>
          <p className="text-muted-foreground">
            Manage and track student attendance records
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

              {/* Class Filter */}
              <div className="flex-1">
                <Select 
                  value={selectedClass} 
                  onValueChange={(value) => {
                    setSelectedClass(value);
                    setSectionFilter("all"); // Reset section when class changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classOptions.map(cls => (
                      <SelectItem key={cls} value={cls}>
                        {cls.toUpperCase().includes('KG') ? cls : `Class ${cls}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Section Filter */}
              <div className="flex-1">
                <Select 
                  value={sectionFilter}
                  onValueChange={setSectionFilter}
                  disabled={selectedClass === "all"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {Array.from(new Set(mockStudents
                      .filter(s => selectedClass === "all" || s.class === selectedClass)
                      .map(s => s.section)))
                      .map(section => (
                        <SelectItem key={section} value={section}>
                          Section {section}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Section Filter */}
              <div className="flex-1">
                <Select 
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  disabled={selectedClass === "all"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {Array.from(new Set(mockStudents
                      .filter(s => selectedClass === "all" || s.class === selectedClass)
                      .map(s => s.section)))
                      .map(section => (
                        <SelectItem key={section} value={section}>
                          Section {section}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
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
                    <SelectItem value="excused">Excused</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
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
                    <th className="text-left">Enrollment #</th>
                    <th className="text-left">Class</th>
                    <th className="text-left">Section</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const studentAttendance = attendance[student.id];
                      return (
                        <tr key={student.id}>
                          <td>{student.name}</td>
                          <td>{student.enrollmentNo}</td>
                          <td>{student.class}</td>
                          <td>{student.section}</td>
                          <td className="text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                !studentAttendance
                                  ? "bg-gray-100 text-gray-800"
                                  : studentAttendance.status === "present"
                                  ? "bg-green-100 text-green-800"
                                  : studentAttendance.status === "absent"
                                  ? "bg-red-100 text-red-800"
                                  : studentAttendance.status === "late"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {studentAttendance?.status || "Not marked"}
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="flex justify-center space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                                onClick={() => handleStatusChange(student.id, "present")}
                              >
                                Present
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                                onClick={() => handleStatusChange(student.id, "absent")}
                              >
                                Absent
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                                onClick={() => handleStatusChange(student.id, "late")}
                              >
                                Late
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                                onClick={() => handleStatusChange(student.id, "excused")}
                              >
                                Excused
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        No students found matching your search criteria
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

export default StudentAttendance;
