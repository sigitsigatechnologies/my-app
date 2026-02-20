'use client';

import { useEffect, useState, useCallback } from 'react';
import { itemsService, ItemDTO } from '@/lib/services/items-service';
import { categoriesService } from '@/lib/services/categories-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface PaginatedResponse {
  data: ItemDTO[];
  total: number;
  page: number;
  limit: number;
}

export default function ItemsPage() {
  const [items, setItems] = useState<ItemDTO[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemDTO | null>(null);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unit, setUnit] = useState('');
  const [minStock, setMinStock] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await itemsService.getAll(page, limit, search);
      const data = res.data as unknown as PaginatedResponse;
      setItems(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to load items', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  const loadCategories = async () => {
    try {
      const res = await categoriesService.getAll(1, 100);
      const data = res.data as unknown as { data: Category[] };
      setCategories(data.data || []);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  useEffect(() => {
    loadItems();
    loadCategories();
  }, [loadItems]);

  const totalPages = Math.ceil(total / limit);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadItems();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name,
        sku,
        barcode: barcode || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        unit: unit || undefined,
        minStock: minStock ? Number(minStock) : undefined,
      };
      if (editingItem) {
        await itemsService.update(editingItem.id, data);
      } else {
        await itemsService.create(data);
      }
      setShowModal(false);
      setEditingItem(null);
      setName(''); setSku(''); setBarcode(''); setCategoryId(''); setUnit(''); setMinStock('');
      loadItems();
    } catch (error) {
      console.error('Failed to save item', error);
    }
  };

  const handleEdit = (item: ItemDTO) => {
    setEditingItem(item);
    setName(item.name);
    setSku(item.sku);
    setBarcode(item.barcode || '');
    setCategoryId(item.categoryId?.toString() || '');
    setUnit(item.unit || '');
    setMinStock(item.minStock?.toString() || '');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await itemsService.remove(id);
        loadItems();
      } catch (error) {
        console.error('Failed to delete item', error);
      }
    }
  };

  const getCategoryName = (id: number | null | undefined) => {
    if (!id) return '-';
    const cat = categories.find(c => c.id === id);
    return cat?.name || '-';
  };

  const resetForm = () => {
    setEditingItem(null);
    setName('');
    setSku('');
    setBarcode('');
    setCategoryId('');
    setUnit('');
    setMinStock('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Items</h1>
        <Button onClick={() => { setShowModal(true); resetForm(); }} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            type="text" 
            placeholder="Search items..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="default" className="bg-green-600 hover:bg-green-700">Search</Button>
        {search && (
          <Button type="button" variant="outline" onClick={() => { setSearch(''); setPage(1); loadItems(); }}>
            Clear
          </Button>
        )}
      </form>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">{item.id}</td>
                    <td className="px-4 py-3 text-sm">{item.name}</td>
                    <td className="px-4 py-3 text-sm">{item.sku}</td>
                    <td className="px-4 py-3 text-sm">{getCategoryName(item.categoryId)}</td>
                    <td className="px-4 py-3 text-sm">{item.unit || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 mr-2">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {search ? `No items found for "${search}"` : 'No items found'}
              </div>
            )}
          </div>

          {totalPages > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Rows per page:</span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-700 ml-4">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results {search && '(filtered)'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                >
                  Previous
                </Button>
                {getPageNumbers().map((pg, idx) => (
                  <Button
                    key={idx}
                    variant={pg === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => typeof pg === 'number' && setPage(pg)}
                    disabled={typeof pg !== 'number'}
                    className={pg === page ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {pg}
                  </Button>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{editingItem ? 'Edit Item' : 'Add Item'}</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name *</label>
                <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">SKU *</label>
                <Input type="text" value={sku} onChange={(e) => setSku(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Barcode</label>
                <Input type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Unit</label>
                <Input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g., pcs, kg, box" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Min Stock</label>
                <Input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
