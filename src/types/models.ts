/**
 * Representa o perfil de usuário armazenado no Firestore (collection `users`).
 */
export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  birthDate?: string; // ISO string (YYYY-MM-DD)
  birthTime?: string; // HH:mm
  plan?: 'gratuito' | 'premium' | 'mentorado' | 'master';
  photoURL?: string;
  role?: 'user' | 'admin' | 'mentor';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Documento de meditação (collection `meditations`).
 */
export interface Meditation {
  id: string;
  title: string;
  description: string;
  durationSeconds: number;
  level: 'iniciante' | 'intermediario' | 'avancado';
  audioUrl: string;
  coverUrl?: string;
  tags?: string[];
  language?: string;
}

/**
 * Documento de exercício de respiração (collection `breathings`).
 */
export interface Breathing {
  id: string;
  title: string;
  description: string;
  durationSeconds: number;
  pattern: string;
  level: 'iniciante' | 'intermediario' | 'avancado';
  audioUrl?: string;
  coverUrl?: string;
  tags?: string[];
}

/**
 * Representa um curso com múltiplas aulas/meditações.
 */
export interface Course {
  id: string;
  title: string;
  description: string;
  coverUrl?: string;
  lessons: Lesson[];
}

/**
 * Uma lição dentro de um curso.
 */
export interface Lesson {
  id: string;
  title: string;
  description?: string;
  durationSeconds?: number;
  audioUrl?: string;
  videoUrl?: string;
  order: number;
  completed?: boolean;
}

/**
 * Sessão agendada com terapeuta.
 */
export interface Session {
  id: string;
  therapistId: string;
  userId: string;
  scheduledAt: string; // ISO datetime
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  publicSummary?: string;
  privateNotes?: string;
}

/**
 * Progresso de usuário para conteúdos (collection `userProgress`).
 */
export interface UserProgress {
  id: string;
  userId: string;
  contentType: 'meditation' | 'breathing' | 'course' | 'lesson';
  contentId: string;
  completedAt: string; // ISO datetime
  progressSeconds?: number;
}

/**
 * Fatura gerada para planos pagos.
 */
export interface Invoice {
  id: string;
  userId: string;
  amountCents: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  issuedAt: string;
  dueAt?: string;
  hostedInvoiceUrl?: string;
}
