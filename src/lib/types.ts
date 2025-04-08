
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
  grade: string;
  enrollmentNo: string;
  attendancePercentage: number;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  qualifications: string[];
  classes: string[];
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
  type: "class" | "exam" | "meeting" | "holiday" | "task";
  description?: string;
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
