
export type UserRole = "admin" | "teacher" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AcademicYear {
  id: string;
  name: string;  // e.g., "2024-2025"
  startDate: string;  // ISO timestamp
  endDate: string;    // ISO timestamp
  status: "active" | "archived";
}

export interface Class {
  id: string;
  name: string;    // e.g., "Grade 1", "Grade 10"
  level: number;   // e.g., 1, 10
  // Adding back section for backward compatibility
  section?: string;
  students?: Student[];
  teacherId?: string;
}

export interface Section {
  id: string;
  name: string;            // e.g., "A", "Blue"
  academicYearId: string;  // reference to academicYears
  classId: string;         // reference to classes
  homeroomTeacherId?: string;  // optional reference to teachers
}

export interface Enrollment {
  id: string;
  studentId: string;      // reference to students
  academicYearId: string; // reference to academicYears
  classId: string;        // reference to classes
  sectionId: string;      // reference to sections
  enrollmentDate: string; // ISO timestamp
  withdrawalDate?: string; // ISO timestamp, optional
  status: "active" | "inactive" | "graduated" | "transferred";
}

export interface Student {
  id: string;
  name: string;
  enrollmentNo: string;
  attendancePercentage: number;
  guardianName?: string;
  guardianNumber?: string;
  address?: string;
  currentEnrollmentId?: string; // reference to enrollments
  // Adding back fields for backward compatibility
  section?: string;
  class?: string;
  grade?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  qualifications: string[];
  classes: string[];
  phoneNumber?: string;
  address?: string;
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
  enrollmentId: string;  // changed from studentId to enrollmentId
  date: string;
  status: "present" | "absent" | "late" | "excused";
  markedById: string;
  markedAt: string;
  // Adding back studentId for backward compatibility
  studentId?: string;
  classId?: string;
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
  enrollmentId: string;  // changed from studentId to enrollmentId
  marksObtained: number;
  feedback?: string;
  // Adding back studentId for backward compatibility
  studentId?: string;
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
  class?: string;
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
