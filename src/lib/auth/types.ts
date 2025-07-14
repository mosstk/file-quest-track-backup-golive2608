export interface AuthUser {
  id: string;
  name: string;
  full_name: string;
  email: string;
  employeeId: string;
  employee_id: string;
  company: string;
  department: string;
  division: string;
  role: UserRole;
  avatar?: string;
  avatar_url?: string;
}

export type UserRole = 'fa_admin' | 'requester' | 'receiver';

export interface AuthSession {
  user: AuthUser;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  userData: Partial<AuthUser>;
}