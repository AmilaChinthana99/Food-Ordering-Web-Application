import React from 'react';
import { Plus, Star, Heart } from 'lucide-react';
import { Badge } from '../common/Badge';
import { useFavoritesStore } from '../../store/favoritesStore';
import { favoriteApi } from '../../api/review.api';
import toast from 'react-hot-toast';

interface DishCardProps {
  dish: any;
  onSelect: (dish: any) => void;
}

export const DishCard: React.FC<DishCardProps> = ({ dish, onSelect }) => {
  const { isMenuItemFavorite, toggleMenuItem } = useFavoritesStore();
  const isFav = isMenuItemFavorite(dish.id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMenuItem(dish.id);
    try {
      await favoriteApi.toggle({ menuItemId: dish.id });
      toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
    } catch (err) {
      // client state updated
    }
  };

  return (
    <div
      onClick={() => onSelect(dish)}
      className="group bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex gap-4 hover:border-primary-500/40 relative"
    >
      {/* Thumbnail Image */}
      <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700">
        <img
          src={dish.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop'}
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <button
          onClick={handleFavoriteClick}
          className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-gray-700 dark:text-gray-200 hover:text-red-500 transition-colors"
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {dish.isVeg ? (
              <Badge variant="success" size="sm">Veg</Badge>
            ) : (
              <Badge variant="danger" size="sm">Non-Veg</Badge>
            )}
            {dish.isPopular && <Badge variant="warning" size="sm">Popular</Badge>}
          </div>

          <h4 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors truncate">
            {dish.name}
          </h4>

          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {dish.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="font-bold text-base text-gray-900 dark:text-white">
            Rs. {dish.price.toLocaleString()}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(dish);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-bold text-xs hover:bg-primary-500 hover:text-white transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
