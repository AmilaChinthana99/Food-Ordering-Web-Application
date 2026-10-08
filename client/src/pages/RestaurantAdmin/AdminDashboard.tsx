import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/analytics.api';
import { orderApi } from '../../api/order.api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { ShoppingBag, Banknote, Clock, Utensils, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statRes, orderRes]: any[] = await Promise.all([
          analyticsApi.getPlatformAnalytics(),
          orderApi.getOrders({ limit: 5 }),
        ]);

        if (statRes.success) setStats(statRes.data);
        if (orderRes.success) setRecentOrders(orderRes.data);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Restaurant Admin Dashboard</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Today's business overview and live pending orders</p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Revenue</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              Rs. {stats?.totalRevenue?.toLocaleString() || 0}
            </h3>
          </div>
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-2xl">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Orders</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {stats?.totalOrders || 0}
            </h3>
          </div>
          <div className="p-3 bg-primary-100 dark:bg-primary-950/60 text-primary-500 rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Pending Orders</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {stats?.pendingOrders || 0}
            </h3>
          </div>
          <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded-2xl">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Items</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">Menu Active</h3>
          </div>
          <div className="p-3 bg-sky-100 dark:bg-sky-950/60 text-sky-600 rounded-2xl">
            <Utensils className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Live Orders Feed */}
      <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders Feed</h3>
          <Link to="/admin/orders" className="text-xs font-bold text-primary-500 hover:underline flex items-center gap-1">
            View Live Orders Console <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">No orders received yet.</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((ord) => (
              <div
                key={ord.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/60 rounded-2xl gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                      #{ord.orderNumber}
                    </span>
                    <Badge variant={ord.orderStatus === 'DELIVERED' ? 'success' : 'info'}>
                      {ord.orderStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Customer: {ord.user.name} ({ord.user.phone}) • {ord.items.length} items
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    Rs. {ord.totalAmount.toLocaleString()}
                  </span>
                  <Link to="/admin/orders">
                    <Button variant="secondary" size="sm">Manage</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
