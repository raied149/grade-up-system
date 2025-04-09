
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import TeacherAttendance from "./pages/TeacherAttendance";
import StudentAttendance from "./pages/StudentAttendance";
import Calendar from "./pages/Calendar";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AddStudent from "./pages/AddStudent";
import AddTeacher from "./pages/AddTeacher";
import SignUp from "./pages/SignUp";
import Fees from "./pages/Fees";
import Exam from "./pages/Exam";
import TimeTable from "./pages/TimeTable";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teacher-attendance" element={<TeacherAttendance />} />
          <Route path="/student-attendance" element={<StudentAttendance />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/students" element={<Students />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/add-student" element={<AddStudent />} />
          <Route path="/add-teacher" element={<AddTeacher />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/timetable" element={<TimeTable />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
