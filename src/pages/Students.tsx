
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

const Students = () => {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  
  // Get unique grades and sections for filters
  const grades = Array.from(new Set(mockStudents.map(student => student.grade)));
  const sections = Array.from(new Set(mockStudents.map(student => student.section)));
  
  // Filter students based on search and filters
  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) || 
                          student.enrollmentNo.toLowerCase().includes(search.toLowerCase());
    const matchesGrade = gradeFilter === "all" || student.grade === gradeFilter;
    const matchesSection = sectionFilter === "all" || student.section === sectionFilter;
    
    return matchesSearch && matchesGrade && matchesSection;
  });

  // Export students data to Excel
  const exportToExcel = () => {
    const exportData = filteredStudents.map(student => ({
      Name: student.name,
      "Enrollment No": student.enrollmentNo,
      Marks: student.grade,
      Section: student.section,
      Attendance: `${student.attendancePercentage}%`
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
              
              {/* Grade Filter */}
              <div className="w-full md:w-48">
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Marks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Marks</SelectItem>
                    {grades.map(grade => (
                      <SelectItem key={grade} value={grade}>
                        Marks: {grade}
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
                    <th className="text-left py-3 px-4 font-medium">Marks</th>
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
                        <td className="py-3 px-4">{student.grade}</td>
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
                          <Button variant="ghost" size="sm">View</Button>
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
