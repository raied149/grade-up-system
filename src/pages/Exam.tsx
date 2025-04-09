
import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Plus, FileEdit } from "lucide-react";
import { mockStudents } from "@/lib/mockData";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import * as XLSX from 'xlsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock exams data
const mockExams = [
  { id: "1", title: "Mid Term Exam", subject: "", date: "2025-03-15", totalMarks: 100, class: "10", type: "exam" },
  { id: "2", title: "Class Test - Mathematics", subject: "Mathematics", date: "2025-03-22", totalMarks: 50, class: "9", type: "test" },
  { id: "3", title: "Annual Exam", subject: "", date: "2025-04-10", totalMarks: 100, class: "8", type: "exam" },
  { id: "4", title: "Class Test - Science", subject: "Science", date: "2025-04-05", totalMarks: 50, class: "10", type: "test" },
  { id: "5", title: "Unit Test - English", subject: "English", date: "2025-03-28", totalMarks: 25, class: "7", type: "test" }
];

// Mock marks data
const mockMarks = [
  { id: "m1", examId: "1", studentId: "student-1", marksObtained: 85, feedback: "Good performance" },
  { id: "m2", examId: "1", studentId: "student-2", marksObtained: 72, feedback: "Can improve" },
  { id: "m3", examId: "1", studentId: "student-3", marksObtained: 91, feedback: "Excellent work" },
  { id: "m4", examId: "2", studentId: "student-1", marksObtained: 42, feedback: "Good effort" }
];

const classOptions = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const Exam = () => {
  const [activeTab, setActiveTab] = useState<"exams" | "tests">("exams");
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [marksData, setMarksData] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Filter exams/tests based on search, class filter, and type
  const filteredItems = mockExams.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesClass = classFilter === "all" || item.class === classFilter;
    const matchesType = activeTab === "exams" ? item.type === "exam" : item.type === "test";
    
    return matchesSearch && matchesClass && matchesType;
  });

  // Get students for a specific class
  const getStudentsForClass = (classValue: string) => {
    return mockStudents.filter(student => student.class === classValue);
  };

  // Handle mark update
  const handleMarkUpdate = (studentId: string, mark: number) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: mark
    }));
  };

  // Handle feedback update
  const handleFeedbackUpdate = (studentId: string, text: string) => {
    setFeedback(prev => ({
      ...prev,
      [studentId]: text
    }));
  };

  // Save marks for an exam/test
  const saveMarks = () => {
    if (!selectedExam) return;
    
    // In a real app, this would send data to an API
    toast.success("Marks saved successfully");
    
    // Close the dialog
    setSelectedExam(null);
  };

  // Export marks data to Excel
  const exportMarksToExcel = () => {
    if (!selectedExam) return;
    
    const students = getStudentsForClass(selectedExam.class);
    
    const exportData = students.map(student => {
      const existingMark = mockMarks.find(m => m.examId === selectedExam.id && m.studentId === student.id);
      const currentMark = marksData[student.id] !== undefined ? marksData[student.id] : (existingMark?.marksObtained || 0);
      const currentFeedback = feedback[student.id] !== undefined ? feedback[student.id] : (existingMark?.feedback || "");
      
      return {
        "Student Name": student.name,
        "Enrollment No": student.enrollmentNo,
        "Class": student.class,
        "Section": student.section,
        "Marks": currentMark,
        "Out Of": selectedExam.totalMarks,
        "Percentage": ((currentMark / selectedExam.totalMarks) * 100).toFixed(2) + "%",
        "Feedback": currentFeedback
      };
    });
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Exam Marks");
    
    // Export Excel file
    XLSX.writeFile(workbook, `${selectedExam.title.replace(/\s+/g, '_')}_marks.xlsx`);
    
    toast.success("Marks data exported to Excel");
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Test & Exam</h1>
            <p className="text-muted-foreground">
              Manage student tests and exams
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
        
        <Tabs defaultValue="exams" value={activeTab} onValueChange={(value) => setActiveTab(value as "exams" | "tests")}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="exams">Exams</TabsTrigger>
              <TabsTrigger value="tests">Tests</TabsTrigger>
            </TabsList>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search ${activeTab}...`}
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
                      <SelectValue placeholder="Filter by class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classOptions.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          Class {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Export Button */}
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              
              <TabsContent value="exams" className="pt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length > 0 ? (
                      filteredItems.map((exam) => (
                        <TableRow key={exam.id}>
                          <TableCell className="font-medium">{exam.title}</TableCell>
                          <TableCell>{exam.date}</TableCell>
                          <TableCell>Class {exam.class}</TableCell>
                          <TableCell>{exam.totalMarks}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedExam(exam)}
                            >
                              <FileEdit className="h-4 w-4 mr-2" />
                              Manage Marks
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No exams found matching your search criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="tests" className="pt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length > 0 ? (
                      filteredItems.map((test) => (
                        <TableRow key={test.id}>
                          <TableCell className="font-medium">{test.title}</TableCell>
                          <TableCell>{test.subject}</TableCell>
                          <TableCell>{test.date}</TableCell>
                          <TableCell>Class {test.class}</TableCell>
                          <TableCell>{test.totalMarks}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedExam(test)}
                            >
                              <FileEdit className="h-4 w-4 mr-2" />
                              Manage Marks
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No tests found matching your search criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
        
        {/* Exam/Test Marks Management Dialog */}
        {selectedExam && (
          <Dialog open={!!selectedExam} onOpenChange={(open) => !open && setSelectedExam(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  Manage Marks: {selectedExam.title}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Class {selectedExam.class}</p>
                    <p className="text-sm text-muted-foreground">Total Marks: {selectedExam.totalMarks}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={exportMarksToExcel}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Marks
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Enrollment No</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Feedback</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getStudentsForClass(selectedExam.class).map((student) => {
                        const existingMark = mockMarks.find(
                          m => m.examId === selectedExam.id && m.studentId === student.id
                        );
                        
                        const studentMark = marksData[student.id] !== undefined 
                          ? marksData[student.id]
                          : (existingMark?.marksObtained || 0);
                          
                        const studentFeedback = feedback[student.id] !== undefined 
                          ? feedback[student.id] 
                          : (existingMark?.feedback || "");
                        
                        return (
                          <TableRow key={student.id}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.enrollmentNo}</TableCell>
                            <TableCell>{student.section}</TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                min="0" 
                                max={selectedExam.totalMarks}
                                value={studentMark} 
                                onChange={(e) => handleMarkUpdate(student.id, parseInt(e.target.value) || 0)}
                                className="w-20"
                              />
                              <span className="ml-2 text-xs text-muted-foreground">/ {selectedExam.totalMarks}</span>
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={studentFeedback} 
                                onChange={(e) => handleFeedbackUpdate(student.id, e.target.value)}
                                placeholder="Add feedback"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedExam(null)}>Cancel</Button>
                <Button onClick={saveMarks}>Save Marks</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Add New Test/Exam Dialog */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Test/Exam</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Tabs defaultValue="exam" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="exam">Exam</TabsTrigger>
                  <TabsTrigger value="test">Test</TabsTrigger>
                </TabsList>
                <TabsContent value="exam" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label htmlFor="examName" className="text-sm font-medium">Exam Name</label>
                    <Input id="examName" placeholder="e.g. Mid Term Exam" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="examClass" className="text-sm font-medium">Class</label>
                      <Select>
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
                    <div className="space-y-2">
                      <label htmlFor="examMarks" className="text-sm font-medium">Max Marks</label>
                      <Input id="examMarks" type="number" placeholder="e.g. 100" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="examDate" className="text-sm font-medium">Exam Date</label>
                    <Input id="examDate" type="date" />
                  </div>
                </TabsContent>
                <TabsContent value="test" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label htmlFor="testName" className="text-sm font-medium">Test Name</label>
                    <Input id="testName" placeholder="e.g. Class Test - Mathematics" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="testSubject" className="text-sm font-medium">Subject</label>
                      <Input id="testSubject" placeholder="e.g. Mathematics" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="testMarks" className="text-sm font-medium">Max Marks</label>
                      <Input id="testMarks" type="number" placeholder="e.g. 50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="testClass" className="text-sm font-medium">Class</label>
                      <Select>
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
                    <div className="space-y-2">
                      <label htmlFor="testDate" className="text-sm font-medium">Test Date</label>
                      <Input id="testDate" type="date" />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success("New test/exam added successfully");
                setIsAddModalOpen(false);
              }}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Exam;
