export type MessageRole = 'sys' | 'user' | 'ai' | 'workout';

export interface WorkoutExercise {
  name: string;
  targetSets: number;
  targetReps: string;
  suggestedWeight: { value: number; unit: 'kg' | 'lbs' };
  notes?: string;
}

export interface WorkoutPlan {
  type: 'workout_plan';
  status: 'draft' | 'logged';
  estimatedMinutes: number;
  sessionType: string;
  exercises: WorkoutExercise[];
}

export interface ChatMessage {
  id: string;
  type: MessageRole;
  text?: string;
  workout?: WorkoutPlan;
  timestamp?: number;
}

export interface Session {
  id: string;
  date: string;
  label: string;
  sets: number;
  detail: string;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface UserProfile {
  id: string;
  phone: string;
  displayName?: string;
  currentWeightLbs?: number;
  goalWeightLbs?: number;
  experienceLevel?: string;
}

export type RootStackParamList = {
  Auth: undefined;
  OTP: { phone: string };
  Main: undefined;
};
