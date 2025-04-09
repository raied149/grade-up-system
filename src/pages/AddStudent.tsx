
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Student, User } from "@/lib/types";
import * as XLSX from 'xlsx';

const AddStudent = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    // Check user role for access control
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role);
      
      // If not admin or teacher, redirect to dashboard
      if (user.role !== 'admin' && user.role !== 'teacher') {
        toast.error("You don't have permission to access this page");
        navigate("/dashboard");
      }
    } else {
      // If no user found, redirect to login
      navigate("/");
    }
  }, [navigate]);
  
  const [formData, setFormData] = useState({
    name: "",
    enrollmentNo: "",
    section: "A",
    marks: "",
    testType: {
      name: "",
      maxMarks: 100
    }
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleTestTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      testType: {
        ...prevState.testType,
        [name]: name === "maxMarks" ? parseInt(value) : value
      }
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || !formData.enrollmentNo || !formData.section || !formData.marks || 
        !formData.testType.name) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Create student object
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      name: formData.name,
      enrollmentNo: formData.enrollmentNo,
      section: formData.section,
      grade: formData.marks, // We use marks as grade
      attendancePercentage: 100, // Default value for new student
      testType: {
        name: formData.testType.name,
        maxMarks: formData.testType.maxMarks
      }
    };
    
    // In a real app, we would send this to an API
    // For now, just show success message and navigate back
    toast.success(`Student ${formData.name} added successfully`);
    navigate("/students");
  };

  const exportToExcel = () => {
    // Create a sample worksheet with the student data
    const worksheet = XLSX.utils.json_to_sheet([{
      Name: formData.name,
      "Enrollment No": formData.enrollmentNo,
      Section: formData.section,
      Marks: formData.marks,
      "Test Name": formData.testType.name,
      "Max Marks": formData.testType.maxMarks
    }]);
    
    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    
    // Generate an Excel file
    XLSX.writeFile(workbook, "student_data.xlsx");
    
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
        
        if (jsonData.length > 0) {
          // Display first student data as an example
          const firstStudent = jsonData[0] as any;
          setFormData({
            name: firstStudent.Name || "",
            enrollmentNo: firstStudent["Enrollment No"] || "",
            section: firstStudent.Section || "A",
            marks: firstStudent.Marks?.toString() || "",
            testType: {
              name: firstStudent["Test Name"] || "",
              maxMarks: parseInt(firstStudent["Max Marks"]) || 100
            }
          });
          
          toast.success(`Successfully imported ${jsonData.length} students. First student loaded in form.`);
        }
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
          <p className="text-muted-foreground">
            Enter student information to add them to the system
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="flex justify-end mb-4">
                <label htmlFor="import-excel" className="cursor-pointer">
                  <div className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                    <span className="text-sm font-medium">Import from Excel</span>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="enrollmentNo">Enrollment No</Label>
                  <Input
                    id="enrollmentNo"
                    name="enrollmentNo"
                    value={formData.enrollmentNo}
                    onChange={handleChange}
                    placeholder="e.g. EN12345"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Select 
                    value={formData.section}
                    onValueChange={(value) => setFormData({...formData, section: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Section A</SelectItem>
                      <SelectItem value="B">Section B</SelectItem>
                      <SelectItem value="C">Section C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="marks">Marks</Label>
                  <Input
                    id="marks"
                    name="marks"
                    value={formData.marks}
                    onChange={handleChange}
                    placeholder="e.g. 85"
                    type="number"
                    required
                  />
                </div>
              </div>
              
              <div className="border p-4 rounded-md space-y-4">
                <h3 className="font-medium">Test Type</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="testName">Test Name</Label>
                    <Input
                      id="testName"
                      name="name"
                      value={formData.testType.name}
                      onChange={handleTestTypeChange}
                      placeholder="e.g. Mid Term Exam"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxMarks">Max Marks</Label>
                    <Input
                      id="maxMarks"
                      name="maxMarks"
                      value={formData.testType.maxMarks}
                      onChange={handleTestTypeChange}
                      placeholder="e.g. 100"
                      type="number"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate("/students")}>Cancel</Button>
              <div className="space-x-2">
                <Button variant="outline" type="button" onClick={exportToExcel}>Export to Excel</Button>
                <Button type="submit">Add Student</Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddStudent;
