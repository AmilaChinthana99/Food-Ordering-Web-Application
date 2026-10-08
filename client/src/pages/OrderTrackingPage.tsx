import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderApi } from '../api/order.api';
import { useSocket } from '../context/SocketContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import toast from 'react-hot-toast';
import { Clock, CheckCircle2, Bike, Utensils, XCircle, ArrowLeft, Phone, MapPin } from 'lucide-react';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const res: any = await orderApi.getById(id);
        if (res.success) {
          setOrder(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch order tracking details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Subscribe to Socket.IO real-time order updates
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('join_order', id);

    const handleStatusUpdate = (updatedOrder: any) => {
      console.log('⚡ Socket event received: order_status_updated', updatedOrder);
      if (updatedOrder.id === id) {
        setOrder(updatedOrder);
        toast.success(`Order status updated to: ${updatedOrder.orderStatus}`, { id: 'status-update' });
      }
    };

    socket.on('order_status_updated', handleStatusUpdate);

    return () => {
      socket.emit('leave_order', id);
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, [socket, id]);

  const handleCancelOrder = async () => {
    if (!id || !order) return;
    setIsCancelling(true);
    try {
      const res: any = await orderApi.cancelOrder(id, { reason: 'Cancelled by customer' });
      if (res.success) {
        setOrder(res.data);
        toast.success('Order cancelled');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="skeleton h-48 w-full rounded-3xl"></div>
        <div className="skeleton h-32 w-full rounded-2xl"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order not found</h2>
      </div>
    );
  }

  const steps = [
    { key: 'PLACED', label: 'Placed', desc: 'Order received by restaurant', icon: Utensils },
    { key: 'CONFIRMED', label: 'Confirmed', desc: 'Accepted & preparing ticket', icon: CheckCircle2 },
    { key: 'PREPARING', label: 'Preparing', desc: 'Chef is cooking your dish', icon: Utensils },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Rider is on the way', icon: Bike },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Enjoy your meal!', icon: CheckCircle2 },
  ];

  const getStepIndex = (status: string) => {
    if (status === 'CANCELLED') return -1;
    return steps.findIndex((s) => s.key === status);
  };

  const currentStepIndex = getStepIndex(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Order header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {order.orderStatus === 'PLACED' && (
          <Button variant="danger" size="sm" onClick={handleCancelOrder} isLoading={isCancelling}>
            Cancel Order
          </Button>
        )}
      </div>

      {/* Live Timeline Component */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-700/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-500 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Estimated Delivery</p>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">25 - 35 Minutes</h3>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Status</span>
            {order.orderStatus === 'CANCELLED' ? (
              <Badge variant="danger">Cancelled</Badge>
            ) : (
              <Badge variant="success">{order.orderStatus.replace(/_/g, ' ')}</Badge>
            )}
          </div>
        </div>

        {order.orderStatus === 'CANCELLED' ? (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-center space-y-1">
            <XCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h4 className="font-bold text-rose-900 dark:text-rose-200 text-base">This order was cancelled</h4>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              Reason: {order.cancelledReason || 'Cancelled by user'}
            </p>
          </div>
        ) : (
          /* Timeline Progress Bar */
          <div className="relative pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const IconComponent = step.icon;

                return (
                  <div key={step.key} className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        isCurrent
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110 ring-4 ring-primary-100 dark:ring-primary-950'
                          : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-400'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                        {step.label}
                      </h4>
                      <p className="text-[10px] text-gray-400 hidden sm:block mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Restaurant & Delivery Details Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Restaurant Info</h4>
          <div className="flex items-center gap-3">
            <img
              src={order.restaurant.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&auto=format&fit=crop'}
              alt={order.restaurant.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div>
              <h5 className="font-bold text-sm text-gray-900 dark:text-white">{order.restaurant.name}</h5>
              <p className="text-xs text-gray-500 dark:text-gray-400">{order.restaurant.address}</p>
              <p className="text-xs text-primary-500 font-semibold">{order.restaurant.phone}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Delivery Address</h4>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
            <div>
              {order.deliveryAddressJson ? (
                (() => {
                  const addr = JSON.parse(order.deliveryAddressJson);
                  return (
                    <>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{addr.street}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{addr.city}</p>
                      <p className="text-xs text-gray-400 mt-1">Phone: {addr.phone}</p>
                    </>
                  );
                })()
              ) : (
                <p className="text-xs text-gray-500">Address detail unavailable</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Items Summary */}
      <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-4">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-slate-700 pb-3">
          Items Ordered ({order.items.length})
        </h4>

        <div className="space-y-3">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-gray-900 dark:text-white">{item.quantity}x {item.name}</span>
                {item.variantName && <span className="text-gray-400 ml-2">({item.variantName})</span>}
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Rs. {(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-slate-700 space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rs. {order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>Rs. {order.deliveryFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>Rs. {order.tax.toLocaleString()}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Discount</span>
              <span>-Rs. {order.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-slate-700">
            <span>Total Paid</span>
            <span className="text-primary-500">Rs. {order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
