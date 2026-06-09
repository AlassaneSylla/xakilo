import type { Role } from '../auth/types';

export type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  boutique: number | null;
  boutique_name: string | null;
  is_superuser: boolean;
  is_staff: boolean;
  is_active: boolean;
  last_login: string | null;
  date_joined: string;
};

export type UserPayload = {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role?: Role;
  boutique?: number;
};