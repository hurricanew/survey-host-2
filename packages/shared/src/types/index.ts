// Common types shared between frontend and backend

export enum UserRole {
  USER = 'User',
  ADMIN = 'Admin'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Survey {
  id: string;
  userId: string;
  title: string;
  description?: string;
  slug: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  fingerprintId?: string;
  responses: Record<string, any>;
  submittedAt: Date;
}

export interface CreateSurveyDto {
  title: string;
  description?: string;
  content: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface GoogleOAuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthSession {
  user: AuthUser;
  expires: string;
}

export interface AuthError {
  error: string;
  message?: string;
}