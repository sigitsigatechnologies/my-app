import api from '../api/client';

export const warehousesService = {
  getAll: (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (search) params.append('search', search);
    return api.get(`/warehouses?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/warehouses/${id}`),
  create: (data: { name: string; location: string }) => api.post('/warehouses', data),
  update: (id: number, data: { name: string; location: string }) => api.put(`/warehouses/${id}`, data),
  delete: (id: number) => api.delete(`/warehouses/${id}`),
};
