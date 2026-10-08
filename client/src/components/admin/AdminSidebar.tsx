import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Utensils, Store, MessageSquare, Users, Shield, Tag, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/orders', label: 'Live Orders', icon: ShoppingBag },
    { path: '/admin/menu', label: 'Menu Management', icon: Utensils },
    { path: '/admin/profile', label: 'Restaurant Profile', icon: Store },
    { path: '/admin/reviews', label: 'Customer Reviews', icon: MessageSquare },
  ];

  const superAdminLinks = [
    { path: '/super-admin', label: 'Platform Analytics', icon: LayoutDashboard },
    { path: '/super-admin/users', label: 'Manage Users', icon: Users },
    { path: '/super-admin/restaurants', label: 'Approvals & Stores', icon: Shield },
    { path: '/super-admin/categories', label: 'Global Categories', icon: Layers },
    { path: '/super-admin/coupons', label: 'Promo Coupons', icon: Tag },
    { path: '/super-admin/orders', label: 'All Platform Orders', icon: ShoppingBag },
  ];

  const links = isSuperAdmin ? superAdminLinks : adminLinks;

  return (
    <aside className="w-full md:w-64 shrink-0 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm h-fit">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700/60 mb-3">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
          {isSuperAdmin ? 'Super Admin Console' : 'Restaurant Portal'}
        </span>
        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white truncate mt-0.5">
          {isSuperAdmin ? 'Platform Management' : user?.restaurants?.[0]?.name || 'My Restaurant'}
        </h3>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
