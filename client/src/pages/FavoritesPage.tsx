import React, { useEffect, useState } from 'react';
import { favoriteApi } from '../api/review.api';
import { RestaurantCard } from '../components/customer/RestaurantCard';
import { DishCard } from '../components/customer/DishCard';
import { FoodItemModal } from '../components/customer/FoodItemModal';
import { Heart, Utensils } from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedDish, setSelectedDish] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res: any = await favoriteApi.getFavorites();
        if (res.success) {
          setFavorites(res.data);
        }
      } catch (err) {
        console.error('Failed to load favorites', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const restaurantFavs = favorites.filter((f) => f.restaurant).map((f) => f.restaurant);
  const dishFavs = favorites.filter((f) => f.menuItem).map((f) => f.menuItem);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <Heart className="w-7 h-7 text-red-500 fill-red-500" /> My Wishlist & Favorites
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Quick access to your favorite restaurants and dishes</p>
      </div>

      {loading ? (
        <div className="skeleton h-48 w-full rounded-2xl"></div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-4">
          <Heart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your wishlist is empty</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Click the heart icon on any restaurant or dish to save it here!</p>
        </div>
      ) : (
        <div className="space-y-10">
          {restaurantFavs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Favorite Restaurants</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurantFavs.map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} />
                ))}
              </div>
            </div>
          )}

          {dishFavs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Favorite Dishes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dishFavs.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    onSelect={(d) => {
                      setSelectedDish(d);
                      setIsModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedDish && (
        <FoodItemModal
          item={selectedDish}
          restaurant={selectedDish.restaurant || { id: selectedDish.restaurantId, name: 'Restaurant', deliveryFee: 250 }}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
