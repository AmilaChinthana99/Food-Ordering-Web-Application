import React, { useEffect, useState } from 'react';
import { orderApi } from '../../api/order.api';
import { analyticsApi } from '../../api/analytics.api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Download, ShoppingBag, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AllOrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchAllOrders = async () => {
    try {
      const res: any = await orderApi.getOrders({ status: statusFilter === 'ALL' ? undefined : statusFilter, limit: 100 });
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to load all orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [statusFilter]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">All Platform Orders</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Audit and export all customer orders across Sri Lanka</p>
        </div>

        <Button variant="secondary" size="md" onClick={() => analyticsApi.exportCSV()} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Download CSV Export
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-slate-800">
        {['ALL', 'PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === st
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-500 font-bold uppercase">
                <th className="p-4">Order #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Restaurant</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/60">
                  <td className="p-4 font-extrabold text-gray-900 dark:text-white">#{ord.orderNumber}</td>
                  <td className="p-4 text-gray-700 dark:text-gray-300">{ord.user?.name}</td>
                  <td className="p-4 text-gray-700 dark:text-gray-300 font-medium">{ord.restaurant?.name}</td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">Rs. {ord.totalAmount.toLocaleString()}</td>
                  <td className="p-4">
                    <Badge variant={ord.orderStatus === 'DELIVERED' ? 'success' : ord.orderStatus === 'CANCELLED' ? 'danger' : 'info'}>
                      {ord.orderStatus}
                    </Badge>
                  </td>
                  <td className="p-4 text-gray-400">{new Date(ord.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <Link to={`/orders/${ord.id}/track`} className="p-2 text-primary-500 hover:text-primary-700 inline-block">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
