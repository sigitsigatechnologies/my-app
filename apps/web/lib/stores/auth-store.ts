import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';

// Types matching the API responses
export type Role = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

interface AuthResponse {
  accessToken: string;
  user: UserDTO;
}

interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

interface AuthState {
  user: UserDTO | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post<AuthResponse>('/auth/login', {
            email,
            password,
          });
          localStorage.setItem('accessToken', data.accessToken);
          set({
            user: data.user,
            accessToken: data.accessToken,
            isLoading: false,
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterDto) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/users/register', data);
          // After registration, auto-login
          await useAuthStore.getState().login(data.email, data.password);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Registration failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null, error: null });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ user: null, accessToken: null });
          return;
        }
        set({ accessToken: token, isLoading: true });
        try {
          // Optionally verify token with API - for now just set the token
          // In production, you would call /auth/me or similar endpoint
          set({ isLoading: false });
        } catch {
          localStorage.removeItem('accessToken');
          set({ user: null, accessToken: null, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
