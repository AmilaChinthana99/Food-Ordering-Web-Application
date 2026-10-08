import React, { useEffect, useState } from 'react';
import { restaurantApi } from '../../api/restaurant.api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Store, Star, CheckCircle, XCircle } from 'lucide-react';

export const RestaurantManagement: React.FC = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    try {
      const res: any = await restaurantApi.getRestaurants({ limit: 50 });
      if (res.success) {
        setRestaurants(res.data);
      }
    } catch (err) {
      console.error('Failed to load restaurants', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleToggleApproval = async (id: string, currentApproved: boolean) => {
    try {
      const res: any = await restaurantApi.update(id, { isApproved: !currentApproved });
      if (res.success) {
        toast.success(currentApproved ? 'Restaurant suspended' : 'Restaurant approved!');
        fetchRestaurants();
      }
    } catch (err: any) {
      toast.error('Failed to update restaurant status');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Restaurant Approvals & Management</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Approve new restaurant partners or suspend non-compliant stores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((r) => (
          <div
            key={r.id}
            className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={r.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&auto=format&fit=crop'}
                  alt={r.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1">{r.name}</h3>
                  <p className="text-xs text-gray-400">{r.cuisine}</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{r.description}</p>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <Badge variant={r.isApproved ? 'success' : 'warning'}>
                {r.isApproved ? 'Approved' : 'Pending Approval'}
              </Badge>

              <Button
                variant={r.isApproved ? 'danger' : 'primary'}
                size="sm"
                onClick={() => handleToggleApproval(r.id, r.isApproved)}
              >
                {r.isApproved ? 'Suspend' : 'Approve Store'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
