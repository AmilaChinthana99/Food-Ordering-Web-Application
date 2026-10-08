import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Heart } from 'lucide-react';
import { Badge } from '../common/Badge';
import { useFavoritesStore } from '../../store/favoritesStore';
import { favoriteApi } from '../../api/review.api';
import toast from 'react-hot-toast';

interface RestaurantCardProps {
  restaurant: any;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const { isRestaurantFavorite, toggleRestaurant } = useFavoritesStore();
  const isFav = isRestaurantFavorite(restaurant.id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleRestaurant(restaurant.id);
    try {
      await favoriteApi.toggle({ restaurantId: restaurant.id });
      toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
    } catch (err) {
      // client toggle state is handled optimistically
    }
  };

  return (
    <Link
      to={`/restaurants/${restaurant.slug || restaurant.id}`}
      className="group block bg-white dark:bg-slate-800/80 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Cover Image & Badges */}
      <div className="relative h-44 w-full overflow-hidden bg-gray-200 dark:bg-slate-700">
        <img
          src={restaurant.coverImage || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop'}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-gray-700 dark:text-gray-200 hover:text-red-500 transition-colors shadow-md"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          {restaurant.isOpen ? (
            <Badge variant="success">Open Now</Badge>
          ) : (
            <Badge variant="neutral">Closed</Badge>
          )}
          {restaurant.isFeatured && <Badge variant="warning">Featured</Badge>}
        </div>

        {/* Rating Overlay */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-xs font-extrabold text-gray-900 dark:text-white shadow">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{restaurant.rating}</span>
          <span className="text-gray-400 text-[10px]">({restaurant.reviewCount})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-1">
              {restaurant.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-1 mt-0.5">
              {restaurant.cuisine}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
          {restaurant.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700/60 text-xs text-gray-500 dark:text-gray-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{restaurant.preparationTime}</span>
          </div>
          <div>
            <span>Delivery: <strong className="text-gray-900 dark:text-white">Rs. {restaurant.deliveryFee}</strong></span>
          </div>
        </div>
      </div>
    </Link>
  );
};
