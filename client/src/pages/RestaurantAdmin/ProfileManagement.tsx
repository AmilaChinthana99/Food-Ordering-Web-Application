import React, { useEffect, useState } from 'react';
import { restaurantApi } from '../../api/restaurant.api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import toast from 'react-hot-toast';
import { Store, Clock, MapPin, Phone, ToggleLeft, ToggleRight } from 'lucide-react';

export const ProfileManagement: React.FC = () => {
  const { user } = useAuth();
  const restaurant = user?.restaurants && user.restaurants.length > 0 ? user.restaurants[0] : null;

  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    cuisine: '',
    deliveryFee: 250,
    minOrder: 500,
    isOpen: true,
    openingHours: '',
    phone: '',
    address: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!restaurant?.id) return;
      try {
        const res: any = await restaurantApi.getBySlugOrId(restaurant.id);
        if (res.success) {
          setFormData(res.data);
        }
      } catch (err) {
        console.error('Failed to load restaurant profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [restaurant?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant?.id) return;
    setSaving(true);
    try {
      const res: any = await restaurantApi.update(restaurant.id, formData);
      if (res.success) {
        toast.success('Restaurant profile updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Restaurant Profile Settings</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage delivery fee, opening hours, and open/closed status</p>
      </div>

      <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700">
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">Store Status</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Toggle whether your restaurant is currently accepting orders</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isOpen: !formData.isOpen })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                formData.isOpen ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'
              }`}
            >
              {formData.isOpen ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              <span>{formData.isOpen ? 'Open For Delivery' : 'Closed'}</span>
            </button>
          </div>

          <Input
            label="Restaurant Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Cuisine Categories"
            value={formData.cuisine || ''}
            onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
            placeholder="Sri Lankan, Kottu, Rice & Curry"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Delivery Fee (Rs.)"
              type="number"
              value={formData.deliveryFee || ''}
              onChange={(e) => setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) })}
              required
            />
            <Input
              label="Minimum Order (Rs.)"
              type="number"
              value={formData.minOrder || ''}
              onChange={(e) => setFormData({ ...formData, minOrder: parseFloat(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Opening Hours"
            value={formData.openingHours || ''}
            onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
            placeholder="Mon - Sun: 10:00 AM - 10:30 PM"
          />

          <Input
            label="Address"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />

          <Input
            label="Phone Contact"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" isLoading={saving} className="w-full pt-3">
            Save Profile Settings
          </Button>
        </form>
      </div>
    </div>
  );
};
