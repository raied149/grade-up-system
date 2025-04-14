
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

const classOptions = [
  "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"
];

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
    section: "",
    class: "LKG",
    guardianName: "",
    guardianNumber: "",
    address: ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || !formData.enrollmentNo || !formData.section || !formData.class) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Create student object
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      name: formData.name,
      enrollmentNo: formData.enrollmentNo,
      section: formData.section, // We've added section back to Student type
      class: formData.class, // We've added class back to Student type
      attendancePercentage: 100, // Default value for new student
      guardianName: formData.guardianName,
      guardianNumber: formData.guardianNumber,
      address: formData.address
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
      Class: formData.class,
      Section: formData.section,
      "Guardian Name": formData.guardianName,
      "Guardian Number": formData.guardianNumber,
      Address: formData.address
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
            class: firstStudent.Class || "LKG",
            section: firstStudent.Section || "",
            guardianName: firstStudent["Guardian Name"] || "",
            guardianNumber: firstStudent["Guardian Number"] || "",
            address: firstStudent.Address || ""
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
                  <Label htmlFor="class">Class</Label>
                  <Select 
                    value={formData.class}
                    onValueChange={(value) => setFormData({...formData, class: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classOptions.map(option => (
                        <SelectItem key={option} value={option}>
                          Class {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    placeholder="e.g. A, B, C"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianName">Guardian Name</Label>
                  <Input
                    id="guardianName"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleChange}
                    placeholder="Guardian's full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="guardianNumber">Guardian Phone Number</Label>
                  <Input
                    id="guardianNumber"
                    name="guardianNumber"
                    value={formData.guardianNumber}
                    onChange={handleChange}
                    placeholder="e.g. +1234567890"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Student's residential address"
                />
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
