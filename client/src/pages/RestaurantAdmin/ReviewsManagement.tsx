import React, { useEffect, useState } from 'react';
import { restaurantApi } from '../../api/restaurant.api';
import { reviewApi } from '../../api/review.api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Star, MessageSquare, CornerDownRight } from 'lucide-react';

export const ReviewsManagement: React.FC = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants && user.restaurants.length > 0 ? user.restaurants[0].id : '';

  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    if (!restaurantId) return;
    try {
      const res: any = await restaurantApi.getBySlugOrId(restaurantId);
      if (res.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [restaurantId]);

  const handleSendReply = async (reviewId: string) => {
    const reply = replyText[reviewId];
    if (!reply?.trim()) return;

    setSubmittingId(reviewId);
    try {
      const res: any = await reviewApi.reply(reviewId, reply);
      if (res.success) {
        toast.success('Response posted!');
        setReplyText({ ...replyText, [reviewId]: '' });
        fetchReviews();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit response');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Customer Reviews</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">View ratings and respond to customer feedback</p>
      </div>

      {loading ? (
        <div className="skeleton h-48 w-full rounded-2xl"></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 space-y-2">
          <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
          <p className="font-bold text-gray-500">No customer reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center">
                    {rev.user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{rev.user.name}</h4>
                    <p className="text-[10px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 font-bold text-xs text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{rev.rating}.0</span>
                </div>
              </div>

              <p className="text-xs text-gray-700 dark:text-gray-300">{rev.comment}</p>

              {rev.reply ? (
                <div className="p-3 bg-primary-50/60 dark:bg-slate-900/60 rounded-xl border border-primary-100 dark:border-slate-700 text-xs space-y-1">
                  <span className="font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1">
                    <CornerDownRight className="w-3.5 h-3.5" /> Your Response:
                  </span>
                  <p className="text-gray-600 dark:text-gray-300">{rev.reply}</p>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <textarea
                    value={replyText[rev.id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [rev.id]: e.target.value })}
                    placeholder="Write an appreciative reply..."
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSendReply(rev.id)}
                    isLoading={submittingId === rev.id}
                  >
                    Post Reply
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
