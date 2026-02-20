import api from '../api/client';

export const usersService = {
  getAll: (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (search) params.append('search', search);
    return api.get(`/users?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/users/${id}`),
  create: (data: { name: string; email: string; password: string; role?: string }) => api.post('/users/register', data),
  update: (id: number, data: { name?: string; email?: string; role?: string }) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};
