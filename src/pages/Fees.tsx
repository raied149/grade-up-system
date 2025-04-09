
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, MoreVertical, Plus, Upload } from "lucide-react";
import { mockStudents } from "@/lib/mockData";
import { Fee, User } from "@/lib/types";
import * as XLSX from 'xlsx';

// Mock fees data
const initialFees: Fee[] = [
  {
    id: "fee-1",
    studentId: "student-1",
    amount: 5000,
    dueDate: "2025-05-01",
    status: "paid",
    paidAmount: 5000,
    pendingAmount: 0,
    paidDate: "2025-04-05",
    description: "Tuition Fee - May 2025"
  },
  {
    id: "fee-2",
    studentId: "student-2",
    amount: 5000,
    dueDate: "2025-05-01",
    status: "not_paid",
    pendingAmount: 5000,
    description: "Tuition Fee - May 2025"
  },
  {
    id: "fee-3",
    studentId: "student-3",
    amount: 5000,
    dueDate: "2025-05-01",
    status: "partial",
    paidAmount: 2500,
    pendingAmount: 2500,
    paidDate: "2025-04-07",
    description: "Tuition Fee - May 2025"
  }
];

const Fees = () => {
  const [fees, setFees] = useState<Fee[]>(initialFees);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddFeeDialogOpen, setIsAddFeeDialogOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isPartialPaymentDialogOpen, setIsPartialPaymentDialogOpen] = useState<boolean>(false);
  const [currentFee, setCurrentFee] = useState<Fee | null>(null);
  const [partialAmount, setPartialAmount] = useState<string>("");
  
  const [newFee, setNewFee] = useState<{
    studentId: string;
    amount: string;
    dueDate: string;
    description: string;
  }>({
    studentId: "",
    amount: "",
    dueDate: "",
    description: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Filter and search fees
  const filteredFees = fees.filter(fee => {
    const student = mockStudents.find(s => s.id === fee.studentId);
    const matchesSearch = student && student.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    return fee.status === filter && matchesSearch;
  });

  // Get student name by ID
  const getStudentName = (studentId: string) => {
    const student = mockStudents.find(s => s.id === studentId);
    return student ? student.name : "Unknown Student";
  };

  // Handle adding a new fee
  const handleAddFee = () => {
    const amount = parseFloat(newFee.amount);
    const newFeeRecord: Fee = {
      id: `fee-${Date.now()}`,
      studentId: newFee.studentId,
      amount: amount,
      dueDate: newFee.dueDate,
      status: "not_paid",
      pendingAmount: amount,
      description: newFee.description
    };
    
    setFees([...fees, newFeeRecord]);
    toast.success("Fee added successfully");
    setIsAddFeeDialogOpen(false);
    
    // Reset form
    setNewFee({
      studentId: "",
      amount: "",
      dueDate: "",
      description: ""
    });
  };

  // Handle updating fee status
  const handleUpdateFeeStatus = (feeId: string, newStatus: "paid" | "not_paid" | "partial") => {
    if (newStatus === "partial") {
      const fee = fees.find(f => f.id === feeId);
      if (fee) {
        setCurrentFee(fee);
        setPartialAmount("");
        setIsPartialPaymentDialogOpen(true);
      }
    } else {
      const updatedFees = fees.map(fee => {
        if (fee.id === feeId) {
          const now = new Date().toISOString().split('T')[0];
          
          if (newStatus === "paid") {
            return {
              ...fee,
              status: newStatus,
              paidAmount: fee.amount,
              pendingAmount: 0,
              paidDate: now
            };
          } else {
            return {
              ...fee,
              status: newStatus,
              paidAmount: undefined,
              pendingAmount: fee.amount,
              paidDate: undefined
            };
          }
        }
        return fee;
      });
      
      setFees(updatedFees);
      toast.success("Fee status updated");
    }
  };

  // Handle partial payment submission
  const handlePartialPaymentSubmit = () => {
    if (!currentFee || !partialAmount) return;
    
    const paidAmount = parseFloat(partialAmount);
    
    // Validate paid amount
    if (isNaN(paidAmount) || paidAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (paidAmount > currentFee.amount) {
      toast.error("Paid amount cannot be greater than total amount");
      return;
    }
    
    const now = new Date().toISOString().split('T')[0];
    const pendingAmount = currentFee.amount - paidAmount;
    
    const updatedFees = fees.map(fee => {
      if (fee.id === currentFee.id) {
        return {
          ...fee,
          status: paidAmount === currentFee.amount ? "paid" : "partial",
          paidAmount: paidAmount,
          pendingAmount: pendingAmount,
          paidDate: now
        };
      }
      return fee;
    });
    
    setFees(updatedFees);
    toast.success(`Partial payment of $${paidAmount.toFixed(2)} recorded`);
    setIsPartialPaymentDialogOpen(false);
    setCurrentFee(null);
  };

  // Export fees data to Excel
  const exportFeesToExcel = () => {
    const dataToExport = fees.map(fee => {
      const student = mockStudents.find(s => s.id === fee.studentId);
      return {
        "Student Name": student ? student.name : "Unknown",
        "Amount": fee.amount,
        "Due Date": fee.dueDate,
        "Status": fee.status === "paid" ? "Paid" : fee.status === "partial" ? "Partially Paid" : "Not Paid",
        "Paid Amount": fee.paidAmount || "",
        "Pending Amount": fee.pendingAmount || "",
        "Paid Date": fee.paidDate || "",
        "Description": fee.description
      };
    });
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fees");
    XLSX.writeFile(workbook, "student_fees.xlsx");
    
    toast.success("Fees data exported to Excel");
  };

  // Import fees from Excel
  const importFeesFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Assuming the first sheet contains the data
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Process and validate the data
        const importedFees: Fee[] = jsonData.map((row: any, index) => {
          // Find student by name
          const studentName = row["Student Name"];
          const student = mockStudents.find(s => s.name === studentName);
          const amount = parseFloat(row["Amount"]) || 0;
          const paidAmount = row["Paid Amount"] ? parseFloat(row["Paid Amount"]) : undefined;
          const pendingAmount = row["Pending Amount"] ? parseFloat(row["Pending Amount"]) : (amount - (paidAmount || 0));
          
          let status: "paid" | "not_paid" | "partial";
          if (row["Status"]?.toLowerCase().includes("paid") && (paidAmount === amount || pendingAmount === 0)) {
            status = "paid";
          } else if (row["Status"]?.toLowerCase().includes("partial") || (paidAmount && paidAmount < amount)) {
            status = "partial";
          } else {
            status = "not_paid";
          }
          
          return {
            id: `fee-import-${Date.now()}-${index}`,
            studentId: student?.id || "unknown",
            amount: amount,
            dueDate: row["Due Date"] || new Date().toISOString().split('T')[0],
            status: status,
            paidAmount: paidAmount,
            pendingAmount: pendingAmount,
            paidDate: row["Paid Date"] || undefined,
            description: row["Description"] || ""
          };
        });
        
        // Filter out fees with unknown students
        const validFees = importedFees.filter(fee => fee.studentId !== "unknown");
        
        if (validFees.length === 0) {
          toast.error("No valid fee records found in the file");
          return;
        }
        
        // Add the imported fees
        setFees(prev => [...prev, ...validFees]);
        toast.success(`Successfully imported ${validFees.length} fee records`);
        
        // Show warning if some records were invalid
        if (validFees.length < importedFees.length) {
          toast.warning(`${importedFees.length - validFees.length} records were skipped due to missing or invalid student names`);
        }
      } catch (error) {
        toast.error("Failed to import data. Please ensure the file format is correct");
        console.error("Excel import error:", error);
      }
      
      // Clear the input
      event.target.value = "";
    };
    
    reader.readAsArrayBuffer(file);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Fees</h1>
            <p className="text-muted-foreground">Manage student fee payments and records</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportFeesToExcel}>
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
            
            <div>
              <Input
                type="file"
                id="excel-import"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={importFeesFromExcel}
              />
              <Button variant="outline" onClick={() => document.getElementById("excel-import")?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Import from Excel
              </Button>
            </div>
            
            <Dialog open={isAddFeeDialogOpen} onOpenChange={setIsAddFeeDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Fee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Fee</DialogTitle>
                  <DialogDescription>
                    Create a new fee record for a student
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="student">Student</Label>
                    <Select
                      value={newFee.studentId}
                      onValueChange={(value) => setNewFee({...newFee, studentId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockStudents.map(student => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newFee.amount}
                      onChange={(e) => setNewFee({...newFee, amount: e.target.value})}
                      placeholder="Enter fee amount"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newFee.dueDate}
                      onChange={(e) => setNewFee({...newFee, dueDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newFee.description}
                      onChange={(e) => setNewFee({...newFee, description: e.target.value})}
                      placeholder="Enter fee description (e.g. Tuition fee, Lab fee)"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddFeeDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleAddFee} 
                    disabled={!newFee.studentId || !newFee.amount || !newFee.dueDate}
                  >
                    Add Fee
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Partial Payment Dialog */}
        <Dialog open={isPartialPaymentDialogOpen} onOpenChange={setIsPartialPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Partial Payment</DialogTitle>
              <DialogDescription>
                Enter the amount paid by the student
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Student</Label>
                <Input
                  id="studentName"
                  value={currentFee ? getStudentName(currentFee.studentId) : ""}
                  readOnly
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Fee Amount</Label>
                <Input
                  id="totalAmount"
                  value={currentFee ? `$${currentFee.amount.toFixed(2)}` : ""}
                  readOnly
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paidAmount">Amount Being Paid</Label>
                <Input
                  id="paidAmount"
                  type="number"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder="Enter amount paid"
                  className="appearance-auto"
                />
              </div>
              
              {currentFee && parseFloat(partialAmount) > 0 && !isNaN(parseFloat(partialAmount)) && (
                <div className="space-y-2">
                  <Label htmlFor="pendingAmount">Pending Amount</Label>
                  <Input
                    id="pendingAmount"
                    value={`$${(currentFee.amount - parseFloat(partialAmount)).toFixed(2)}`}
                    readOnly
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPartialPaymentDialogOpen(false)}>Cancel</Button>
              <Button onClick={handlePartialPaymentSubmit} disabled={!partialAmount || isNaN(parseFloat(partialAmount))}>
                Record Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Fee Records</CardTitle>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Input
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partially Paid</SelectItem>
                  <SelectItem value="not_paid">Not Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Pending Amount</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.length > 0 ? (
                  filteredFees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">{getStudentName(fee.studentId)}</TableCell>
                      <TableCell>{fee.description}</TableCell>
                      <TableCell>${fee.amount.toFixed(2)}</TableCell>
                      <TableCell>{fee.dueDate}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          fee.status === "paid" 
                            ? "bg-green-100 text-green-800" 
                            : fee.status === "partial" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {fee.status === "paid" ? "Paid" : fee.status === "partial" ? "Partial" : "Not Paid"}
                        </div>
                      </TableCell>
                      <TableCell>{fee.paidAmount ? `$${fee.paidAmount.toFixed(2)}` : "—"}</TableCell>
                      <TableCell>{fee.pendingAmount ? `$${fee.pendingAmount.toFixed(2)}` : "—"}</TableCell>
                      <TableCell>{fee.paidDate || "—"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdateFeeStatus(fee.id, "paid")}>Mark as Paid</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateFeeStatus(fee.id, "partial")}>Update Partial Payment</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateFeeStatus(fee.id, "not_paid")}>Mark as Not Paid</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground p-4">
                      No fee records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Fees;
