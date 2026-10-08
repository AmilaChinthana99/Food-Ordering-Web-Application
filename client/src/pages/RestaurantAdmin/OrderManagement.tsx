import React, { useEffect, useState } from 'react';
import { orderApi } from '../../api/order.api';
import { useSocket } from '../../context/SocketContext';
import { playOrderNotificationSound } from '../../components/admin/OrderNotificationSound';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';
import { ShoppingBag, CheckCircle, Clock, Bike, XCircle, Volume2, Phone, MapPin } from 'lucide-react';

export const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { socket } = useSocket();

  const fetchOrders = async () => {
    try {
      const res: any = await orderApi.getOrders({ status: statusFilter === 'ALL' ? undefined : statusFilter });
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch restaurant orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // Socket listener for new live incoming orders
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (newOrder: any) => {
      console.log('⚡ Live new order received:', newOrder);
      playOrderNotificationSound();
      toast.success(`🚨 NEW ORDER #${newOrder.orderNumber} received!`, { duration: 6000 });
      fetchOrders();
    };

    socket.on('new_order_placed', handleNewOrder);
    socket.on('restaurant_order_updated', fetchOrders);

    return () => {
      socket.off('new_order_placed', handleNewOrder);
      socket.off('restaurant_order_updated', fetchOrders);
    };
  }, [socket]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res: any = await orderApi.updateStatus(orderId, { status });
      if (res.success) {
        toast.success(`Order status updated to ${status}`);
        fetchOrders();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            Live Order Management <Volume2 className="w-6 h-6 text-primary-500 animate-pulse" />
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real-time incoming order console with audio alerts
          </p>
        </div>

        {/* Test sound button */}
        <Button variant="outline" size="sm" onClick={() => playOrderNotificationSound()}>
          🔊 Test Audio Notification
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-slate-800">
        {['ALL', 'PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === st
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="skeleton h-48 w-full rounded-2xl"></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 text-gray-500 space-y-2">
          <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="font-bold">No orders found matching filter "{statusFilter}"</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className={`p-6 bg-white dark:bg-slate-800 rounded-3xl border shadow-sm space-y-4 transition-all ${
                ord.orderStatus === 'PLACED'
                  ? 'border-amber-400 ring-2 ring-amber-400/20 animate-pulse-subtle'
                  : 'border-gray-100 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-700 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                      Order #{ord.orderNumber}
                    </h3>
                    <Badge variant={ord.orderStatus === 'DELIVERED' ? 'success' : ord.orderStatus === 'PLACED' ? 'warning' : 'info'}>
                      {ord.orderStatus.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Customer: <strong className="text-gray-900 dark:text-white">{ord.user.name}</strong> • Phone: {ord.user.phone || 'N/A'} • {new Date(ord.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 block uppercase">Total Amount</span>
                  <span className="text-xl font-extrabold text-primary-500">
                    Rs. {ord.totalAmount.toLocaleString()}
                  </span>
                  <p className="text-[11px] text-gray-400 font-semibold">{ord.paymentMethod} ({ord.paymentStatus})</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-900/60 p-4 rounded-2xl">
                <h4 className="font-bold text-gray-500 uppercase tracking-wider text-[10px] mb-1">
                  Ordered Items:
                </h4>
                {ord.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="font-bold">
                      {item.quantity}x {item.name} {item.variantName ? `[${item.variantName}]` : ''}
                    </span>
                    <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                {ord.specialInstructions && (
                  <p className="text-amber-600 dark:text-amber-400 font-semibold pt-2 border-t border-gray-200 dark:border-slate-700">
                    Note: {ord.specialInstructions}
                  </p>
                )}
              </div>

              {/* Status Change Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-gray-500">
                  <span>Type: <strong className="text-gray-900 dark:text-white">{ord.orderType}</strong></span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {ord.orderStatus === 'PLACED' && (
                    <>
                      <Button variant="danger" size="sm" onClick={() => handleUpdateStatus(ord.id, 'CANCELLED')}>
                        Reject
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => handleUpdateStatus(ord.id, 'CONFIRMED')}>
                        Accept Order
                      </Button>
                    </>
                  )}

                  {ord.orderStatus === 'CONFIRMED' && (
                    <Button variant="primary" size="sm" onClick={() => handleUpdateStatus(ord.id, 'PREPARING')}>
                      Start Cooking (Preparing)
                    </Button>
                  )}

                  {ord.orderStatus === 'PREPARING' && (
                    <Button variant="primary" size="sm" onClick={() => handleUpdateStatus(ord.id, 'OUT_FOR_DELIVERY')}>
                      Dispatch (Out for Delivery)
                    </Button>
                  )}

                  {ord.orderStatus === 'OUT_FOR_DELIVERY' && (
                    <Button variant="primary" size="sm" onClick={() => handleUpdateStatus(ord.id, 'DELIVERED')}>
                      Mark Delivered
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
