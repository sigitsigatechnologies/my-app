'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { itemsService, type ItemDTO } from '@/lib/services/items-service';
import { stockInsService, stockOutsService, stockService } from '@/lib/services/stock-service';

interface StockIn {
  id: number;
  total: number;
}

interface StockOut {
  id: number;
  items?: { qty: number }[];
}

interface Stock {
  id: number;
  quantity: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, checkAuth, isLoading: authLoading } = useAuthStore();
  const [items, setItems] = useState<ItemDTO[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [stockInCount, setStockInCount] = useState(0);
  const [stockOutCount, setStockOutCount] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth().then(() => {
      const { user: storedUser } = useAuthStore.getState();
      if (!storedUser) {
        router.push('/login');
      }
    });
  }, [router]);

  useEffect(() => {
    if (user) {
      Promise.all([
        itemsService.list(),
        stockInsService.getAll(),
        stockOutsService.getAll(),
        stockService.getAll(),
      ])
        .then(([itemsData, stockInsRes, stockOutsRes, stocksRes]) => {
          setItems(itemsData);
          
          // Handle stock-ins - check if response is paginated or array
          const stockIns = stockInsRes.data?.data || stockInsRes.data || stockInsRes;
          const stockOuts = stockOutsRes.data?.data || stockOutsRes.data || stockOutsRes;
          const stocks = stocksRes.data || stocksRes;
          
          // Calculate total stock in quantity
          const totalStockIn = Array.isArray(stockIns) 
            ? stockIns.reduce((sum: number, si: StockIn) => sum + (si.total || 0), 0)
            : 0;
          
          // Calculate total stock out quantity
          const totalStockOut = Array.isArray(stockOuts)
            ? stockOuts.reduce((sum: number, so: StockOut) => sum + (so.items?.reduce((s: number, i: { qty: number }) => s + i.qty, 0) || 0), 0)
            : 0;
          
          // Calculate total stock quantity
          const totalQty = Array.isArray(stocks)
            ? stocks.reduce((sum: number, s: Stock) => sum + (s.quantity || 0), 0)
            : 0;
          
          setStockInCount(totalStockIn);
          setStockOutCount(totalStockOut);
          setTotalStock(totalQty);
          setItemsLoading(false);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to load data');
          setItemsLoading(false);
        });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.name} ({user?.role})
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white shadow rounded-lg border-l-4 border-blue-500">
          <div className="text-sm text-gray-500">Total Items</div>
          <div className="text-2xl font-bold">{items.length}</div>
        </div>
        <div className="p-4 bg-white shadow rounded-lg border-l-4 border-green-500">
          <div className="text-sm text-gray-500">Total Stock Quantity</div>
          <div className="text-2xl font-bold">{totalStock}</div>
        </div>
        <div className="p-4 bg-white shadow rounded-lg border-l-4 border-yellow-500">
          <div className="text-sm text-gray-500">Total Stock In</div>
          <div className="text-2xl font-bold">{stockInCount}</div>
        </div>
        <div className="p-4 bg-white shadow rounded-lg border-l-4 border-red-500">
          <div className="text-sm text-gray-500">Total Stock Out</div>
          <div className="text-2xl font-bold">{stockOutCount}</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Items List</h3>
        </div>
        
        {itemsLoading ? (
          <div className="p-4 text-center text-gray-500">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No items found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">SKU</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Barcode</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{item.id}</td>
                  <td className="px-4 py-2 text-sm">{item.name}</td>
                  <td className="px-4 py-2 text-sm">{item.sku}</td>
                  <td className="px-4 py-2 text-sm">{item.barcode || '-'}</td>
                  <td className="px-4 py-2 text-sm">{item.unit || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
