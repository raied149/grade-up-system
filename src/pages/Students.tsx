
import React, { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, UserPlus } from "lucide-react";
import { mockStudents } from "@/lib/mockData";
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Students = () => {
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  // Get unique classes and sections for filters
  const classes = Array.from(new Set(mockStudents.map(student => student.class || "Unknown")));
  const sections = Array.from(new Set(mockStudents.map(student => student.section)));
  
  // Filter students based on search and filters
  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) || 
                        student.enrollmentNo.toLowerCase().includes(search.toLowerCase());
    const matchesClass = classFilter === "all" || student.class === classFilter;
    const matchesSection = sectionFilter === "all" || student.section === sectionFilter;
    
    return matchesSearch && matchesClass && matchesSection;
  });

  // Mock data for student details dialog
  const mockStudentMarks = [
    { id: 1, test: "Mid Term Exam", subject: "Mathematics", marks: 85, maxMarks: 100, date: "2025-02-15" },
    { id: 2, test: "Class Test", subject: "Science", marks: 42, maxMarks: 50, date: "2025-03-10" },
    { id: 3, test: "Annual Exam", subject: "English", marks: 72, maxMarks: 100, date: "2025-04-05" }
  ];
  
  const mockStudentAttendance = [
    { id: 1, date: "2025-04-01", status: "present" },
    { id: 2, date: "2025-04-02", status: "present" },
    { id: 3, date: "2025-04-03", status: "absent" },
    { id: 4, date: "2025-04-04", status: "present" },
    { id: 5, date: "2025-04-05", status: "present" }
  ];

  // Export students data to Excel
  const exportToExcel = () => {
    const exportData = filteredStudents.map(student => ({
      Name: student.name,
      "Enrollment No": student.enrollmentNo,
      Class: student.class || "Not Specified",
      Section: student.section,
      Attendance: `${student.attendancePercentage}%`,
      "Guardian Name": student.guardianName || "",
      "Guardian Number": student.guardianNumber || "",
      "Address": student.address || ""
    }));
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    
    // Export Excel file
    XLSX.writeFile(workbook, "students_data.xlsx");
    
    toast.success("Student data exported to Excel");
  };
  
  // Handle Excel file import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // In a real app, we would process this data and add to database
        console.log("Imported data:", jsonData);
        toast.success(`Successfully imported ${jsonData.length} students`);
      } catch (error) {
        toast.error("Error importing file. Please check the format.");
        console.error("Import error:", error);
      }
    };
    reader.readAsBinaryString(file);
  };
  
  // View student details
  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">
              View and manage student information
            </p>
          </div>
          <Link to="/add-student">
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Student
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
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
              
              {/* Class Filter */}
              <div className="w-full md:w-48">
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map(cls => (
                      <SelectItem key={cls} value={cls || "Unknown"}>
                        {cls ? `Class ${cls}` : "Unknown"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Section Filter */}
              <div className="w-full md:w-48">
                <Select value={sectionFilter} onValueChange={setSectionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {sections.map(section => (
                      <SelectItem key={section} value={section}>
                        Section {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Import Button */}
              <div className="w-full md:w-48">
                <label htmlFor="import-excel" className="cursor-pointer">
                  <div className="flex items-center justify-center w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                    <span className="text-sm font-medium">Import Excel</span>
                  </div>
                  <input
                    id="import-excel"
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={handleFileImport}
                  />
                </label>
              </div>
              
              {/* Export Button */}
              <Button variant="outline" onClick={exportToExcel}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
            
            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Enrollment No</th>
                    <th className="text-left py-3 px-4 font-medium">Class</th>
                    <th className="text-left py-3 px-4 font-medium">Section</th>
                    <th className="text-left py-3 px-4 font-medium">Attendance</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{student.name}</td>
                        <td className="py-3 px-4">{student.enrollmentNo}</td>
                        <td className="py-3 px-4">{student.class || "Not Specified"}</td>
                        <td className="py-3 px-4">{student.section}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  student.attendancePercentage >= 90 ? "bg-green-600" :
                                  student.attendancePercentage >= 75 ? "bg-yellow-400" :
                                  "bg-red-600"
                                }`}
                                style={{ width: `${student.attendancePercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{student.attendancePercentage}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => handleViewStudent(student)}>View</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Student Details</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold">Basic Information</h3>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Name</p>
                                      <p className="font-medium">{student.name}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Enrollment No</p>
                                      <p className="font-medium">{student.enrollmentNo}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Class</p>
                                      <p className="font-medium">{student.class || "Not Specified"}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Section</p>
                                      <p className="font-medium">{student.section}</p>
                                    </div>
                                  </div>
                                  
                                  <h3 className="text-lg font-semibold pt-2">Guardian Details</h3>
                                  <div className="grid grid-cols-1 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Guardian Name</p>
                                      <p className="font-medium">{student.guardianName || "Not Provided"}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Guardian Phone</p>
                                      <p className="font-medium">{student.guardianNumber || "Not Provided"}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Address</p>
                                      <p className="font-medium">{student.address || "Not Provided"}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Marks & Attendance */}
                                <div className="space-y-6">
                                  <div>
                                    <h3 className="text-lg font-semibold mb-4">Test & Exam Marks</h3>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Test Name</TableHead>
                                          <TableHead>Subject</TableHead>
                                          <TableHead>Marks</TableHead>
                                          <TableHead>Date</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {mockStudentMarks.map((mark) => (
                                          <TableRow key={mark.id}>
                                            <TableCell>{mark.test}</TableCell>
                                            <TableCell>{mark.subject}</TableCell>
                                            <TableCell>{mark.marks}/{mark.maxMarks}</TableCell>
                                            <TableCell>{mark.date}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                  
                                  <div>
                                    <h3 className="text-lg font-semibold mb-4">Recent Attendance</h3>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Date</TableHead>
                                          <TableHead>Status</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {mockStudentAttendance.map((record) => (
                                          <TableRow key={record.id}>
                                            <TableCell>{record.date}</TableCell>
                                            <TableCell>
                                              <span className={`capitalize ${
                                                record.status === "present" ? "text-green-600" :
                                                record.status === "absent" ? "text-red-600" : "text-yellow-600"
                                              }`}>
                                                {record.status}
                                              </span>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                    
                                    <div className="mt-4">
                                      <p className="text-sm text-muted-foreground">Overall Attendance</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                          <div 
                                            className={`h-2.5 rounded-full ${
                                              student.attendancePercentage >= 90 ? "bg-green-600" :
                                              student.attendancePercentage >= 75 ? "bg-yellow-400" :
                                              "bg-red-600"
                                            }`}
                                            style={{ width: `${student.attendancePercentage}%` }}
                                          ></div>
                                        </div>
                                        <span className="font-medium">{student.attendancePercentage}%</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
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

export default Students;
