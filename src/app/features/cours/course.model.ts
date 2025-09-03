export interface Course {
  id: number;
  title: string;
  teacher: string;
  ects: number;
  date: string; // YYYY-MM-DD
  order: number;
  /** Étudiants inscrits à ce cours */
  studentIds: number[];
}
