'use client';

import { useEffect, useState, useCallback } from 'react';
import { stockInsService } from '@/lib/services/stock-service';
import { itemsService } from '@/lib/services/items-service';
import { suppliersService } from '@/lib/services/suppliers-service';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';

interface StockIn {
  id: number;
  supplierId: number;
  date: string;
  items: { itemId: number; qty: number }[];
  supplier?: { name: string };
}

interface Item {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface PaginatedResponse {
  data: StockIn[];
  total: number;
  page: number;
  limit: number;
}

export default function StockInsPage() {
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStockIn, setEditingStockIn] = useState<StockIn | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState<number>(0);
  const [stockItems, setStockItems] = useState<{ itemId: number; qty: number }[]>([{ itemId: 0, qty: 1 }]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);

  const loadStockIns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await stockInsService.getAll(page, limit);
      const data = res.data as unknown as PaginatedResponse;
      setStockIns(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to load stock ins', error);
      setStockIns([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    loadStockIns();
  }, [loadStockIns]);

  const totalPages = Math.ceil(total / limit);

  const loadFormData = async () => {
    try {
      const [itemsRes, suppliersRes] = await Promise.all([
        itemsService.list(),
        suppliersService.getAll(1, 1000),
      ]);
      setItems(itemsRes);
      setSuppliers(suppliersRes.data?.data || suppliersRes.data || []);
    } catch (error) {
      console.error('Failed to load form data', error);
    }
  };

  const handleAddOpenModal = async () => {
    await loadFormData();
    setEditingStockIn(null);
    setSupplierId(0);
    setStockItems([{ itemId: 0, qty: 1 }]);
    setShowModal(true);
  };

  const handleEditOpenModal = async (stockIn: StockIn) => {
    await loadFormData();
    setEditingStockIn(stockIn);
    setSupplierId(stockIn.supplierId);
    setStockItems(stockIn.items?.map(i => ({ itemId: i.itemId, qty: i.qty })) || [{ itemId: 0, qty: 1 }]);
    setShowModal(true);
  };

  const handleAddItem = () => {
    setStockItems([...stockItems, { itemId: 0, qty: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setStockItems(stockItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'itemId' | 'qty', value: number) => {
    const updated = [...stockItems];
    updated[index] = { ...updated[index], [field]: value };
    setStockItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (supplierId === 0) {
      alert('Please select a supplier');
      return;
    }
    try {
      const validItems = stockItems.filter(item => item.itemId > 0 && item.qty > 0);
      if (validItems.length === 0) {
        alert('Please add at least one item');
        return;
      }
      if (editingStockIn) {
        await stockInsService.update(editingStockIn.id, { supplierId, items: validItems });
      } else {
        await stockInsService.create({ supplierId, items: validItems });
      }
      setShowModal(false);
      setSupplierId(0);
      setStockItems([{ itemId: 0, qty: 1 }]);
      loadStockIns();
    } catch (error) {
      console.error('Failed to save stock in', error);
      alert('Failed to save stock in. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this stock in record?')) {
      try {
        await stockInsService.delete(id);
        loadStockIns();
      } catch (error) {
        console.error('Failed to delete stock in', error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stock In</h1>
        <button
          onClick={handleAddOpenModal}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="h-5 w-5" />
          Add Stock In
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stockIns.map((stockIn) => (
                  <tr key={stockIn.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stockIn.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stockIn.supplier?.name || `Supplier #${stockIn.supplierId}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stockIn.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(stockIn.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEditOpenModal(stockIn)} className="text-blue-600 hover:text-blue-900 mr-4">
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(stockIn.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stockIns.length === 0 && (
              <div className="text-center py-8 text-gray-500">No stock in records found</div>
            )}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            limit={limit}
            onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
            total={total}
            className="justify-between"
          />
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingStockIn ? 'Edit Stock In' : 'Add Stock In'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value={0}>Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                {stockItems.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      value={item.itemId}
                      onChange={(e) => handleItemChange(index, 'itemId', Number(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value={0}>Select Item</option>
                      {items.map((i) => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, 'qty', Number(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                    {stockItems.length > 1 && (
                      <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-600">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddItem} className="text-green-600 text-sm">
                  + Add Item
                </button>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingStockIn ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
