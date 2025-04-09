
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Teacher } from "@/lib/types";
import * as XLSX from 'xlsx';

const AddTeacher = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    qualifications: "",
    classes: "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || !formData.email || !formData.subject) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Create teacher object
    const newTeacher: Teacher = {
      id: `teacher-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      qualifications: formData.qualifications.split(',').map(q => q.trim()),
      classes: formData.classes.split(',').map(c => c.trim()),
    };
    
    // In a real app, we would send this to an API
    // For now, just show success message and navigate back
    toast.success(`Teacher ${formData.name} added successfully`);
    navigate("/teachers");
  };

  const exportToExcel = () => {
    // Create a sample worksheet with the teacher data
    const worksheet = XLSX.utils.json_to_sheet([{
      Name: formData.name,
      Email: formData.email,
      Subject: formData.subject,
      Qualifications: formData.qualifications,
      Classes: formData.classes
    }]);
    
    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers");
    
    // Generate an Excel file
    XLSX.writeFile(workbook, "teacher_data.xlsx");
    
    toast.success("Teacher data exported to Excel");
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Teacher</h1>
          <p className="text-muted-foreground">
            Enter teacher information to add them to the system
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Teacher Information</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Mathematics"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="qualifications">
                  Qualifications (comma separated)
                </Label>
                <Input
                  id="qualifications"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  placeholder="e.g. B.Ed, M.Sc Mathematics"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="classes">Classes (comma separated)</Label>
                <Input
                  id="classes"
                  name="classes"
                  value={formData.classes}
                  onChange={handleChange}
                  placeholder="e.g. 9A, 10B, 11A"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate("/teachers")}>Cancel</Button>
              <div className="space-x-2">
                <Button variant="outline" type="button" onClick={exportToExcel}>Export to Excel</Button>
                <Button type="submit">Add Teacher</Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddTeacher;
