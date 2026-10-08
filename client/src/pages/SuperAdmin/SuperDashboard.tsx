import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/analytics.api';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { Banknote, ShoppingBag, Users, Store, Download, TrendingUp } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const SuperDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res: any = await analyticsApi.getPlatformAnalytics();
        if (res.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error('Failed to load super admin analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Super Admin Console</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Platform-wide analytics, user growth & revenue insights</p>
        </div>

        <Button variant="secondary" size="md" onClick={() => analyticsApi.exportCSV()} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Orders CSV
        </Button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Platform Revenue</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              Rs. {analytics?.totalRevenue?.toLocaleString() || 0}
            </h3>
          </div>
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-2xl">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Orders Placed</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {analytics?.totalOrders || 0}
            </h3>
          </div>
          <div className="p-3 bg-primary-100 dark:bg-primary-950/60 text-primary-500 rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Registered Customers</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {analytics?.totalUsers || 0}
            </h3>
          </div>
          <div className="p-3 bg-sky-100 dark:bg-sky-950/60 text-sky-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Restaurants</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {analytics?.totalRestaurants || 0}
            </h3>
          </div>
          <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded-2xl">
            <Store className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recharts Analytics Charts */}
      {analytics?.chartData && analytics.chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend Area Chart */}
          <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Daily Revenue (Last 7 Days)
            </h3>
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip formatter={(val: any) => `Rs. ${val}`} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Count Bar Chart */}
          <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary-500" /> Order Volume (Last 7 Days)
            </h3>
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
