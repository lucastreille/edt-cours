export interface Note {
  id: number;
  studentId: number;
  courseId: number;
  value: number; // 0..20
  date: string; // ISO (YYYY-MM-DD)
  createdAt: string; // ISO datetime
}

export interface CreateNoteDto {
  studentId: number;
  courseId: number;
  value: number; // 0..20
  date?: string; // default = today (YYYY-MM-DD)
}

export type UpdateNoteDto = Partial<Omit<Note, 'id' | 'createdAt'>>;
