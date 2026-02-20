import api from '../api/client';

export const suppliersService = {
  getAll: (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (search) params.append('search', search);
    return api.get(`/suppliers?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/suppliers/${id}`),
  create: (data: { name: string; phone?: string; address?: string }) => api.post('/suppliers', data),
  update: (id: number, data: { name: string; phone?: string; address?: string }) => api.put(`/suppliers/${id}`, data),
  delete: (id: number) => api.delete(`/suppliers/${id}`),
};
