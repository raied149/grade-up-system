
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, UserPlus, Mail } from "lucide-react";
import { mockTeachers } from "@/lib/mockData";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

const Teachers = () => {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Get user role from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role);
    }
  }, []);
  
  // Get unique subjects for filters
  const subjects = Array.from(new Set(mockTeachers.map(teacher => teacher.subject)));
  
  // Filter teachers based on search and filters
  const filteredTeachers = mockTeachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(search.toLowerCase()) || 
                          teacher.email.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === "all" || teacher.subject === subjectFilter;
    
    return matchesSearch && matchesSubject;
  });

  // Export teachers data to Excel
  const exportToExcel = () => {
    const exportData = filteredTeachers.map(teacher => ({
      Name: teacher.name,
      Email: teacher.email,
      Subject: teacher.subject,
      Qualifications: teacher.qualifications.join(", "),
      Classes: teacher.classes.join(", ")
    }));
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers");
    
    // Export Excel file
    XLSX.writeFile(workbook, "teachers_data.xlsx");
    
    toast.success("Teacher data exported to Excel");
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
        toast.success(`Successfully imported ${jsonData.length} teachers`);
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
            <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
            <p className="text-muted-foreground">
              View and manage teacher information
            </p>
          </div>
          {userRole === 'admin' && (
            <Link to="/add-teacher">
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add Teacher
              </Button>
            </Link>
          )}
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
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
              
              {/* Subject Filter */}
              <div className="w-full md:w-48">
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {userRole === 'admin' && (
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
              )}
              
              {/* Export Button */}
              <Button variant="outline" onClick={exportToExcel}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
            
            {/* Teachers Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Subject</th>
                    <th className="text-left py-3 px-4 font-medium">Qualifications</th>
                    <th className="text-left py-3 px-4 font-medium">Classes</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.length > 0 ? (
                    filteredTeachers.map((teacher) => (
                      <tr key={teacher.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{teacher.name}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            {teacher.email}
                          </div>
                        </td>
                        <td className="py-3 px-4">{teacher.subject}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {teacher.qualifications.map((qual, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {qual}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {teacher.classes.map((cls, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                              >
                                {cls}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">View</Button>
                          {userRole === 'admin' && (
                            <Button variant="ghost" size="sm">Edit</Button>
                          )}
                        </td>
                      </tr>
                    ))
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

export default Teachers;
