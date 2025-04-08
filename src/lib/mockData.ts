
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
  },
  { 
    id: "teacher2", 
    name: "Emily Davis", 
    email: "emily.davis@school.edu", 
    role: "teacher",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  { 
    id: "student1", 
    name: "Alex Wong", 
    email: "alex.w@school.edu", 
    role: "student",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg"
  }
];

export const mockStudents: Student[] = [
  {
    id: "student1",
    name: "Alex Wong",
    section: "A",
    grade: "10",
    enrollmentNo: "EN10001",
    attendancePercentage: 92
  },
  {
    id: "student2",
    name: "Sophia Martinez",
    section: "A",
    grade: "10",
    enrollmentNo: "EN10002",
    attendancePercentage: 88
  },
  {
    id: "student3",
    name: "Ethan Johnson",
    section: "A",
    grade: "10",
    enrollmentNo: "EN10003",
    attendancePercentage: 95
  },
  {
    id: "student4",
    name: "Olivia Brown",
    section: "B",
    grade: "10",
    enrollmentNo: "EN10004",
    attendancePercentage: 90
  },
  {
    id: "student5",
    name: "Noah Wilson",
    section: "B",
    grade: "10",
    enrollmentNo: "EN10005",
    attendancePercentage: 85
  },
  {
    id: "student6",
    name: "Emma Taylor",
    section: "B",
    grade: "10",
    enrollmentNo: "EN10006",
    attendancePercentage: 97
  }
];

export const mockTeachers: Teacher[] = [
  {
    id: "teacher1",
    name: "Michael Brown",
    email: "michael.brown@school.edu",
    subject: "Mathematics",
    qualifications: ["M.Sc. Mathematics", "B.Ed"],
    classes: ["class1", "class2"]
  },
  {
    id: "teacher2",
    name: "Emily Davis",
    email: "emily.davis@school.edu",
    subject: "Science",
    qualifications: ["Ph.D. Physics", "M.Ed"],
    classes: ["class1", "class3"]
  },
  {
    id: "teacher3",
    name: "Robert Wilson",
    email: "robert.wilson@school.edu",
    subject: "English",
    qualifications: ["M.A. English Literature", "B.Ed"],
    classes: ["class2", "class3"]
  }
];

export const mockClasses: Class[] = [
  {
    id: "class1",
    name: "Mathematics",
    section: "A",
    teacherId: "teacher1",
    students: mockStudents.slice(0, 3)
  },
  {
    id: "class2",
    name: "Science",
    section: "B",
    teacherId: "teacher2",
    students: mockStudents.slice(3, 6)
  },
  {
    id: "class3",
    name: "English",
    section: "A",
    teacherId: "teacher3",
    students: mockStudents
  }
];

export const mockTeacherAttendance: TeacherAttendance[] = [
  {
    id: "ta1",
    teacherId: "teacher1",
    date: "2025-04-08",
    status: "present",
    checkInTime: "08:30",
    checkOutTime: "16:30"
  },
  {
    id: "ta2",
    teacherId: "teacher2",
    date: "2025-04-08",
    status: "present",
    checkInTime: "08:15",
    checkOutTime: "16:45"
  },
  {
    id: "ta3",
    teacherId: "teacher3",
    date: "2025-04-08",
    status: "absent"
  },
  {
    id: "ta4",
    teacherId: "teacher1",
    date: "2025-04-07",
    status: "present",
    checkInTime: "08:20",
    checkOutTime: "16:30"
  },
  {
    id: "ta5",
    teacherId: "teacher2",
    date: "2025-04-07",
    status: "late",
    checkInTime: "09:10",
    checkOutTime: "16:30"
  }
];

export const mockStudentAttendance: StudentAttendance[] = [
  {
    id: "sa1",
    studentId: "student1",
    date: "2025-04-08",
    classId: "class1",
    status: "present",
    markedById: "teacher1",
    markedAt: "2025-04-08T08:45:00Z"
  },
  {
    id: "sa2",
    studentId: "student2",
    date: "2025-04-08",
    classId: "class1",
    status: "absent",
    markedById: "teacher1",
    markedAt: "2025-04-08T08:45:00Z"
  },
  {
    id: "sa3",
    studentId: "student3",
    date: "2025-04-08",
    classId: "class1",
    status: "present",
    markedById: "teacher1",
    markedAt: "2025-04-08T08:45:00Z"
  },
  {
    id: "sa4",
    studentId: "student4",
    date: "2025-04-08",
    classId: "class2",
    status: "present",
    markedById: "teacher2",
    markedAt: "2025-04-08T09:15:00Z"
  }
];

export const mockTasks: Task[] = [
  {
    id: "task1",
    title: "Prepare Final Exams",
    description: "Create final exam papers for Grade 10 Mathematics",
    dueDate: "2025-04-20",
    assignedBy: "admin1",
    assignedTo: ["teacher1"],
    status: "pending",
    priority: "high",
    createdAt: "2025-04-05T10:30:00Z",
    updatedAt: "2025-04-05T10:30:00Z"
  },
  {
    id: "task2",
    title: "Science Lab Equipment Check",
    description: "Inventory and check all science lab equipment",
    dueDate: "2025-04-15",
    assignedBy: "admin1",
    assignedTo: ["teacher2"],
    status: "pending",
    priority: "medium",
    createdAt: "2025-04-06T09:15:00Z",
    updatedAt: "2025-04-06T09:15:00Z"
  },
  {
    id: "task3",
    title: "Submit Grade Reports",
    description: "Submit all student grade reports for mid-term evaluation",
    dueDate: "2025-04-12",
    assignedBy: "admin1",
    assignedTo: ["teacher1", "teacher2", "teacher3"],
    status: "completed",
    priority: "high",
    createdAt: "2025-04-01T14:00:00Z",
    updatedAt: "2025-04-07T16:30:00Z"
  }
];

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "event1",
    title: "Mathematics Class",
    start: "2025-04-08T08:30:00",
    end: "2025-04-08T09:30:00",
    allDay: false,
    type: "class",
    description: "Grade 10 Mathematics"
  },
  {
    id: "event2",
    title: "Science Lab",
    start: "2025-04-08T10:00:00",
    end: "2025-04-08T11:30:00",
    allDay: false,
    type: "class",
    description: "Grade 10 Science Lab Session"
  },
  {
    id: "event3",
    title: "Parent-Teacher Meeting",
    start: "2025-04-09T13:00:00",
    end: "2025-04-09T16:00:00",
    allDay: false,
    type: "meeting",
    description: "Annual parent-teacher conference"
  },
  {
    id: "event4",
    title: "Mid-term Exams",
    start: "2025-04-15",
    end: "2025-04-20",
    allDay: true,
    type: "exam",
    description: "Mid-term examinations for all grades"
  },
  {
    id: "event5",
    title: "Staff Development Day",
    start: "2025-04-22",
    end: "2025-04-22",
    allDay: true,
    type: "holiday",
    description: "No classes - teacher professional development"
  }
];

export const mockAttendanceSummaries: AttendanceSummary[] = [
  {
    date: "2025-04-08",
    presentCount: 45,
    absentCount: 3,
    lateCount: 2,
    excusedCount: 1,
    total: 51
  },
  {
    date: "2025-04-07",
    presentCount: 48,
    absentCount: 2,
    lateCount: 1,
    excusedCount: 0,
    total: 51
  },
  {
    date: "2025-04-06",
    presentCount: 47,
    absentCount: 4,
    lateCount: 0,
    excusedCount: 0,
    total: 51
  }
];

// Helper function to simulate login
export const login = (email: string, password: string): User | null => {
  // In a real app, this would validate against a database
  // For demo purposes, we're using simple email matching
  const user = mockUsers.find(u => u.email === email);
  
  // In a real app, you would verify the password here
  if (user) {
    return user;
  }
  
  return null;
};

// Helper function to get user by ID
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

// Helper function to get class by ID
export const getClassById = (id: string): Class | undefined => {
  return mockClasses.find(classItem => classItem.id === id);
};

// Helper function to get teacher by ID
export const getTeacherById = (id: string): Teacher | undefined => {
  return mockTeachers.find(teacher => teacher.id === id);
};

// Helper function to get student by ID
export const getStudentById = (id: string): Student | undefined => {
  return mockStudents.find(student => student.id === id);
};
