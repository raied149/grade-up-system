
export type UserRole = "admin" | "teacher" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Class {
  id: string;
  name: string;
  section: string;
  teacherId: string;
  students: Student[];
}

export interface Student {
  id: string;
  name: string;
  section: string;
  grade: string;  // Will display as "marks" but keeping the property name for compatibility
  enrollmentNo: string;
  attendancePercentage: number;
  guardianName?: string;
  guardianNumber?: string;
  address?: string;
  class?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  qualifications: string[];
  classes: string[];
  phoneNumber?: string;  // Added phone number field
  address?: string;      // Added address field
}

export interface TeacherAttendance {
  id: string;
  teacherId: string;
  date: string;
  status: "present" | "absent" | "late" | "leave";
  checkInTime?: string;
  checkOutTime?: string;
}

export interface StudentAttendance {
  id: string;
  studentId: string;
  date: string;
  classId: string;
  status: "present" | "absent" | "late" | "excused";
  markedById: string;
  markedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  assignedBy: string;
  assignedTo: string[];
  status: "pending" | "completed" | "overdue";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  date: string;
  totalMarks: number;
  class?: string;
  type: "test" | "exam";
}

export interface Mark {
  id: string;
  examId: string;
  studentId: string;
  marksObtained: number;
  feedback?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  type: "class" | "exam" | "meeting" | "holiday" | "task" | "test" | "occasion";
  description?: string;
  assignedTeachers?: string[];
  maxMarks?: number;
  subject?: string;
  class?: string; // Adding class property to fix type errors
}

export interface AttendanceSummary {
  date: string;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  total: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  status: "paid" | "not_paid" | "partial";
  paidAmount?: number;
  pendingAmount?: number;
  paidDate?: string;
  description?: string;
}

export interface TimeTableEntry {
  id: string;
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId: string;
  classId: string;
  section: string;
}

export interface TimeTableDay {
  isHoliday: boolean;
  periods: TimeTableEntry[];
}

export interface TimeTable {
  id: string;
  classId: string;
  section: string;
  days: Record<string, TimeTableDay>;
}
