// User type
export interface User {
  id: string;
  fullName: string;
  email: string;
  university: string;
  avatar?: string;
  totalSales?: number;
  totalEarnings?: number;
}

// Auth response from backend
export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
  errors?: AuthError[];
}

// Error type for validation errors
export interface AuthError {
  msg: string;
  param: string;
} 