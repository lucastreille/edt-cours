export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string; // ISO string (YYYY-MM-DD)
  createdAt: string; // ISO date-time
}

export type CreateStudentDto = Omit<Student, 'id' | 'createdAt'> & {
  birthDate: string;
};

export type UpdateStudentDto = Partial<Omit<Student, 'id' | 'createdAt'>>;
