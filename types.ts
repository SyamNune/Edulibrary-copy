export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  username: string;
  role: Role;
  lastLogin?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  pdfUrl: string; // Mock URL
  uploadedAt: string;
}

export interface Review {
  id: string;
  bookId: string; // Optional if general feedback, but good to link
  userId: string;
  username: string;
  rating: number;
  comment: string;
  timestamp: string;
}

export interface LoginLog {
  id: string;
  username: string;
  role: Role;
  timestamp: string;
}

// Mock Database Schema
export interface DB {
  users: User[];
  books: Book[];
  reviews: Review[];
  loginLogs: LoginLog[];
}