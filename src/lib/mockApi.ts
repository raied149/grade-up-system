
import { 
  AcademicYear, 
  Class, 
  Section, 
  Teacher, 
  Student, 
  Enrollment,
  StudentAttendance
} from './types';
import { mockStudents, mockTeachers, mockClasses } from './mockData';

// Mock data for academic years
const mockAcademicYears: AcademicYear[] = [
  {
    id: "ay-1",
    name: "2023-2024",
    startDate: "2023-09-01",
    endDate: "2024-06-30",
    status: "active"
  },
  {
    id: "ay-2",
    name: "2024-2025",
    startDate: "2024-09-01",
    endDate: "2025-06-30",
    status: "archived"
  },
  {
    id: "ay-3",
    name: "2025-2026",
    startDate: "2025-09-01",
    endDate: "2026-06-30",
    status: "archived"
  }
];

// Mock data for sections
const mockSections: Section[] = [
  {
    id: "section-1",
    name: "A",
    academicYearId: "ay-1",
    classId: "class1",
    homeroomTeacherId: "teacher1"
  },
  {
    id: "section-2",
    name: "B",
    academicYearId: "ay-1",
    classId: "class1",
    homeroomTeacherId: "teacher2"
  },
  {
    id: "section-3",
    name: "A",
    academicYearId: "ay-1",
    classId: "class2",
    homeroomTeacherId: "teacher3"
  },
  {
    id: "section-4",
    name: "A",
    academicYearId: "ay-2",
    classId: "class1",
    homeroomTeacherId: "teacher1"
  }
];

// Mock data for enrollments
const mockEnrollments: Enrollment[] = [
  {
    id: "enrollment-1",
    studentId: "student1",
    academicYearId: "ay-1",
    classId: "class1",
    sectionId: "section-1",
    enrollmentDate: "2023-09-01",
    status: "active"
  },
  {
    id: "enrollment-2",
    studentId: "student2",
    academicYearId: "ay-1",
    classId: "class1",
    sectionId: "section-1",
    enrollmentDate: "2023-09-01",
    status: "active"
  },
  {
    id: "enrollment-3",
    studentId: "student3",
    academicYearId: "ay-1",
    classId: "class1",
    sectionId: "section-2",
    enrollmentDate: "2023-09-01",
    status: "active"
  }
];

// Mock implementations of API functions
export const mockFetchAcademicYears = async (): Promise<AcademicYear[]> => {
  return [...mockAcademicYears];
};

export const mockCreateAcademicYear = async (data: Omit<AcademicYear, 'id'>): Promise<AcademicYear> => {
  const newAcademicYear = {
    id: `ay-${Date.now()}`,
    ...data
  };
  mockAcademicYears.push(newAcademicYear);
  return newAcademicYear;
};

export const mockUpdateAcademicYear = async (
  id: string, 
  data: Partial<AcademicYear>
): Promise<AcademicYear> => {
  const index = mockAcademicYears.findIndex(ay => ay.id === id);
  if (index !== -1) {
    mockAcademicYears[index] = {
      ...mockAcademicYears[index],
      ...data
    };
    return mockAcademicYears[index];
  }
  throw new Error(`Academic year with id ${id} not found`);
};

export const mockFetchClasses = async (): Promise<Class[]> => {
  return [...mockClasses];
};

export const mockCreateClass = async (data: Omit<Class, 'id'>): Promise<Class> => {
  const newClass = {
    id: `class-${Date.now()}`,
    ...data
  };
  mockClasses.push(newClass);
  return newClass;
};

export const mockUpdateClass = async (
  id: string, 
  data: Partial<Class>
): Promise<Class> => {
  const index = mockClasses.findIndex(c => c.id === id);
  if (index !== -1) {
    mockClasses[index] = {
      ...mockClasses[index],
      ...data
    };
    return mockClasses[index];
  }
  throw new Error(`Class with id ${id} not found`);
};

export const mockDeleteClass = async (id: string): Promise<void> => {
  const index = mockClasses.findIndex(c => c.id === id);
  if (index !== -1) {
    mockClasses.splice(index, 1);
  }
};

export const mockFetchSections = async (
  filters?: { academicYearId?: string; classId?: string }
): Promise<Section[]> => {
  let sections = [...mockSections];
  
  if (filters?.academicYearId) {
    sections = sections.filter(s => s.academicYearId === filters.academicYearId);
  }
  
  if (filters?.classId) {
    sections = sections.filter(s => s.classId === filters.classId);
  }
  
  return sections;
};

export const mockCreateSection = async (data: Omit<Section, 'id'>): Promise<Section> => {
  const newSection = {
    id: `section-${Date.now()}`,
    ...data
  };
  mockSections.push(newSection);
  return newSection;
};

export const mockUpdateSection = async (
  id: string, 
  data: Partial<Section>
): Promise<Section> => {
  const index = mockSections.findIndex(s => s.id === id);
  if (index !== -1) {
    mockSections[index] = {
      ...mockSections[index],
      ...data
    };
    return mockSections[index];
  }
  throw new Error(`Section with id ${id} not found`);
};

export const mockDeleteSection = async (id: string): Promise<void> => {
  const index = mockSections.findIndex(s => s.id === id);
  if (index !== -1) {
    mockSections.splice(index, 1);
  }
};

export const mockFetchTeachers = async (): Promise<Teacher[]> => {
  return [...mockTeachers];
};

export const mockGetStudentEnrollments = async (studentId: string): Promise<Enrollment[]> => {
  return mockEnrollments.filter(e => e.studentId === studentId);
};

export const mockGetActiveEnrollment = async (
  enrollmentId: string
): Promise<Enrollment & { academicYear?: AcademicYear; class?: Class; section?: Section }> => {
  const enrollment = mockEnrollments.find(e => e.id === enrollmentId);
  
  if (!enrollment) {
    throw new Error(`Enrollment with id ${enrollmentId} not found`);
  }
  
  const academicYear = mockAcademicYears.find(ay => ay.id === enrollment.academicYearId);
  const classInfo = mockClasses.find(c => c.id === enrollment.classId);
  const section = mockSections.find(s => s.id === enrollment.sectionId);
  
  return {
    ...enrollment,
    academicYear,
    class: classInfo,
    section
  };
};

export const mockFindActiveEnrollments = async (
  filters: { academicYearId: string; classId: string; sectionId: string }
): Promise<Enrollment[]> => {
  return mockEnrollments.filter(
    e => e.academicYearId === filters.academicYearId &&
         e.classId === filters.classId &&
         e.sectionId === filters.sectionId &&
         e.status === "active"
  );
};

export const mockEnrollStudent = async (
  data: Omit<Enrollment, 'id' | 'withdrawalDate' | 'status'> & { studentId: string }
): Promise<{ newEnrollment: Enrollment; updatedStudent: Student }> => {
  const newEnrollment = {
    id: `enrollment-${Date.now()}`,
    ...data,
    withdrawalDate: undefined,
    status: "active" as const
  };
  
  mockEnrollments.push(newEnrollment);
  
  const studentIndex = mockStudents.findIndex(s => s.id === data.studentId);
  if (studentIndex !== -1) {
    mockStudents[studentIndex] = {
      ...mockStudents[studentIndex],
      currentEnrollmentId: newEnrollment.id
    };
    
    return {
      newEnrollment,
      updatedStudent: mockStudents[studentIndex]
    };
  }
  
  throw new Error(`Student with id ${data.studentId} not found`);
};

export const mockPromoteStudent = async (
  studentId: string,
  currentEnrollmentId: string,
  newEnrollmentData: Omit<Enrollment, 'id' | 'studentId' | 'withdrawalDate' | 'status'>
): Promise<{ 
  updatedOldEnrollment: Enrollment;
  newEnrollment: Enrollment;
  updatedStudent: Student;
}> => {
  // Update old enrollment
  const oldEnrollmentIndex = mockEnrollments.findIndex(e => e.id === currentEnrollmentId);
  if (oldEnrollmentIndex === -1) {
    throw new Error(`Enrollment with id ${currentEnrollmentId} not found`);
  }
  
  const updatedOldEnrollment = {
    ...mockEnrollments[oldEnrollmentIndex],
    withdrawalDate: new Date().toISOString(),
    status: "inactive" as const
  };
  
  mockEnrollments[oldEnrollmentIndex] = updatedOldEnrollment;
  
  // Create new enrollment
  const newEnrollment = {
    id: `enrollment-${Date.now()}`,
    studentId,
    ...newEnrollmentData,
    enrollmentDate: new Date().toISOString(),
    status: "active" as const
  };
  
  mockEnrollments.push(newEnrollment);
  
  // Update student
  const studentIndex = mockStudents.findIndex(s => s.id === studentId);
  if (studentIndex === -1) {
    throw new Error(`Student with id ${studentId} not found`);
  }
  
  const updatedStudent = {
    ...mockStudents[studentIndex],
    currentEnrollmentId: newEnrollment.id
  };
  
  mockStudents[studentIndex] = updatedStudent;
  
  return {
    updatedOldEnrollment,
    newEnrollment,
    updatedStudent
  };
};

export const mockMarkAttendance = async (
  data: Omit<StudentAttendance, 'id'>[]
): Promise<void> => {
  // This would update the attendance records in a real implementation
};

export const mockFetchStudentAttendance = async (
  enrollmentId: string, 
  dateRange: { start: Date; end: Date }
): Promise<StudentAttendance[]> => {
  // This would return filtered attendance records in a real implementation
  return [];
};
