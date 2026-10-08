import React, { useEffect, useState } from 'react';
import { userApi } from '../../api/user.api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Users, Ban, CheckCircle2, Shield } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res: any = await userApi.getUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (id: string, currentStatus: boolean) => {
    try {
      const res: any = await userApi.updateStatus(id, { isBlocked: !currentStatus });
      if (res.success) {
        toast.success(currentStatus ? 'User unblocked' : 'User account suspended');
        fetchUsers();
      }
    } catch (err: any) {
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage platform users, roles, and access suspensions</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-500 font-bold uppercase">
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/60">
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{u.name}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{u.email}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{u.phone || 'N/A'}</td>
                  <td className="p-4">
                    <Badge variant={u.role === 'SUPER_ADMIN' ? 'warning' : u.role === 'RESTAURANT_ADMIN' ? 'info' : 'neutral'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {u.isBlocked ? (
                      <Badge variant="danger">Suspended</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== 'SUPER_ADMIN' && (
                      <Button
                        variant={u.isBlocked ? 'outline' : 'danger'}
                        size="sm"
                        onClick={() => handleToggleBlock(u.id, u.isBlocked)}
                      >
                        {u.isBlocked ? 'Unblock' : 'Suspend'}
                      </Button>
                    )}
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
