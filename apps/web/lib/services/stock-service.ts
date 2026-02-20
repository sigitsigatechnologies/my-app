import api from '../api/client';

export const stockService = {
  getAll: () => api.get('/stocks'),
  getById: (id: number) => api.get(`/stocks/${id}`),
};

export const stockInsService = {
  getAll: (page = 1, limit = 1000) => api.get(`/stock-ins?page=${page}&limit=${limit}`),
  getById: (id: number) => api.get(`/stock-ins/${id}`),
  create: (data: { supplierId: number; items: { itemId: number; qty: number }[] }) => api.post('/stock-ins', data),
  update: (id: number, data: { supplierId: number; items: { itemId: number; qty: number }[] }) => api.put(`/stock-ins/${id}`, data),
  delete: (id: number) => api.delete(`/stock-ins/${id}`),
};

export const stockOutsService = {
  getAll: (page = 1, limit = 1000) => api.get(`/stock-outs?page=${page}&limit=${limit}`),
  getById: (id: number) => api.get(`/stock-outs/${id}`),
  create: (data: { destination?: string; items: { itemId: number; qty: number }[] }) => api.post('/stock-outs', data),
  update: (id: number, data: { destination?: string; items: { itemId: number; qty: number }[] }) => api.put(`/stock-outs/${id}`, data),
  delete: (id: number) => api.delete(`/stock-outs/${id}`),
};
