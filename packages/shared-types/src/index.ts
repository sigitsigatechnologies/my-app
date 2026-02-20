export type Role = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserDTO;
}

export interface ItemDTO {
  id: number;
  name: string;
  sku: string;
  barcode?: string | null;
  categoryId?: number | null;
  unit?: string | null;
  minStock?: number | null;
  createdAt: string;
}
