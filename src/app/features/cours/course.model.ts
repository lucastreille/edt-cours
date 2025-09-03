export interface Course {
  id: number;
  title: string;
  teacher: string;
  ects: number; // crédits ECTS
  description: string;
  order: number; // pour l’affichage/drag & drop
  createdAt: string; // ISO
}

export type CreateCourseDto = Omit<Course, 'id' | 'createdAt' | 'order'> & {
  order?: number;
};

export type UpdateCourseDto = Partial<Omit<Course, 'id' | 'createdAt'>>;
