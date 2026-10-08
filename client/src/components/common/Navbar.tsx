import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCartStore } from '../../store/cartStore';
import { ThemeToggle } from './ThemeToggle';
import {
  Utensils,
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  LogOut,
  MapPin,
  LayoutDashboard,
  Shield,
  Menu,
  X,
  History,
} from 'lucide-react';
import { CartDrawer } from '../customer/CartDrawer';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { items, openCart } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalCartCount = items.reduce((acc, i) => acc + i.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-gray-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-11 h-11 bg-gradient-to-tr from-primary-600 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  FoodieExpress
                </span>
                <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest -mt-1">
                  Sri Lanka
                </span>
              </div>
            </Link>

            {/* Location indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800/80 text-xs font-medium text-gray-700 dark:text-gray-300">
              <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
              <span>Deliver to: <strong className="text-gray-900 dark:text-white">Colombo & Suburbs</strong></span>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search restaurants, Kottu, Rice & Curry, Pizza..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </form>

            {/* Nav actions right */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />

              {/* Favorites Button */}
              <Link
                to="/favorites"
                className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={openCart}
                className="relative p-2.5 rounded-full bg-primary-500 hover:bg-primary-600 text-white transition-all shadow-md shadow-primary-500/20 active:scale-95 flex items-center justify-center"
                title="View Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-gray-950 text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* User Account / Profile */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/orders"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                        >
                          <History className="w-4 h-4 text-gray-400" />
                          My Orders
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                        >
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          Account Settings
                        </Link>

                        {/* Admin shortcuts */}
                        {user.role === 'RESTAURANT_ADMIN' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-primary-600 dark:text-primary-400 font-medium hover:bg-gray-50 dark:hover:bg-slate-800"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Restaurant Dashboard
                          </Link>
                        )}

                        {user.role === 'SUPER_ADMIN' && (
                          <Link
                            to="/super-admin"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-amber-600 dark:text-amber-400 font-medium hover:bg-gray-50 dark:hover:bg-slate-800"
                          >
                            <Shield className="w-4 h-4" />
                            Super Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-gray-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-primary-500 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-xl shadow-md shadow-primary-500/20 transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Cart Drawer instance */}
      <CartDrawer />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-gray-200/60 dark:border-slate-800/60 px-6 py-2">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 ${
              location.pathname === '/' ? 'text-primary-500 font-bold' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Utensils className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </Link>
          <Link
            to="/restaurants"
            className={`flex flex-col items-center gap-1 ${
              location.pathname.startsWith('/restaurants') ? 'text-primary-500 font-bold' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px]">Explore</span>
          </Link>
          <button
            onClick={openCart}
            className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 relative"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px]">Cart</span>
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </button>
          <Link
            to="/orders"
            className={`flex flex-col items-center gap-1 ${
              location.pathname === '/orders' ? 'text-primary-500 font-bold' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px]">Orders</span>
          </Link>
          <Link
            to={user ? '/profile' : '/login'}
            className={`flex flex-col items-center gap-1 ${
              location.pathname === '/profile' ? 'text-primary-500 font-bold' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px]">Account</span>
          </Link>
        </div>
      </div>
    </>
  );
};
