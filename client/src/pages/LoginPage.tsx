import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import toast from 'react-hot-toast';
import { Utensils, Mail, Lock, Shield, Store, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-primary-600 to-amber-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-primary-500/30">
            <Utensils className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Sign in to FoodieExpress</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Order your favorite Sri Lankan dishes with 1 click</p>
        </div>

        {/* One-Click Quick Demo Login Shortcuts */}
        <div className="p-4 bg-gray-50 dark:bg-slate-900/60 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 space-y-2">
          <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center mb-1">
            ⚡ Quick Demo Accounts
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => fillDemoAccount('customer@foodie.com', 'User@123')}
              className="px-2 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-primary-500 text-xs font-bold text-gray-700 dark:text-gray-300 flex flex-col items-center gap-1 shadow-xs"
            >
              <User className="w-4 h-4 text-primary-500" />
              <span>Customer</span>
            </button>
            <button
              onClick={() => fillDemoAccount('admin.spicy@foodie.com', 'Admin@123')}
              className="px-2 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-primary-500 text-xs font-bold text-gray-700 dark:text-gray-300 flex flex-col items-center gap-1 shadow-xs"
            >
              <Store className="w-4 h-4 text-orange-500" />
              <span>Rest Admin</span>
            </button>
            <button
              onClick={() => fillDemoAccount('admin@foodie.com', 'Admin@123')}
              className="px-2 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-primary-500 text-xs font-bold text-gray-700 dark:text-gray-300 flex flex-col items-center gap-1 shadow-xs"
            >
              <Shield className="w-4 h-4 text-amber-500" />
              <span>Super Admin</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@foodie.com"
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full pt-3">
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary-500 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
