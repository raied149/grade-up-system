import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStudentById } from "@/lib/mockData";
import { Student, Fee } from "@/lib/types";

const Fees = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [currentFee, setCurrentFee] = useState<Fee | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Mock data for students
    const mockStudents: Student[] = [
      {
        id: "student1",
        name: "Alex Johnson",
        enrollmentNo: "ENR123",
        attendancePercentage: 90,
      },
      {
        id: "student2",
        name: "Emily Smith",
        enrollmentNo: "ENR456",
        attendancePercentage: 85,
      },
    ];

    // Mock data for fees
    const mockFees: Fee[] = [
      {
        id: "fee1",
        studentId: "student1",
        amount: 500,
        dueDate: "2024-07-15",
        status: "not_paid",
      },
      {
        id: "fee2",
        studentId: "student2",
        amount: 600,
        dueDate: "2024-07-20",
        status: "partial",
        paidAmount: 300,
        pendingAmount: 300,
        paidDate: "2024-07-10",
      },
    ];

    setStudents(mockStudents);
    setFees(mockFees);
  }, []);

  const handleStudentSelect = (studentId: string) => {
    const student = getStudentById(studentId);
    setSelectedStudent(student || null);
  };

  const handleAddFee = () => {
    setShowAddModal(true);
  };

  const handleSaveFee = () => {
    if (!selectedStudent || !amount || !dueDate) return;

    const newFee: Fee = {
      id: `fee-${Date.now()}`,
      studentId: selectedStudent.id,
      amount: parseFloat(amount),
      dueDate: dueDate,
      status: "not_paid",
      description: description,
    };

    setFees((prevFees) => [...prevFees, newFee]);
    setShowAddModal(false);
    setAmount("");
    setDueDate("");
    setDescription("");
  };

  const handlePayFeeClick = (fee: Fee) => {
    setCurrentFee(fee);
    setShowPaymentModal(true);
  };

  // Fix the handlePayFee function to ensure proper typing
  const handlePayFee = () => {
    if (!currentFee || !paidAmount) return;
    
    const paid = parseFloat(paidAmount);
    const total = currentFee.amount;
    
    let newStatus: "paid" | "partial" | "not_paid";
    if (paid >= total) {
      newStatus = "paid";
    } else if (paid > 0) {
      newStatus = "partial";
    } else {
      newStatus = "not_paid";
    }
    
    const updatedFee: Fee = {
      ...currentFee,
      paidAmount: paid,
      pendingAmount: total - paid,
      paidDate: new Date().toISOString(),
      status: newStatus
    };
    
    setFees(prev => prev.map(f => f.id === currentFee.id ? updatedFee : f));
    setShowPaymentModal(false);
    setPaidAmount("");
    setCurrentFee(null);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Fees Management</h1>

        {/* Student Selection */}
        <div className="mb-4">
          <Label htmlFor="student">Select Student:</Label>
          <select
            id="student"
            className="w-full p-2 border rounded"
            onChange={(e) => handleStudentSelect(e.target.value)}
          >
            <option value="">Select a student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.enrollmentNo})
              </option>
            ))}
          </select>
        </div>

        {/* Add Fee Button */}
        <Button onClick={handleAddFee} className="mb-4">
          Add Fee
        </Button>

        {/* Fees Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Student</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Due Date</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee.id}>
                  <td className="p-2 border">
                    {getStudentById(fee.studentId)?.name}
                  </td>
                  <td className="p-2 border">{fee.amount}</td>
                  <td className="p-2 border">{fee.dueDate}</td>
                  <td className="p-2 border">{fee.status}</td>
                  <td className="p-2 border">
                    <Button onClick={() => handlePayFeeClick(fee)}>
                      Pay Fee
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Fee Modal */}
        {showAddModal && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-4 rounded">
              <h2 className="text-xl font-bold mb-2">Add New Fee</h2>
              <div className="mb-2">
                <Label htmlFor="amount">Amount:</Label>
                <Input
                  type="number"
                  id="amount"
                  className="w-full p-2 border rounded"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <Label htmlFor="dueDate">Due Date:</Label>
                <Input
                  type="date"
                  id="dueDate"
                  className="w-full p-2 border rounded"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <Label htmlFor="description">Description:</Label>
                <Input
                  type="text"
                  id="description"
                  className="w-full p-2 border rounded"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveFee} className="mr-2">
                Save
              </Button>
              <Button onClick={() => setShowAddModal(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-4 rounded">
              <h2 className="text-xl font-bold mb-2">Pay Fee</h2>
              <p className="mb-2">
                Amount: {currentFee?.amount}, Due Date: {currentFee?.dueDate}
              </p>
              <div className="mb-2">
                <Label htmlFor="paidAmount">Paid Amount:</Label>
                <Input
                  type="number"
                  id="paidAmount"
                  className="w-full p-2 border rounded"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                />
              </div>
              <Button onClick={handlePayFee} className="mr-2">
                Pay
              </Button>
              <Button onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Fees;
