import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { restaurantApi } from '../api/restaurant.api';
import { DishCard } from '../components/customer/DishCard';
import { FoodItemModal } from '../components/customer/FoodItemModal';
import { SkeletonList } from '../components/common/Skeleton';
import { Badge } from '../components/common/Badge';
import { Star, Clock, MapPin, Phone, Search, Utensils, MessageSquare } from 'lucide-react';

export const RestaurantDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [restaurant, setRestaurant] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedDish, setSelectedDish] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res: any = await restaurantApi.getBySlugOrId(slug);
        if (res.success) {
          setRestaurant(res.data);
        }
      } catch (err) {
        console.error('Failed to load restaurant details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="skeleton h-64 w-full rounded-3xl"></div>
        <SkeletonList count={6} />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Restaurant not found</h2>
      </div>
    );
  }

  // Extract unique categories from menu items
  const menuItems = restaurant.menuItems || [];
  const categoriesMap: Record<string, string> = {};
  menuItems.forEach((item: any) => {
    if (item.category) {
      categoriesMap[item.category.id] = item.category.name;
    }
  });

  const categories = Object.entries(categoriesMap).map(([id, name]) => ({ id, name }));

  // Filtered menu items
  const filteredMenuItems = menuItems.filter((item: any) => {
    const matchesCategory = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDishSelect = (dish: any) => {
    setSelectedDish(dish);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header Banner & Meta */}
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-800 shadow-xl">
        <div className="h-64 w-full relative">
          <img
            src={restaurant.coverImage || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop'}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>

        <div className="relative px-6 sm:px-8 pb-6 -mt-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="flex items-end gap-5">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-xl bg-white shrink-0">
              <img
                src={restaurant.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop'}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1 text-white">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold">{restaurant.name}</h1>
                {restaurant.isOpen ? (
                  <Badge variant="success">Open</Badge>
                ) : (
                  <Badge variant="neutral">Closed</Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-200 font-medium">{restaurant.cuisine}</p>
              <div className="flex items-center gap-4 text-xs text-gray-300 pt-1">
                <span className="flex items-center gap-1 font-bold text-amber-300">
                  <Star className="w-4 h-4 fill-current" /> {restaurant.rating} ({restaurant.reviewCount} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {restaurant.preparationTime}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {restaurant.address}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-900/90 p-3 rounded-2xl border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Delivery Fee</p>
              <p className="text-sm font-bold text-primary-500">Rs. {restaurant.deliveryFee}</p>
            </div>
            <div className="h-6 w-px bg-gray-200 dark:bg-slate-700"></div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Min Order</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Rs. {restaurant.minOrder}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Menu vs Reviews) */}
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'menu'
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          <Utensils className="w-4 h-4" /> Menu Items ({menuItems.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'reviews'
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Customer Reviews ({restaurant.reviews?.length || 0})
        </button>
      </div>

      {activeTab === 'menu' ? (
        <div className="space-y-6">
          {/* Search & Category Filter Pills */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
            {/* Category pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'ALL'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                All Items
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* In-menu search */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search in menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Menu Items Grid */}
          {filteredMenuItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="font-bold text-base">No dishes found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map((dish: any) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  onSelect={handleDishSelect}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Reviews Tab */
        <div className="space-y-4">
          {restaurant.reviews && restaurant.reviews.length > 0 ? (
            restaurant.reviews.map((rev: any) => (
              <div
                key={rev.id}
                className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center text-sm">
                      {rev.user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{rev.user.name}</h4>
                      <p className="text-[10px] text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-xs bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{rev.rating}.0</span>
                  </div>
                </div>

                <p className="text-xs text-gray-700 dark:text-gray-300">{rev.comment}</p>

                {rev.reply && (
                  <div className="p-3 bg-primary-50/60 dark:bg-slate-900/60 rounded-xl border border-primary-100 dark:border-slate-700 text-xs space-y-1">
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      Response from Restaurant:
                    </span>
                    <p className="text-gray-600 dark:text-gray-300">{rev.reply}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="font-bold">No customer reviews yet for this restaurant.</p>
            </div>
          )}
        </div>
      )}

      {/* Selected Dish Customization Modal */}
      {selectedDish && (
        <FoodItemModal
          item={selectedDish}
          restaurant={{ id: restaurant.id, name: restaurant.name, deliveryFee: restaurant.deliveryFee }}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
