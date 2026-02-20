import api from '../api/client';

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

export interface CreateItemDto {
  name: string;
  sku: string;
  barcode?: string;
  categoryId?: number;
  unit?: string;
  minStock?: number;
}

export const itemsService = {
  getAll: (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (search) params.append('search', search);
    return api.get(`/items?${params.toString()}`);
  },
  
  // Returns paginated response { data, total, page, limit }
  getAllPaginated: (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (search) params.append('search', search);
    return api.get(`/items?${params.toString()}`);
  },

  // Returns simple array (for forms/dropdowns)
  async list(): Promise<ItemDTO[]> {
    const res = await api.get<{ data: ItemDTO[] }>('/items?page=1&limit=1000');
    return res.data.data || [];
  },

  async create(dto: CreateItemDto): Promise<ItemDTO> {
    const { data } = await api.post<ItemDTO>('/items', dto);
    return data;
  },

  async update(id: number, dto: Partial<CreateItemDto>): Promise<ItemDTO> {
    const { data } = await api.put<ItemDTO>(`/items/${id}`, dto);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/items/${id}`);
  },
};
