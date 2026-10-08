import React, { useState } from 'react';
import { useCartStore } from '../../store/cartStore';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag } from 'lucide-react';
import { Button } from '../common/Button';
import { couponApi } from '../../api/coupon.api';
import toast from 'react-hot-toast';

export const CartDrawer: React.FC = () => {
  const {
    items,
    restaurantName,
    deliveryFee,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getTax,
    getTotal,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsValidating(true);
    try {
      const res: any = await couponApi.validate({ code: couponCode, subtotal });
      if (res.success) {
        applyCoupon(res.data);
        toast.success(`Coupon ${res.data.code} applied! Saved Rs. ${res.data.discountAmount}`);
        setCouponCode('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid coupon code');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-gray-100 dark:border-slate-800">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-100 dark:bg-primary-950/60 text-primary-500 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Cart</h2>
                {restaurantName && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    From {restaurantName}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body / Items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 my-12">
                <div className="p-6 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-400">
                  <ShoppingBag className="w-12 h-12" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Your cart is empty</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                    Browse our delicious Sri Lankan and international restaurants and add your favorite dishes!
                  </p>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-800"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.variantName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Size: {item.variantName}
                      </p>
                    )}

                    {item.addOns && item.addOns.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        Add-ons: {item.addOns.map((a) => a.name).join(', ')}
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-3">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        Rs. {item.totalPrice.toLocaleString()}
                      </span>

                      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-gray-600 dark:text-gray-400"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-gray-600 dark:text-gray-400"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              {/* Promo Code Form */}
              {coupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        {coupon.code} Applied
                      </span>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        Saving Rs. {coupon.discountAmount}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-500 font-semibold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Promo Code (e.g. CEYLON20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 uppercase rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button variant="secondary" size="sm" type="submit" isLoading={isValidating}>
                    Apply
                  </Button>
                </form>
              )}

              {/* Subtotals Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Tax (5%)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Rs. {tax.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Rs. {deliveryFee.toLocaleString()}
                  </span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-Rs. {coupon.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-slate-700">
                  <span>Total Amount</span>
                  <span className="text-primary-500">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 py-3.5"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
