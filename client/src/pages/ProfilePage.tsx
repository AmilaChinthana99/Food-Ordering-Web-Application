import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import toast from 'react-hot-toast';
import { User, Phone, Mail, Shield, MapPin } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateProfile({ name, phone });
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Account Settings</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage your personal profile and preferences</p>
      </div>

      <div className="p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-100 dark:border-slate-700/60 pb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-500 to-amber-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
              Role: {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Email Address"
            value={user?.email || ''}
            disabled
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone className="w-4 h-4" />}
            placeholder="+94 77 123 4567"
          />

          <Button type="submit" variant="primary" size="lg" isLoading={isUpdating} className="w-full pt-3">
            Save Profile Changes
          </Button>
        </form>
      </div>
    </div>
  );
};
