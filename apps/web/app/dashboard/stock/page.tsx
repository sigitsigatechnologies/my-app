'use client';

import { useEffect, useState } from 'react';
import { stockService } from '@/lib/services/stock-service';

interface Stock {
  id: number;
  itemId: number;
  warehouseId: number;
  quantity: number;
  item: { id: number; name: string };
  warehouse: { id: number; name: string };
}

export default function StockPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    try {
      const res = await stockService.getAll();
      setStocks(res.data);
    } catch (error) {
      console.error('Failed to load stocks', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Stock</h1>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stocks.map((stock) => (
                <tr key={stock.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.item?.name || `Item #${stock.itemId}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.warehouse?.name || `Warehouse #${stock.warehouseId}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {stocks.length === 0 && (
            <div className="text-center py-8 text-gray-500">No stock data found</div>
          )}
        </div>
      )}
    </div>
  );
}
