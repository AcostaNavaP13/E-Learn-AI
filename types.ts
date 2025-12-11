export type DifficultyLevel = 'Principiante' | 'Intermedio' | 'Avanzado';
export type CourseFormat = 'Lecturas breves' | 'Lecturas + ejercicios' | 'Esquemas + problemas' | 'Mixto';

export interface UserInput {
  topic: string;
  level: DifficultyLevel;
  profile: string;
  goal: string;
  timeAvailable: string;
  format: CourseFormat;
  files?: File[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
}

export interface LessonBlock {
  type: 'concept' | 'example' | 'activity' | 'quiz';
  title: string;
  content: string; // Markdown supported
  quizData?: QuizQuestion; // Only if type is 'quiz'
}

export interface Lesson {
  id: string;
  title: string;
  blocks: LessonBlock[];
}

export interface Unit {
  id: string;
  title: string;
  summary: string;
  lessons: Lesson[];
}

export interface FinalProject {
  title: string;
  description: string;
}

export interface Reference {
  title: string;
  url?: string;
  author?: string;
}

export interface CourseStructure {
  title: string;
  subtitle: string;
  level: string;
  duration: string;
  targetProfile: string;
  coverImageKeyword?: string; // New field for visual keyword
  objectives: string[];
  units: Unit[];
  finalEvaluation: QuizQuestion[];
  finalProjects: FinalProject[];
  references: Reference[];
}

export type AppView = 'designer' | 'classroom';