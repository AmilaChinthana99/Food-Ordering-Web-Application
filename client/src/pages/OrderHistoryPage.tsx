import React, { useEffect, useState } from 'react';
import { orderApi } from '../api/order.api';
import { reviewApi } from '../api/review.api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShoppingBag, Star, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState<any | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res: any = await orderApi.getOrders();
        if (res.success) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch user order history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder) return;

    setIsSubmittingReview(true);
    try {
      const res: any = await reviewApi.create({
        restaurantId: reviewOrder.restaurantId,
        orderId: reviewOrder.id,
        rating,
        comment,
      });

      if (res.success) {
        toast.success('Thank you for rating your meal!');
        setReviewOrder(null);
        setComment('');
        // Refresh orders
        const updatedRes: any = await orderApi.getOrders();
        if (updatedRes.success) setOrders(updatedRes.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">My Order History</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Track active orders and leave reviews for past meals</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-32 w-full rounded-2xl"></div>
          <div className="skeleton h-32 w-full rounded-2xl"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No orders placed yet</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Craving Sri Lankan food? Explore top restaurants now!</p>
          <Link to="/restaurants">
            <Button variant="primary" size="md">Browse Restaurants</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-700/60 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={ord.restaurant.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&auto=format&fit=crop'}
                    alt={ord.restaurant.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">{ord.restaurant.name}</h3>
                    <p className="text-xs text-gray-400">
                      Order #{ord.orderNumber} • {new Date(ord.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={ord.orderStatus === 'DELIVERED' ? 'success' : ord.orderStatus === 'CANCELLED' ? 'danger' : 'info'}>
                    {ord.orderStatus.replace(/_/g, ' ')}
                  </Badge>
                  <span className="font-extrabold text-base text-gray-900 dark:text-white">
                    Rs. {ord.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Items summary snippet */}
              <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                {ord.items.map((item: any) => (
                  <p key={item.id}>
                    <span className="font-bold">{item.quantity}x</span> {item.name} {item.variantName ? `(${item.variantName})` : ''}
                  </p>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  to={`/orders/${ord.id}/track`}
                  className="text-xs font-bold text-primary-500 hover:underline flex items-center gap-1"
                >
                  Track Order <ArrowRight className="w-4 h-4" />
                </Link>

                {ord.orderStatus === 'DELIVERED' && (
                  <div>
                    {ord.reviews && ord.reviews.length > 0 ? (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Reviewed ({ord.reviews[0].rating}★)
                      </span>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setReviewOrder(ord)}>
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-current mr-1" /> Leave Review
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leave Review Modal */}
      {reviewOrder && (
        <Modal isOpen={!!reviewOrder} onClose={() => setReviewOrder(null)} title={`Review ${reviewOrder.restaurant.name}`}>
          <form onSubmit={handleSubmitReview} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-2 text-2xl focus:outline-none transition-transform hover:scale-125"
                  >
                    <Star className={`w-8 h-8 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Your Feedback
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the taste, packaging, and delivery speed?"
                rows={3}
                required
                className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" isLoading={isSubmittingReview} className="w-full">
              Submit Review
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
