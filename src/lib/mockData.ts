import { 
  User, 
  Student, 
  Teacher, 
  Class, 
  TeacherAttendance, 
  StudentAttendance,
  Task,
  CalendarEvent,
  AttendanceSummary
} from './types';

export const mockUsers: User[] = [
  { 
    id: "admin1", 
    name: "Sarah Johnson", 
    email: "admin@school.edu", 
    role: "admin",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  { 
    id: "teacher1", 
    name: "Michael Brown", 
    email: "michael.brown@school.edu", 
    role: "teacher",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  }
];

export const mockStudents: Student[] = [
  {
    id: "student1",
    name: "Alex Wong",
    class: "LKG",
    section: "A",
    enrollmentNo: "EN001",
    guardianName: "David Wong",
    guardianNumber: "1234567890",
    address: "123 Main St",
    attendancePercentage: 92
  },
  {
    id: "student2",
    name: "Sophia Martinez",
    class: "UKG",
    section: "B",
    enrollmentNo: "EN002",
    guardianName: "Maria Martinez",
    guardianNumber: "9876543210",
    address: "456 Oak Ave",
    attendancePercentage: 88
  },
  {
    id: "student3",
    name: "Ryan Patel",
    class: "1",
    section: "A",
    enrollmentNo: "EN003",
    guardianName: "Priya Patel",
    guardianNumber: "5554443333",
    address: "789 Pine Rd",
    attendancePercentage: 95
  },
  {
    id: "student4",
    name: "Emma Thompson",
    class: "2",
    section: "C",
    enrollmentNo: "EN004",
    guardianName: "James Thompson",
    guardianNumber: "1112223333",
    address: "321 Elm St",
    attendancePercentage: 90
  },
  {
    id: "student5",
    name: "Mohammed Ahmed",
    class: "3",
    section: "B",
    enrollmentNo: "EN005",
    guardianName: "Fatima Ahmed",
    guardianNumber: "7778889999",
    address: "654 Maple Dr",
    attendancePercentage: 87
  }
];

export const mockTeachers: Teacher[] = [
  {
    id: "teacher1",
    name: "Michael Brown",
    email: "michael.brown@school.edu",
    subject: "Mathematics",
    qualifications: ["M.Sc. Mathematics", "B.Ed"],
    classes: ["LKG-A", "UKG-B"]
  },
  {
    id: "teacher2",
    name: "Emily Davis",
    email: "emily.davis@school.edu",
    subject: "Science",
    qualifications: ["Ph.D. Physics", "M.Ed"],
    classes: ["1-A", "2-C"]
  }
];

export const mockClasses: Class[] = [
  {
    id: "LKG-A",
    name: "Lower Kindergarten",
    section: "A",
    teacherId: "teacher1",
    students: mockStudents.filter(s => s.class === "LKG" && s.section === "A")
  },
  {
    id: "UKG-B",
    name: "Upper Kindergarten",
    section: "B",
    teacherId: "teacher1",
    students: mockStudents.filter(s => s.class === "UKG" && s.section === "B")
  },
  {
    id: "1-A",
    name: "Class 1",
    section: "A",
    teacherId: "teacher2",
    students: mockStudents.filter(s => s.class === "1" && s.section === "A")
  }
];

export const mockTeacherAttendance: TeacherAttendance[] = [
  {
    id: "ta1",
    teacherId: "teacher1",
    date: "2024-01-15",
    status: "present",
    checkInTime: "08:30",
    checkOutTime: "16:30"
  },
  {
    id: "ta2",
    teacherId: "teacher2",
    date: "2024-01-15",
    status: "present",
    checkInTime: "08:15",
    checkOutTime: "16:45"
  }
];

export const mockStudentAttendance: StudentAttendance[] = [
  {
    id: "sa1",
    studentId: "student1",
    date: "2024-01-15",
    status: "present",
    markedById: "teacher1",
    markedAt: "2024-01-15T08:45:00Z"
  },
  {
    id: "sa2",
    studentId: "student2",
    date: "2024-01-15",
    status: "present",
    markedById: "teacher1",
    markedAt: "2024-01-15T08:45:00Z"
  },
  {
    id: "sa3",
    studentId: "student3",
    date: "2024-01-15",
    status: "present",
    markedById: "teacher1",
    markedAt: "2024-01-15T08:45:00Z"
  },
  {
    id: "sa4",
    studentId: "student4",
    date: "2024-01-15",
    status: "present",
    markedById: "teacher1",
    markedAt: "2024-01-15T08:45:00Z"
  },
  {
    id: "sa5",
    studentId: "student5",
    date: "2024-01-15",
    status: "present",
    markedById: "teacher1",
    markedAt: "2024-01-15T08:45:00Z"
  }
];

export const mockTasks: Task[] = [
  {
    id: "task1",
    title: "Prepare Term Exams",
    description: "Create term exam papers for LKG and UKG",
    dueDate: "2024-02-01",
    assignedBy: "admin1",
    assignedTo: ["teacher1"],
    status: "pending",
    priority: "high",
    createdAt: "2024-01-10T10:30:00Z",
    updatedAt: "2024-01-10T10:30:00Z"
  }
];

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "event1",
    title: "LKG-A Mathematics Class",
    start: "2024-01-16T08:30:00",
    end: "2024-01-16T09:30:00",
    allDay: false,
    type: "class",
    description: "Regular mathematics class"
  }
];

export const mockAttendanceSummaries: AttendanceSummary[] = [
  {
    date: "2024-01-15",
    presentCount: 45,
    absentCount: 3,
    lateCount: 2,
    excusedCount: 1,
    total: 51
  }
];

// Helper functions
export const login = (email: string, password: string): User | null => {
  const user = mockUsers.find(u => u.email === email);
  return user || null;
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getClassById = (id: string): Class | undefined => {
  return mockClasses.find(classItem => classItem.id === id);
};

export const getTeacherById = (id: string): Teacher | undefined => {
  return mockTeachers.find(teacher => teacher.id === id);
};

export const getStudentById = (id: string): Student | undefined => {
  return mockStudents.find(student => student.id === id);
};