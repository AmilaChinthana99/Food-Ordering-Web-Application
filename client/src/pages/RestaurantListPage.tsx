import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { restaurantApi } from '../api/restaurant.api';
import { RestaurantCard } from '../components/customer/RestaurantCard';
import { SkeletonList } from '../components/common/Skeleton';
import { Pagination } from '../components/common/Pagination';
import { Search, Filter, SlidersHorizontal, Star, Clock, Utensils } from 'lucide-react';

export const RestaurantListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const cuisine = searchParams.get('cuisine') || 'All';
  const minRating = searchParams.get('minRating') || '';
  const openOnly = searchParams.get('openOnly') === 'true';
  const sortBy = searchParams.get('sortBy') || 'rating';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const cuisinesList = ['All', 'Sri Lankan', 'Kottu', 'Rice & Curry', 'Italian', 'Burgers', 'Healthy', 'Desserts'];

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const res: any = await restaurantApi.getRestaurants({
          search,
          cuisine: cuisine === 'All' ? undefined : cuisine,
          minRating: minRating || undefined,
          openOnly: openOnly ? 'true' : undefined,
          sortBy,
          page,
          limit: 9,
        });

        if (res.success) {
          setRestaurants(res.data);
          setTotalPages(res.meta.totalPages);
          setTotalCount(res.meta.total);
        }
      } catch (err) {
        console.error('Failed to fetch restaurants', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [search, cuisine, minRating, openOnly, sortBy, page]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Explore Restaurants in Sri Lanka 🍽️
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Showing {totalCount} verified restaurants delivering right to your location
        </p>
      </div>

      {/* Filter Bar & Search */}
      <div className="space-y-4 bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by restaurant name, dish, or area..."
              value={search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Sort By:
            </label>
            <select
              value={sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="rating">Top Rated (Highest)</option>
              <option value="deliveryFee">Delivery Fee (Lowest)</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Cuisine Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-2">
            Cuisine:
          </span>
          {cuisinesList.map((c) => (
            <button
              key={c}
              onClick={() => updateFilter('cuisine', c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                cuisine === c
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Additional Toggle Filters */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={openOnly}
              onChange={(e) => updateFilter('openOnly', e.target.checked ? 'true' : '')}
              className="rounded text-primary-500 focus:ring-primary-500"
            />
            <span>Open Now Only</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={minRating === '4.5'}
              onChange={(e) => updateFilter('minRating', e.target.checked ? '4.5' : '')}
              className="rounded text-primary-500 focus:ring-primary-500"
            />
            <span className="flex items-center gap-1">
              Top 4.5+ Rating <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
            </span>
          </label>
        </div>
      </div>

      {/* Grid Results */}
      {loading ? (
        <SkeletonList count={9} />
      ) : restaurants.length === 0 ? (
        <div className="text-center py-16 space-y-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No restaurants match your filters</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Try adjusting your search keywords or resetting filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => updateFilter('page', newPage.toString())}
      />
    </div>
  );
};
