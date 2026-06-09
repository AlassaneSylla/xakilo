export type TokenPair = {
  access: string;
  refresh: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type Role = 'OWNER' | 'MANAGER' | 'EMPLOYEE';

export type AuthUser = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_superuser: boolean;
  is_staff: boolean;
  role: Role;
  boutique: number | null;
  boutique_name:    string | null;
  boutique_phone:   string | null;
  boutique_address: string | null;
  boutique_logo:    string | null;
};