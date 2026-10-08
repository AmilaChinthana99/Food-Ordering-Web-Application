import React, { useEffect, useState } from 'react';
import { couponApi } from '../../api/coupon.api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import toast from 'react-hot-toast';
import { Plus, Tag, Trash2 } from 'lucide-react';

export const CouponManagement: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrderValue, setMinOrderValue] = useState('500');

  const fetchCoupons = async () => {
    try {
      const res: any = await couponApi.getCoupons();
      if (res.success) {
        setCoupons(res.data);
      }
    } catch (err) {
      console.error('Failed to load coupons', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await couponApi.create({
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue),
      });

      if (res.success) {
        toast.success('Coupon created successfully!');
        setIsModalOpen(false);
        setCode('');
        fetchCoupons();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon code?')) return;
    try {
      await couponApi.delete(id);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err: any) {
      toast.error('Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Promo Coupons</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage global discount voucher codes</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3 flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-500" />
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">{c.code}</h3>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% Off` : `Rs. ${c.discountValue} Off`}
              </p>
              <p className="text-[11px] text-gray-400">Min Order: Rs. {c.minOrderValue} • Used {c.usageCount} times</p>
            </div>

            <button onClick={() => handleDeleteCoupon(c.id)} className="p-2 text-rose-500 hover:text-rose-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Promo Coupon">
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <Input label="Coupon Code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. CEYLON30" required />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Discount Type
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (Rs.)</option>
                </select>
              </div>
              <Input label="Discount Value" type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required />
            </div>
            <Input label="Min Order Value (Rs.)" type="number" value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)} required />
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Create Promo Code
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
