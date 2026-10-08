import React, { useEffect, useState } from 'react';
import { HeroSection } from '../components/customer/HeroSection';
import { RestaurantCard } from '../components/customer/RestaurantCard';
import { DishCard } from '../components/customer/DishCard';
import { FoodItemModal } from '../components/customer/FoodItemModal';
import { SkeletonList } from '../components/common/Skeleton';
import { restaurantApi } from '../api/restaurant.api';
import { categoryApi } from '../api/category.api';
import { menuApi } from '../api/menu.api';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Sparkles, Utensils } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<any[]>([]);
  const [popularDishes, setPopularDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Selected item modal state
  const [selectedDish, setSelectedDish] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, restRes, dishRes]: any[] = await Promise.all([
          categoryApi.getCategories(),
          restaurantApi.getRestaurants({ limit: 6, sortBy: 'rating' }),
          menuApi.getMenuItems({ isPopular: 'true' }),
        ]);

        if (catRes.success) setCategories(catRes.data);
        if (restRes.success) setFeaturedRestaurants(restRes.data);
        if (dishRes.success) setPopularDishes(dishRes.data.slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch home page data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDishSelect = (dish: any) => {
    setSelectedDish(dish);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-16">
      {/* Hero Banner */}
      <HeroSection />

      {/* Categories Grid / Slider */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" /> Explore Categories
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Discover delicious food by category</p>
          </div>
          <Link
            to="/restaurants"
            className="text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/restaurants?cuisine=${encodeURIComponent(cat.name.split(' ')[0])}`}
              className="group flex flex-col items-center p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary-500/50 transition-all text-center"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-primary-50 dark:bg-slate-700 group-hover:scale-110 transition-transform">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&auto=format&fit=crop'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary-500 transition-colors line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Flame className="w-6 h-6 text-primary-500" /> Featured Restaurants
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Top rated restaurants delivering near you</p>
          </div>
          <Link
            to="/restaurants"
            className="text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1"
          >
            Browse All Restaurants <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <SkeletonList count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Dishes */}
      {popularDishes.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Utensils className="w-6 h-6 text-amber-500" /> Popular Sri Lankan Dishes
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Most ordered items by foodies this week</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} onSelect={handleDishSelect} />
            ))}
          </div>
        </section>
      )}

      {/* Selected Dish Customization Modal */}
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
