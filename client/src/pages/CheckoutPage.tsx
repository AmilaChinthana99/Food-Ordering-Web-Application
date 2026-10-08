import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth.api';
import { orderApi } from '../api/order.api';
import { couponApi } from '../api/coupon.api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import toast from 'react-hot-toast';
import { MapPin, CreditCard, Banknote, Plus, CheckCircle, ArrowLeft, Tag, ShoppingBag } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    items,
    restaurantId,
    restaurantName,
    deliveryFee,
    getSubtotal,
    getTax,
    getTotal,
    coupon,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCartStore();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddAddress, setShowAddAddress] = useState<boolean>(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', street: '', city: 'Colombo', phone: user?.phone || '' });

  const [orderType, setOrderType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD'>('COD');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [couponCode, setCouponCode] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState<boolean>(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/restaurants');
      return;
    }

    const fetchAddresses = async () => {
      try {
        const res: any = await authApi.getAddresses();
        if (res.success && res.data.length > 0) {
          setAddresses(res.data);
          const defaultAddr = res.data.find((a: any) => a.isDefault) || res.data[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowAddAddress(true);
        }
      } catch (err) {
        setShowAddAddress(true);
      }
    };

    fetchAddresses();
  }, [items, navigate]);

  const subtotal = getSubtotal();
  const tax = getTax();
  const activeDeliveryFee = orderType === 'PICKUP' ? 0 : deliveryFee;
  const discountAmount = coupon?.discountAmount || 0;
  const totalAmount = Math.max(0, Math.round(subtotal + tax + activeDeliveryFee - discountAmount));

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await authApi.addAddress({ ...newAddress, isDefault: addresses.length === 0 });
      if (res.success) {
        setAddresses([...addresses, res.data]);
        setSelectedAddressId(res.data.id);
        setShowAddAddress(false);
        toast.success('Address added successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to add address');
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    try {
      const res: any = await couponApi.validate({ code: couponCode, subtotal });
      if (res.success) {
        applyCoupon(res.data);
        toast.success(`Coupon ${res.data.code} applied! Saved Rs. ${res.data.discountAmount}`);
        setCouponCode('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid promo code');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (orderType === 'DELIVERY' && !selectedAddressId && !showAddAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
      const deliveryAddress = selectedAddr
        ? { street: selectedAddr.street, city: selectedAddr.city, phone: selectedAddr.phone }
        : { street: newAddress.street, city: newAddress.city, phone: newAddress.phone };

      const payload = {
        restaurantId,
        addressId: selectedAddressId || undefined,
        deliveryAddress,
        orderType,
        paymentMethod,
        couponCode: coupon?.code,
        specialInstructions,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          variantName: i.variantName,
          addOns: i.addOns,
          notes: i.notes,
        })),
      };

      const res: any = await orderApi.create(payload);

      if (res.success) {
        clearCart();
        toast.success('Order placed successfully! 🎉');
        navigate(`/orders/${res.data.order.id}/track`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Back Link */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Checkout</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Order from {restaurantName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form (Delivery & Payment details) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Type Toggle */}
          <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              1. Delivery Method
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOrderType('DELIVERY')}
                className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                  orderType === 'DELIVERY'
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                    : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <MapPin className="w-4 h-4" /> Door Delivery
              </button>
              <button
                onClick={() => setOrderType('PICKUP')}
                className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                  orderType === 'PICKUP'
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                    : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> Restaurant Pickup
              </button>
            </div>
          </div>

          {/* Delivery Address Selection */}
          {orderType === 'DELIVERY' && (
            <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  2. Delivery Address
                </h3>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="text-xs font-bold text-primary-500 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> {showAddAddress ? 'Cancel' : 'Add New'}
                </button>
              </div>

              {!showAddAddress && addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                        selectedAddressId === addr.id
                          ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/20'
                          : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 text-primary-500 focus:ring-primary-500"
                        />
                        <div>
                          <span className="font-bold text-sm text-gray-900 dark:text-white">{addr.label}</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{addr.street}, {addr.city}</p>
                          <p className="text-[11px] text-gray-400 font-medium">Phone: {addr.phone}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleCreateAddress} className="space-y-3 pt-2">
                  <Input
                    label="Street Address"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    placeholder="e.g. 45 Galle Road, Bambalapitiya"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="City / Area"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      required
                    />
                    <Input
                      label="Contact Phone"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      placeholder="+94 77 123 4567"
                      required
                    />
                  </div>
                  {addresses.length > 0 && (
                    <Button type="submit" variant="secondary" size="sm">
                      Save & Select Address
                    </Button>
                  )}
                </form>
              )}
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              3. Payment Method
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                    : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <Banknote className="w-5 h-5" /> Cash on Delivery (COD)
              </button>

              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                    : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <CreditCard className="w-5 h-5" /> Stripe Test Card
              </button>
            </div>
          </div>

          {/* Special Delivery Instructions */}
          <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              4. Special Delivery Instructions
            </h3>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Leave at security gate, ring doorbell twice..."
              rows={2}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Right Summary Sidebar */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xl space-y-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-3">
              Order Summary
            </h3>

            {/* Items Summary list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {item.quantity}x {item.name}
                    </span>
                    {item.variantName && (
                      <p className="text-[10px] text-gray-400">Option: {item.variantName}</p>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Rs. {item.totalPrice.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            <div className="pt-3 border-t border-gray-100 dark:border-slate-700 space-y-2">
              {coupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">
                    Promo {coupon.code} (-Rs. {coupon.discountAmount})
                  </span>
                  <button onClick={removeCoupon} className="text-red-500 font-bold hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 uppercase rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button variant="secondary" size="sm" type="submit" isLoading={isValidatingCoupon}>
                    Apply
                  </Button>
                </form>
              )}
            </div>

            {/* Totals Calculation */}
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-slate-700">
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
                  Rs. {activeDeliveryFee.toLocaleString()}
                </span>
              </div>
              {coupon && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-Rs. {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-slate-700">
                <span>Total Payable</span>
                <span className="text-primary-500">Rs. {totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handlePlaceOrder}
              isLoading={isSubmitting}
              className="w-full py-4 text-base"
            >
              Place Order • Rs. {totalAmount.toLocaleString()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
